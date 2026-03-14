'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSharedLink, deleteSharedLink } from '@/services/shared-links'
import { Button } from '@/components/ui/button'
import { Link2, Copy, Trash2, Loader2, Check, ExternalLink } from 'lucide-react'
import type { SharedLink } from '@/types/database'

interface ShareProjectProps {
  projectId: string
  links: SharedLink[]
}

export function ShareProject({ projectId, links }: ShareProjectProps) {
  const router = useRouter()
  const [creating, setCreating] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleCreate(expiresInDays?: number) {
    setCreating(true)
    const result = await createSharedLink(projectId, expiresInDays)
    if (result.error) alert(result.error)
    setCreating(false)
    router.refresh()
  }

  async function handleDelete(id: string) {
    if (!confirm('Revoke this shared link?')) return
    setDeletingId(id)
    const result = await deleteSharedLink(id, projectId)
    if (result.error) alert(result.error)
    setDeletingId(null)
    router.refresh()
  }

  function copyLink(token: string, linkId: string) {
    const url = `${window.location.origin}/share/${token}`
    navigator.clipboard.writeText(url)
    setCopiedId(linkId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Shared Links ({links.length})
        </h2>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleCreate(7)}
            disabled={creating}
          >
            {creating ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Link2 className="mr-1.5 h-4 w-4" />}
            7-day link
          </Button>
          <Button
            size="sm"
            onClick={() => handleCreate()}
            disabled={creating}
          >
            {creating ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Link2 className="mr-1.5 h-4 w-4" />}
            Permanent link
          </Button>
        </div>
      </div>

      {links.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 py-12">
          <Link2 className="h-10 w-10 text-gray-300" />
          <p className="mt-2 text-sm text-gray-500">No shared links yet</p>
          <p className="text-xs text-gray-400">Create a link to share a read-only view of this project</p>
        </div>
      ) : (
        <div className="space-y-2">
          {links.map((link) => {
            const isExpired = link.expires_at && new Date(link.expires_at) < new Date()

            return (
              <div
                key={link.id}
                className="group flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2.5 hover:bg-gray-50"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <code className="text-xs text-gray-500 truncate max-w-[200px]">
                      /share/{link.token.slice(0, 12)}...
                    </code>
                    {isExpired && (
                      <span className="rounded bg-red-100 px-1.5 py-0.5 text-xs text-red-600">
                        Expired
                      </span>
                    )}
                    {!isExpired && link.expires_at && (
                      <span className="rounded bg-yellow-100 px-1.5 py-0.5 text-xs text-yellow-700">
                        Expires {new Date(link.expires_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    )}
                    {!link.expires_at && (
                      <span className="rounded bg-green-100 px-1.5 py-0.5 text-xs text-green-700">
                        Permanent
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Created {new Date(link.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {!isExpired && (
                    <>
                      <button
                        onClick={() => copyLink(link.token, link.id)}
                        className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        title="Copy link"
                      >
                        {copiedId === link.id ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                      <a
                        href={`/share/${link.token}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        title="Open link"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </>
                  )}
                  <button
                    onClick={() => handleDelete(link.id)}
                    disabled={deletingId === link.id}
                    className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                    title="Revoke"
                  >
                    {deletingId === link.id ? (
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
    </>
  )
}
