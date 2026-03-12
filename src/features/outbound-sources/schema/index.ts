import { z } from "zod";

export const OutboundSourceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, {
      message: "Outbound Source name must be at least 2 characters long.",
    })
    .max(50, { message: "Outbound Source name cannot exceed 50 characters." }),
});

export type TOutboundSourceSchema = z.infer<typeof OutboundSourceSchema>;
