import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Create a Supabase client with the service role key for server-side operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// Create a Supabase client with the anon key for client-side operations
export const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

// Database types
export type Document = {
  id: string
  user_id: string
  file_name: string
  file_type: string
  file_size: number
  created_at: string
}

export type Summary = {
  id: string
  document_id: string
  content: string
  created_at: string
}
