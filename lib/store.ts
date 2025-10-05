"use client";
import { create } from "zustand";

type Language = "sa" | "en";

type UIState = {
  language: Language;
  sidebarOpen: boolean;
  setLanguage: (lang: Language) => void;
  toggleSidebar: () => void;
};

const readLanguage = (): Language => {
  if (typeof window === "undefined") return "en";
  const v = window.localStorage.getItem("rvh-language");
  return v === "sa" || v === "en" ? v : "en";
};

export const useUIStore = create<UIState>((set, get) => ({
  language: readLanguage(),
  sidebarOpen: false,
  setLanguage: (lang) => {
    if (typeof window !== "undefined")
      window.localStorage.setItem("rvh-language", lang);
    set({ language: lang });
  },
  toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),
}));
