import { z } from 'zod'

export const CityFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'City name must be at least 2 characters long.' })
    .max(100, { message: 'City name cannot exceed 100 characters.' })
    .trim(),

  state: z.string().min(1, { message: 'State is required' }).nullable(),

  country: z.string().min(1, { message: 'Country is required' }).nullable(),

  isEdit: z.boolean().optional(),
})

export type TCityFormSchema = z.infer<typeof CityFormSchema>
