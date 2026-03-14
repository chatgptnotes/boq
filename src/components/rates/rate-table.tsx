'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteRate } from '@/services/rates'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { RateForm } from '@/components/rates/rate-form'
import { formatCurrency } from '@/lib/utils'
import { Plus, Pencil, Trash2, Database, Loader2, Search } from 'lucide-react'
import type { RateMaster } from '@/types/database'
import { RATE_CATEGORIES } from '@/lib/validations/rate'

interface RateTableProps {
  rates: RateMaster[]
  currentSearch: string
  currentCategory: string
}

export function RateTable({ rates, currentSearch, currentCategory }: RateTableProps) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [editingRate, setEditingRate] = useState<RateMaster | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [search, setSearch] = useState(currentSearch)
  const [category, setCategory] = useState(currentCategory)

  function handleSuccess() {
    setShowForm(false)
    setEditingRate(null)
    router.refresh()
  }

  function handleFilter() {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (category && category !== 'all') params.set('category', category)
    const qs = params.toString()
    router.push(`/rates${qs ? `?${qs}` : ''}`)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this rate entry?')) return
    setDeletingId(id)
    const result = await deleteRate(id)
    if (result.error) alert(result.error)
    setDeletingId(null)
    router.refresh()
  }

  return (
    <>
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rate Database</h1>
          <p className="text-sm text-gray-500">{rates.length} rate{rates.length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add Rate
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
            placeholder="Search by item name or category..."
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
          />
        </div>
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value)
            // Auto-search on category change
            const params = new URLSearchParams()
            if (search) params.set('search', search)
            if (e.target.value !== 'all') params.set('category', e.target.value)
            router.push(`/rates?${params.toString()}`)
          }}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
        >
          <option value="all">All Categories</option>
          {RATE_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <Button variant="secondary" size="sm" onClick={handleFilter}>
          <Search className="mr-1.5 h-4 w-4" />
          Search
        </Button>
      </div>

      {/* Table */}
      {rates.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 py-16">
          <Database className="h-12 w-12 text-gray-300" />
          <h3 className="mt-3 text-lg font-medium text-gray-900">No rates found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {currentSearch || currentCategory !== 'all'
              ? 'Try adjusting your search or filter'
              : 'Add rates to build your pricing database'}
          </p>
          {!currentSearch && currentCategory === 'all' && (
            <Button className="mt-4" onClick={() => setShowForm(true)}>
              <Plus className="mr-1.5 h-4 w-4" />
              Add First Rate
            </Button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left">
                <th className="px-3 py-2.5 font-medium text-gray-500">Category</th>
                <th className="px-3 py-2.5 font-medium text-gray-500">Item Name</th>
                <th className="px-3 py-2.5 font-medium text-gray-500">Unit</th>
                <th className="px-3 py-2.5 font-medium text-gray-500 text-right">Standard</th>
                <th className="px-3 py-2.5 font-medium text-gray-500 text-right">Premium</th>
                <th className="px-3 py-2.5 font-medium text-gray-500 text-right">Luxury</th>
                <th className="px-3 py-2.5 font-medium text-gray-500 text-right">Super Luxury</th>
                <th className="px-3 py-2.5 w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rates.map((rate) => (
                <tr key={rate.id} className="group hover:bg-gray-50">
                  <td className="px-3 py-2.5">
                    <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                      {rate.category}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 font-medium text-gray-900">{rate.item_name}</td>
                  <td className="px-3 py-2.5 text-gray-600">{rate.unit}</td>
                  <td className="px-3 py-2.5 text-right text-gray-900">
                    {formatCurrency(rate.standard_rate)}
                  </td>
                  <td className="px-3 py-2.5 text-right text-blue-600">
                    {formatCurrency(rate.premium_rate)}
                  </td>
                  <td className="px-3 py-2.5 text-right text-purple-600">
                    {formatCurrency(rate.luxury_rate)}
                  </td>
                  <td className="px-3 py-2.5 text-right text-amber-600">
                    {formatCurrency(rate.super_luxury_rate)}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditingRate(rate)}
                        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(rate.id)}
                        disabled={deletingId === rate.id}
                        className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                      >
                        {deletingId === rate.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Modal */}
      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title="Add Rate"
        className="max-w-xl"
      >
        <RateForm onSuccess={handleSuccess} onCancel={() => setShowForm(false)} />
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={!!editingRate}
        onClose={() => setEditingRate(null)}
        title="Edit Rate"
        className="max-w-xl"
      >
        {editingRate && (
          <RateForm
            rate={editingRate}
            onSuccess={handleSuccess}
            onCancel={() => setEditingRate(null)}
          />
        )}
      </Modal>
    </>
  )
}
