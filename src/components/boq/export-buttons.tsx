'use client'

import { Button } from '@/components/ui/button'
import { exportBoqToExcel } from '@/lib/utils/export-excel'
import { exportBoqToPdf } from '@/lib/utils/export-pdf'
import { FileSpreadsheet, FileDown } from 'lucide-react'
import type { BoqItem, Project, Room } from '@/types/database'

interface ExportButtonsProps {
  project: Project
  items: BoqItem[]
  rooms: Room[]
}

export function ExportButtons({ project, items, rooms }: ExportButtonsProps) {
  if (items.length === 0) return null

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => exportBoqToExcel(project, items, rooms)}
      >
        <FileSpreadsheet className="mr-1.5 h-4 w-4" />
        Export Excel
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => exportBoqToPdf(project, items, rooms)}
      >
        <FileDown className="mr-1.5 h-4 w-4" />
        Export PDF
      </Button>
    </div>
  )
}
