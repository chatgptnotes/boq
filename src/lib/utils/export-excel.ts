import * as XLSX from 'xlsx'
import type { BoqItem, Project, Room } from '@/types/database'

export function exportBoqToExcel(
  project: Project,
  items: BoqItem[],
  rooms: Room[]
) {
  const roomMap = Object.fromEntries(rooms.map((r) => [r.id, r.room_name]))

  // Header rows
  const header = [
    ['BOQ Report'],
    ['Project:', project.title],
    ['Client:', project.client_name],
    ['Type:', project.project_type],
    ['Location:', project.location ?? '—'],
    ['Status:', project.status],
    [],
    [
      'S.No',
      'Category',
      'Item Name',
      'Specification',
      'Room',
      'Quantity',
      'Unit',
      'Base Rate',
      'Tier',
      'Final Rate',
      'Total Amount',
      'Remarks',
    ],
  ]

  // Data rows
  const dataRows = items.map((item, index) => [
    index + 1,
    item.category,
    item.item_name,
    item.specification ?? '',
    item.room_id ? roomMap[item.room_id] ?? '' : '',
    item.quantity,
    item.unit,
    item.base_rate,
    item.luxury_tier.replace('_', ' '),
    item.final_rate,
    item.total_amount,
    item.remarks ?? '',
  ])

  // Total row
  const totalAmount = items.reduce((sum, i) => sum + Number(i.total_amount), 0)
  const totalRow = ['', '', '', '', '', '', '', '', '', 'TOTAL', totalAmount, '']

  const allRows = [...header, ...dataRows, [], totalRow]

  // Create workbook
  const ws = XLSX.utils.aoa_to_sheet(allRows)

  // Column widths
  ws['!cols'] = [
    { wch: 6 },  // S.No
    { wch: 16 }, // Category
    { wch: 30 }, // Item Name
    { wch: 25 }, // Specification
    { wch: 18 }, // Room
    { wch: 10 }, // Quantity
    { wch: 8 },  // Unit
    { wch: 12 }, // Base Rate
    { wch: 14 }, // Tier
    { wch: 12 }, // Final Rate
    { wch: 14 }, // Total Amount
    { wch: 20 }, // Remarks
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'BOQ')

  // Category summary sheet
  const categoryTotals: Record<string, { count: number; amount: number }> = {}
  for (const item of items) {
    if (!categoryTotals[item.category]) {
      categoryTotals[item.category] = { count: 0, amount: 0 }
    }
    categoryTotals[item.category].count++
    categoryTotals[item.category].amount += Number(item.total_amount)
  }

  const summaryRows = [
    ['Category Summary'],
    [],
    ['Category', 'Items', 'Total Amount'],
    ...Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b.amount - a.amount)
      .map(([cat, data]) => [cat, data.count, data.amount]),
    [],
    ['Grand Total', items.length, totalAmount],
  ]

  const summaryWs = XLSX.utils.aoa_to_sheet(summaryRows)
  summaryWs['!cols'] = [{ wch: 20 }, { wch: 10 }, { wch: 16 }]
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary')

  // Download
  const fileName = `BOQ-${project.title.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`
  XLSX.writeFile(wb, fileName)
}
