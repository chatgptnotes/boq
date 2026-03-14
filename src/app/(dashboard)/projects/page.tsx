import Link from 'next/link'
import { getProjects } from '@/services/projects'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { Plus, FolderKanban, MapPin, ArrowRight } from 'lucide-react'

export default async function ProjectsPage() {
  const projects = await getProjects()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-sm text-gray-500">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <Link href="/projects/new">
          <Button>
            <Plus className="mr-1.5 h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      {projects.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center justify-center py-16">
            <FolderKanban className="h-12 w-12 text-gray-300" />
            <h3 className="mt-3 text-lg font-medium text-gray-900">No projects yet</h3>
            <p className="mt-1 text-sm text-gray-500">Create your first project to start building BOQs</p>
            <Link href="/projects/new" className="mt-4">
              <Button>
                <Plus className="mr-1.5 h-4 w-4" />
                Create Project
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="group h-full transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-base font-semibold text-gray-900 group-hover:text-blue-600">
                      {project.title}
                    </h3>
                    <p className="mt-0.5 text-sm text-gray-500">{project.client_name}</p>
                  </div>
                  <Badge variant={project.status}>
                    {project.status.replace('_', ' ')}
                  </Badge>
                </div>

                <div className="mt-3 space-y-1.5 text-sm text-gray-500">
                  <p className="flex items-center gap-1.5">
                    <FolderKanban className="h-3.5 w-3.5" />
                    {project.project_type}
                  </p>
                  {project.location && (
                    <p className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      {project.location}
                    </p>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                  <span className="text-xs text-gray-400">{formatDate(project.created_at)}</span>
                  <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-blue-500" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
