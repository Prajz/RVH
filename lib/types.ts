export type Verse = { v: number; sa: string; en: string };
export type Hymn = {
  mandala: number;
  hymn: number;
  deities?: string[];
  meter?: string;
  verses: Verse[];
  audio?: string; // absolute or relative URL
};
export type MandalaFile = { mandala: number; hymns: Hymn[] };

export type Lens = "vibration" | "soul" | "existence";

export type Note = {
  text: string;
  updatedAt: number;
  lens?: Lens;
};
