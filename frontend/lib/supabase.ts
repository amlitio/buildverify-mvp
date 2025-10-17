import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export type User = {
  id: string
  email: string
  full_name: string | null
  company_name: string | null
  created_at: string
}

export type Invoice = {
  id: string
  user_id: string
  invoice_number: string
  contractor_name: string
  total_amount: number
  claimed_hours: number
  invoice_date: string
  due_date: string
  status: 'pending' | 'verified' | 'flagged' | 'disputed'
  ai_confidence: number | null
  created_at: string
}

export type InvoiceAnalysis = {
  id: string
  invoice_id: string
  findings: any
  flags: string[]
  recommendations: string[]
  confidence_score: number
  created_at: string
}

export type Document = {
  id: string
  invoice_id: string
  file_name: string
  file_type: 'invoice' | 'work_order' | 'photo'
  file_url: string
  file_size: number
  created_at: string
}
