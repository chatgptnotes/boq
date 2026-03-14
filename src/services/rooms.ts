'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { RoomInput } from '@/lib/validations/room'
import type { Room } from '@/types/database'

export async function getRooms(projectId: string): Promise<Room[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)
  return (data as Room[]) ?? []
}

export async function getRoom(id: string): Promise<Room | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data as Room
}

export async function createRoom(projectId: string, input: RoomInput) {
  const supabase = await createClient()

  const { error } = await supabase.from('rooms').insert({
    project_id: projectId,
    room_name: input.room_name,
    floor: input.floor || null,
    category: input.category || null,
    notes: input.notes || null,
  })

  if (error) return { error: error.message }

  revalidatePath(`/projects/${projectId}`)
  revalidatePath('/dashboard')
  return { error: null }
}

export async function updateRoom(id: string, projectId: string, input: RoomInput) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('rooms')
    .update({
      room_name: input.room_name,
      floor: input.floor || null,
      category: input.category || null,
      notes: input.notes || null,
    })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath(`/projects/${projectId}`)
  return { error: null }
}

export async function deleteRoom(id: string, projectId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('rooms')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath(`/projects/${projectId}`)
  revalidatePath('/dashboard')
  return { error: null }
}

export async function getRoomCount(projectId: string): Promise<number> {
  const supabase = await createClient()

  const { count, error } = await supabase
    .from('rooms')
    .select('id', { count: 'exact', head: true })
    .eq('project_id', projectId)

  if (error) return 0
  return count ?? 0
}
