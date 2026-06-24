import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"
import { ArrowLeft, Save } from "lucide-react"
import { api, toRegistration, type Registration } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

export default function AdminEditRegistrationPage() {
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

  async function saveRegistration() {
    if (!registration) return
    setSaving(true)
    try {
      await api(`/admin/registrations/${registration.id}`, {
        method: "PUT",
        body: JSON.stringify({
          fullName: registration.full_name,
          email: registration.email,
          whatsapp: registration.whatsapp,
          gender: registration.gender,
          age: registration.age,
          city: registration.city,
          shirtSize: registration.shirt_size,
          fullAddress: registration.full_address,
          notes: registration.notes,
          paymentStatus: registration.payment_status,
        }),
      })
      toast.success("Peserta berhasil diupdate")
      navigate("/admin")
    } catch (error) {
      toast.error("Gagal update peserta: " + (error instanceof Error ? error.message : "Terjadi kesalahan"))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex min-h-svh items-center justify-center bg-background text-muted-foreground">Memuat...</div>
  if (!registration) return <div className="flex min-h-svh items-center justify-center bg-background text-muted-foreground">Peserta tidak ditemukan</div>

  return (
    <div className="min-h-svh bg-background">
      <div className="border-b border-border bg-background sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/admin" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Kembali Admin
          </Link>
          <span className="font-black text-sm">Edit Peserta</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-lg">{registration.registration_number}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <p className="text-sm text-muted-foreground">Nama</p>
              <Input value={registration.full_name} onChange={e => setRegistration({ ...registration, full_name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <p className="text-sm text-muted-foreground">Email</p>
              <Input value={registration.email} onChange={e => setRegistration({ ...registration, email: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <p className="text-sm text-muted-foreground">WhatsApp</p>
              <Input value={registration.whatsapp} onChange={e => setRegistration({ ...registration, whatsapp: e.target.value })} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <p className="text-sm text-muted-foreground">Gender</p>
                <Select value={registration.gender} onValueChange={v => setRegistration({ ...registration, gender: v as Registration["gender"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ikhwan">Ikhwan</SelectItem>
                    <SelectItem value="akhwat">Akhwat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <p className="text-sm text-muted-foreground">Usia</p>
                <Input type="number" value={registration.age} onChange={e => setRegistration({ ...registration, age: Number(e.target.value) })} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <p className="text-sm text-muted-foreground">Kota</p>
                <Input value={registration.city} onChange={e => setRegistration({ ...registration, city: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <p className="text-sm text-muted-foreground">Ukuran Kaos</p>
                <Input value={registration.shirt_size ?? ""} onChange={e => setRegistration({ ...registration, shirt_size: e.target.value || null })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <p className="text-sm text-muted-foreground">Status</p>
              <Select value={registration.payment_status} onValueChange={v => setRegistration({ ...registration, payment_status: v as Registration["payment_status"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="belum_bayar">Belum Bayar</SelectItem>
                  <SelectItem value="menunggu_konfirmasi">Menunggu Konfirmasi</SelectItem>
                  <SelectItem value="lunas">Lunas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <p className="text-sm text-muted-foreground">Alamat</p>
              <Textarea value={registration.full_address} onChange={e => setRegistration({ ...registration, full_address: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <p className="text-sm text-muted-foreground">Catatan</p>
              <Textarea value={registration.notes ?? ""} onChange={e => setRegistration({ ...registration, notes: e.target.value || null })} />
            </div>
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => navigate("/admin")}>Batal</Button>
              <Button onClick={saveRegistration} disabled={saving} className="bg-fire-red hover:bg-fire-orange text-white border-0">
                <Save className="h-4 w-4 mr-2" /> {saving ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
