import type { Item, Priority } from "@/lib/types";
import { makeItem } from "./item";

/**
 * Preset aktivitas bawaan. Bekerja tanpa AI dan tanpa internet (ADR 0003).
 * Kunci = id activity yang dihasilkan parser lokal.
 */
export type PresetDef = {
  id: string;
  label: string;
  items: { name: string; priority: Priority }[];
};

export const PRESETS: PresetDef[] = [
  {
    id: "campus",
    label: "Kampus",
    items: [
      { name: "HP", priority: "required" },
      { name: "Dompet", priority: "required" },
      { name: "Alat tulis", priority: "recommended" },
      { name: "Buku / catatan", priority: "recommended" },
      { name: "Botol minum", priority: "optional" },
    ],
  },
  {
    id: "work",
    label: "Kerja",
    items: [
      { name: "HP", priority: "required" },
      { name: "Dompet", priority: "required" },
      { name: "Kartu akses / ID", priority: "required" },
      { name: "Laptop", priority: "recommended" },
      { name: "Charger", priority: "recommended" },
    ],
  },
  {
    id: "gym",
    label: "Gym",
    items: [
      { name: "Pakaian olahraga", priority: "required" },
      { name: "Sepatu", priority: "required" },
      { name: "Handuk", priority: "recommended" },
      { name: "Botol minum", priority: "recommended" },
    ],
  },
  {
    id: "hangout",
    label: "Nongkrong",
    items: [
      { name: "HP", priority: "required" },
      { name: "Dompet", priority: "required" },
      { name: "Powerbank", priority: "optional" },
    ],
  },
  {
    id: "riding",
    label: "Riding",
    items: [
      { name: "Helm", priority: "required" },
      { name: "SIM & STNK", priority: "required" },
      { name: "Sarung tangan", priority: "recommended" },
      { name: "Jaket", priority: "recommended" },
    ],
  },
  {
    id: "traveling",
    label: "Traveling",
    items: [
      { name: "Dompet", priority: "required" },
      { name: "Identitas", priority: "required" },
      { name: "HP & charger", priority: "required" },
      { name: "Pakaian ganti", priority: "recommended" },
      { name: "Powerbank", priority: "recommended" },
    ],
  },
  {
    id: "overnight",
    label: "Menginap",
    items: [
      { name: "Pakaian ganti", priority: "required" },
      { name: "Perlengkapan mandi", priority: "required" },
      { name: "Charger", priority: "recommended" },
    ],
  },
  {
    id: "camping",
    label: "Camping",
    items: [
      { name: "Tenda", priority: "required" },
      { name: "Sleeping bag", priority: "required" },
      { name: "Senter", priority: "recommended" },
      { name: "Jaket tebal", priority: "recommended" },
      { name: "Perlengkapan masak", priority: "optional" },
    ],
  },
  {
    id: "beach",
    label: "Pantai",
    items: [
      { name: "Sunscreen", priority: "required" },
      { name: "Kacamata hitam", priority: "recommended" },
      { name: "Baju ganti", priority: "recommended" },
      { name: "Topi", priority: "optional" },
    ],
  },
  {
    id: "photography",
    label: "Fotografi",
    items: [
      { name: "Kamera", priority: "required" },
      { name: "Baterai cadangan", priority: "required" },
      { name: "Memory card", priority: "required" },
      { name: "Tripod", priority: "optional" },
    ],
  },
  {
    id: "formal",
    label: "Acara formal",
    items: [
      { name: "Pakaian formal", priority: "required" },
      { name: "Sepatu formal", priority: "required" },
      { name: "Dompet", priority: "required" },
      { name: "Parfum", priority: "optional" },
    ],
  },
];

export function getPreset(activityId?: string): PresetDef | undefined {
  if (!activityId) return undefined;
  return PRESETS.find((p) => p.id === activityId);
}

export function presetItems(activityId?: string): Item[] {
  const preset = getPreset(activityId);
  if (!preset) return [];
  return preset.items.map((i) =>
    makeItem(
      i.name,
      i.priority,
      "preset",
      `Bagian dari perlengkapan ${preset.label.toLowerCase()}.`,
    ),
  );
}
