import { Card } from '@/components/ui/card'
import { ProjectForm } from '@/components/projects/project-form'

export default function NewProjectPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create New Project</h1>
        <p className="text-sm text-gray-500">Fill in the details to create a new BOQ project</p>
      </div>

      <Card>
        <ProjectForm />
      </Card>
    </div>
  )
}
