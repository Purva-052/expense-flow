import { z } from 'zod'

export const couponFormSchema = z.object({
  code: z
    .string()
    .min(2, { message: 'Coupon code must be at least 2 characters long.' })
    .max(20, { message: 'Coupon code cannot exceed 20 characters.' })
    .trim()
    .toUpperCase(),
  description: z
    .string()
    .min(5, { message: 'Description must be at least 5 characters long.' })
    .max(200, { message: 'Description cannot exceed 200 characters.' })
    .trim(),
  discountPercentage: z.preprocess(
    (val) => (val === '' || val == null ? 0 : Number(val)),
    z.number({ invalid_type_error: 'Discount must be a number.' })
    .max(100, { message: 'Discount cannot exceed 100%.' })
  ),
  maxDiscountAmount: z.preprocess(
    (val) => (val === '' || val == null ? 0 : Number(val)),
    z.number({ invalid_type_error: 'Max discount must be a number.' })
  ),
  minOrderAmount: z.preprocess(
    (val) => (val === '' || val == null ? 0 : Number(val)),
    z.number({ invalid_type_error: 'Minimum order must be a number.' })
  ),
  isActive: z.boolean(),
})
export type TCouponFormSchema = z.infer<typeof couponFormSchema>
