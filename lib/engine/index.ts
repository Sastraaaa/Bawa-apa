import type { Context, Trip } from "@/lib/types";
import { parseContext, parseConfidence } from "./parser";
import { buildChecklist, computeProgress } from "./build";

/**
 * Titik masuk jalur lokal: kalimat -> Trip lengkap tanpa AI (ADR 0003).
 * Layer di atas boleh memperkaya dengan AI setelahnya.
 */
export function createLocalTrip(
  input: string,
  options?: { neverForget?: string[]; avoid?: string[] },
): { trip: Trip; confidence: number } {
  const context = parseContext(input);
  const confidence = parseConfidence(context);
  const items = buildChecklist(context, options);

  const trip: Trip = {
    id: `trip_${Date.now().toString(36)}`,
    title: deriveTitle(input, context),
    createdAt: new Date().toISOString(),
    context,
    items,
    progress: computeProgress(items),
    aiEnriched: false,
  };

  return { trip, confidence };
}

function deriveTitle(input: string, context: Context): string {
  const trimmed = input.trim();
  if (trimmed.length > 0 && trimmed.length <= 40) return capitalize(trimmed);
  if (trimmed.length > 40) return capitalize(trimmed.slice(0, 37)) + "…";
  return context.activity ? capitalize(context.activity) : "Checklist";
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export { parseContext, parseConfidence, buildChecklist, computeProgress };
