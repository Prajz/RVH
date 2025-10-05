"use client";
import { useEffect, useMemo, useState } from "react";
import type { Hymn, MandalaFile } from "@/lib/types";
import { Index } from "flexsearch";

type Props = { data: MandalaFile };

type Hit = { key: string; hymn: number; verse: number; text: string };

export function ReaderClient({ data }: Props) {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);

  const { index, docMap } = useMemo(() => {
    const idx = new Index({
      tokenize: "forward",
      preset: "match",
      optimize: true,
    });
    const map = new Map<
      string,
      { hymn: number; verse: number; text: string }
    >();
    for (const h of data.hymns) {
      for (const v of h.verses) {
        const keySa = `${h.hymn}-${v.v}-sa`;
        const keyEn = `${h.hymn}-${v.v}-en`;
        idx.add(keySa, v.sa);
        idx.add(keyEn, v.en);
        map.set(keySa, { hymn: h.hymn, verse: v.v, text: v.sa });
        map.set(keyEn, { hymn: h.hymn, verse: v.v, text: v.en });
      }
    }
    return { index: idx, docMap: map };
  }, [data]);

  useEffect(() => {
    if (!q) {
      setHits([]);
      return;
    }
    const ids = index.search(q, { limit: 20 }) as string[];
    const res: Hit[] = [];
    for (const id of ids) {
      const meta = docMap.get(id);
      if (meta)
        res.push({
          key: id,
          hymn: meta.hymn,
          verse: meta.verse,
          text: meta.text,
        });
    }
    setHits(res);
  }, [q, index, docMap]);

  return (
    <div>
      <label className="muted">
        Search Mandala {data.mandala}
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search Sanskrit or English"
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
        />
      </label>
      {hits.length > 0 && (
        <div style={{ marginTop: 8 }} className="muted">
          {hits.length} results
        </div>
      )}
      {hits.length > 0 && (
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            marginTop: 8,
            display: "grid",
            gap: 8,
          }}
        >
          {hits.map((h) => (
            <li
              key={h.key}
              style={{
                background: "var(--panel)",
                borderRadius: 10,
                padding: 8,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 8,
                }}
              >
                <div>
                  <strong>Hymn {h.hymn}</strong> · v.{h.verse}
                </div>
              </div>
              <div style={{ whiteSpace: "pre-wrap" }}>{h.text}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
