import { z } from 'zod'

export const MenuCategoryFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Category name must be at least 2 characters long.' })
    .max(100, { message: 'Category name cannot exceed 100 characters.' })
    .trim(),
  isEdit: z.boolean().optional(),
})

export type TMenuCategoryFormSchema = z.infer<typeof MenuCategoryFormSchema>
