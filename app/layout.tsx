import "./globals.css";
import { Sidebar } from "@/components/Sidebar/Sidebar";
import styles from "./layout.module.css";
import type { ReactNode } from "react";

export const metadata = { title: "Rig Veda", description: "Mantra Visualizer" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="app">
          <Sidebar />
          <main className="content">
            <div className="container">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
