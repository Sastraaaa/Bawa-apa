import { create } from "zustand";
import type { Item, Priority, Trip } from "@/lib/types";
import { computeProgress, mergeItems, buildChecklist } from "@/lib/engine/build";
import { makeItem } from "@/lib/engine/item";
import { createLocalTrip } from "@/lib/engine";
import { parseConfidence } from "@/lib/engine/parser";
import { aiExtract, aiRecommend } from "@/lib/ai/client";
import { getPreferences, saveTrip } from "@/lib/db/queries";

type AiStatus = "idle" | "loading" | "done" | "unavailable";

type ChecklistState = {
  trip: Trip | null;
  aiStatus: AiStatus;

  createFromInput: (input: string) => Promise<Trip>;
  loadTrip: (trip: Trip) => void;
  enrichWithAi: () => Promise<void>;

  toggleItem: (id: string) => void;
  addItem: (name: string, priority: Priority) => void;
  editItem: (id: string, name: string) => void;
  deleteItem: (id: string) => void;
  moveItem: (id: string, priority: Priority) => void;
};

function recompute(trip: Trip): Trip {
  return { ...trip, progress: computeProgress(trip.items) };
}

async function persist(trip: Trip | null): Promise<void> {
  if (!trip) return;
  try {
    await saveTrip(trip);
  } catch {
    // Offline / SSR: abaikan; state tetap ada di memori.
  }
}

export const useChecklistStore = create<ChecklistState>((set, get) => ({
  trip: null,
  aiStatus: "idle",

  async createFromInput(input) {
    let neverForget: string[] = [];
    let avoid: string[] = [];
    try {
      const prefs = await getPreferences();
      neverForget = prefs.neverForget;
      avoid = prefs.itemPreferences
        .filter((p) => p.preference === "avoid")
        .map((p) => p.item);
    } catch {
      // preferensi belum ada / SSR
    }

    // Jalur lokal dulu — selalu berhasil (ADR 0003).
    const { trip, confidence } = createLocalTrip(input, { neverForget, avoid });
    set({ trip, aiStatus: "idle" });
    await persist(trip);

    // Bila parser kurang yakin, coba perbaiki konteks via AI (best-effort).
    if (confidence < 0.6) {
      const aiContext = await aiExtract(input);
      if (aiContext && parseConfidence(aiContext) > confidence) {
        const items = buildChecklist(aiContext, { neverForget, avoid });
        const merged = mergeItems(trip.items, items);
        const improved = recompute({ ...trip, context: aiContext, items: merged });
        set({ trip: improved });
        await persist(improved);
        return improved;
      }
    }
    return trip;
  },

  loadTrip(trip) {
    set({ trip, aiStatus: trip.aiEnriched ? "done" : "idle" });
  },

  async enrichWithAi() {
    const current = get().trip;
    if (!current || current.aiEnriched) return; // hemat AI: jangan ulang
    set({ aiStatus: "loading" });

    const existing = current.items.map((i) => i.name);
    const additions = await aiRecommend(current.context, existing);

    if (additions.length === 0) {
      set({ aiStatus: "unavailable" });
      return;
    }

    const merged = mergeItems(current.items, additions);
    const updated = recompute({ ...current, items: merged, aiEnriched: true });
    set({ trip: updated, aiStatus: "done" });
    await persist(updated);
  },

  toggleItem(id) {
    const trip = get().trip;
    if (!trip) return;
    const items = trip.items.map((i) =>
      i.id === id ? { ...i, checked: !i.checked } : i,
    );
    const updated = recompute({ ...trip, items });
    set({ trip: updated });
    void persist(updated);
  },

  addItem(name, priority) {
    const trip = get().trip;
    if (!trip || name.trim() === "") return;
    const item = makeItem(name.trim(), priority, "manual");
    const updated = recompute({ ...trip, items: [...trip.items, item] });
    set({ trip: updated });
    void persist(updated);
  },

  editItem(id, name) {
    const trip = get().trip;
    if (!trip) return;
    const items = trip.items.map((i) =>
      i.id === id ? { ...i, name: name.trim() } : i,
    );
    const updated = { ...trip, items };
    set({ trip: updated });
    void persist(updated);
  },

  deleteItem(id) {
    const trip = get().trip;
    if (!trip) return;
    const items = trip.items.filter((i) => i.id !== id);
    const updated = recompute({ ...trip, items });
    set({ trip: updated });
    void persist(updated);
  },

  moveItem(id, priority) {
    const trip = get().trip;
    if (!trip) return;
    const items = trip.items.map((i) => (i.id === id ? { ...i, priority } : i));
    const updated = { ...trip, items };
    set({ trip: updated });
    void persist(updated);
  },
}));

export type { AiStatus, Item };
