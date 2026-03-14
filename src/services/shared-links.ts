'use server'

import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/services/auth'
import { revalidatePath } from 'next/cache'
import type { SharedLink } from '@/types/database'

function generateToken(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let token = ''
  for (let i = 0; i < 32; i++) {
    token += chars[Math.floor(Math.random() * chars.length)]
  }
  return token
}

export async function createSharedLink(projectId: string, expiresInDays?: number) {
  const supabase = await createClient()
  const user = await getUser()
  if (!user) return { error: 'Not authenticated', link: null }

  const token = generateToken()
  const expiresAt = expiresInDays
    ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
    : null

  const { error } = await supabase.from('shared_links').insert({
    project_id: projectId,
    token,
    expires_at: expiresAt,
    created_by: user.id,
  })

  if (error) return { error: error.message, link: null }

  revalidatePath(`/projects/${projectId}`)
  return { error: null, link: token }
}

export async function getSharedLinks(projectId: string): Promise<SharedLink[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('shared_links')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) return [] as SharedLink[]
  return (data as SharedLink[]) ?? []
}

export async function deleteSharedLink(id: string, projectId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('shared_links')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath(`/projects/${projectId}`)
  return { error: null }
}

export async function getProjectByToken(token: string) {
  const supabase = await createClient()

  const { data: link, error } = await supabase
    .from('shared_links')
    .select('*')
    .eq('token', token)
    .single()

  if (error || !link) return null

  const sharedLink = link as SharedLink

  // Check expiry
  if (sharedLink.expires_at && new Date(sharedLink.expires_at) < new Date()) {
    return null
  }

  return sharedLink
}
