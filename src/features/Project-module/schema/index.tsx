import { z } from "zod";

export const ProjectModuleSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "Project module name must be at least 2 characters long.",
    })
    .max(50, { message: "Project module name cannot exceed 50 characters." })
    .trim(),
});

export type TProjectModuleSchema = z.infer<typeof ProjectModuleSchema>;
