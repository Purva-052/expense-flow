import { z } from "zod";

export const ProjectTypeSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, {
      message: "Project type name must be at least 2 characters long.",
    })
    .max(50, { message: "Project type name cannot exceed 50 characters." }),
});

export type TProjectTypeSchema = z.infer<typeof ProjectTypeSchema>;
