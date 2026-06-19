import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const EVENT_ID = "2ee4e1a9-bc70-47cb-81b4-1c926d7515cb"

export type Profile = {
  id: string
  email: string
  full_name: string | null
  role: "peserta" | "admin"
  created_at: string
  updated_at: string
}

export type Event = {
  id: string
  name: string
  theme: string | null
  camp_number: string | null
  start_date: string
  end_date: string
  start_time: string | null
  venue: string | null
  address: string | null
  price: number
  quota: number
  is_active: boolean
  created_at: string
}

export type Registration = {
  id: string
  registration_number: string
  user_id: string
  event_id: string
  full_name: string
  email: string
  whatsapp: string
  gender: "ikhwan" | "akhwat"
  age: number
  city: string
  shirt_size: string | null
  hijab_size: string | null
  full_address: string
  notes: string | null
  payment_status: "belum_bayar" | "menunggu_konfirmasi" | "lunas"
  payment_proof_url: string | null
  created_at: string
  updated_at: string
}
