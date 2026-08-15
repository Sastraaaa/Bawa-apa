import type { Context } from "@/lib/types";

/**
 * Parser lokal: kalimat bahasa Indonesia -> Context.
 * Deterministik, tanpa AI, tanpa jaringan (ADR 0003).
 * Menangani kasus umum; kalimat rumit bisa di-fallback ke AI di layer atas.
 */

type Match = { keywords: string[]; id: string };

const ACTIVITY_MATCHERS: Match[] = [
  { id: "campus", keywords: ["kampus", "kuliah", "sidang"] },
  { id: "work", keywords: ["kerja", "kantor", "meeting", "rapat"] },
  { id: "gym", keywords: ["gym", "olahraga", "workout", "fitness", "nge-gym"] },
  { id: "hangout", keywords: ["nongkrong", "hangout", "ngopi", "kafe", "cafe"] },
  { id: "riding", keywords: ["riding", "touring", "nge-trail"] },
  { id: "traveling", keywords: ["traveling", "liburan", "jalan-jalan", "wisata", "trip"] },
  { id: "overnight", keywords: ["menginap", "nginap", "menginep", "stay"] },
  { id: "camping", keywords: ["camping", "kemah", "berkemah", "mendaki", "naik gunung"] },
  { id: "beach", keywords: ["pantai", "beach", "berenang", "snorkeling"] },
  { id: "photography", keywords: ["fotografi", "hunting foto", "motret", "foto"] },
  { id: "formal", keywords: ["formal", "wisuda", "pernikahan", "kondangan", "acara resmi"] },
];

const TRANSPORT_MATCHERS: Match[] = [
  { id: "motorcycle", keywords: ["motor", "sepeda motor", "ojek"] },
  { id: "car", keywords: ["mobil", "nyetir"] },
  { id: "public", keywords: ["kereta", "bus", "busway", "angkot", "krl", "mrt", "trans"] },
  { id: "plane", keywords: ["pesawat", "terbang", "flight"] },
  { id: "bicycle", keywords: ["sepeda", "gowes"] },
  { id: "walk", keywords: ["jalan kaki"] },
];

const PURPOSE_MATCHERS: Match[] = [
  { id: "presentation", keywords: ["presentasi", "sidang", "pitch"] },
  { id: "photography", keywords: ["motret", "hunting foto", "fotografi"] },
  { id: "meeting", keywords: ["meeting", "rapat"] },
  { id: "exam", keywords: ["ujian", "uas", "uts"] },
];

function findFirst(text: string, matchers: Match[]): string | undefined {
  for (const m of matchers) {
    if (m.keywords.some((k) => text.includes(k))) return m.id;
  }
  return undefined;
}

function findAll(text: string, matchers: Match[]): string[] {
  const found: string[] = [];
  for (const m of matchers) {
    if (m.keywords.some((k) => text.includes(k)) && !found.includes(m.id)) {
      found.push(m.id);
    }
  }
  return found;
}

function detectOvernight(text: string): boolean | undefined {
  if (/(menginap|nginap|menginep|semalam|nge-?stay)/.test(text)) return true;
  return undefined;
}

function detectDuration(text: string): Context["duration"] {
  const days = text.match(/(\d+)\s*hari/);
  if (days) return { value: Number(days[1]), unit: "days" };
  const hours = text.match(/(\d+)\s*jam/);
  if (hours) return { value: Number(hours[1]), unit: "hours" };
  if (/(pagi.*(sore|malam)|seharian)/.test(text)) {
    return { value: 8, unit: "hours" };
  }
  return undefined;
}

function detectWeather(text: string): string | undefined {
  if (/(hujan|mendung|gerimis)/.test(text)) return "possible_rain";
  if (/(panas|terik|gerah)/.test(text)) return "hot";
  return undefined;
}

export function parseContext(input: string): Context {
  const text = input.toLowerCase();

  const activity = findFirst(text, ACTIVITY_MATCHERS);
  const transport = findFirst(text, TRANSPORT_MATCHERS);
  const purpose = findAll(text, PURPOSE_MATCHERS);
  const duration = detectDuration(text);
  const overnight = detectOvernight(text);
  const weatherContext = detectWeather(text);

  return {
    activity,
    purpose,
    transport,
    duration,
    overnight: overnight ?? (activity === "overnight" ? true : undefined),
    weatherContext,
    specialNeeds: [],
    destination: undefined,
  };
}

/**
 * Seberapa yakin parser lokal atas kalimat ini (0..1).
 * Dipakai layer atas untuk memutuskan fallback ke AI.
 */
export function parseConfidence(ctx: Context): number {
  let score = 0;
  if (ctx.activity) score += 0.6;
  if (ctx.transport) score += 0.2;
  if (ctx.duration) score += 0.1;
  if (ctx.purpose.length) score += 0.1;
  return score;
}
