import { z } from "zod";
import { contextSchema, itemSchema } from "@/lib/types";

/**
 * Kontrak Zod bersama untuk AI Proxy (ADR 0002).
 * Dipakai baik oleh route handler (server) maupun klien (browser).
 */

// /api/ai/extract
export const extractRequestSchema = z.object({
  text: z.string().min(1).max(500),
});
export type ExtractRequest = z.infer<typeof extractRequestSchema>;

export const extractResponseSchema = z.object({
  context: contextSchema,
});
export type ExtractResponse = z.infer<typeof extractResponseSchema>;

// /api/ai/recommend
export const recommendRequestSchema = z.object({
  context: contextSchema,
  existingItems: z.array(z.string()).default([]),
});
export type RecommendRequest = z.infer<typeof recommendRequestSchema>;

// AI hanya boleh mengembalikan tambahan; source dipaksa "ai" di klien.
export const recommendResponseSchema = z.object({
  items: z.array(itemSchema.pick({ name: true, priority: true, reason: true })),
});
export type RecommendResponse = z.infer<typeof recommendResponseSchema>;

// /api/ai/review
export const reviewRequestSchema = z.object({
  context: contextSchema,
  items: z.array(z.string()).default([]),
});
export type ReviewRequest = z.infer<typeof reviewRequestSchema>;

export const reviewResponseSchema = z.object({
  findings: z.array(z.string()),
});
export type ReviewResponse = z.infer<typeof reviewResponseSchema>;
