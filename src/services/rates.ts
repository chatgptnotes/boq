'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { RateInput } from '@/lib/validations/rate'
import type { RateMaster } from '@/types/database'

export async function getRates(
  search?: string,
  category?: string
): Promise<RateMaster[]> {
  const supabase = await createClient()

  let query = supabase
    .from('rate_master')
    .select('*')
    .order('category')
    .order('item_name')

  if (category && category !== 'all') {
    query = query.eq('category', category)
  }

  if (search) {
    query = query.or(`item_name.ilike.%${search}%,category.ilike.%${search}%`)
  }

  const { data, error } = await query

  if (error) throw new Error(error.message)
  return (data as RateMaster[]) ?? []
}

export async function getRate(id: string): Promise<RateMaster | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('rate_master')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data as RateMaster
}

export async function createRate(input: RateInput) {
  const supabase = await createClient()

  const { error } = await supabase.from('rate_master').insert({
    category: input.category,
    item_name: input.item_name,
    unit: input.unit,
    standard_rate: input.standard_rate,
    premium_rate: input.premium_rate,
    luxury_rate: input.luxury_rate,
    super_luxury_rate: input.super_luxury_rate,
  })

  if (error) return { error: error.message }

  revalidatePath('/rates')
  return { error: null }
}

export async function updateRate(id: string, input: RateInput) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('rate_master')
    .update({
      category: input.category,
      item_name: input.item_name,
      unit: input.unit,
      standard_rate: input.standard_rate,
      premium_rate: input.premium_rate,
      luxury_rate: input.luxury_rate,
      super_luxury_rate: input.super_luxury_rate,
    })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/rates')
  return { error: null }
}

export async function deleteRate(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('rate_master')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/rates')
  return { error: null }
}
