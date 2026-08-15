import { z } from "zod";

export const prioritySchema = z.enum(["required", "recommended", "optional"]);
export type Priority = z.infer<typeof prioritySchema>;

export const sourceSchema = z.enum([
  "preset",
  "rule",
  "ai",
  "manual",
  "memory",
]);
export type Source = z.infer<typeof sourceSchema>;

export const itemSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  priority: prioritySchema,
  reason: z.string().optional(),
  source: sourceSchema,
  checked: z.boolean().default(false),
});
export type Item = z.infer<typeof itemSchema>;

export const durationSchema = z.object({
  value: z.number().nonnegative(),
  unit: z.enum(["hours", "days"]),
});
export type Duration = z.infer<typeof durationSchema>;

export const contextSchema = z.object({
  activity: z.string().optional(),
  purpose: z.array(z.string()).default([]),
  destination: z.string().optional(),
  duration: durationSchema.optional(),
  transport: z.string().optional(),
  overnight: z.boolean().optional(),
  weatherContext: z.string().optional(),
  specialNeeds: z.array(z.string()).default([]),
});
export type Context = z.infer<typeof contextSchema>;

export const tripSchema = z.object({
  id: z.string(),
  title: z.string(),
  createdAt: z.string(),
  departureAt: z.string().optional(),
  context: contextSchema,
  items: z.array(itemSchema),
  progress: z.number().min(0).max(100),
  aiEnriched: z.boolean().default(false),
});
export type Trip = z.infer<typeof tripSchema>;

export const templateSchema = z.object({
  id: z.string(),
  name: z.string(),
  items: z.array(itemSchema),
  createdAt: z.string(),
});
export type Template = z.infer<typeof templateSchema>;

export type ItemPreference = {
  item: string;
  preference: "useful" | "avoid";
};

export type Preferences = {
  id: string;
  neverForget: string[];
  itemPreferences: ItemPreference[];
  frequentItems: Record<string, number>;
};

export type Settings = {
  id: string;
  theme: "light" | "dark" | "system";
  language: "id";
  notifications: boolean;
  aiEnabled: boolean;
  weatherEnabled: boolean;
};
