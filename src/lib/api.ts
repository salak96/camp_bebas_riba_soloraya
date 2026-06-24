const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api"

export const EVENT_ID = 1

export type User = {
  id: number
  email: string
  fullName: string | null
  role: "peserta" | "admin"
}

export type Profile = {
  id: number
  email: string
  full_name: string | null
  role: "peserta" | "admin"
  created_at?: string
  updated_at?: string
}

export type EventData = {
  id: number
  name: string
  theme: string | null
  campNumber: string | null
  region: string | null
  startDate: string
  endDate: string
  startTime: string | null
  venue: string | null
  address: string | null
  price: number
  quota: number
}

export type Registration = {
  id: number
  registration_number: string
  user_id: number
  event_id: number
  full_name: string
  email: string
  whatsapp: string
  gender: "ikhwan" | "akhwat"
  age: number
  city: string
  shirt_size: string | null
  full_address: string
  notes: string | null
  payment_status: "belum_bayar" | "menunggu_konfirmasi" | "lunas"
  payment_proof_url: string | null
  created_at: string
  updated_at: string
}

type ApiRegistration = {
  id: number
  registrationNumber: string
  userId: number
  eventId: number
  fullName: string
  email: string
  whatsapp: string
  gender: "ikhwan" | "akhwat"
  age: number
  city: string
  shirtSize: string | null
  fullAddress: string
  notes: string | null
  paymentStatus: "belum_bayar" | "menunggu_konfirmasi" | "lunas"
  proofFile: string | null
  createdAt: string
  updatedAt: string
}

export function token() {
  return localStorage.getItem("cbr_token")
}

export function saveToken(value: string) {
  localStorage.setItem("cbr_token", value)
}

export function clearToken() {
  localStorage.removeItem("cbr_token")
}

export function toProfile(user: User | null): Profile | null {
  if (!user) return null
  return {
    id: user.id,
    email: user.email,
    full_name: user.fullName,
    role: user.role,
  }
}

export function toRegistration(r: ApiRegistration | null): Registration | null {
  if (!r) return null
  return {
    id: r.id,
    registration_number: r.registrationNumber,
    user_id: r.userId,
    event_id: r.eventId,
    full_name: r.fullName,
    email: r.email,
    whatsapp: r.whatsapp,
    gender: r.gender,
    age: r.age,
    city: r.city,
    shirt_size: r.shirtSize,
    full_address: r.fullAddress,
    notes: r.notes,
    payment_status: r.paymentStatus,
    payment_proof_url: r.proofFile ? `${API_URL.replace("/api", "")}/uploads/${r.proofFile}` : null,
    created_at: r.createdAt,
    updated_at: r.updatedAt,
  }
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  if (!(options.body instanceof FormData)) headers.set("Content-Type", "application/json")
  const authToken = token()
  if (authToken) headers.set("Authorization", `Bearer ${authToken}`)

  const res = await fetch(`${API_URL}${path}`, { ...options, headers })
  const text = await res.text()
  const data = text ? JSON.parse(text) : null
  if (!res.ok) throw new Error(data?.message || "Request gagal")
  return data as T
}

export const apiBaseUrl = API_URL
