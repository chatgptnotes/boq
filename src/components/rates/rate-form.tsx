'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { rateSchema, type RateInput, RATE_CATEGORIES } from '@/lib/validations/rate'
import { createRate, updateRate } from '@/services/rates'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { UNITS } from '@/lib/validations/boq-item'
import type { RateMaster } from '@/types/database'

interface RateFormProps {
  rate?: RateMaster
  onSuccess: () => void
  onCancel: () => void
}

export function RateForm({ rate, onSuccess, onCancel }: RateFormProps) {
  const [serverError, setServerError] = useState<string | null>(null)
  const isEditing = !!rate

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RateInput>({
    resolver: zodResolver(rateSchema),
    defaultValues: rate
      ? {
          category: rate.category,
          item_name: rate.item_name,
          unit: rate.unit,
          standard_rate: rate.standard_rate,
          premium_rate: rate.premium_rate,
          luxury_rate: rate.luxury_rate,
          super_luxury_rate: rate.super_luxury_rate,
        }
      : {
          standard_rate: 0,
          premium_rate: 0,
          luxury_rate: 0,
          super_luxury_rate: 0,
        },
  })

  async function onSubmit(data: RateInput) {
    setServerError(null)

    const result = isEditing
      ? await updateRate(rate.id, data)
      : await createRate(data)

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

      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          id="category"
          label="Category"
          placeholder="Select category"
          options={RATE_CATEGORIES.map((c) => ({ value: c, label: c }))}
          error={errors.category?.message}
          {...register('category')}
        />
        <Select
          id="unit"
          label="Unit"
          placeholder="Select unit"
          options={UNITS.map((u) => ({ value: u.value, label: u.label }))}
          error={errors.unit?.message}
          {...register('unit')}
        />
      </div>

      <Input
        id="item_name"
        label="Item Name"
        placeholder="e.g. Vitrified Tile 600x600mm"
        error={errors.item_name?.message}
        {...register('item_name')}
      />

      <div className="rounded-lg border border-gray-200 p-4 space-y-3">
        <p className="text-sm font-medium text-gray-700">Rates by Tier (₹)</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="standard_rate"
            type="number"
            step="0.01"
            label="Standard"
            placeholder="0"
            error={errors.standard_rate?.message}
            {...register('standard_rate', { valueAsNumber: true })}
          />
          <Input
            id="premium_rate"
            type="number"
            step="0.01"
            label="Premium"
            placeholder="0"
            error={errors.premium_rate?.message}
            {...register('premium_rate', { valueAsNumber: true })}
          />
          <Input
            id="luxury_rate"
            type="number"
            step="0.01"
            label="Luxury"
            placeholder="0"
            error={errors.luxury_rate?.message}
            {...register('luxury_rate', { valueAsNumber: true })}
          />
          <Input
            id="super_luxury_rate"
            type="number"
            step="0.01"
            label="Super Luxury"
            placeholder="0"
            error={errors.super_luxury_rate?.message}
            {...register('super_luxury_rate', { valueAsNumber: true })}
          />
        </div>
      </div>

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
            'Update Rate'
          ) : (
            'Add Rate'
          )}
        </Button>
      </div>
    </form>
  )
}
