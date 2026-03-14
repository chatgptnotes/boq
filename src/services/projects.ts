'use server'

import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/services/auth'
import { revalidatePath } from 'next/cache'
import type { ProjectInput } from '@/lib/validations/project'
import type { Project } from '@/types/database'

export async function getProjects(): Promise<Project[]> {
  const supabase = await createClient()
  const user = await getUser()
  if (!user) return [] as Project[]

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data as Project[]) ?? []
}

export async function getProject(id: string): Promise<Project | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data as Project
}

export async function createProject(input: ProjectInput) {
  const supabase = await createClient()
  const user = await getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('projects').insert({
    ...input,
    location: input.location || null,
    description: input.description || null,
    created_by: user.id,
  })

  if (error) return { error: error.message }

  revalidatePath('/projects')
  revalidatePath('/dashboard')
  return { error: null }
}

export async function updateProject(id: string, input: ProjectInput) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('projects')
    .update({
      ...input,
      location: input.location || null,
      description: input.description || null,
    })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/projects')
  revalidatePath(`/projects/${id}`)
  revalidatePath('/dashboard')
  return { error: null }
}

export async function deleteProject(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/projects')
  revalidatePath('/dashboard')
  return { error: null }
}

export async function getProjectStats() {
  const supabase = await createClient()
  const user = await getUser()
  if (!user) return { projectCount: 0, roomCount: 0, boqCount: 0, totalAmount: 0 }

  const [projectsRes, roomsRes, boqRes] = await Promise.all([
    supabase
      .from('projects')
      .select('id', { count: 'exact', head: true })
      .eq('created_by', user.id),
    supabase
      .from('rooms')
      .select('id, projects!inner(created_by)', { count: 'exact', head: true })
      .eq('projects.created_by', user.id),
    supabase
      .from('boq_items')
      .select('total_amount, projects!inner(created_by)')
      .eq('projects.created_by', user.id),
  ])

  const totalAmount = boqRes.data?.reduce(
    (sum, item) => sum + Number(item.total_amount),
    0
  ) ?? 0

  return {
    projectCount: projectsRes.count ?? 0,
    roomCount: roomsRes.count ?? 0,
    boqCount: boqRes.data?.length ?? 0,
    totalAmount,
  }
}

export async function getRecentProjects(limit = 5): Promise<Project[]> {
  const supabase = await createClient()
  const user = await getUser()
  if (!user) return [] as Project[]

  const { data } = await supabase
    .from('projects')
    .select('*')
    .eq('created_by', user.id)
    .order('updated_at', { ascending: false })
    .limit(limit)

  return (data as Project[]) ?? []
}
