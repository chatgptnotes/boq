'use client'

import { useState, useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  boqItemSchema,
  type BoqItemInput,
  BOQ_CATEGORIES,
  UNITS,
  LUXURY_TIERS,
} from '@/lib/validations/boq-item'
import { createBoqItem, updateBoqItem } from '@/services/boq-items'
import { calculateFinalRate, calculateTotalAmount } from '@/lib/utils/boq-calculations'
import { getRateFromTier } from '@/lib/utils/boq-calculations'
import { formatCurrency } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { RatePicker } from '@/components/boq/rate-picker'
import { Loader2, Database } from 'lucide-react'
import type { BoqItem, Room, RateMaster } from '@/types/database'

interface BoqItemFormProps {
  projectId: string
  rooms: Room[]
  item?: BoqItem
  onSuccess: () => void
  onCancel: () => void
}

export function BoqItemForm({ projectId, rooms, item, onSuccess, onCancel }: BoqItemFormProps) {
  const [serverError, setServerError] = useState<string | null>(null)
  const [showRatePicker, setShowRatePicker] = useState(false)
  const isEditing = !!item

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BoqItemInput>({
    resolver: zodResolver(boqItemSchema),
    defaultValues: item
      ? {
          room_id: item.room_id ?? '',
          category: item.category,
          item_name: item.item_name,
          specification: item.specification ?? '',
          quantity: item.quantity,
          unit: item.unit,
          base_rate: item.base_rate,
          luxury_tier: item.luxury_tier,
          remarks: item.remarks ?? '',
        }
      : {
          luxury_tier: 'standard',
          quantity: 1,
          base_rate: 0,
        },
  })

  // Live calculation preview
  const watchedQuantity = useWatch({ control, name: 'quantity' })
  const watchedBaseRate = useWatch({ control, name: 'base_rate' })
  const watchedTier = useWatch({ control, name: 'luxury_tier' })

  const [preview, setPreview] = useState({ finalRate: 0, totalAmount: 0 })

  useEffect(() => {
    const q = Number(watchedQuantity) || 0
    const br = Number(watchedBaseRate) || 0
    const tier = watchedTier || 'standard'
    const fr = calculateFinalRate(br, tier)
    const ta = calculateTotalAmount(q, fr)
    setPreview({ finalRate: fr, totalAmount: ta })
  }, [watchedQuantity, watchedBaseRate, watchedTier])

  async function onSubmit(data: BoqItemInput) {
    setServerError(null)

    const result = isEditing
      ? await updateBoqItem(item.id, projectId, data)
      : await createBoqItem(projectId, data)

    if (result.error) {
      setServerError(result.error)
      return
    }

    onSuccess()
  }

  function handleRateSelect(rate: RateMaster) {
    setValue('category', rate.category)
    setValue('item_name', rate.item_name)
    setValue('unit', rate.unit)
    const tier = control._formValues.luxury_tier || 'standard'
    const baseRate = getRateFromTier(rate, tier)
    setValue('base_rate', baseRate)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
          {serverError}
        </div>
      )}

      {/* Rate Picker Button */}
      {!isEditing && (
        <button
          type="button"
          onClick={() => setShowRatePicker(true)}
          className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-blue-200 py-2.5 text-sm text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-colors"
        >
          <Database className="h-4 w-4" />
          Pick from Rate Database
        </button>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          id="category"
          label="Category"
          placeholder="Select category"
          options={BOQ_CATEGORIES.map((c) => ({ value: c, label: c }))}
          error={errors.category?.message}
          {...register('category')}
        />
        <Select
          id="room_id"
          label="Room (Optional)"
          placeholder="No specific room"
          options={rooms.map((r) => ({ value: r.id, label: r.room_name }))}
          error={errors.room_id?.message}
          {...register('room_id')}
        />
      </div>

      <Input
        id="item_name"
        label="Item Name"
        placeholder="e.g. Vitrified Tile 600x600mm"
        error={errors.item_name?.message}
        {...register('item_name')}
      />

      <Input
        id="specification"
        label="Specification"
        placeholder="e.g. Kajaria Eternity, Anti-skid, Grade A"
        error={errors.specification?.message}
        {...register('specification')}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Input
          id="quantity"
          type="number"
          step="0.01"
          label="Quantity"
          placeholder="0"
          error={errors.quantity?.message}
          {...register('quantity', { valueAsNumber: true })}
        />
        <Select
          id="unit"
          label="Unit"
          placeholder="Select unit"
          options={UNITS.map((u) => ({ value: u.value, label: u.label }))}
          error={errors.unit?.message}
          {...register('unit')}
        />
        <Input
          id="base_rate"
          type="number"
          step="0.01"
          label="Base Rate (₹)"
          placeholder="0"
          error={errors.base_rate?.message}
          {...register('base_rate', { valueAsNumber: true })}
        />
      </div>

      <Select
        id="luxury_tier"
        label="Luxury Tier"
        options={LUXURY_TIERS.map((t) => ({ value: t.value, label: t.label }))}
        error={errors.luxury_tier?.message}
        {...register('luxury_tier')}
      />

      {/* Live Calculation Preview */}
      <div className="rounded-lg bg-gray-50 p-3 border border-gray-200">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-500">Final Rate:</span>
            <span className="ml-2 font-medium text-gray-900">
              {formatCurrency(preview.finalRate)}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Total Amount:</span>
            <span className="ml-2 font-semibold text-blue-600">
              {formatCurrency(preview.totalAmount)}
            </span>
          </div>
        </div>
      </div>

      <Textarea
        id="remarks"
        label="Remarks"
        placeholder="Additional notes, brand preferences, installation details..."
        error={errors.remarks?.message}
        {...register('remarks')}
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
            'Update Item'
          ) : (
            'Add Item'
          )}
        </Button>
      </div>

      {/* Rate Picker Modal */}
      <Modal
        open={showRatePicker}
        onClose={() => setShowRatePicker(false)}
        title="Pick from Rate Database"
      >
        <RatePicker
          onSelect={handleRateSelect}
          onClose={() => setShowRatePicker(false)}
        />
      </Modal>
    </form>
  )
}
