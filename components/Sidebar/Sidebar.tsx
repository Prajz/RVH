"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import s from "./Sidebar.module.css";
import { useUIStore } from "@/lib/store";

const NavLink = ({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: string;
}) => {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      className={`${s.link} ${active ? s.active : ""}`}
      aria-current={active ? "page" : undefined}
    >
      <span aria-hidden>{icon}</span>
      <span>{label}</span>
    </Link>
  );
};

export function Sidebar() {
  const language = useUIStore((x) => x.language);
  const setLanguage = useUIStore((x) => x.setLanguage);
  const sidebarOpen = useUIStore((x) => x.sidebarOpen);
  return (
    <aside className={`${s.root} ${sidebarOpen ? s.open : ""}`}>
      <div className={s.top}>
        <div className={s.icon} aria-hidden />
        <div>
          <div className={s.title}>Rig Veda</div>
          <div className={s.subtitle}>Mantra Visualizer</div>
        </div>
      </div>

      <nav className={s.nav} aria-label="Primary">
        <NavLink href="/" label="Dashboard" icon="🏠" />
        <NavLink href="/visualizer" label="Mantra Visualizer" icon="🎵" />
        <NavLink href="/notes" label="Notes & Reflections" icon="📝" />
      </nav>

      <div className={s.spacer} />

      <div className={s.lang}>
        <div className="muted">Language</div>
        <div className={s.pills} role="tablist" aria-label="Language">
          <button
            role="tab"
            aria-selected={language === "sa"}
            onClick={() => setLanguage("sa")}
            className={`${s.pill} ${language === "sa" ? s.pillActive : ""}`}
          >
            Sanskrit
          </button>
          <button
            role="tab"
            aria-selected={language === "en"}
            onClick={() => setLanguage("en")}
            className={`${s.pill} ${language === "en" ? s.pillActive : ""}`}
          >
            English
          </button>
        </div>
      </div>
    </aside>
  );
}
