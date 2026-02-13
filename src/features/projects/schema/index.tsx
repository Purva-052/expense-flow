import { PROJECT_SERVER_STATUS, PROJECT_SERVER_TYPE } from "@/types";
import { z } from "zod";

// Base schema without refine - can be used with .omit()
const projectFormSchemaBase = z.object({
  name: z
    .string()
    .min(2, "Project name must be at least 2 characters")
    .max(100),
  description: z.string().optional().nullable(),
  clientId: z.number({ invalid_type_error: "Client is required" }),
  technologyId: z
    .array(z.number(), { invalid_type_error: "Technologies are required" })
    .nonempty("At least one technology is required"),
  projectTypeId: z.number({ message: "Project Type is required" }),
  startDate: z.preprocess(
    (val) => {
      if (
        val === "" ||
        val === null ||
        val === undefined ||
        (val instanceof Date && isNaN(val.getTime()))
      ) {
        return undefined;
      }
      return val;
    },
    z.date({
      required_error: "Start date is required",
      invalid_type_error: "Start date is required",
    })
  ),

  expectedCompletionDate: z.coerce
    .date({
      invalid_type_error: "Invalid date",
    })
    .optional(),

  handlerId: z
    .union([z.number().min(1), z.undefined(), z.null()])
    .refine((val) => val !== null && val !== undefined && val >= 1, {
      message: "Project Coordinator is required",
    }),

  percentageComplete: z.preprocess(
    (val) => (val === "" || val == null ? 0 : Number(val)),
    z
      .number({ invalid_type_error: "Progress must be a number" })
      .min(0, "Progress cannot be negative")
      .max(100, "Progress cannot exceed 100")
  ),
  status: z
    .string({ required_error: "Status is required" })
    .min(1, "Status is required"),
  priority: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.enum(["low", "medium", "high"], {
      required_error: "Priority is required",
      invalid_type_error: "Priority is required",
    })
  ),
  projectDocuments: z
    .array(
      z.object({
        link: z.string().url("Enter a valid URL"),
        note: z.string().optional(),
      })
    )
    .optional(),
  isVisibleToAllDevTeam: z.boolean(),
  isVisibleToAllBdeTeam: z.boolean(),
});

// Main schema with date validation
export const projectFormSchema = projectFormSchemaBase.refine(
  (data) => {
    // Only validate if both dates are present
    if (!data.startDate || !data.expectedCompletionDate) return true;

    const startDate = new Date(data.startDate);
    const expectedDate = new Date(data.expectedCompletionDate);

    return expectedDate >= startDate;
  },
  {
    message: "Expected completion date cannot be before start date",
    path: ["expectedCompletionDate"], // This will show the error on the expectedCompletionDate field
  }
);

// Export base schema for cases where .omit() is needed
export const projectFormSchemaWithoutRefine = projectFormSchemaBase;

export type TProjectFormSchema = z.infer<typeof projectFormSchema>;

export const singleDocSchema = z.object({
  documentName: z.string().trim().min(1, "Document name is required"),

  notes: z.string().trim().optional(),

  link: z
    .string()
    .trim()
    .min(1, "Link is required")
    .url("Please enter a valid URL like https://example.com"),
});

export const _documentListSchema = z.object({
  documents: z.array(singleDocSchema).min(1, "At least one document required"),
});

export type TProjectDocumentSchema = z.infer<typeof _documentListSchema>;

export const ProjectServerSchema = z.object({
  url: z
    .string()
    .url({ message: "Please enter a valid URL like https://example.com" })
    .min(5, { message: "URL must be at least 5 characters long." })
    .max(100, { message: "URL cannot exceed 100 characters." })
    .trim(),
  port: z.any().optional(),

  type: z.enum(
    [
      PROJECT_SERVER_TYPE.BACKEND,
      PROJECT_SERVER_TYPE.FRONTEND,
      PROJECT_SERVER_TYPE.S3,
    ],
    {
      errorMap: () => ({ message: "Please select a valid server type." }),
    }
  ),

  serverId: z.any().optional(),
  status: z.enum(
    [PROJECT_SERVER_STATUS.ACTIVE, PROJECT_SERVER_STATUS.INACTIVE],
    {
      errorMap: () => ({ message: "Please select a valid status." }),
    }
  ),
});

export type TProjectServerSchema = z.infer<typeof ProjectServerSchema>;
