import { createClient } from "@supabase/supabase-js"

declare const __SUPABASE_URL__: string
declare const __SUPABASE_ANON_KEY__: string

const supabaseUrl = __SUPABASE_URL__
const supabaseAnonKey = __SUPABASE_ANON_KEY__

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type TicketTier = {
  id: string
  name: string
  price_kobo: number
  seats_per_table: number
  total_tables: number
  max_capacity: number
  perks: string[]
}

export type GalaTable = {
  id: string
  tier_id: string
  table_number: number
  seats_total: number
  seats_booked: number
}

export type Attendee = {
  id: string
  transaction_id: string
  tier_id: string
  table_id: string
  table_number: number
  first_name: string
  last_name: string
  email: string
  ticket_id: string
  group_booking_code: string
  is_primary: boolean
  transfer_locked: boolean
  manage_token: string
  qr_code_sent: boolean
  qr_used_at: string | null
  created_at: string
}

export type Transaction = {
  id: string
  reference: string
  squad_reference: string | null
  tier_id: string
  table_id: string
  primary_email: string
  primary_first_name: string
  primary_last_name: string
  primary_phone: string
  quantity: number
  unit_price_kobo: number
  total_kobo: number
  group_booking_code: string
  payment_status: string
  seating_notes: string | null
  created_at: string
  confirmed_at: string | null
}

export type WaitlistEntry = {
  id: string
  first_name: string
  email: string
  tier_id: string
  tier_name: string
  notified: boolean
  created_at: string
}

export type VvipPickup = {
  id: string
  attendee_id: string
  pickup_address: string | null
  pickup_time: string | null
  pickup_status: string
  notes: string | null
  confirmation_sent: boolean
  updated_at: string
}
