"use client";
import { useEffect, useRef, useState } from "react";

export type JSAnalysis = {
  f0Hz: number | null;
  onset: boolean;
  centroidHz: number | null;
  rolloffHz: number | null; // 85% energy
  flatness: number | null; // 0..1
};

export function useJSAnalysis(
  analyser: AnalyserNode | null,
  sampleRate = 44100
) {
  const [state, setState] = useState<JSAnalysis>({
    f0Hz: null,
    onset: false,
    centroidHz: null,
    rolloffHz: null,
    flatness: null,
  });
  const prevMagRef = useRef<Float32Array | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!analyser) return;
    // Ensure decent FFT size for analysis
    analyser.fftSize = Math.max(analyser.fftSize, 2048);
    const bufferLen = analyser.fftSize;
    const time = new Float32Array(bufferLen);
    const freq = new Uint8Array(analyser.frequencyBinCount);

    const loop = () => {
      // Capture frames
      analyser.getFloatTimeDomainData(time);
      analyser.getByteFrequencyData(freq);

      const f0Hz = yinPitch(time, sampleRate);
      const { centroidHz, rolloffHz, flatness } = spectralTimbre(
        freq,
        sampleRate
      );
      const onset = spectralOnset(prevMagRef, freq);

      setState({ f0Hz, onset, centroidHz, rolloffHz, flatness });
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [analyser, sampleRate]);

  return state;
}

function yinPitch(frame: Float32Array, sampleRate: number): number | null {
  // Basic YIN implementation
  const threshold = 0.1;
  const maxLag = Math.floor(sampleRate / 50); // 50 Hz
  const minLag = Math.floor(sampleRate / 1000); // 1 kHz
  const N = frame.length;
  const diff = new Float32Array(maxLag);
  const cmnd = new Float32Array(maxLag);

  for (let tau = 1; tau < maxLag; tau++) {
    let sum = 0;
    for (let i = 0; i < N - tau; i++) {
      const d = frame[i] - frame[i + tau];
      sum += d * d;
    }
    diff[tau] = sum;
  }
  cmnd[0] = 1;
  let running = 0;
  for (let tau = 1; tau < maxLag; tau++) {
    running += diff[tau];
    cmnd[tau] = (diff[tau] * tau) / (running || 1);
  }
  let tauEstimate = -1;
  for (let tau = minLag; tau < maxLag; tau++) {
    if (cmnd[tau] < threshold) {
      // local minimum
      while (tau + 1 < maxLag && cmnd[tau + 1] < cmnd[tau]) tau++;
      tauEstimate = tau;
      break;
    }
  }
  if (tauEstimate <= 0) return null;
  // Parabolic interpolation for better precision
  const tau = tauEstimate;
  const x0 = cmnd[tau - 1] || cmnd[tau];
  const x1 = cmnd[tau];
  const x2 = cmnd[tau + 1] || cmnd[tau];
  const denom = x0 - 2 * x1 + x2;
  const betterTau = tau + (denom !== 0 ? (0.5 * (x0 - x2)) / denom : 0);
  const f0 = sampleRate / betterTau;
  if (!isFinite(f0) || f0 < 50 || f0 > 1000) return null;
  return f0;
}

function spectralTimbre(magBytes: Uint8Array, sampleRate: number) {
  const n = magBytes.length;
  if (n === 0) return { centroidHz: null, rolloffHz: null, flatness: null };
  let sum = 0,
    weighted = 0;
  const power = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const m = magBytes[i];
    sum += m;
    weighted += m * i;
    power[i] = m * m + 1e-9;
  }
  const centroidBin = sum > 0 ? weighted / sum : 0;
  const nyq = sampleRate / 2;
  const binHz = nyq / n;
  const centroidHz = centroidBin * binHz;

  // rolloff 85%
  let total = 0;
  for (let i = 0; i < n; i++) total += magBytes[i];
  const target = 0.85 * total;
  let acc = 0,
    rollBin = 0;
  for (let i = 0; i < n; i++) {
    acc += magBytes[i];
    if (acc >= target) {
      rollBin = i;
      break;
    }
  }
  const rolloffHz = rollBin * binHz;

  // flatness: geometric mean / arithmetic mean of power
  let logSum = 0;
  let arith = 0;
  for (let i = 0; i < n; i++) {
    logSum += Math.log(power[i]);
    arith += power[i];
  }
  const geom = Math.exp(logSum / n);
  const flatness = arith > 0 ? geom / (arith / n) : 0;
  return { centroidHz, rolloffHz, flatness };
}

function spectralOnset(
  prevRef: React.MutableRefObject<Float32Array | null>,
  currBytes: Uint8Array
) {
  const n = currBytes.length;
  const curr = new Float32Array(n);
  for (let i = 0; i < n; i++) curr[i] = currBytes[i];
  const prev = prevRef.current || new Float32Array(n);
  let flux = 0;
  for (let i = 0; i < n; i++) {
    const d = curr[i] - prev[i];
    if (d > 0) flux += d;
  }
  prevRef.current = curr;
  // Simple threshold
  return flux > 2000; // tune empirically
}
