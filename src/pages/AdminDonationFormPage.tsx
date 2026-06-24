import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"
import { ArrowLeft, Save } from "lucide-react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type DonationForm = {
  name: string
  amount: number
  method: string
  round: number
  isPaid: boolean
}

const emptyDonation: DonationForm = { name: "", amount: 0, method: "transfer", round: 3, isPaid: true }

export default function AdminDonationFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const [form, setForm] = useState<DonationForm>(emptyDonation)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!id) return
    async function loadDonation() {
      try {
        const data = await api<{ donation: DonationForm }>(`/admin/donations/${id}`)
        setForm(data.donation)
      } catch (error) {
        toast.error("Gagal memuat donasi: " + (error instanceof Error ? error.message : "Terjadi kesalahan"))
      } finally {
        setLoading(false)
      }
    }
    loadDonation()
  }, [id])

  async function saveDonation() {
    setSaving(true)
    try {
      await api(isEdit ? `/admin/donations/${id}` : "/admin/donations", {
        method: isEdit ? "PUT" : "POST",
        body: JSON.stringify(form),
      })
      toast.success(isEdit ? "Donasi berhasil diupdate" : "Donasi berhasil ditambah")
      navigate(-1)
    } catch (error) {
      toast.error("Gagal simpan donasi: " + (error instanceof Error ? error.message : "Terjadi kesalahan"))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex min-h-svh items-center justify-center bg-background text-muted-foreground">Memuat...</div>

  return (
    <div className="min-h-svh bg-background">
      <div className="border-b border-border bg-background sticky top-0 z-10">
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/admin" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Kembali Admin
          </Link>
          <span className="font-black text-sm">{isEdit ? "Edit Donasi" : "Donasi Baru"}</span>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-6">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-lg">{isEdit ? "Edit Donasi" : "Donasi Baru"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <p className="text-sm text-muted-foreground">Nama Donatur</p>
              <Input placeholder="Nama donatur" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <p className="text-sm text-muted-foreground">Total Donasi</p>
              <Input type="number" placeholder="Nominal" value={form.amount} onChange={e => setForm({ ...form, amount: Number(e.target.value) })} />
            </div>
            <div className="space-y-1.5">
              <p className="text-sm text-muted-foreground">Cara Donasi</p>
              <Select value={form.method} onValueChange={value => setForm({ ...form, method: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="transfer">Transfer</SelectItem>
                  <SelectItem value="tunai">Tunai</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <p className="text-sm text-muted-foreground">Ronde</p>
              <Input type="number" value={form.round} onChange={e => setForm({ ...form, round: Number(e.target.value) })} />
            </div>
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => navigate(-1)}>Batal</Button>
              <Button onClick={saveDonation} disabled={saving} className="bg-fire-red hover:bg-fire-orange text-white border-0">
                <Save className="h-4 w-4 mr-2" /> {saving ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
