// src/features/operators/schema.ts

import { z } from 'zod'

export const formSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters long.' })
    .max(100, { message: 'Name cannot exceed 100 characters.' })
    .trim(),

  email: z
    .string()
    .email({ message: 'Please enter a valid email address.' })
    .trim(),
  
  mobile: z
    .string()
    .min(10, { message: 'Mobile number must be at least 10 digits.' })
    .max(10, { message: 'Mobile number cannot exceed 10 characters.' }),

  user_name: z
    .string()
    .min(3, { message: 'Username must be at least 3 characters long.'})
    .optional()
    .or(z.literal('')), // Allows optional and empty string

  // For 'add' mode, password is required. For 'edit', it's optional.
  // We make it optional here and handle the 'required' logic conditionally if needed.
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters.' })
    .optional()
    .or(z.literal('')), // Allows optional and empty string

  isEdit: z.boolean().optional(),
})
.refine(
  (data) => {
    // If it's not edit mode (i.e., add mode), password must be provided.
    if (!data.isEdit && !data.password) {
      return false;
    }
    return true;
  },
  {
    // Custom error message for the password field when in 'add' mode.
    message: 'Password is required.',
    path: ['password'],
  }
);


export type TFormSchema = z.infer<typeof formSchema>