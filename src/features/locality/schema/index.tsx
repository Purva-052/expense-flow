import { z } from 'zod'

export const LocalityFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Locality name must be at least 2 characters long.' })
    .max(100, { message: 'Locality name cannot exceed 100 characters.' })
    .trim(),

  city: z.string().min(1, { message: 'City is required' }).nullable(),
  state: z.string().min(1, { message: 'State is required' }).nullable(),
  country: z.string().min(1, { message: 'Country is required' }).nullable(),

  isEdit: z.boolean().optional(),
})

export type TLocalityFormSchema = z.infer<typeof LocalityFormSchema>
