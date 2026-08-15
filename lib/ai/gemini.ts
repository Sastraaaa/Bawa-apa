import "server-only";
import type { Context } from "@/lib/types";

/**
 * Klien Gemini SERVER-ONLY (ADR 0002). Modul ini mengimpor "server-only"
 * sehingga build gagal bila tak sengaja diimpor dari kode klien.
 * Memakai REST endpoint generateContent agar tanpa dependency tambahan.
 */

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL ?? "gemini-1.5-flash";

export function isGeminiConfigured(): boolean {
  return typeof API_KEY === "string" && API_KEY.length > 0;
}

/**
 * Memanggil Gemini dan meminta output JSON. Melempar bila tidak dikonfigurasi
 * atau gagal — pemanggil (route handler) menerjemahkan ke 5xx dan klien
 * jatuh ke jalur lokal.
 */
export async function generateJson(prompt: string): Promise<unknown> {
  if (!isGeminiConfigured()) {
    throw new Error("GEMINI_API_KEY belum dikonfigurasi.");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.4,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!res.ok) throw new Error(`Gemini error: ${res.status}`);

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Respons Gemini kosong.");

  return JSON.parse(text);
}

// --- Prompt builders ---

export function extractPrompt(text: string): string {
  return [
    "Ekstrak konteks aktivitas dari kalimat berikut menjadi JSON.",
    "Skema JSON (purpose & specialNeeds wajib array, sisanya opsional):",
    `{"activity": string, "purpose": string[], "destination": string, "duration": {"value": number, "unit": "hours"|"days"}, "transport": "motorcycle"|"car"|"public"|"plane"|"bicycle"|"walk", "overnight": boolean, "weatherContext": "possible_rain"|"hot", "specialNeeds": string[]}`,
    "Gunakan id aktivitas dari daftar: campus, work, gym, hangout, riding, traveling, overnight, camping, beach, photography, formal.",
    "Balas HANYA JSON, tanpa penjelasan.",
    `Kalimat: "${text}"`,
  ].join("\n");
}

export function recommendPrompt(context: Context, existingItems: string[]): string {
  return [
    "Kamu membantu melengkapi checklist barang bawaan.",
    "Berdasarkan konteks dan barang yang sudah ada, sarankan HANYA barang TAMBAHAN yang relevan.",
    "Jangan menduplikasi barang yang sudah ada. Maksimal 6 barang. Berikan alasan pendek.",
    "Balas HANYA JSON dengan skema:",
    `{"items": [{"name": string, "priority": "required"|"recommended"|"optional", "reason": string}]}`,
    `Konteks: ${JSON.stringify(context)}`,
    `Barang yang sudah ada: ${JSON.stringify(existingItems)}`,
  ].join("\n");
}

export function reviewPrompt(context: Context, items: string[]): string {
  return [
    "Tinjau checklist barang berikut terhadap konteks aktivitas.",
    "Sebutkan kemungkinan barang penting yang terlewat atau tidak konsisten.",
    "Jangan mengubah checklist, hanya beri catatan singkat. Maksimal 5 temuan.",
    "Balas HANYA JSON dengan skema:",
    `{"findings": string[]}`,
    `Konteks: ${JSON.stringify(context)}`,
    `Checklist: ${JSON.stringify(items)}`,
  ].join("\n");
}
