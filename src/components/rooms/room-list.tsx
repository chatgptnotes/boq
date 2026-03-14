'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteRoom } from '@/services/rooms'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { RoomForm } from '@/components/rooms/room-form'
import { Plus, Pencil, Trash2, DoorOpen, Loader2 } from 'lucide-react'
import type { Room } from '@/types/database'

interface RoomListProps {
  projectId: string
  rooms: Room[]
}

export function RoomList({ projectId, rooms }: RoomListProps) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  function handleSuccess() {
    setShowForm(false)
    setEditingRoom(null)
    router.refresh()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this room? All BOQ items linked to it will be unlinked.')) return
    setDeletingId(id)
    const result = await deleteRoom(id, projectId)
    if (result.error) {
      alert(result.error)
    }
    setDeletingId(null)
    router.refresh()
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Rooms ({rooms.length})
        </h2>
        <Button size="sm" onClick={() => setShowForm(true)}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add Room
        </Button>
      </div>

      {rooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 py-12">
          <DoorOpen className="h-10 w-10 text-gray-300" />
          <p className="mt-2 text-sm text-gray-500">No rooms added yet</p>
          <p className="text-xs text-gray-400">Add rooms to organize your BOQ items</p>
          <Button size="sm" className="mt-3" onClick={() => setShowForm(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            Add First Room
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <Card key={room.id} padding="sm" className="group">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-gray-900 truncate">{room.room_name}</h3>
                  <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-500">
                    {room.floor && (
                      <span className="rounded bg-gray-100 px-1.5 py-0.5">{room.floor}</span>
                    )}
                    {room.category && (
                      <span className="rounded bg-blue-50 px-1.5 py-0.5 text-blue-600">
                        {room.category}
                      </span>
                    )}
                  </div>
                </div>
                <div className="ml-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setEditingRoom(room)}
                    className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    title="Edit room"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(room.id)}
                    disabled={deletingId === room.id}
                    className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                    title="Delete room"
                  >
                    {deletingId === room.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
              {room.notes && (
                <p className="mt-2 text-xs text-gray-400 line-clamp-2">{room.notes}</p>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Add Room Modal */}
      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title="Add Room"
      >
        <RoomForm
          projectId={projectId}
          onSuccess={handleSuccess}
          onCancel={() => setShowForm(false)}
        />
      </Modal>

      {/* Edit Room Modal */}
      <Modal
        open={!!editingRoom}
        onClose={() => setEditingRoom(null)}
        title="Edit Room"
      >
        {editingRoom && (
          <RoomForm
            projectId={projectId}
            room={editingRoom}
            onSuccess={handleSuccess}
            onCancel={() => setEditingRoom(null)}
          />
        )}
      </Modal>
    </>
  )
}
