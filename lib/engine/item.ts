import type { Item, Priority, Source } from "@/lib/types";

let counter = 0;

/** Membuat Item baru dengan id unik per-sesi. */
export function makeItem(
  name: string,
  priority: Priority,
  source: Source,
  reason?: string,
): Item {
  counter += 1;
  return {
    id: `item_${Date.now().toString(36)}_${counter.toString(36)}`,
    name,
    priority,
    source,
    reason,
    checked: false,
  };
}

export function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}
