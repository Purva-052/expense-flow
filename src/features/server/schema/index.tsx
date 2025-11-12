import { OWNER_TYPE } from "@/types";
import { z } from "zod";

export const ServerSchema = z.object({
  ip: z
    .string()
    .trim()
    .regex(
      /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/,
      { message: "Please enter a valid IP address." }
    ),

  ownerName: z.enum([OWNER_TYPE.DEVSTREE, OWNER_TYPE.CLIENT], {
    errorMap: () => ({ message: "Please select a valid owner." }),
  }),

  ssl: z.boolean({ required_error: "Please select SSL or NONSSL." }),
});

export type TServerSchema = z.infer<typeof ServerSchema>;
