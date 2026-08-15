import type { Context, Item } from "@/lib/types";
import { makeItem } from "./item";

/**
 * Smart Rule deterministik: IF konteks THEN item (ADR 0003).
 * Berjalan lokal tanpa AI. Tiap rule mengembalikan Item dengan source "rule".
 */
type Rule = {
  id: string;
  when: (ctx: Context) => boolean;
  items: () => Item[];
};

const RULES: Rule[] = [
  {
    id: "motor",
    when: (c) => c.transport === "motorcycle",
    items: () => [
      makeItem("Jas hujan", "recommended", "rule", "Disarankan karena bepergian dengan sepeda motor."),
      makeItem("Sarung tangan", "optional", "rule", "Menambah kenyamanan berkendara motor."),
    ],
  },
  {
    id: "overnight",
    when: (c) => c.overnight === true,
    items: () => [
      makeItem("Perlengkapan mandi", "required", "rule", "Dibutuhkan karena menginap."),
      makeItem("Pakaian ganti", "required", "rule", "Dibutuhkan karena menginap."),
    ],
  },
  {
    id: "multiday",
    when: (c) => c.duration?.unit === "days" && c.duration.value > 1,
    items: () => [
      makeItem("Pakaian ganti tambahan", "recommended", "rule", "Perjalanan lebih dari satu hari."),
    ],
  },
  {
    id: "presentation",
    when: (c) => c.purpose.includes("presentation"),
    items: () => [
      makeItem("Laptop", "required", "rule", "Dibutuhkan untuk presentasi."),
      makeItem("Charger laptop", "required", "rule", "Mencegah laptop kehabisan daya."),
      makeItem("Adapter HDMI", "recommended", "rule", "Untuk menyambung ke proyektor."),
      makeItem("File presentasi (backup)", "recommended", "rule", "Cadangan bila file utama bermasalah."),
    ],
  },
  {
    id: "photography",
    when: (c) => c.purpose.includes("photography") || c.activity === "photography",
    items: () => [
      makeItem("Kamera", "required", "rule", "Kegiatan fotografi."),
      makeItem("Baterai cadangan", "required", "rule", "Agar tidak kehabisan daya saat memotret."),
      makeItem("Memory card", "required", "rule", "Media penyimpanan foto."),
    ],
  },
  {
    id: "rain",
    when: (c) => c.weatherContext === "possible_rain",
    items: () => [
      makeItem("Payung", "recommended", "rule", "Kemungkinan hujan."),
      makeItem("Cover tas", "optional", "rule", "Melindungi barang saat hujan."),
    ],
  },
  {
    id: "hot",
    when: (c) => c.weatherContext === "hot",
    items: () => [
      makeItem("Botol minum", "recommended", "rule", "Cuaca panas, jaga cairan tubuh."),
      makeItem("Sunscreen", "optional", "rule", "Melindungi kulit dari sinar matahari."),
      makeItem("Topi", "optional", "rule", "Melindungi dari terik."),
    ],
  },
  {
    id: "long-day",
    when: (c) => c.duration?.unit === "hours" && c.duration.value >= 6,
    items: () => [
      makeItem("Powerbank", "recommended", "rule", "Aktivitas berlangsung lama, ponsel butuh daya cadangan."),
    ],
  },
];

export function applyRules(context: Context): Item[] {
  const out: Item[] = [];
  for (const rule of RULES) {
    if (rule.when(context)) out.push(...rule.items());
  }
  return out;
}
