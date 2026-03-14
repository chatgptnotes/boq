'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteBoqItem } from '@/services/boq-items'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BoqItemForm } from '@/components/boq/boq-item-form'
import { formatCurrency } from '@/lib/utils'
import { Plus, Pencil, Trash2, ClipboardList, Loader2, Filter } from 'lucide-react'
import type { BoqItem, Room } from '@/types/database'

interface BoqTableProps {
  projectId: string
  items: BoqItem[]
  rooms: Room[]
}

const tierColors: Record<string, string> = {
  standard: 'bg-gray-100 text-gray-700',
  premium: 'bg-blue-100 text-blue-700',
  luxury: 'bg-purple-100 text-purple-700',
  super_luxury: 'bg-amber-100 text-amber-700',
}

export function BoqTable({ projectId, items, rooms }: BoqTableProps) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<BoqItem | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [filterRoom, setFilterRoom] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')

  const roomMap = Object.fromEntries(rooms.map((r) => [r.id, r.room_name]))

  // Build unique categories from items
  const categories = [...new Set(items.map((i) => i.category))].sort()

  // Filter items
  const filtered = items.filter((item) => {
    if (filterRoom !== 'all' && (item.room_id ?? 'unassigned') !== filterRoom) return false
    if (filterCategory !== 'all' && item.category !== filterCategory) return false
    return true
  })

  const totalAmount = filtered.reduce((sum, i) => sum + Number(i.total_amount), 0)

  function handleSuccess() {
    setShowForm(false)
    setEditingItem(null)
    router.refresh()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this BOQ item?')) return
    setDeletingId(id)
    const result = await deleteBoqItem(id, projectId)
    if (result.error) alert(result.error)
    setDeletingId(null)
    router.refresh()
  }

  return (
    <>
      {/* Header & Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          BOQ Items ({items.length})
        </h2>
        <Button size="sm" onClick={() => setShowForm(true)}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add Item
        </Button>
      </div>

      {items.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filterRoom}
              onChange={(e) => setFilterRoom(e.target.value)}
              className="rounded-lg border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="all">All Rooms</option>
              <option value="unassigned">Unassigned</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>{r.room_name}</option>
              ))}
            </select>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="rounded-lg border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 py-12">
          <ClipboardList className="h-10 w-10 text-gray-300" />
          <p className="mt-2 text-sm text-gray-500">No BOQ items yet</p>
          <p className="text-xs text-gray-400">Add items to build your bill of quantities</p>
          <Button size="sm" className="mt-3" onClick={() => setShowForm(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            Add First Item
          </Button>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left">
                  <th className="px-3 py-2.5 font-medium text-gray-500">Item</th>
                  <th className="px-3 py-2.5 font-medium text-gray-500">Room</th>
                  <th className="px-3 py-2.5 font-medium text-gray-500">Category</th>
                  <th className="px-3 py-2.5 font-medium text-gray-500 text-right">Qty</th>
                  <th className="px-3 py-2.5 font-medium text-gray-500">Unit</th>
                  <th className="px-3 py-2.5 font-medium text-gray-500">Tier</th>
                  <th className="px-3 py-2.5 font-medium text-gray-500 text-right">Base Rate</th>
                  <th className="px-3 py-2.5 font-medium text-gray-500 text-right">Final Rate</th>
                  <th className="px-3 py-2.5 font-medium text-gray-500 text-right">Total</th>
                  <th className="px-3 py-2.5 w-20"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((item) => (
                  <tr key={item.id} className="group hover:bg-gray-50">
                    <td className="px-3 py-2.5">
                      <div>
                        <p className="font-medium text-gray-900">{item.item_name}</p>
                        {item.specification && (
                          <p className="text-xs text-gray-400 truncate max-w-[200px]">
                            {item.specification}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-gray-600">
                      {item.room_id ? roomMap[item.room_id] ?? '—' : '—'}
                    </td>
                    <td className="px-3 py-2.5 text-gray-600">{item.category}</td>
                    <td className="px-3 py-2.5 text-right text-gray-900">{item.quantity}</td>
                    <td className="px-3 py-2.5 text-gray-600">{item.unit}</td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          tierColors[item.luxury_tier] ?? tierColors.standard
                        }`}
                      >
                        {item.luxury_tier.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right text-gray-600">
                      {formatCurrency(item.base_rate)}
                    </td>
                    <td className="px-3 py-2.5 text-right text-gray-900">
                      {formatCurrency(item.final_rate)}
                    </td>
                    <td className="px-3 py-2.5 text-right font-medium text-gray-900">
                      {formatCurrency(item.total_amount)}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditingItem(item)}
                          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                          className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                        >
                          {deletingId === item.id ? (
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
              <tfoot>
                <tr className="border-t-2 border-gray-200 bg-gray-50">
                  <td colSpan={8} className="px-3 py-2.5 text-right font-semibold text-gray-700">
                    Total ({filtered.length} items)
                  </td>
                  <td className="px-3 py-2.5 text-right font-bold text-blue-600">
                    {formatCurrency(totalAmount)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}

      {/* Add Item Modal */}
      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title="Add BOQ Item"
        className="max-w-2xl"
      >
        <BoqItemForm
          projectId={projectId}
          rooms={rooms}
          onSuccess={handleSuccess}
          onCancel={() => setShowForm(false)}
        />
      </Modal>

      {/* Edit Item Modal */}
      <Modal
        open={!!editingItem}
        onClose={() => setEditingItem(null)}
        title="Edit BOQ Item"
        className="max-w-2xl"
      >
        {editingItem && (
          <BoqItemForm
            projectId={projectId}
            rooms={rooms}
            item={editingItem}
            onSuccess={handleSuccess}
            onCancel={() => setEditingItem(null)}
          />
        )}
      </Modal>
    </>
  )
}
