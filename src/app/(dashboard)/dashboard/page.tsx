import Link from 'next/link'
import { Card, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getUser } from '@/services/auth'
import { getProjectStats, getRecentProjects } from '@/services/projects'
import { formatDate, formatCurrency } from '@/lib/utils'
import {
  FolderKanban,
  DoorOpen,
  ClipboardList,
  IndianRupee,
  Plus,
  ArrowRight,
} from 'lucide-react'

export default async function DashboardPage() {
  const [user, stats, recentProjects] = await Promise.all([
    getUser(),
    getProjectStats(),
    getRecentProjects(),
  ])

  const statCards = [
    { name: 'Total Projects', value: String(stats.projectCount), icon: FolderKanban, color: 'bg-blue-100 text-blue-600' },
    { name: 'Total Rooms', value: String(stats.roomCount), icon: DoorOpen, color: 'bg-green-100 text-green-600' },
    { name: 'BOQ Items', value: String(stats.boqCount), icon: ClipboardList, color: 'bg-purple-100 text-purple-600' },
    { name: 'Estimated Amount', value: formatCurrency(stats.totalAmount), icon: IndianRupee, color: 'bg-amber-100 text-amber-600' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">
            Welcome back, {user?.user_metadata?.full_name || user?.email}
          </p>
        </div>
        <Link href="/projects/new">
          <Button>
            <Plus className="mr-1.5 h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.name}>
            <div className="flex items-center gap-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Projects</CardTitle>
          {recentProjects.length > 0 && (
            <Link href="/projects" className="text-sm text-blue-600 hover:text-blue-700">
              View all
            </Link>
          )}
        </div>

        {recentProjects.length === 0 ? (
          <div className="mt-4 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 py-12">
            <FolderKanban className="h-10 w-10 text-gray-300" />
            <p className="mt-2 text-sm text-gray-500">No projects yet</p>
            <p className="text-xs text-gray-400">Create your first project to get started</p>
            <Link href="/projects/new" className="mt-3">
              <Button size="sm">
                <Plus className="mr-1.5 h-4 w-4" />
                Create Project
              </Button>
            </Link>
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  <th className="pb-2 font-medium text-gray-500">Project</th>
                  <th className="pb-2 font-medium text-gray-500">Client</th>
                  <th className="pb-2 font-medium text-gray-500">Type</th>
                  <th className="pb-2 font-medium text-gray-500">Status</th>
                  <th className="pb-2 font-medium text-gray-500">Updated</th>
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentProjects.map((project) => (
                  <tr key={project.id} className="group">
                    <td className="py-3 font-medium text-gray-900">{project.title}</td>
                    <td className="py-3 text-gray-600">{project.client_name}</td>
                    <td className="py-3 text-gray-600">{project.project_type}</td>
                    <td className="py-3">
                      <Badge variant={project.status}>
                        {project.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="py-3 text-gray-400">{formatDate(project.updated_at)}</td>
                    <td className="py-3 text-right">
                      <Link href={`/projects/${project.id}`}>
                        <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-blue-500" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
