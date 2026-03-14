import { z } from 'zod'

export const projectSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  client_name: z.string().min(2, 'Client name is required'),
  project_type: z.string().min(1, 'Project type is required'),
  location: z.string().optional(),
  description: z.string().optional(),
  status: z.string().min(1, 'Status is required'),
})

export type ProjectInput = z.infer<typeof projectSchema>

export const PROJECT_TYPES = [
  'Residential',
  'Commercial',
  'Interior Fit-out',
  'Renovation',
  'Institutional',
  'Industrial',
  'Mixed Use',
  'Other',
] as const

export const PROJECT_STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'review', label: 'Under Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'completed', label: 'Completed' },
  { value: 'on_hold', label: 'On Hold' },
] as const
