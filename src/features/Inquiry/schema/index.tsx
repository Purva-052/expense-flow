import { z } from "zod";

const requiredNumber = (message: string) =>
  z.preprocess(
    (val) => {
      if (
        val === "" ||
        val === null ||
        val === undefined ||
        (typeof val === "number" && isNaN(val))
      ) {
        return undefined;
      }
      return Number(val);
    },
    z
      .number({
        required_error: message,
        invalid_type_error: message,
      })
      .min(1, message)
  );

const optionalNumber = () =>
  z.preprocess((val) => {
    if (
      val === "" ||
      val === null ||
      val === undefined ||
      (typeof val === "number" && isNaN(val))
    ) {
      return null;
    }
    return Number(val);
  }, z.number().nullable().optional());

export const InquirySchema = z.object({
  projectName: z.string().trim().optional(),

  clientName: z
    .string()
    .trim()
    .min(2, { message: "Client name must be at least 2 characters long." })
    .max(50, { message: "Client name cannot exceed 50 characters." }),

  countryId: requiredNumber("Country is required"),

  clientContactNo: z.any().optional(),
  clientCompanyName: z.string().trim().optional(),
  sourceOfInquiry: z.string().trim().optional(),

  clientEmailId: z.string().trim().email().optional().or(z.literal("")),
  clientLinkedInProfile: z
    .string()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === "") return true;
      try {
        new URL(val);
        return true;
      } catch {
        return false;
      }
    }, "Must be a valid Profile URL"),

  requirements: z
    .array(z.coerce.number())
    .min(1, { message: "Please select at least one requirement." }),

  inquirySourceId: requiredNumber("Inquiry Channel is required"),

  inboundSourceId: optionalNumber(),
  outboundSourceId: optionalNumber(),
  domainId: optionalNumber(),
  industryId: optionalNumber(),

  inquiryTypeId: requiredNumber("Inquiry type is required"),
  salesPersonId: requiredNumber("Sales person is required"),
  coordinatorId: z.preprocess((val) => {
    if (val === "" || val === null || val === undefined) return null;
    return Number(val);
  }, z.number().nullable()),
  inquiryDate: z.preprocess(
    (val) => {
      if (!val) return undefined;
      return new Date(val as any);
    },
    z.date({
      required_error: "Inquiry Date is required.",
      invalid_type_error: "Inquiry Date is required.",
    })
  ),

  status: z.string().nonempty({ message: "Please select a status." }),

  notes: z
    .string()
    .trim()
    .max(500, { message: "Notes cannot exceed 500 characters." })
    .optional(),
});

export type TInquirySchema = z.infer<typeof InquirySchema>;
