import type { Preferences, Settings, Template, Trip } from "@/lib/types";
import { getDB, PREFERENCES_ID, SETTINGS_ID } from "./db";

// --- Trips ---

export async function saveTrip(trip: Trip): Promise<void> {
  await getDB().trips.put(trip);
}

export async function getTrip(id: string): Promise<Trip | undefined> {
  return getDB().trips.get(id);
}

export async function deleteTrip(id: string): Promise<void> {
  await getDB().trips.delete(id);
}

/** History diturunkan dari trips, terbaru dulu (ADR 0004). */
export async function listTrips(): Promise<Trip[]> {
  return getDB().trips.orderBy("createdAt").reverse().toArray();
}

export async function duplicateTrip(id: string): Promise<Trip | undefined> {
  const original = await getTrip(id);
  if (!original) return undefined;
  const copy: Trip = {
    ...original,
    id: `trip_${Date.now().toString(36)}`,
    title: `${original.title} (salinan)`,
    createdAt: new Date().toISOString(),
    items: original.items.map((i) => ({ ...i, checked: false })),
    progress: 0,
  };
  await saveTrip(copy);
  return copy;
}

// --- Templates ---

export async function saveTemplate(template: Template): Promise<void> {
  await getDB().templates.put(template);
}

export async function listTemplates(): Promise<Template[]> {
  return getDB().templates.orderBy("createdAt").reverse().toArray();
}

export async function deleteTemplate(id: string): Promise<void> {
  await getDB().templates.delete(id);
}

// --- Preferences ---

const DEFAULT_PREFERENCES: Preferences = {
  id: PREFERENCES_ID,
  neverForget: [],
  itemPreferences: [],
  frequentItems: {},
};

export async function getPreferences(): Promise<Preferences> {
  const existing = await getDB().preferences.get(PREFERENCES_ID);
  return existing ?? DEFAULT_PREFERENCES;
}

export async function savePreferences(prefs: Preferences): Promise<void> {
  await getDB().preferences.put({ ...prefs, id: PREFERENCES_ID });
}

// --- Settings ---

const DEFAULT_SETTINGS: Settings = {
  id: SETTINGS_ID,
  theme: "system",
  language: "id",
  notifications: false,
  aiEnabled: true,
  weatherEnabled: false,
};

export async function getSettings(): Promise<Settings> {
  const existing = await getDB().settings.get(SETTINGS_ID);
  return existing ?? DEFAULT_SETTINGS;
}

export async function saveSettings(settings: Settings): Promise<void> {
  await getDB().settings.put({ ...settings, id: SETTINGS_ID });
}

export async function clearAllData(): Promise<void> {
  const db = getDB();
  await Promise.all([
    db.trips.clear(),
    db.templates.clear(),
    db.preferences.clear(),
    db.settings.clear(),
  ]);
}
