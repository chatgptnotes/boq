import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getProject } from '@/services/projects'
import { getRooms } from '@/services/rooms'
import { getBoqItems, getBoqSummary } from '@/services/boq-items'
import { getFiles } from '@/services/files'
import { getVersions } from '@/services/versions'
import { getSharedLinks } from '@/services/shared-links'
import { Card, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DeleteProjectButton } from '@/components/projects/delete-project-button'
import { RoomList } from '@/components/rooms/room-list'
import { BoqTable } from '@/components/boq/boq-table'
import { ExportButtons } from '@/components/boq/export-buttons'
import { FileUpload } from '@/components/files/file-upload'
import { VersionHistory } from '@/components/projects/version-history'
import { ShareProject } from '@/components/projects/share-project'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Pencil, ArrowLeft, MapPin, User, Calendar, FileText } from 'lucide-react'

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [project, rooms, boqItems, boqSummary, files, versions, sharedLinks] =
    await Promise.all([
      getProject(id),
      getRooms(id),
      getBoqItems(id),
      getBoqSummary(id),
      getFiles(id),
      getVersions(id),
      getSharedLinks(id),
    ])

  if (!project) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/projects">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back
            </Button>
          </Link>
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
        <div className="flex items-center gap-2 flex-wrap">
          <ExportButtons project={project} items={boqItems} rooms={rooms} />
          <Link href={`/projects/${id}/edit`}>
            <Button variant="secondary" size="sm">
              <Pencil className="mr-1.5 h-4 w-4" />
              Edit
            </Button>
          </Link>
          <DeleteProjectButton projectId={id} projectTitle={project.title} />
        </div>
      </div>

      {/* Project Details + Summary */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardTitle>Project Details</CardTitle>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Project Type</dt>
              <dd className="mt-1 text-sm text-gray-900">{project.project_type}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1">
                <Badge variant={project.status}>
                  {project.status.replace('_', ' ')}
                </Badge>
              </dd>
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
                <Calendar className="h-3.5 w-3.5" /> Created
              </dt>
              <dd className="mt-1 text-sm text-gray-900">{formatDate(project.created_at)}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-1 text-sm font-medium text-gray-500">
                <Calendar className="h-3.5 w-3.5" /> Last Updated
              </dt>
              <dd className="mt-1 text-sm text-gray-900">{formatDate(project.updated_at)}</dd>
            </div>
          </dl>
          {project.description && (
            <div className="mt-4 border-t border-gray-100 pt-4">
              <dt className="flex items-center gap-1 text-sm font-medium text-gray-500">
                <FileText className="h-3.5 w-3.5" /> Description
              </dt>
              <dd className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">
                {project.description}
              </dd>
            </div>
          )}
        </Card>

        {/* Summary Sidebar */}
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
                <dd className="font-medium text-gray-900">{boqSummary.itemCount}</dd>
              </div>
              <div className="flex justify-between text-sm">
                <dt className="text-gray-500">Files</dt>
                <dd className="font-medium text-gray-900">{files.length}</dd>
              </div>
              <div className="flex justify-between text-sm">
                <dt className="text-gray-500">Versions</dt>
                <dd className="font-medium text-gray-900">{versions.length}</dd>
              </div>
              <div className="flex justify-between text-sm border-t border-gray-100 pt-3">
                <dt className="font-medium text-gray-700">Total Estimate</dt>
                <dd className="font-bold text-blue-600">
                  {formatCurrency(boqSummary.totalAmount)}
                </dd>
              </div>
            </dl>
          </Card>

          {Object.keys(boqSummary.byCategory).length > 0 && (
            <Card>
              <CardTitle>By Category</CardTitle>
              <dl className="mt-3 space-y-2">
                {Object.entries(boqSummary.byCategory)
                  .sort(([, a], [, b]) => b - a)
                  .map(([category, amount]) => (
                    <div key={category} className="flex justify-between text-sm">
                      <dt className="text-gray-500 truncate mr-2">{category}</dt>
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
      <Card>
        <RoomList projectId={id} rooms={rooms} />
      </Card>

      {/* BOQ Items */}
      <Card>
        <BoqTable projectId={id} items={boqItems} rooms={rooms} />
      </Card>

      {/* Files */}
      <Card>
        <FileUpload projectId={id} files={files} />
      </Card>

      {/* Version History & Sharing - side by side */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <VersionHistory projectId={id} versions={versions} />
        </Card>
        <Card>
          <ShareProject projectId={id} links={sharedLinks} />
        </Card>
      </div>
    </div>
  )
}
