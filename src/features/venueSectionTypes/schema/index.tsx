import { z } from 'zod'

export const VenueSectionTypeFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Venue section type name must be at least 2 characters long.' })
    .max(100, { message: 'Venue section type name cannot exceed 100 characters.' })
    .trim(),
  isEdit: z.boolean().optional(),
})

export type TVenueSectionTypeFormSchema = z.infer<typeof VenueSectionTypeFormSchema>
