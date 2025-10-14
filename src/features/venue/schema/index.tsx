import { z } from 'zod'

export const getVenueFormSchema = (isEdit: boolean) =>
  z.object({
    // Step 1 fields
    name: z.string().min(1, 'Venue name is required'),
    description: z.string().min(1, 'Description is required'),
    image: z.any().nullable().optional(),

    country: z.coerce.number().min(1, 'Country is required').nullable(),
    state: z.coerce.number().min(1, 'State is required').nullable(),
    city: z.coerce.number().min(1, 'City is required').nullable(),
    locality: z.coerce.number().nullable().optional(),
    address: z.string().min(1, 'Address is required'),

    phone: z.string().min(1, 'Phone number is required'),
    rating: z.coerce
      .number({ required_error: 'Rating is required' })
      .min(0, 'Rating cannot be less than 0')
      .max(5, 'Rating must be between 0 and 5'),

    totalReviews: z.coerce
      .number({ required_error: 'Total reviews is required' })
      .min(0, 'Total reviews cannot be negative'),

    priceRange: z.string().min(1, 'Price range is required'),

    openingTime: z.string().min(1, 'Opening time is required'),
    closingTime: z.string().min(1, 'Closing time is required'),

    venueType: z.coerce.number().min(1, 'Venue type is required').nullable(),

    // 👇 conditional owner validation
    owner: isEdit
      ? z
          .object({
            name: z.string().optional(),
            email: z.string().optional(),
            password: z.string().optional(),
            phone: z.string().optional(),
            phoneNumberCountryCode: z.string().optional(),
            phoneNumberCountryId: z.number().nullable().optional(),
          })
          .optional()
      : z.object({
          name: z.string().min(1, 'Owner name is required'),
          email: z.string().email('Invalid email'),
          password: z.string().min(6, 'Password must be at least 6 characters'),
          phone: z.string().min(1, 'Phone number is required'),
          phoneNumberCountryCode: z.string().optional(),
          phoneNumberCountryId: z.number().nullable().optional(),
        }),

    // Step 2 fields
    sections: z
      .array(
        z.object({
          venueSectionType: z.coerce
            .number()
            .min(1, 'Section type is required')
            .nullable(),
          numberOfTables: z.coerce
            .number()
            .min(1, 'Number of tables is required'),
          seatingCapacity: z.coerce
            .number()
            .min(1, 'Seating capacity is required'),
          images: z
            .array(z.union([z.instanceof(File), z.string(), z.any()]))
            .optional()
            .refine((val) => val && val.length > 0, {
              message: 'At least one image is required',
            }),
        })
      )
      .min(1, 'At least one section is required'),
  })

export type TVenueFormSchema = z.infer<ReturnType<typeof getVenueFormSchema>>
