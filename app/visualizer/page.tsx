"use client";
import { useEffect, useRef, useState } from "react";

// Reuse a single MediaElementSourceNode per HTMLMediaElement across mounts
const audioGraphMap = new WeakMap<
  HTMLMediaElement,
  {
    ctx: AudioContext;
    source: MediaElementAudioSourceNode;
    analyser: AnalyserNode;
  }
>();

export default function Visualizer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [src, setSrc] = useState<string>(
    "https://raw.githubusercontent.com/aasi-archive/rv-audio/main/data/M1/H001.mp3"
  );

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const onPlayResumeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    const canvas = canvasRef.current;
    if (!audio || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Build or reuse graph
    let graph = audioGraphMap.get(audio);
    if (!graph) {
      const AudioCtx =
        (window as any).AudioContext || (window as any).webkitAudioContext;
      const ctx: AudioContext = new AudioCtx();
      const source = ctx.createMediaElementSource(audio);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyser.connect(ctx.destination);
      graph = { ctx, source, analyser };
      audioGraphMap.set(audio, graph);
    }

    audioContextRef.current = graph.ctx;
    analyserRef.current = graph.analyser;

    // Resume context on user interaction
    const maybeResume = async () => {
      try {
        if (
          audioContextRef.current &&
          audioContextRef.current.state === "suspended"
        ) {
          await audioContextRef.current.resume();
        }
      } catch {}
    };
    onPlayResumeRef.current = maybeResume;
    audio.addEventListener("play", maybeResume, { passive: true });

    const analyser = analyserRef.current!;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);
      analyser.getByteFrequencyData(dataArray);
      const barWidth = width / bufferLength;
      for (let i = 0; i < bufferLength; i++) {
        const value = dataArray[i];
        const barHeight = (value / 255) * height;
        const x = i * barWidth;
        ctx.fillStyle = `hsl(${30 + i / 2} 60% 60%)`;
        ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);
      }
      rafRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      audio.removeEventListener("play", maybeResume as any);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      // Keep AudioContext/graph alive in WeakMap; they'll be GC'ed with the element
      analyserRef.current = null;
      audioContextRef.current = null;
    };
  }, []);

  return (
    <div>
      <h1>Mantra Visualizer</h1>
      <div style={{ display: "grid", gap: 12 }}>
        <audio ref={audioRef} controls src={src} />
        <canvas
          ref={canvasRef}
          width={900}
          height={300}
          style={{
            width: "100%",
            background: "var(--panel)",
            borderRadius: 12,
          }}
        />
        <label className="muted">
          Audio URL
          <input
            style={{
              display: "block",
              width: "100%",
              marginTop: 6,
              background: "var(--panel)",
              border: "1px solid var(--panel-2)",
              borderRadius: 8,
              padding: "8px 10px",
              color: "var(--text)",
            }}
            value={src}
            onChange={(e) => setSrc(e.target.value)}
          />
        </label>
      </div>
    </div>
  );
}
