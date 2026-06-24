import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"
import { ArrowLeft, ExternalLink, Save } from "lucide-react"
import { api, toRegistration, type Registration } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const PAYMENT_STATUS_CONFIG = {
  belum_bayar: { label: "Belum Bayar", color: "bg-destructive/10 text-destructive border-destructive/20" },
  menunggu_konfirmasi: { label: "Menunggu Konfirmasi", color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" },
  lunas: { label: "Lunas", color: "bg-green-500/10 text-green-600 border-green-500/20" },
}

export default function AdminRegistrationProofPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [registration, setRegistration] = useState<Registration | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function loadRegistration() {
      try {
        const data = await api<{ registration: any }>(`/admin/registrations/${id}`)
        setRegistration(toRegistration(data.registration))
      } catch (error) {
        toast.error("Gagal memuat peserta: " + (error instanceof Error ? error.message : "Terjadi kesalahan"))
      } finally {
        setLoading(false)
      }
    }
    loadRegistration()
  }, [id])

  async function saveStatus() {
    if (!registration) return
    setSaving(true)
    try {
      await api(`/admin/registrations/${registration.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ paymentStatus: registration.payment_status }),
      })
      toast.success("Status pembayaran berhasil diubah")
      navigate("/admin")
    } catch (error) {
      toast.error("Gagal update status: " + (error instanceof Error ? error.message : "Terjadi kesalahan"))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex min-h-svh items-center justify-center bg-background text-muted-foreground">Memuat...</div>
  if (!registration) return <div className="flex min-h-svh items-center justify-center bg-background text-muted-foreground">Peserta tidak ditemukan</div>

  return (
    <div className="min-h-svh bg-background">
      <div className="border-b border-border bg-background sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/admin" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Kembali Admin
          </Link>
          <span className="font-black text-sm">Bukti Transfer</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        <Card className="border-border/60">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <CardTitle className="text-lg">{registration.registration_number}</CardTitle>
              <Badge className={`${PAYMENT_STATUS_CONFIG[registration.payment_status].color} border w-fit`}>
                {PAYMENT_STATUS_CONFIG[registration.payment_status].label}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {[
                { label: "Nama", value: registration.full_name },
                { label: "Email", value: registration.email },
                { label: "WhatsApp", value: registration.whatsapp },
                { label: "Gender", value: registration.gender === "ikhwan" ? "Ikhwan" : "Akhwat" },
                { label: "Usia", value: `${registration.age} tahun` },
                { label: "Kota", value: registration.city },
              ].map(({ label, value }) => (
                <div key={label} className="flex flex-col gap-0.5">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-semibold">{value}</span>
                </div>
              ))}
            </div>

            <Separator />

            <div>
              <p className="text-sm font-semibold mb-3">Bukti Pembayaran</p>
              {registration.payment_proof_url ? (
                registration.payment_proof_url.toLowerCase().endsWith(".pdf") ? (
                  <Button asChild variant="outline">
                    <a href={registration.payment_proof_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" /> Buka PDF
                    </a>
                  </Button>
                ) : (
                  <a href={registration.payment_proof_url} target="_blank" rel="noopener noreferrer">
                    <img src={registration.payment_proof_url} alt="Bukti pembayaran" className="w-full rounded-xl border border-border bg-white object-contain" />
                  </a>
                )
              ) : (
                <p className="text-sm text-muted-foreground italic">Belum diupload</p>
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              <p className="text-sm font-semibold">Ubah Status Pembayaran</p>
              <Select value={registration.payment_status} onValueChange={v => setRegistration({ ...registration, payment_status: v as Registration["payment_status"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="belum_bayar">Belum Bayar</SelectItem>
                  <SelectItem value="menunggu_konfirmasi">Menunggu Konfirmasi</SelectItem>
                  <SelectItem value="lunas">Lunas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
              <Button variant="outline" onClick={() => navigate("/admin")}>Batal</Button>
              <Button onClick={saveStatus} disabled={saving} className="bg-fire-red hover:bg-fire-orange text-white border-0">
                <Save className="h-4 w-4 mr-2" /> {saving ? "Menyimpan..." : "Simpan Status"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
