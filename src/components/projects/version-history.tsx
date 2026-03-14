'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createVersion, deleteVersion } from '@/services/versions'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { formatCurrency } from '@/lib/utils'
import { History, Plus, Trash2, Loader2, Eye } from 'lucide-react'
import type { ProjectVersion } from '@/types/database'

interface VersionHistoryProps {
  projectId: string
  versions: ProjectVersion[]
}

export function VersionHistory({ projectId, versions }: VersionHistoryProps) {
  const router = useRouter()
  const [creating, setCreating] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [viewingSnapshot, setViewingSnapshot] = useState<ProjectVersion | null>(null)

  async function handleCreate() {
    setCreating(true)
    const result = await createVersion(projectId)
    if (result.error) {
      alert(result.error)
    }
    setCreating(false)
    router.refresh()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this version snapshot?')) return
    setDeletingId(id)
    const result = await deleteVersion(id, projectId)
    if (result.error) alert(result.error)
    setDeletingId(null)
    router.refresh()
  }

  const snapshot = viewingSnapshot?.snapshot as {
    project?: { title: string }
    rooms?: unknown[]
    boq_items?: { total_amount: number }[]
    created_at?: string
  } | null

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Version History ({versions.length})
        </h2>
        <Button size="sm" onClick={handleCreate} disabled={creating}>
          {creating ? (
            <>
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Plus className="mr-1.5 h-4 w-4" />
              Save Snapshot
            </>
          )}
        </Button>
      </div>

      {versions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 py-12">
          <History className="h-10 w-10 text-gray-300" />
          <p className="mt-2 text-sm text-gray-500">No version snapshots yet</p>
          <p className="text-xs text-gray-400">Save a snapshot to track project changes over time</p>
        </div>
      ) : (
        <div className="space-y-2">
          {versions.map((version) => {
            const snap = version.snapshot as {
              rooms?: unknown[]
              boq_items?: { total_amount: number }[]
              created_at?: string
            }
            const total = (snap?.boq_items ?? []).reduce(
              (sum, i) => sum + Number(i.total_amount ?? 0), 0
            )

            return (
              <div
                key={version.id}
                className="group flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2.5 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                    v{version.version_number}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Version {version.version_number}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(version.created_at).toLocaleString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                      {' '}· {snap?.rooms?.length ?? 0} rooms · {snap?.boq_items?.length ?? 0} items · {formatCurrency(total)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setViewingSnapshot(version)}
                    className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    title="View snapshot"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(version.id)}
                    disabled={deletingId === version.id}
                    className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                    title="Delete"
                  >
                    {deletingId === version.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Snapshot Viewer Modal */}
      <Modal
        open={!!viewingSnapshot}
        onClose={() => setViewingSnapshot(null)}
        title={`Version ${viewingSnapshot?.version_number} Snapshot`}
        className="max-w-2xl"
      >
        {snapshot && (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div className="text-sm">
              <p className="text-gray-500">
                Saved on{' '}
                {snapshot.created_at
                  ? new Date(snapshot.created_at).toLocaleString('en-IN')
                  : '—'}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Rooms ({snapshot.rooms?.length ?? 0})
              </h4>
              {(snapshot.rooms as { room_name: string; floor?: string; category?: string }[] ?? []).length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {(snapshot.rooms as { room_name: string; floor?: string; category?: string }[]).map(
                    (room, i) => (
                      <span key={i} className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700">
                        {room.room_name}
                        {room.floor ? ` (${room.floor})` : ''}
                      </span>
                    )
                  )}
                </div>
              ) : (
                <p className="text-xs text-gray-400">No rooms in this snapshot</p>
              )}
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                BOQ Items ({snapshot.boq_items?.length ?? 0})
              </h4>
              {(snapshot.boq_items ?? []).length > 0 ? (
                <div className="overflow-x-auto rounded border border-gray-200">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-2 py-1.5 text-left font-medium text-gray-500">Item</th>
                        <th className="px-2 py-1.5 text-left font-medium text-gray-500">Category</th>
                        <th className="px-2 py-1.5 text-right font-medium text-gray-500">Qty</th>
                        <th className="px-2 py-1.5 text-right font-medium text-gray-500">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {(snapshot.boq_items as { item_name: string; category: string; quantity: number; total_amount: number }[]).map(
                        (item, i) => (
                          <tr key={i}>
                            <td className="px-2 py-1.5 text-gray-900">{item.item_name}</td>
                            <td className="px-2 py-1.5 text-gray-500">{item.category}</td>
                            <td className="px-2 py-1.5 text-right text-gray-900">{item.quantity}</td>
                            <td className="px-2 py-1.5 text-right font-medium text-gray-900">
                              {formatCurrency(item.total_amount)}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-50">
                        <td colSpan={3} className="px-2 py-1.5 text-right font-medium text-gray-700">
                          Total
                        </td>
                        <td className="px-2 py-1.5 text-right font-bold text-blue-600">
                          {formatCurrency(
                            (snapshot.boq_items ?? []).reduce(
                              (s, it) => s + Number(it.total_amount), 0
                            )
                          )}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-gray-400">No BOQ items in this snapshot</p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
