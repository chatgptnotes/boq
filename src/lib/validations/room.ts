import { z } from 'zod'

export const roomSchema = z.object({
  room_name: z.string().min(1, 'Room name is required'),
  floor: z.string().optional(),
  category: z.string().optional(),
  notes: z.string().optional(),
})

export type RoomInput = z.infer<typeof roomSchema>

export const ROOM_CATEGORIES = [
  'Living Area',
  'Bedroom',
  'Bathroom',
  'Kitchen',
  'Dining',
  'Balcony',
  'Lobby',
  'Office',
  'Conference Room',
  'Common Area',
  'Utility',
  'Storage',
  'Parking',
  'Other',
] as const

export const FLOOR_OPTIONS = [
  'Basement',
  'Ground Floor',
  '1st Floor',
  '2nd Floor',
  '3rd Floor',
  '4th Floor',
  '5th Floor',
  'Terrace',
  'Other',
] as const
