'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { roomSchema, type RoomInput, ROOM_CATEGORIES, FLOOR_OPTIONS } from '@/lib/validations/room'
import { createRoom, updateRoom } from '@/services/rooms'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import type { Room } from '@/types/database'

interface RoomFormProps {
  projectId: string
  room?: Room
  onSuccess: () => void
  onCancel: () => void
}

export function RoomForm({ projectId, room, onSuccess, onCancel }: RoomFormProps) {
  const [serverError, setServerError] = useState<string | null>(null)
  const isEditing = !!room

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RoomInput>({
    resolver: zodResolver(roomSchema),
    defaultValues: room
      ? {
          room_name: room.room_name,
          floor: room.floor ?? '',
          category: room.category ?? '',
          notes: room.notes ?? '',
        }
      : {},
  })

  async function onSubmit(data: RoomInput) {
    setServerError(null)

    const result = isEditing
      ? await updateRoom(room.id, projectId, data)
      : await createRoom(projectId, data)

    if (result.error) {
      setServerError(result.error)
      return
    }

    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
          {serverError}
        </div>
      )}

      <Input
        id="room_name"
        label="Room Name"
        placeholder="e.g. Master Bedroom, Kitchen, Living Room"
        error={errors.room_name?.message}
        {...register('room_name')}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          id="floor"
          label="Floor"
          placeholder="Select floor"
          options={FLOOR_OPTIONS.map((f) => ({ value: f, label: f }))}
          error={errors.floor?.message}
          {...register('floor')}
        />
        <Select
          id="category"
          label="Category"
          placeholder="Select category"
          options={ROOM_CATEGORIES.map((c) => ({ value: c, label: c }))}
          error={errors.category?.message}
          {...register('category')}
        />
      </div>

      <Textarea
        id="notes"
        label="Notes"
        placeholder="Dimensions, special instructions, material preferences..."
        error={errors.notes?.message}
        {...register('notes')}
      />

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEditing ? 'Updating...' : 'Adding...'}
            </>
          ) : isEditing ? (
            'Update Room'
          ) : (
            'Add Room'
          )}
        </Button>
      </div>
    </form>
  )
}
