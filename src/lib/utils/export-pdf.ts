import jsPDF from 'jspdf'
import type { BoqItem, Project, Room } from '@/types/database'

export function exportBoqToPdf(
  project: Project,
  items: BoqItem[],
  rooms: Room[]
) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  const roomMap = Object.fromEntries(rooms.map((r) => [r.id, r.room_name]))
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 14

  // Title
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('Bill of Quantities', margin, 20)

  // Project info
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  let y = 30
  const infoLines = [
    `Project: ${project.title}`,
    `Client: ${project.client_name}`,
    `Type: ${project.project_type}`,
    `Location: ${project.location ?? '—'}`,
    `Status: ${project.status.replace('_', ' ')}`,
  ]
  for (const line of infoLines) {
    doc.text(line, margin, y)
    y += 5
  }
  y += 5

  // Table header
  const cols = [
    { label: '#', width: 8 },
    { label: 'Category', width: 28 },
    { label: 'Item', width: 50 },
    { label: 'Room', width: 30 },
    { label: 'Qty', width: 15 },
    { label: 'Unit', width: 15 },
    { label: 'Base Rate', width: 25 },
    { label: 'Tier', width: 22 },
    { label: 'Final Rate', width: 25 },
    { label: 'Total', width: 28 },
  ]

  function drawHeader(yPos: number) {
    doc.setFillColor(245, 245, 245)
    doc.rect(margin, yPos - 4, pageWidth - margin * 2, 7, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7)
    let x = margin + 1
    for (const col of cols) {
      doc.text(col.label, x, yPos)
      x += col.width
    }
    doc.setFont('helvetica', 'normal')
    return yPos + 8
  }

  y = drawHeader(y)

  // Format currency
  function fmt(n: number): string {
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0,
    }).format(n)
  }

  // Table rows
  doc.setFontSize(7)
  let totalAmount = 0

  for (let i = 0; i < items.length; i++) {
    if (y > doc.internal.pageSize.getHeight() - 20) {
      doc.addPage()
      y = 15
      y = drawHeader(y)
      doc.setFontSize(7)
    }

    const item = items[i]
    totalAmount += Number(item.total_amount)
    let x = margin + 1

    const rowData = [
      String(i + 1),
      item.category,
      item.item_name,
      item.room_id ? roomMap[item.room_id] ?? '' : '',
      String(item.quantity),
      item.unit,
      fmt(item.base_rate),
      item.luxury_tier.replace('_', ' '),
      fmt(item.final_rate),
      fmt(item.total_amount),
    ]

    for (let j = 0; j < cols.length; j++) {
      const text = rowData[j]
      const maxWidth = cols[j].width - 2
      const truncated = doc.getTextWidth(text) > maxWidth
        ? text.slice(0, Math.floor(maxWidth / 2)) + '...'
        : text
      doc.text(truncated, x, y)
      x += cols[j].width
    }

    // Light bottom border
    doc.setDrawColor(230, 230, 230)
    doc.line(margin, y + 2, pageWidth - margin, y + 2)
    y += 6
  }

  // Total row
  y += 2
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  const totalX = margin + 1 + cols.slice(0, -1).reduce((s, c) => s + c.width, 0)
  doc.text('TOTAL:', totalX - 30, y)
  doc.text(fmt(totalAmount), totalX, y)

  // Footer
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(150, 150, 150)
  doc.text(
    `Generated on ${new Date().toLocaleDateString('en-IN')} — BOQ Platform`,
    margin,
    doc.internal.pageSize.getHeight() - 8
  )

  const fileName = `BOQ-${project.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
  doc.save(fileName)
}
