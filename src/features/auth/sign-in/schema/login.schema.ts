import { z } from "zod";

export const formSchema = z.object({
    email: z
        .string()
        .min(1, { message: 'Please enter your email' })
        .email({ message: 'Invalid email address' }),
    password: z
        .string()
        .min(1, {
            message: 'Please enter your password',
        })
        .min(6, {
            message: 'Password must be at least 6 characters long',
        }),
})

export type TFormSchema = z.infer<typeof formSchema>