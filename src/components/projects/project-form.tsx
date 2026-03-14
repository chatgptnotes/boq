'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { projectSchema, type ProjectInput, PROJECT_TYPES, PROJECT_STATUSES } from '@/lib/validations/project'
import { createProject, updateProject } from '@/services/projects'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import type { Project } from '@/types/database'

interface ProjectFormProps {
  project?: Project
}

export function ProjectForm({ project }: ProjectFormProps) {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const isEditing = !!project

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProjectInput>({
    resolver: zodResolver(projectSchema),
    defaultValues: project
      ? {
          title: project.title,
          client_name: project.client_name,
          project_type: project.project_type,
          location: project.location ?? '',
          description: project.description ?? '',
          status: project.status,
        }
      : {
          status: 'draft',
        },
  })

  async function onSubmit(data: ProjectInput) {
    setServerError(null)

    const result = isEditing
      ? await updateProject(project.id, data)
      : await createProject(data)

    if (result.error) {
      setServerError(result.error)
      return
    }

    router.push('/projects')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {serverError && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
          {serverError}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          id="title"
          label="Project Title"
          placeholder="e.g. Villa Renovation - Bandra"
          error={errors.title?.message}
          {...register('title')}
        />
        <Input
          id="client_name"
          label="Client Name"
          placeholder="e.g. Sharma Builders Pvt. Ltd."
          error={errors.client_name?.message}
          {...register('client_name')}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          id="project_type"
          label="Project Type"
          placeholder="Select type"
          options={PROJECT_TYPES.map((t) => ({ value: t, label: t }))}
          error={errors.project_type?.message}
          {...register('project_type')}
        />
        <Select
          id="status"
          label="Status"
          options={PROJECT_STATUSES.map((s) => ({ value: s.value, label: s.label }))}
          error={errors.status?.message}
          {...register('status')}
        />
      </div>

      <Input
        id="location"
        label="Location"
        placeholder="e.g. Mumbai, Maharashtra"
        error={errors.location?.message}
        {...register('location')}
      />

      <Textarea
        id="description"
        label="Description"
        placeholder="Brief project description, scope of work, special requirements..."
        error={errors.description?.message}
        {...register('description')}
      />

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEditing ? 'Updating...' : 'Creating...'}
            </>
          ) : isEditing ? (
            'Update Project'
          ) : (
            'Create Project'
          )}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
