import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"
import { ArrowLeft, Save } from "lucide-react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type AdminUser = {
  id: number
  fullName: string | null
  email: string
  role: "peserta" | "admin"
}

export default function AdminEditUserPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState<AdminUser | null>(null)
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function loadUser() {
      try {
        const data = await api<{ user: AdminUser }>(`/admin/users/${id}`)
        setUser(data.user)
      } catch (error) {
        toast.error("Gagal memuat user: " + (error instanceof Error ? error.message : "Terjadi kesalahan"))
      } finally {
        setLoading(false)
      }
    }
    loadUser()
  }, [id])

  async function saveUser() {
    if (!user) return
    setSaving(true)
    try {
      await api(`/admin/users/${user.id}`, {
        method: "PUT",
        body: JSON.stringify({ fullName: user.fullName, email: user.email, password: password || undefined, role: user.role }),
      })
      toast.success("User berhasil diupdate")
      navigate(-1)
    } catch (error) {
      toast.error("Gagal update user: " + (error instanceof Error ? error.message : "Terjadi kesalahan"))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex min-h-svh items-center justify-center bg-background text-muted-foreground">Memuat...</div>
  if (!user) return <div className="flex min-h-svh items-center justify-center bg-background text-muted-foreground">User tidak ditemukan</div>

  return (
    <div className="min-h-svh bg-background">
      <div className="border-b border-border bg-background sticky top-0 z-10">
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/admin" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Kembali Admin
          </Link>
          <span className="font-black text-sm">Edit User</span>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-6">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-lg">Edit User</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <p className="text-sm text-muted-foreground">Nama</p>
              <Input value={user.fullName ?? ""} onChange={e => setUser({ ...user, fullName: e.target.value || null })} />
            </div>
            <div className="space-y-1.5">
              <p className="text-sm text-muted-foreground">Email</p>
              <Input type="email" value={user.email} onChange={e => setUser({ ...user, email: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <p className="text-sm text-muted-foreground">Password baru (opsional)</p>
              <Input type="password" placeholder="Kosongkan jika tidak diubah" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => navigate(-1)}>Batal</Button>
              <Button onClick={saveUser} disabled={saving} className="bg-fire-red hover:bg-fire-orange text-white border-0">
                <Save className="h-4 w-4 mr-2" /> {saving ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
