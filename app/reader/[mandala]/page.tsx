import { notFound } from "next/navigation";
import type { MandalaFile } from "@/lib/types";
import { ReaderClient } from "@/components/Reader/ReaderClient";

async function loadMandala(mandala: string): Promise<MandalaFile | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/data/mandala-${mandala}.json`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function ReaderPage({
  params,
}: {
  params: { mandala: string };
}) {
  const data = await loadMandala(params.mandala);
  if (!data) return notFound();
  return (
    <div>
      <h1>Mandala {data.mandala}</h1>
      <ReaderClient data={data} />
      {data.hymns.map((h) => (
        <article
          key={h.hymn}
          style={{
            marginTop: 16,
            padding: 12,
            background: "var(--panel)",
            borderRadius: 12,
          }}
        >
          <header
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <h2 style={{ margin: 0 }}>Hymn {h.hymn}</h2>
            <div className="muted">{h.deities?.join(", ")}</div>
          </header>
          {h.audio && (
            <audio
              controls
              style={{ width: "100%", marginTop: 8 }}
              src={h.audio}
            />
          )}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginTop: 12,
            }}
          >
            <div>
              <h3 style={{ marginTop: 0 }}>Sanskrit</h3>
              {h.verses.map((v) => (
                <p key={v.v}>
                  <strong>{v.v}.</strong> {v.sa}
                </p>
              ))}
            </div>
            <div>
              <h3 style={{ marginTop: 0 }}>English</h3>
              {h.verses.map((v) => (
                <p key={v.v}>
                  <strong>{v.v}.</strong> {v.en}
                </p>
              ))}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
