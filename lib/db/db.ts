import { Dexie, type EntityTable } from "dexie";
import type { Preferences, Settings, Template, Trip } from "@/lib/types";

/**
 * Skema IndexedDB (ADR 0004): empat store saja.
 * Item disematkan di dalam Trip. History diturunkan dari query trips.
 */
export class BawaApaDB extends Dexie {
  trips!: EntityTable<Trip, "id">;
  templates!: EntityTable<Template, "id">;
  preferences!: EntityTable<Preferences, "id">;
  settings!: EntityTable<Settings, "id">;

  constructor() {
    super("bawa-apa");
    this.version(1).stores({
      trips: "id, createdAt, departureAt",
      templates: "id, createdAt, name",
      preferences: "id",
      settings: "id",
    });
  }
}

let _db: BawaApaDB | null = null;

/** Akses DB lazy agar aman di lingkungan server (SSR) yang tak punya IndexedDB. */
export function getDB(): BawaApaDB {
  if (typeof window === "undefined") {
    throw new Error("IndexedDB hanya tersedia di browser.");
  }
  if (!_db) _db = new BawaApaDB();
  return _db;
}

export const PREFERENCES_ID = "default";
export const SETTINGS_ID = "default";
