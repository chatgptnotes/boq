import { z } from 'zod'

export const boqItemSchema = z.object({
  room_id: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  item_name: z.string().min(1, 'Item name is required'),
  specification: z.string().optional(),
  quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
  unit: z.string().min(1, 'Unit is required'),
  base_rate: z.number().min(0, 'Rate must be 0 or more'),
  luxury_tier: z.string().min(1, 'Tier is required'),
  remarks: z.string().optional(),
})

export type BoqItemInput = z.infer<typeof boqItemSchema>

export const BOQ_CATEGORIES = [
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

export const UNITS = [
  { value: 'sqft', label: 'Sq. Ft.' },
  { value: 'sqm', label: 'Sq. M.' },
  { value: 'rft', label: 'R. Ft.' },
  { value: 'rm', label: 'R. M.' },
  { value: 'nos', label: 'Nos.' },
  { value: 'set', label: 'Set' },
  { value: 'lot', label: 'Lot' },
  { value: 'kg', label: 'Kg' },
  { value: 'cum', label: 'Cu. M.' },
  { value: 'ls', label: 'Lump Sum' },
] as const

export const LUXURY_TIERS = [
  { value: 'standard', label: 'Standard' },
  { value: 'premium', label: 'Premium' },
  { value: 'luxury', label: 'Luxury' },
  { value: 'super_luxury', label: 'Super Luxury' },
] as const
