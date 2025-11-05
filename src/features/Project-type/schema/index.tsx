import { z } from "zod";

export const ProjectTypeSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "Project type name must be at least 2 characters long.",
    })
    .max(50, { message: "Project type name cannot exceed 50 characters." })
    .trim(),
});

export type TProjectTypeSchema = z.infer<typeof ProjectTypeSchema>;
