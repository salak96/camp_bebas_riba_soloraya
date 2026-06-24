import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { ArrowLeft, Send } from "lucide-react"
import { api, type EventData } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const defaultEvent: EventData = {
  id: 1,
  name: "CAMP BEBAS RIBA INDONESIA",
  theme: "Lepaskan Beban Hidup dari Jerat Hutang",
  campNumber: "CAMP#39",
  region: "Jabodetabek & Karawang",
  startDate: "2026-07-25T00:00:00.000Z",
  endDate: "2026-07-26T00:00:00.000Z",
  startTime: "08.00 WIB",
  venue: "Asrama Haji Bekasi",
  address: "Jl. Ir. H. Juanda No.70, Bekasi Timur, Kota Bekasi, Jawa Barat 17113",
  price: 500000,
  quota: 150,
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID").format(amount)
}

const schema = z.object({
  full_name: z.string().min(3, "Nama minimal 3 karakter"),
  email: z.string().email("Email tidak valid"),
  whatsapp: z.string().min(10, "Nomor WhatsApp minimal 10 digit").regex(/^[0-9+\-\s()]+$/, "Format nomor tidak valid"),
  gender: z.enum(["ikhwan", "akhwat"] as const),
  age: z.string().min(1, "Usia wajib diisi"),
  city: z.string().min(2, "Kota asal wajib diisi"),
  shirt_size: z.enum(["S", "M", "L", "XL", "XXL"] as const, { message: "Ukuran kaos wajib dipilih" }),
  full_address: z.string().min(10, "Alamat minimal 10 karakter"),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export default function RegistrationFormPage() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [checkingReg, setCheckingReg] = useState(true)
  const [event, setEvent] = useState<EventData>(defaultEvent)

  useEffect(() => {
    async function loadEvent() {
      try {
        const data = await api<{ event: EventData }>("/events/active")
        if (data.event) setEvent(data.event)
      } catch {
        // use default
      }
    }
    loadEvent()
  }, [])

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: user?.email ?? "",
      full_name: profile?.full_name ?? "",
    }
  })

  useEffect(() => {
    if (!user) return
    async function checkExisting() {
      const data = await api<{ registration: unknown | null }>("/my/registration")
      if (data.registration) {
        toast.info("Anda sudah terdaftar untuk event ini.")
        navigate("/dashboard")
      }
      setCheckingReg(false)
    }
    checkExisting()
  }, [user, navigate])

  async function onSubmit(values: FormValues) {
    if (!user) return
    setLoading(true)

    const payload = {
      fullName: values.full_name,
      email: values.email,
      whatsapp: values.whatsapp,
      gender: values.gender,
      age: parseInt(values.age, 10) || 0,
      city: values.city,
      shirtSize: values.shirt_size,
      fullAddress: values.full_address,
      notes: values.notes || null,
    }

    try {
      await api("/registrations", { method: "POST", body: JSON.stringify(payload) })
      toast.success("Pendaftaran berhasil! Silakan lakukan pembayaran.")
      navigate("/dashboard")
    } catch (error) {
      toast.error("Gagal mendaftar: " + (error instanceof Error ? error.message : "Terjadi kesalahan"))
    } finally {
      setLoading(false)
    }
  }

  if (checkingReg) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <div className="text-muted-foreground">Memeriksa data...</div>
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-background">
      {/* Top bar */}
      <div className="border-b border-border bg-background sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Link>
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="CBR Indonesia" className="h-8 w-8 object-contain" />
            <span className="font-black text-sm">CBR CAMP#39</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <Badge className="mb-3 bg-fire-orange/20 text-orange-500 border-fire-orange/40">
            Formulir Pendaftaran
          </Badge>
          <h1 className="text-3xl font-black text-foreground mb-2">Daftar {event.campNumber || "Event"}</h1>
          <p className="text-muted-foreground">Isi formulir berikut dengan data yang benar dan lengkap</p>
        </div>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>Data Peserta</CardTitle>
            <CardDescription>Semua field bertanda * wajib diisi</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Nama */}
              <div className="space-y-1.5">
                <Label htmlFor="full_name">Nama Lengkap *</Label>
                <Input id="full_name" placeholder="Masukkan nama lengkap" {...register("full_name")} aria-invalid={!!errors.full_name} />
                {errors.full_name && <p className="text-xs text-destructive">{errors.full_name.message}</p>}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" placeholder="nama@email.com" {...register("email")} aria-invalid={!!errors.email} />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>

              {/* WhatsApp */}
              <div className="space-y-1.5">
                <Label htmlFor="whatsapp">Nomor WhatsApp *</Label>
                <Input id="whatsapp" placeholder="08xxxxxxxxxx" {...register("whatsapp")} aria-invalid={!!errors.whatsapp} />
                {errors.whatsapp && <p className="text-xs text-destructive">{errors.whatsapp.message}</p>}
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label>Jenis Kelamin *</Label>
                <RadioGroup
                  onValueChange={(val) => {
                    setValue("gender", val as "ikhwan" | "akhwat")
                  }}
                  className="flex gap-6"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="ikhwan" id="ikhwan" />
                    <Label htmlFor="ikhwan" className="cursor-pointer font-normal">Ikhwan (Laki-laki)</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="akhwat" id="akhwat" />
                    <Label htmlFor="akhwat" className="cursor-pointer font-normal">Akhwat (Perempuan)</Label>
                  </div>
                </RadioGroup>
                {errors.gender && <p className="text-xs text-destructive">{errors.gender.message}</p>}
              </div>

              {/* Usia */}
              <div className="space-y-1.5">
                <Label htmlFor="age">Usia *</Label>
                <Input id="age" type="number" min={17} max={80} placeholder="Contoh: 30" {...register("age")} aria-invalid={!!errors.age} />
                {errors.age && <p className="text-xs text-destructive">{errors.age.message}</p>}
              </div>

              {/* Kota */}
              <div className="space-y-1.5">
                <Label htmlFor="city">Kota Asal *</Label>
                <Input id="city" placeholder="Contoh: Bekasi, Jakarta Timur" {...register("city")} aria-invalid={!!errors.city} />
                {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label>Ukuran Kaos *</Label>
                <Select onValueChange={(val) => setValue("shirt_size", val as FormValues["shirt_size"], { shouldValidate: true })}>
                  <SelectTrigger aria-invalid={!!errors.shirt_size}>
                    <SelectValue placeholder="Pilih ukuran kaos" />
                  </SelectTrigger>
                  <SelectContent>
                    {["S", "M", "L", "XL", "XXL"].map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.shirt_size && <p className="text-xs text-destructive">{errors.shirt_size.message}</p>}
              </div>

              {/* Alamat */}
              <div className="space-y-1.5">
                <Label htmlFor="full_address">Alamat Lengkap *</Label>
                <Textarea
                  id="full_address"
                  placeholder="Jl. nama jalan, RT/RW, kelurahan, kecamatan, kota, provinsi"
                  rows={3}
                  {...register("full_address")}
                  aria-invalid={!!errors.full_address}
                />
                {errors.full_address && <p className="text-xs text-destructive">{errors.full_address.message}</p>}
              </div>

              {/* Catatan */}
              <div className="space-y-1.5">
                <Label htmlFor="notes">Catatan Tambahan (Opsional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Misal: alergi makanan, kebutuhan khusus, dll."
                  rows={2}
                  {...register("notes")}
                />
              </div>

              {/* Info pembayaran */}
              <div className="bg-muted/50 rounded-xl p-4 border border-border/60">
                <p className="text-sm font-semibold text-foreground mb-1">Informasi Pembayaran</p>
                <p className="text-sm text-muted-foreground mb-2">
                  Setelah mendaftar, lakukan pembayaran sebesar <strong className="text-foreground">Rp {formatCurrency(event.price)}</strong> ke:
                </p>
                <div className="text-sm space-y-1">
                  <div className="flex gap-2"><span className="text-muted-foreground w-20 shrink-0">Bank</span><span className="font-semibold">: BSI / BCA / Mandiri</span></div>
                  <div className="flex gap-2"><span className="text-muted-foreground w-20 shrink-0">No. Rek</span><span className="font-semibold">: 1234 5678 9012</span></div>
                  <div className="flex gap-2"><span className="text-muted-foreground w-20 shrink-0">A/N</span><span className="font-semibold">: Yayasan Camp Bebas Riba</span></div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Upload bukti pembayaran melalui dashboard peserta setelah mendaftar.</p>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-fire-red hover:bg-fire-orange text-white border-0 font-bold py-6 text-base"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Memproses...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    Kirim Pendaftaran
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
