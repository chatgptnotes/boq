import { z } from 'zod'

export const rateSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  item_name: z.string().min(1, 'Item name is required'),
  unit: z.string().min(1, 'Unit is required'),
  standard_rate: z.number().min(0, 'Must be 0 or more'),
  premium_rate: z.number().min(0, 'Must be 0 or more'),
  luxury_rate: z.number().min(0, 'Must be 0 or more'),
  super_luxury_rate: z.number().min(0, 'Must be 0 or more'),
})

export type RateInput = z.infer<typeof rateSchema>

export const RATE_CATEGORIES = [
  'Civil Work',
  'Flooring',
  'Wall Finishes',
  'Ceiling',
  'Doors & Windows',
  'Plumbing',
  'Electrical',
  'HVAC',
  'Painting',
  'Carpentry',
  'Hardware',
  'Fixtures',
  'Furniture',
  'Landscaping',
  'Miscellaneous',
] as const
