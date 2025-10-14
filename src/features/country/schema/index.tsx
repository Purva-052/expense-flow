// src/features/countries/schema.ts
import { z } from 'zod'

export const countryFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Country name must be at least 2 characters long.' })
    .max(100, { message: 'Country name cannot exceed 100 characters.' })
    .trim(),

  code: z
    .string()
    .min(2, { message: 'Country code must be at least 2 characters long.' })
    .max(10, { message: 'Country code cannot exceed 10 characters.' })
    .toUpperCase()
    .trim(),

  dialCode: z
    .string()
    .min(1, { message: 'Dial code is required.' })
    .max(6, { message: 'Dial code cannot exceed 6 characters.' })
    .regex(/^\+?\d+$/, {
      message: 'Dial code must be numeric and may start with +.',
    }),

    flag: z.string().url({ message: 'Please enter a valid flag URL.' }).trim(),

  isEdit: z.boolean().optional(),
})

export type TCountryFormSchema = z.infer<typeof countryFormSchema>
