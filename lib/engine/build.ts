import type { Context, Item, Priority } from "@/lib/types";
import { presetItems } from "./presets";
import { applyRules } from "./rules";
import { makeItem, normalizeName } from "./item";

const PRIORITY_RANK: Record<Priority, number> = {
  required: 0,
  recommended: 1,
  optional: 2,
};

/**
 * Gabungkan Preset + Smart Rule menjadi checklist dasar.
 * Sepenuhnya lokal, tanpa AI (ADR 0003). Dedup berdasar nama ternormalisasi;
 * item dengan prioritas lebih tinggi menang.
 */
export function buildChecklist(
  context: Context,
  options?: { neverForget?: string[]; avoid?: string[] },
): Item[] {
  const collected = [...presetItems(context.activity), ...applyRules(context)];

  const neverForget = options?.neverForget ?? [];
  for (const name of neverForget) {
    collected.push(
      makeItem(name, "required", "memory", "Ditandai sebagai barang yang jangan sampai ketinggalan."),
    );
  }

  const avoid = new Set((options?.avoid ?? []).map(normalizeName));
  const byName = new Map<string, Item>();

  for (const item of collected) {
    const key = normalizeName(item.name);
    if (avoid.has(key)) continue;

    const existing = byName.get(key);
    if (!existing) {
      byName.set(key, item);
      continue;
    }
    if (PRIORITY_RANK[item.priority] < PRIORITY_RANK[existing.priority]) {
      byName.set(key, item);
    }
  }

  return sortItems([...byName.values()]);
}

export function sortItems(items: Item[]): Item[] {
  return [...items].sort((a, b) => {
    const p = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    if (p !== 0) return p;
    return a.name.localeCompare(b.name, "id");
  });
}

/** Sisipkan item tambahan (mis. dari AI) tanpa duplikasi. */
export function mergeItems(existing: Item[], additions: Item[]): Item[] {
  const byName = new Map<string, Item>();
  for (const item of existing) byName.set(normalizeName(item.name), item);
  for (const add of additions) {
    const key = normalizeName(add.name);
    if (!byName.has(key)) byName.set(key, add);
  }
  return sortItems([...byName.values()]);
}

export function computeProgress(items: Item[]): number {
  if (items.length === 0) return 0;
  const done = items.filter((i) => i.checked).length;
  return Math.round((done / items.length) * 100);
}
