import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Building2, MapPin, User, Calendar, DoorOpen } from 'lucide-react'
import type { Project, Room, BoqItem, SharedLink } from '@/types/database'

async function getSharedProject(token: string) {
  const supabase = await createClient()

  // Find link
  const { data: link, error: linkError } = await supabase
    .from('shared_links')
    .select('*')
    .eq('token', token)
    .single()

  if (linkError || !link) return null

  const sharedLink = link as SharedLink

  // Check expiry
  if (sharedLink.expires_at && new Date(sharedLink.expires_at) < new Date()) {
    return null
  }

  // Fetch project data (using service role would be better, but anon works with RLS bypass for shared)
  const [projectRes, roomsRes, boqRes] = await Promise.all([
    supabase.from('projects').select('*').eq('id', sharedLink.project_id).single(),
    supabase.from('rooms').select('*').eq('project_id', sharedLink.project_id).order('created_at'),
    supabase.from('boq_items').select('*').eq('project_id', sharedLink.project_id).order('category'),
  ])

  if (projectRes.error) return null

  return {
    project: projectRes.data as Project,
    rooms: (roomsRes.data as Room[]) ?? [],
    boqItems: (boqRes.data as BoqItem[]) ?? [],
  }
}

export default async function SharedProjectPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const data = await getSharedProject(token)

  if (!data) {
    notFound()
  }

  const { project, rooms, boqItems } = data
  const totalAmount = boqItems.reduce((sum, i) => sum + Number(i.total_amount), 0)
  const roomMap = Object.fromEntries(rooms.map((r) => [r.id, r.room_name]))

  // Category breakdown
  const byCategory: Record<string, number> = {}
  for (const item of boqItems) {
    byCategory[item.category] = (byCategory[item.category] ?? 0) + Number(item.total_amount)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Banner */}
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
                <Badge variant={project.status}>
                  {project.status.replace('_', ' ')}
                </Badge>
              </div>
              <p className="text-sm text-gray-500">{project.client_name}</p>
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-400">
            Shared read-only view · BOQ Platform
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 space-y-6">
        {/* Project Details + Summary */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardTitle>Project Details</CardTitle>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Project Type</dt>
                <dd className="mt-1 text-sm text-gray-900">{project.project_type}</dd>
              </div>
              {project.location && (
                <div>
                  <dt className="flex items-center gap-1 text-sm font-medium text-gray-500">
                    <MapPin className="h-3.5 w-3.5" /> Location
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">{project.location}</dd>
                </div>
              )}
              <div>
                <dt className="flex items-center gap-1 text-sm font-medium text-gray-500">
                  <User className="h-3.5 w-3.5" /> Client
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{project.client_name}</dd>
              </div>
              <div>
                <dt className="flex items-center gap-1 text-sm font-medium text-gray-500">
                  <Calendar className="h-3.5 w-3.5" /> Last Updated
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(project.updated_at)}</dd>
              </div>
            </dl>
            {project.description && (
              <p className="mt-4 text-sm text-gray-700 border-t border-gray-100 pt-4 whitespace-pre-wrap">
                {project.description}
              </p>
            )}
          </Card>

          <div className="space-y-4">
            <Card>
              <CardTitle>Summary</CardTitle>
              <dl className="mt-3 space-y-3">
                <div className="flex justify-between text-sm">
                  <dt className="text-gray-500">Rooms</dt>
                  <dd className="font-medium text-gray-900">{rooms.length}</dd>
                </div>
                <div className="flex justify-between text-sm">
                  <dt className="text-gray-500">BOQ Items</dt>
                  <dd className="font-medium text-gray-900">{boqItems.length}</dd>
                </div>
                <div className="flex justify-between text-sm border-t border-gray-100 pt-3">
                  <dt className="font-medium text-gray-700">Total Estimate</dt>
                  <dd className="font-bold text-blue-600">{formatCurrency(totalAmount)}</dd>
                </div>
              </dl>
            </Card>

            {Object.keys(byCategory).length > 0 && (
              <Card>
                <CardTitle>By Category</CardTitle>
                <dl className="mt-3 space-y-2">
                  {Object.entries(byCategory)
                    .sort(([, a], [, b]) => b - a)
                    .map(([cat, amount]) => (
                      <div key={cat} className="flex justify-between text-sm">
                        <dt className="text-gray-500 truncate mr-2">{cat}</dt>
                        <dd className="font-medium text-gray-900 whitespace-nowrap">
                          {formatCurrency(amount)}
                        </dd>
                      </div>
                    ))}
                </dl>
              </Card>
            )}
          </div>
        </div>

        {/* Rooms */}
        {rooms.length > 0 && (
          <Card>
            <CardTitle>Rooms ({rooms.length})</CardTitle>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className="rounded-lg border border-gray-200 p-3"
                >
                  <div className="flex items-center gap-2">
                    <DoorOpen className="h-4 w-4 text-gray-400" />
                    <span className="font-medium text-gray-900">{room.room_name}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {room.floor && (
                      <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">
                        {room.floor}
                      </span>
                    )}
                    {room.category && (
                      <span className="rounded bg-blue-50 px-1.5 py-0.5 text-xs text-blue-600">
                        {room.category}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* BOQ Table */}
        {boqItems.length > 0 && (
          <Card>
            <CardTitle>Bill of Quantities ({boqItems.length} items)</CardTitle>
            <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr className="text-left">
                    <th className="px-3 py-2.5 font-medium text-gray-500">#</th>
                    <th className="px-3 py-2.5 font-medium text-gray-500">Item</th>
                    <th className="px-3 py-2.5 font-medium text-gray-500">Room</th>
                    <th className="px-3 py-2.5 font-medium text-gray-500">Category</th>
                    <th className="px-3 py-2.5 font-medium text-gray-500 text-right">Qty</th>
                    <th className="px-3 py-2.5 font-medium text-gray-500">Unit</th>
                    <th className="px-3 py-2.5 font-medium text-gray-500 text-right">Rate</th>
                    <th className="px-3 py-2.5 font-medium text-gray-500 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {boqItems.map((item, index) => (
                    <tr key={item.id}>
                      <td className="px-3 py-2.5 text-gray-400">{index + 1}</td>
                      <td className="px-3 py-2.5">
                        <p className="font-medium text-gray-900">{item.item_name}</p>
                        {item.specification && (
                          <p className="text-xs text-gray-400">{item.specification}</p>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-gray-600">
                        {item.room_id ? roomMap[item.room_id] ?? '—' : '—'}
                      </td>
                      <td className="px-3 py-2.5 text-gray-600">{item.category}</td>
                      <td className="px-3 py-2.5 text-right text-gray-900">{item.quantity}</td>
                      <td className="px-3 py-2.5 text-gray-600">{item.unit}</td>
                      <td className="px-3 py-2.5 text-right text-gray-900">
                        {formatCurrency(item.final_rate)}
                      </td>
                      <td className="px-3 py-2.5 text-right font-medium text-gray-900">
                        {formatCurrency(item.total_amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-200 bg-gray-50">
                    <td colSpan={7} className="px-3 py-2.5 text-right font-semibold text-gray-700">
                      Grand Total
                    </td>
                    <td className="px-3 py-2.5 text-right font-bold text-blue-600">
                      {formatCurrency(totalAmount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 pb-6">
          Generated by BOQ Platform · Read-only shared view
        </p>
      </div>
    </div>
  )
}
