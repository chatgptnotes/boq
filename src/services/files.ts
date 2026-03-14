'use server'

import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/services/auth'
import { revalidatePath } from 'next/cache'
import type { UploadedFile } from '@/types/database'

const ALLOWED_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/svg+xml',
  'application/dxf',
  'application/dwg',
]

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export async function getFiles(projectId: string): Promise<UploadedFile[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('uploaded_files')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data as UploadedFile[]) ?? []
}

export async function uploadFile(projectId: string, formData: FormData) {
  const supabase = await createClient()
  const user = await getUser()
  if (!user) return { error: 'Not authenticated' }

  const file = formData.get('file') as File
  if (!file || !file.name) return { error: 'No file provided' }

  if (file.size > MAX_FILE_SIZE) {
    return { error: 'File size must be under 10MB' }
  }

  // Generate unique path
  const ext = file.name.split('.').pop() ?? 'bin'
  const storagePath = `${projectId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  // Upload to Supabase Storage
  const { error: storageError } = await supabase.storage
    .from('project-files')
    .upload(storagePath, file)

  if (storageError) return { error: storageError.message }

  // Save metadata
  const { error: dbError } = await supabase.from('uploaded_files').insert({
    project_id: projectId,
    file_name: file.name,
    file_type: file.type || 'application/octet-stream',
    file_size: file.size,
    storage_path: storagePath,
    uploaded_by: user.id,
  })

  if (dbError) return { error: dbError.message }

  revalidatePath(`/projects/${projectId}`)
  return { error: null }
}

export async function deleteFile(id: string, storagePath: string, projectId: string) {
  const supabase = await createClient()

  // Delete from storage
  await supabase.storage.from('project-files').remove([storagePath])

  // Delete metadata
  const { error } = await supabase
    .from('uploaded_files')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath(`/projects/${projectId}`)
  return { error: null }
}

export async function getFileUrl(storagePath: string): Promise<string | null> {
  const supabase = await createClient()

  const { data } = await supabase.storage
    .from('project-files')
    .createSignedUrl(storagePath, 3600) // 1 hour expiry

  return data?.signedUrl ?? null
}
