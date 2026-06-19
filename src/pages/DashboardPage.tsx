import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import {
  Flame, LogOut, User, Calendar, MapPin, Clock, Upload,
  MessageCircle, CheckCircle2, AlertCircle, Clock3, FileText, ExternalLink
} from "lucide-react"
import { supabase, EVENT_ID, type Registration } from "@/lib/supabase"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

const PAYMENT_STATUS_CONFIG = {
  belum_bayar: { label: "Belum Bayar", color: "bg-destructive/10 text-destructive border-destructive/20", icon: AlertCircle },
  menunggu_konfirmasi: { label: "Menunggu Konfirmasi", color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20", icon: Clock3 },
  lunas: { label: "Lunas", color: "bg-green-500/10 text-green-600 border-green-500/20", icon: CheckCircle2 },
}

export default function DashboardPage() {
  const { user, profile, signOut } = useAuth()
  const [registration, setRegistration] = useState<Registration | null>(null)
  const [loadingReg, setLoadingReg] = useState(true)
  const [uploadingProof, setUploadingProof] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!user) return
    async function loadRegistration() {
      const { data, error } = await supabase
        .from("registrations")
        .select("*")
        .eq("user_id", user!.id)
        .eq("event_id", EVENT_ID)
        .maybeSingle()
      if (error) toast.error("Gagal memuat data pendaftaran")
      setRegistration(data)
      setLoadingReg(false)
    }
    loadRegistration()
  }, [user])

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !registration) return

    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"]
    if (!allowedTypes.includes(file.type)) {
      toast.error("Format file tidak didukung. Gunakan JPG, PNG, atau PDF.")
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 2MB.")
      return
    }

    setUploadingProof(true)
    const fileName = `${user!.id}/${registration.id}_${Date.now()}.${file.name.split(".").pop()}`

    const { error: uploadError } = await supabase.storage
      .from("payment-proofs")
      .upload(fileName, file, { upsert: true })

    if (uploadError) {
      toast.error("Gagal upload bukti pembayaran: " + uploadError.message)
      setUploadingProof(false)
      return
    }

    const { error: updateError } = await supabase
      .from("registrations")
      .update({
        payment_proof_url: fileName,
        payment_status: "menunggu_konfirmasi",
        updated_at: new Date().toISOString(),
      })
      .eq("id", registration.id)

    if (updateError) {
      toast.error("Gagal update status: " + updateError.message)
    } else {
      toast.success("Bukti pembayaran berhasil diupload! Status: Menunggu Konfirmasi.")
      setRegistration(prev => prev ? { ...prev, payment_proof_url: fileName, payment_status: "menunggu_konfirmasi" } : prev)
    }
    setUploadingProof(false)
    if (fileRef.current) fileRef.current.value = ""
  }

  function buildWaMessage() {
    if (!registration) return ""
    const msg = `Halo Admin CBR, saya ingin konfirmasi pendaftaran CAMP#39.%0ANama: ${registration.full_name}%0ANo WA: ${registration.whatsapp}%0AKota: ${registration.city}%0AStatus pembayaran: ${PAYMENT_STATUS_CONFIG[registration.payment_status].label}`
    return `https://wa.me/6281234567890?text=${msg}`
  }

  async function handleSignOut() {
    await signOut()
  }

  const statusConfig = registration ? PAYMENT_STATUS_CONFIG[registration.payment_status] : null

  return (
    <div className="min-h-svh bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Flame className="h-6 w-6 text-fire-orange" />
            <span className="font-black text-sm uppercase tracking-wider hidden sm:inline">CBR Indonesia</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span className="max-w-[140px] truncate hidden sm:inline">{profile?.full_name || user?.email}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="flex items-center gap-1.5"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-foreground mb-1">Dashboard Peserta</h1>
          <p className="text-muted-foreground text-sm">Selamat datang, {profile?.full_name || "Peserta"}!</p>
        </div>

        {/* Apa itu CBR Section */}
        <Card className="border-border/60 mb-8">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div className="w-full sm:w-48 h-48 rounded-2xl bg-fire-gradient-subtle flex items-center justify-center shrink-0 overflow-hidden">
                <img
                  src="https://campbebasriba.com/wp-content/uploads/2024/12/Untitled-1.png"
                  alt="Camp Bebas Riba Indonesia"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none"
                    const parent = (e.target as HTMLImageElement).parentElement
                    if (parent) {
                      const icon = document.createElement("div")
                      icon.className = "flex flex-col items-center gap-2 text-fire-orange"
                      icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>'
                      icon.innerHTML += '<span class="text-xs text-gray-400">CBR Indonesia</span>'
                      parent.appendChild(icon)
                    }
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl sm:text-3xl font-black text-foreground mb-2">
                  Apa itu <span className="text-fire-gradient">CBR</span> ?
                </h2>
                <p className="text-lg font-semibold text-foreground mb-3">
                  Bebaskan diri Anda dari<br />
                  Jeratan Utang dan Riba !
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  CBR Indonesia merupakan organisasi Masyarakat yang berdedikasi untuk membantu masyarakat keluar dari jeratan utang riba dan membangun kehidupan finansial yang sehat, bebas dari praktik yang tidak sesuai dengan prinsip syariah.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {loadingReg ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">Memuat data...</div>
        ) : !registration ? (
          /* Not registered yet */
          <Card className="border-border/60 text-center">
            <CardContent className="py-12">
              <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">Belum Terdaftar</h2>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                Anda belum mendaftar untuk CAMP#39. Daftar sekarang sebelum kuota habis!
              </p>
              <Button asChild className="bg-fire-red hover:bg-fire-orange text-white border-0 font-bold">
                <Link to="/daftar">Daftar Sekarang</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Status card */}
            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <CardTitle className="text-lg">Status Pendaftaran</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">No. Pendaftaran: <strong className="text-foreground font-mono">{registration.registration_number}</strong></p>
                  </div>
                  <Badge className={`${statusConfig?.color} border px-3 py-1 text-sm font-semibold`}>
                    {statusConfig && <statusConfig.icon className="h-3.5 w-3.5 mr-1.5" />}
                    {statusConfig?.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {/* Payment instructions */}
                {registration.payment_status === "belum_bayar" && (
                  <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4 mb-4">
                    <p className="text-sm font-semibold text-destructive mb-2">Segera Lakukan Pembayaran</p>
                    <div className="text-sm space-y-1 text-foreground/80 mb-3">
                      <div className="flex gap-2"><span className="text-muted-foreground w-20 shrink-0">Bank</span><span className="font-semibold">BSI / BCA / Mandiri</span></div>
                      <div className="flex gap-2"><span className="text-muted-foreground w-20 shrink-0">No. Rek</span><span className="font-semibold">1234 5678 9012</span></div>
                      <div className="flex gap-2"><span className="text-muted-foreground w-20 shrink-0">A/N</span><span className="font-semibold">Yayasan Camp Bebas Riba</span></div>
                      <div className="flex gap-2"><span className="text-muted-foreground w-20 shrink-0">Jumlah</span><span className="font-bold text-foreground">Rp 500.000</span></div>
                    </div>
                  </div>
                )}
                {registration.payment_status === "menunggu_konfirmasi" && (
                  <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4 mb-4">
                    <p className="text-sm text-yellow-600 font-medium">Bukti pembayaran Anda sedang diverifikasi oleh panitia. Harap menunggu konfirmasi.</p>
                  </div>
                )}
                {registration.payment_status === "lunas" && (
                  <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4 mb-4">
                    <p className="text-sm text-green-600 font-medium">Pembayaran Anda telah dikonfirmasi. Selamat! Anda resmi terdaftar sebagai peserta CAMP#39.</p>
                  </div>
                )}

                {/* Upload bukti pembayaran */}
                {registration.payment_status !== "lunas" && (
                  <div>
                    <input
                      ref={fileRef}
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    <Button
                      variant="outline"
                      onClick={() => fileRef.current?.click()}
                      disabled={uploadingProof}
                      className="flex items-center gap-2"
                    >
                      {uploadingProof ? (
                        <span className="h-4 w-4 border-2 border-muted-foreground/40 border-t-muted-foreground rounded-full animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                      {registration.payment_proof_url ? "Upload Ulang Bukti" : "Upload Bukti Pembayaran"}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1.5">Format: JPG, PNG, atau PDF • Maks. 2MB</p>
                    {registration.payment_proof_url && (
                      <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Bukti pembayaran sudah diupload
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Data peserta */}
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-lg">Data Peserta</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  {[
                    { label: "Nama Lengkap", value: registration.full_name },
                    { label: "Email", value: registration.email },
                    { label: "WhatsApp", value: registration.whatsapp },
                    { label: "Jenis Kelamin", value: registration.gender === "ikhwan" ? "Ikhwan" : "Akhwat" },
                    { label: "Usia", value: `${registration.age} tahun` },
                    { label: "Kota Asal", value: registration.city },
                    ...(registration.gender === "ikhwan" && registration.shirt_size ? [{ label: "Ukuran Kaos", value: registration.shirt_size }] : []),
                    ...(registration.gender === "akhwat" && registration.hijab_size ? [{ label: "Ukuran Khimar", value: registration.hijab_size }] : []),
                  ].map(({ label, value }) => (
                    <div key={label} className="flex flex-col gap-0.5">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-semibold text-foreground">{value}</span>
                    </div>
                  ))}
                </div>
                {registration.full_address && (
                  <>
                    <Separator className="my-3" />
                    <div className="text-sm">
                      <span className="text-muted-foreground block mb-1">Alamat Lengkap</span>
                      <span className="font-medium text-foreground">{registration.full_address}</span>
                    </div>
                  </>
                )}
                {registration.notes && (
                  <>
                    <Separator className="my-3" />
                    <div className="text-sm">
                      <span className="text-muted-foreground block mb-1">Catatan</span>
                      <span className="text-foreground">{registration.notes}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Detail Event */}
            <Card className="border-border/60 bg-fire-gradient-subtle text-white">
              <CardHeader>
                <CardTitle className="text-lg text-white">Detail Event</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Flame className="h-5 w-5 text-fire-orange shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-white">CAMP BEBAS RIBA INDONESIA</p>
                      <p className="text-sm text-gray-400 italic">"Lepaskan Beban Hidup dari Jerat Hutang"</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-300">
                    <Calendar className="h-4 w-4 text-fire-orange shrink-0" />
                    <span>Sabtu–Minggu, 25–26 Juli 2026</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-300">
                    <Clock className="h-4 w-4 text-fire-orange shrink-0" />
                    <span>08.00 WIB – Selesai</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm text-gray-300">
                    <MapPin className="h-4 w-4 text-fire-orange shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-white">Asrama Haji Bekasi</p>
                      <p>Jl. Ir. H. Juanda No.70, Bekasi Timur</p>
                      <p>Kota Bekasi, Jawa Barat 17113</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* WhatsApp contact */}
            <Card className="border-border/60">
              <CardContent className="p-5">
                <p className="text-sm font-semibold text-foreground mb-2">Butuh Bantuan?</p>
                <p className="text-sm text-muted-foreground mb-3">
                  Hubungi panitia via WhatsApp untuk konfirmasi pembayaran atau pertanyaan lainnya.
                </p>
                <Button
                  asChild
                  variant="outline"
                  className="border-green-500/50 text-green-600 hover:bg-green-500/10 flex items-center gap-2"
                >
                  <a href={buildWaMessage()} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-4 w-4" />
                    Hubungi Panitia via WhatsApp
                    <ExternalLink className="h-3.5 w-3.5 ml-0.5" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
