"use client";
import { useEffect, useMemo, useState } from "react";
import type { Lens, Note } from "@/lib/types";

type NoteMap = Record<string, Note>; // key: mandala-hymn

const storageKey = "rvh-notes-v1";

export default function NotesPage() {
  const [notes, setNotes] = useState<NoteMap>({});
  const [key, setKey] = useState<string>("1-1");
  const [lens, setLens] = useState<Lens | undefined>(undefined);
  const current = notes[key];

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setNotes(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(notes));
    } catch {}
  }, [notes]);

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(notes, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rvh-notes.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const onImport = async (file: File) => {
    const text = await file.text();
    try {
      setNotes(JSON.parse(text));
    } catch {}
  };

  const save = (text: string) => {
    setNotes((prev) => ({
      ...prev,
      [key]: { text, updatedAt: Date.now(), lens },
    }));
  };

  return (
    <div>
      <h1>Notes & Reflections</h1>
      <div style={{ display: "grid", gap: 12 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <label className="muted">
            Hymn key
            <input
              value={key}
              onChange={(e) => setKey(e.target.value)}
              style={{
                marginLeft: 8,
                background: "var(--panel)",
                border: "1px solid var(--panel-2)",
                borderRadius: 8,
                padding: "6px 8px",
                color: "var(--text)",
              }}
            />
          </label>
          <div className="muted">Lens:</div>
          {(["vibration", "soul", "existence"] as Lens[]).map((l) => (
            <button
              key={l}
              onClick={() => setLens(l)}
              className={`pill`}
              style={{
                background: lens === l ? "var(--accent)" : "var(--panel-2)",
                color: lens === l ? "#1F1A16" : "var(--muted)",
              }}
            >
              {l}
            </button>
          ))}
          <button onClick={() => setLens(undefined)} className="pill">
            clear
          </button>
        </div>
        <textarea
          value={current?.text ?? ""}
          onChange={(e) => save(e.target.value)}
          placeholder="Your reflections..."
          style={{
            minHeight: 240,
            width: "100%",
            background: "var(--panel)",
            border: "1px solid var(--panel-2)",
            borderRadius: 12,
            padding: 12,
            color: "var(--text)",
          }}
        />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="pill" onClick={exportJson}>
            Export
          </button>
          <label className="pill" style={{ cursor: "pointer" }}>
            Import
            <input
              onChange={(e) =>
                e.target.files?.[0] && onImport(e.target.files[0])
              }
              type="file"
              accept="application/json"
              style={{ display: "none" }}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
