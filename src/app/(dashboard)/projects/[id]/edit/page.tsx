import { notFound } from 'next/navigation'
import { getProject } from '@/services/projects'
import { Card } from '@/components/ui/card'
import { ProjectForm } from '@/components/projects/project-form'

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const project = await getProject(id)

  if (!project) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Project</h1>
        <p className="text-sm text-gray-500">Update details for {project.title}</p>
      </div>

      <Card>
        <ProjectForm project={project} />
      </Card>
    </div>
  )
}
