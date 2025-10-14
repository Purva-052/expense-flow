import { z } from 'zod'

export const VenueTypeFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Venue type name must be at least 2 characters long.' })
    .max(100, { message: 'Venue type name cannot exceed 100 characters.' })
    .trim(),
  isEdit: z.boolean().optional(),
})

export type TVenueTypeFormSchema = z.infer<typeof VenueTypeFormSchema>
