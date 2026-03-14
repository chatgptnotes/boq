'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { uploadFile, deleteFile } from '@/services/files'
import { Button } from '@/components/ui/button'
import {
  Upload,
  FileText,
  Image,
  Trash2,
  Download,
  Loader2,
  File,
} from 'lucide-react'
import type { UploadedFile } from '@/types/database'
import { createClient } from '@/lib/supabase/client'

interface FileUploadProps {
  projectId: string
  files: UploadedFile[]
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getFileIcon(type: string) {
  if (type.startsWith('image/')) return Image
  if (type === 'application/pdf') return FileText
  return File
}

export function FileUpload({ projectId, files }: FileUploadProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', file)

    const result = await uploadFile(projectId, formData)

    if (result.error) {
      setError(result.error)
    }

    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
    router.refresh()
  }

  async function handleDelete(file: UploadedFile) {
    if (!confirm(`Delete "${file.file_name}"?`)) return
    setDeletingId(file.id)
    const result = await deleteFile(file.id, file.storage_path, projectId)
    if (result.error) alert(result.error)
    setDeletingId(null)
    router.refresh()
  }

  async function handleDownload(file: UploadedFile) {
    const supabase = createClient()
    const { data } = await supabase.storage
      .from('project-files')
      .createSignedUrl(file.storage_path, 3600)

    if (data?.signedUrl) {
      window.open(data.signedUrl, '_blank')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Files ({files.length})
        </h2>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleUpload}
            accept=".pdf,.png,.jpg,.jpeg,.webp,.svg,.dxf,.dwg"
            className="hidden"
          />
          <Button
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-1.5 h-4 w-4" />
                Upload File
              </>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}

      {files.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 py-12 cursor-pointer hover:border-blue-300 hover:bg-blue-50/50 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-10 w-10 text-gray-300" />
          <p className="mt-2 text-sm text-gray-500">No files uploaded yet</p>
          <p className="text-xs text-gray-400">
            Click to upload PDF, images, or drawing files (max 10MB)
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {files.map((file) => {
            const IconComponent = getFileIcon(file.file_type)
            return (
              <div
                key={file.id}
                className="group flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2.5 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100">
                    <IconComponent className="h-4.5 w-4.5 text-gray-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.file_name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatFileSize(file.file_size)} &middot;{' '}
                      {new Date(file.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleDownload(file)}
                    className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(file)}
                    disabled={deletingId === file.id}
                    className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                    title="Delete"
                  >
                    {deletingId === file.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
