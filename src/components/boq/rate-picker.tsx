'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils'
import { Search, Check } from 'lucide-react'
import type { RateMaster } from '@/types/database'

interface RatePickerProps {
  onSelect: (rate: RateMaster) => void
  onClose: () => void
}

export function RatePicker({ onSelect, onClose }: RatePickerProps) {
  const [rates, setRates] = useState<RateMaster[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRates() {
      setLoading(true)
      const supabase = createClient()

      let query = supabase
        .from('rate_master')
        .select('*')
        .order('category')
        .order('item_name')
        .limit(50)

      if (search) {
        query = query.or(`item_name.ilike.%${search}%,category.ilike.%${search}%`)
      }

      const { data } = await query
      setRates((data as RateMaster[]) ?? [])
      setLoading(false)
    }

    const timeout = setTimeout(fetchRates, 300)
    return () => clearTimeout(timeout)
  }, [search])

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search rates..."
          autoFocus
          className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
        />
      </div>

      <div className="max-h-64 overflow-y-auto rounded-lg border border-gray-200 divide-y divide-gray-100">
        {loading ? (
          <p className="p-4 text-center text-sm text-gray-400">Loading...</p>
        ) : rates.length === 0 ? (
          <p className="p-4 text-center text-sm text-gray-400">No rates found</p>
        ) : (
          rates.map((rate) => (
            <button
              key={rate.id}
              type="button"
              onClick={() => {
                onSelect(rate)
                onClose()
              }}
              className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-blue-50 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 truncate">{rate.item_name}</p>
                <p className="text-xs text-gray-500">
                  {rate.category} &middot; {rate.unit}
                </p>
              </div>
              <div className="ml-3 text-right text-xs text-gray-500 whitespace-nowrap">
                <span>{formatCurrency(rate.standard_rate)}</span>
                <span className="text-gray-300"> / </span>
                <span className="text-blue-600">{formatCurrency(rate.premium_rate)}</span>
              </div>
              <Check className="ml-2 h-4 w-4 text-gray-300" />
            </button>
          ))
        )}
      </div>

      <p className="text-xs text-gray-400 text-center">
        Select a rate to auto-fill item details
      </p>
    </div>
  )
}
