import { z } from "zod";

export const ServerSchema = z.object({
  ipOrUrl: z
    .string()
    .min(5, { message: "IP or URL must be at least 5 characters long." })
    .max(100, { message: "IP or URL cannot exceed 100 characters." })
    .trim(),

  type: z.enum(["frontend", "backend", "s3"], {
    errorMap: () => ({ message: "Please select a valid server type." }),
  }),

  owner: z.enum(["devstree", "client"], {
    errorMap: () => ({ message: "Please select a valid owner." }),
  }),

  ssl: z.boolean({ required_error: "Please select SSL or NONSSL." }),

  serverId: z
    .string()
    .min(2, { message: "Server ID must be at least 2 characters long." })
    .max(50, { message: "Server ID cannot exceed 50 characters." })
    .trim(),

  status: z.enum(["active", "inactive", "maintenance"], {
    errorMap: () => ({ message: "Please select a valid status." }),
  }),
});

export type TServerSchema = z.infer<typeof ServerSchema>;
