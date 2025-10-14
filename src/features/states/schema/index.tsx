import { z } from 'zod'

export const StateFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters long.' })
    .max(100, { message: 'Name cannot exceed 100 characters.' })
    .trim(),

  code: z
    .string()
    .min(2, { message: 'Code must be at least 2 characters long.' })
    .max(10, { message: 'Code cannot exceed 10 characters.' })
    .toUpperCase()
    .trim(),

  country: z.string().min(1, { message: 'Country is required' }).nullable(),

  isEdit: z.boolean().optional(),
})

export type TStateFormSchema = z.infer<typeof StateFormSchema>
