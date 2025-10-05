import Link from "next/link";
import { Suspense } from "react";

export default function Page() {
  return (
    <div>
      <h1>Dashboard</h1>
      <p className="muted">
        Quick access to Mandala 1 sample. Lightweight search coming below.
      </p>
      <div
        style={{ marginTop: 12, display: "flex", gap: 12, flexWrap: "wrap" }}
      >
        <Link className="pill" href="/reader/1">
          Open Reader: Mandala 1
        </Link>
        <Link className="pill" href="/visualizer">
          Open Visualizer
        </Link>
        <Link className="pill" href="/notes">
          Notes & Reflections
        </Link>
      </div>
      <Suspense>
        <LocalSearch />
      </Suspense>
    </div>
  );
}

async function LocalSearch() {
  return null;
}
