import { z } from "zod";

export const InboundSourceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, {
      message: "Inbound Source name must be at least 2 characters long.",
    })
    .max(50, { message: "Inbound Source name cannot exceed 50 characters." }),
  domainId: z.preprocess(
    (val) => (val === "" || val === null ? undefined : String(val)),
    z.string().optional()
  ),
});

export type TInboundSourceSchema = z.infer<typeof InboundSourceSchema>;
