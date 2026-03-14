'use server'

/**
 * AI Extraction Service - Scaffolding
 *
 * This module is ready for future AI integration.
 * Possible integrations:
 * - OCR extraction from drawing PDFs
 * - AI-based BOQ generation from floor plans
 * - Material detection from images
 * - Tariff/rate automation from government schedules
 *
 * To implement:
 * 1. Add your AI provider API key to .env
 * 2. Implement the extraction functions below
 * 3. Connect to the upload flow via the ExtractionStatus component
 */

export interface ExtractionResult {
  status: 'pending' | 'processing' | 'completed' | 'failed'
  items: ExtractedItem[]
  confidence: number
  error?: string
}

export interface ExtractedItem {
  category: string
  item_name: string
  specification?: string
  quantity?: number
  unit?: string
  estimated_rate?: number
  confidence: number
}

// Placeholder: Extract BOQ items from an uploaded file
export async function extractFromFile(
  fileId: string,
  _projectId: string
): Promise<ExtractionResult> {
  // TODO: Implement AI extraction
  // Example flow:
  // 1. Download file from Supabase Storage
  // 2. Send to AI provider (OpenAI Vision, Claude, etc.)
  // 3. Parse response into structured BOQ items
  // 4. Return results for user review

  console.log(`AI extraction requested for file: ${fileId}`)

  return {
    status: 'pending',
    items: [],
    confidence: 0,
    error: 'AI extraction not yet configured. Add your AI provider API key to enable this feature.',
  }
}

// Placeholder: Estimate rates from item descriptions
export async function estimateRates(
  _items: { item_name: string; category: string; unit: string }[]
): Promise<{ item_name: string; estimated_rate: number; confidence: number }[]> {
  // TODO: Match items against rate_master or use AI for estimation
  return []
}

// Placeholder: Parse drawing annotations
export async function parseDrawingAnnotations(
  _storagePath: string
): Promise<{ label: string; value: string; location?: string }[]> {
  // TODO: Implement drawing annotation parsing
  return []
}
