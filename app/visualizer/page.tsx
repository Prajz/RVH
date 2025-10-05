"use client";
import { useEffect, useRef, useState } from "react";

export default function Visualizer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [src, setSrc] = useState<string>(
    "https://raw.githubusercontent.com/aasi-archive/rv-audio/main/data/M1/H001.mp3"
  );

  useEffect(() => {
    const audio = audioRef.current;
    const canvas = canvasRef.current;
    if (!audio || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    const ac = new AudioCtx();
    const srcNode = ac.createMediaElementSource(audio);
    const analyser = ac.createAnalyser();
    analyser.fftSize = 256;
    srcNode.connect(analyser);
    analyser.connect(ac.destination);
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
      requestAnimationFrame(draw);
    };
    draw();
    return () => {
      ac.close().catch(() => {});
    };
  }, [src]);

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
