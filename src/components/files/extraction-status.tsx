'use client'

import { useState } from 'react'
import { extractFromFile } from '@/services/ai-extraction'
import { Button } from '@/components/ui/button'
import { Sparkles, Loader2, AlertCircle } from 'lucide-react'
import type { ExtractionResult } from '@/services/ai-extraction'

interface ExtractionStatusProps {
  fileId: string
  projectId: string
  fileName: string
}

export function ExtractionStatus({ fileId, projectId, fileName }: ExtractionStatusProps) {
  const [result, setResult] = useState<ExtractionResult | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleExtract() {
    setLoading(true)
    const res = await extractFromFile(fileId, projectId)
    setResult(res)
    setLoading(false)
  }

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-medium text-blue-700">AI Extraction</span>
        </div>
        <Button
          size="sm"
          variant="secondary"
          onClick={handleExtract}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              Extract BOQ
            </>
          )}
        </Button>
      </div>

      {result && (
        <div className="mt-2">
          {result.error ? (
            <div className="flex items-start gap-2 text-xs text-amber-700">
              <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <span>{result.error}</span>
            </div>
          ) : result.items.length > 0 ? (
            <div className="text-xs text-blue-700">
              Extracted {result.items.length} items with {Math.round(result.confidence * 100)}% confidence
            </div>
          ) : (
            <div className="text-xs text-gray-500">No items could be extracted from this file</div>
          )}
        </div>
      )}

      <p className="mt-1 text-xs text-blue-400">
        Extracts BOQ items from &quot;{fileName}&quot; using AI (coming soon)
      </p>
    </div>
  )
}
