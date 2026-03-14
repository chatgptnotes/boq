'use server'

import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/services/auth'
import { revalidatePath } from 'next/cache'
import type { ProjectVersion } from '@/types/database'

export async function getVersions(projectId: string): Promise<ProjectVersion[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('project_versions')
    .select('*')
    .eq('project_id', projectId)
    .order('version_number', { ascending: false })

  if (error) return [] as ProjectVersion[]
  return (data as ProjectVersion[]) ?? []
}

export async function createVersion(projectId: string) {
  const supabase = await createClient()
  const user = await getUser()
  if (!user) return { error: 'Not authenticated' }

  // Get current project data
  const [projectRes, roomsRes, boqRes] = await Promise.all([
    supabase.from('projects').select('*').eq('id', projectId).single(),
    supabase.from('rooms').select('*').eq('project_id', projectId),
    supabase.from('boq_items').select('*').eq('project_id', projectId),
  ])

  if (projectRes.error) return { error: projectRes.error.message }

  // Get next version number
  const { data: lastVersion } = await supabase
    .from('project_versions')
    .select('version_number')
    .eq('project_id', projectId)
    .order('version_number', { ascending: false })
    .limit(1)
    .single()

  const nextVersion = (lastVersion?.version_number ?? 0) + 1

  const snapshot = {
    project: projectRes.data,
    rooms: roomsRes.data ?? [],
    boq_items: boqRes.data ?? [],
    created_at: new Date().toISOString(),
  }

  const { error } = await supabase.from('project_versions').insert({
    project_id: projectId,
    version_number: nextVersion,
    snapshot: snapshot as Record<string, unknown>,
    created_by: user.id,
  })

  if (error) return { error: error.message }

  revalidatePath(`/projects/${projectId}`)
  return { error: null, versionNumber: nextVersion }
}

export async function deleteVersion(id: string, projectId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('project_versions')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath(`/projects/${projectId}`)
  return { error: null }
}
