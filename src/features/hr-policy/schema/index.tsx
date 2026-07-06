import { z } from "zod";

export const HRPolicySchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(2, {
        message: "Title must be at least 2 characters long.",
      })
      .max(100, { message: "Title cannot exceed 100 characters." }),
    file: z
      .any()
      .optional()
      .refine((file) => {
        if (!file) return true;
        if (!(file instanceof File)) return true;
        const validExtensions = [".pdf"];
        const fileName = file.name.toLowerCase();
        const hasValidExtension = validExtensions.some((ext) =>
          fileName.endsWith(ext)
        );
        if (!hasValidExtension) return false;
        const maxSize = 10 * 1024 * 1024; // 10MB
        return file.size <= maxSize;
      }, "Attachment must be a PDF file and not exceed 10MB"),
    fileS3Key: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.file && !data.fileS3Key) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "PDF attachment is required.",
        path: ["file"],
      });
    }
  });

export type THRPolicySchema = z.infer<typeof HRPolicySchema>;
