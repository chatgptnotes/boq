'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteProject } from '@/services/projects'
import { Button } from '@/components/ui/button'
import { Loader2, Trash2 } from 'lucide-react'

interface DeleteProjectButtonProps {
  projectId: string
  projectTitle: string
}

export function DeleteProjectButton({ projectId, projectTitle }: DeleteProjectButtonProps) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    const result = await deleteProject(projectId)
    if (result.error) {
      alert(result.error)
      setDeleting(false)
      return
    }
    router.push('/projects')
    router.refresh()
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-red-600">Delete &quot;{projectTitle}&quot;?</span>
        <Button
          variant="danger"
          size="sm"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Yes, delete'}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setConfirming(false)}
          disabled={deleting}
        >
          Cancel
        </Button>
      </div>
    )
  }

  return (
    <Button variant="danger" size="sm" onClick={() => setConfirming(true)}>
      <Trash2 className="mr-1.5 h-4 w-4" />
      Delete
    </Button>
  )
}
