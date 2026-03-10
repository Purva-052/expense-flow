import { z } from "zod";

export const DomainSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, {
      message: "Domain name must be at least 2 characters long.",
    })
    .max(50, { message: "Domain name cannot exceed 50 characters." }),
});

export type TDomainSchema = z.infer<typeof DomainSchema>;
