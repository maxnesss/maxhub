import { z } from "zod";

import { PROJECT_PRIORITIES } from "@/lib/project-priority";

export const slugSchema = z
  .string()
  .trim()
  .min(2)
  .max(80)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Use lowercase letters, numbers, and hyphens only.",
  );

export const projectSchema = z.object({
  title: z.string().trim().min(2).max(120),
  slug: slugSchema,
  description: z.union([z.string().trim().max(280), z.literal("")]).optional(),
  priority: z.enum(PROJECT_PRIORITIES),
  notes: z.string().optional(),
});

export const projectEditSchema = projectSchema.extend({
  id: z.string().min(1),
});

export type NewProjectInput = z.infer<typeof projectSchema>;
export type ProjectEditInput = z.infer<typeof projectEditSchema>;
