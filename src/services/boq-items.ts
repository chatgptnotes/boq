'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { calculateFinalRate, calculateTotalAmount } from '@/lib/utils/boq-calculations'
import type { BoqItemInput } from '@/lib/validations/boq-item'
import type { BoqItem } from '@/types/database'

export async function getBoqItems(projectId: string, roomId?: string): Promise<BoqItem[]> {
  const supabase = await createClient()

  let query = supabase
    .from('boq_items')
    .select('*')
    .eq('project_id', projectId)
    .order('category')
    .order('item_name')

  if (roomId) {
    query = query.eq('room_id', roomId)
  }

  const { data, error } = await query

  if (error) throw new Error(error.message)
  return (data as BoqItem[]) ?? []
}

export async function getBoqItem(id: string): Promise<BoqItem | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('boq_items')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data as BoqItem
}

export async function createBoqItem(projectId: string, input: BoqItemInput) {
  const supabase = await createClient()

  const finalRate = calculateFinalRate(input.base_rate, input.luxury_tier)
  const totalAmount = calculateTotalAmount(input.quantity, finalRate)

  const { error } = await supabase.from('boq_items').insert({
    project_id: projectId,
    room_id: input.room_id || null,
    category: input.category,
    item_name: input.item_name,
    specification: input.specification || null,
    quantity: input.quantity,
    unit: input.unit,
    base_rate: input.base_rate,
    luxury_tier: input.luxury_tier,
    final_rate: finalRate,
    total_amount: totalAmount,
    remarks: input.remarks || null,
  })

  if (error) return { error: error.message }

  revalidatePath(`/projects/${projectId}`)
  revalidatePath('/dashboard')
  return { error: null }
}

export async function updateBoqItem(id: string, projectId: string, input: BoqItemInput) {
  const supabase = await createClient()

  const finalRate = calculateFinalRate(input.base_rate, input.luxury_tier)
  const totalAmount = calculateTotalAmount(input.quantity, finalRate)

  const { error } = await supabase
    .from('boq_items')
    .update({
      room_id: input.room_id || null,
      category: input.category,
      item_name: input.item_name,
      specification: input.specification || null,
      quantity: input.quantity,
      unit: input.unit,
      base_rate: input.base_rate,
      luxury_tier: input.luxury_tier,
      final_rate: finalRate,
      total_amount: totalAmount,
      remarks: input.remarks || null,
    })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath(`/projects/${projectId}`)
  revalidatePath('/dashboard')
  return { error: null }
}

export async function deleteBoqItem(id: string, projectId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('boq_items')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath(`/projects/${projectId}`)
  revalidatePath('/dashboard')
  return { error: null }
}

export async function getBoqSummary(projectId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('boq_items')
    .select('category, total_amount')
    .eq('project_id', projectId)

  if (error) return { itemCount: 0, totalAmount: 0, byCategory: {} as Record<string, number> }

  const items = (data ?? []) as { category: string; total_amount: number }[]
  const byCategory: Record<string, number> = {}

  let totalAmount = 0
  for (const item of items) {
    totalAmount += Number(item.total_amount)
    byCategory[item.category] = (byCategory[item.category] ?? 0) + Number(item.total_amount)
  }

  return { itemCount: items.length, totalAmount, byCategory }
}
