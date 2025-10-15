import { z } from 'zod'

export const clientFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Company name must be at least 2 characters long.' })
    .max(100, { message: 'Company name cannot exceed 100 characters.' })
    .trim(),
  company: z
    .string()
    .min(2, { message: 'Company field must be at least 2 characters long.' })
    .max(100, { message: 'Company field cannot exceed 100 characters.' })
    .trim(),
})

export type TClientFormSchema = z.infer<typeof clientFormSchema>
