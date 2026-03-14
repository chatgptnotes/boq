import { getRates } from '@/services/rates'
import { Card } from '@/components/ui/card'
import { RateTable } from '@/components/rates/rate-table'

export default async function RatesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string }>
}) {
  const params = await searchParams
  const search = params.search ?? ''
  const category = params.category ?? 'all'

  const rates = await getRates(search || undefined, category)

  return (
    <div className="space-y-6">
      <Card>
        <RateTable
          rates={rates}
          currentSearch={search}
          currentCategory={category}
        />
      </Card>
    </div>
  )
}
