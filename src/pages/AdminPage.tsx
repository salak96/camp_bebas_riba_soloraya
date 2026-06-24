import { useState, useEffect, useCallback } from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import {
  LogOut, Search, Download, Eye, CheckCircle2, AlertCircle, Clock3,
  Users, Wallet, AlertTriangle, RefreshCw, ExternalLink, Edit, Trash2, Save, Plus, FileText, Calendar, Heart
} from "lucide-react"
import { api, toRegistration, type Registration, type EventData } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

const PAYMENT_STATUS_CONFIG = {
  belum_bayar: { label: "Belum Bayar", color: "bg-destructive/10 text-destructive border-destructive/20", icon: AlertCircle },
  menunggu_konfirmasi: { label: "Menunggu Konfirmasi", color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20", icon: Clock3 },
  lunas: { label: "Lunas", color: "bg-green-500/10 text-green-600 border-green-500/20", icon: CheckCircle2 },
}

type Article = {
  id: number
  title: string
  slug: string
  excerpt: string | null
  content: string
  imageUrl: string | null
  images: string | null
  tiktokUrl: string | null
  isPublished: boolean
}

const emptyArticle = { title: "", slug: "", excerpt: "", content: "", imageUrl: "", images: "", tiktokUrl: "", isPublished: true }

type Donation = {
  id: number
  name: string
  amount: number
  method: string
  round: number
  isPaid: boolean
}

type AdminUser = {
  id: number
  fullName: string | null
  email: string
  role: "peserta" | "admin"
  createdAt: string
}

const emptyDonation = { name: "", amount: 0, method: "transfer", round: 3, isPaid: true }
const emptyUserForm = { fullName: "", email: "", password: "", role: "peserta" as "peserta" | "admin" }

type Tab = "peserta" | "event" | "artikel" | "donasi" | "user"

export default function AdminPage() {
  const { signOut } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>("peserta")
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null)
  const [proofUrl, setProofUrl] = useState<string | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null)
  const [event, setEvent] = useState<EventData | null>(null)
  const [eventForm, setEventForm] = useState({
    name: "", theme: "", campNumber: "", region: "", startDate: "", endDate: "", startTime: "", venue: "", address: "", price: 500000, quota: 150,
  })
  const [savingEvent, setSavingEvent] = useState(false)
  const [editingReg, setEditingReg] = useState<Registration | null>(null)
  const [articles, setArticles] = useState<Article[]>([])
  const [articleForm, setArticleForm] = useState(emptyArticle)
  const [editingArticleId, setEditingArticleId] = useState<number | null>(null)
  const [uploadingArticleImage, setUploadingArticleImage] = useState(false)
  const [donations, setDonations] = useState<Donation[]>([])
  const [donationSearch, setDonationSearch] = useState("")
  const [donationPage, setDonationPage] = useState(1)
  const donationPerPage = 5
  const filteredDonations = donations.filter(d => d.name.toLowerCase().includes(donationSearch.toLowerCase()))
  const donationTotalPages = Math.max(1, Math.ceil(filteredDonations.length / donationPerPage))
  const currentAdminDonations = filteredDonations.slice((donationPage - 1) * donationPerPage, donationPage * donationPerPage)
  const [donationForm, setDonationForm] = useState(emptyDonation)
  const [editingDonationId, setEditingDonationId] = useState<number | null>(null)
  const [donationModalOpen, setDonationModalOpen] = useState(false)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [userForm, setUserForm] = useState(emptyUserForm)
  const [editingUserId, setEditingUserId] = useState<number | null>(null)
  const [userModalOpen, setUserModalOpen] = useState(false)

  const loadRegistrations = useCallback(async () => {
    setLoading(true)
    try {
      const [regData, , articleData, eventData, donationData, userData] = await Promise.all([
        api<{ registrations: any[] }>("/admin/registrations"),
        api<{ quota: number }>("/admin/stats"),
        api<{ articles: Article[] }>("/admin/articles"),
        api<{ event: EventData }>("/admin/events/active"),
        api<{ donations: Donation[] }>("/admin/donations"),
        api<{ users: AdminUser[] }>("/admin/users"),
      ])
      setRegistrations(regData.registrations.map(toRegistration).filter(Boolean) as Registration[])
      setEvent(eventData.event)
      setEventForm({
        name: eventData.event.name,
        theme: eventData.event.theme ?? "",
        campNumber: eventData.event.campNumber ?? "",
        region: eventData.event.region ?? "",
        startDate: eventData.event.startDate.slice(0, 10),
        endDate: eventData.event.endDate.slice(0, 10),
        startTime: eventData.event.startTime ?? "",
        venue: eventData.event.venue ?? "",
        address: eventData.event.address ?? "",
        price: eventData.event.price,
        quota: eventData.event.quota,
      })
      setArticles(articleData.articles)
      setDonations(donationData.donations)
      setUsers(userData.users)
    } catch {
      toast.error("Gagal memuat data")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadRegistrations() }, [loadRegistrations])

  const filtered = registrations.filter((r) => {
    const q = search.toLowerCase()
    const matchSearch = !q || r.full_name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q) || r.whatsapp.includes(q) || r.city.toLowerCase().includes(q)
    const matchStatus = filterStatus === "all" || r.payment_status === filterStatus
    return matchSearch && matchStatus
  })

  const stats = {
    total: registrations.length,
    lunas: registrations.filter(r => r.payment_status === "lunas").length,
    menunggu: registrations.filter(r => r.payment_status === "menunggu_konfirmasi").length,
    belum: registrations.filter(r => r.payment_status === "belum_bayar").length,
    sisa: Math.max((event?.quota ?? 150) - registrations.length, 0),
  }

  async function handleUpdateStatus(reg: Registration, status: "menunggu_konfirmasi" | "lunas" | "belum_bayar") {
    setUpdatingStatus(reg.id)
    try {
      await api(`/admin/registrations/${reg.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ paymentStatus: status }),
      })
      toast.success(`Status berhasil diubah ke: ${PAYMENT_STATUS_CONFIG[status].label}`)
      setRegistrations(prev => prev.map(r => r.id === reg.id ? { ...r, payment_status: status } : r))
      if (selectedReg?.id === reg.id) setSelectedReg(prev => prev ? { ...prev, payment_status: status } : prev)
    } catch (error) {
      toast.error("Gagal update status: " + (error instanceof Error ? error.message : "Terjadi kesalahan"))
    } finally {
      setUpdatingStatus(null)
    }
  }

  async function viewProof(reg: Registration) {
    setSelectedReg(reg)
    setProofUrl(reg.payment_proof_url)
  }

  async function saveEvent() {
    setSavingEvent(true)
    try {
      const data = await api<{ event: EventData }>("/admin/events/active", {
        method: "PATCH",
        body: JSON.stringify(eventForm),
      })
      setEvent(data.event)
      toast.success("Detail event berhasil disimpan!")
    } catch (error) {
      toast.error("Gagal simpan: " + (error instanceof Error ? error.message : "Terjadi kesalahan"))
    } finally {
      setSavingEvent(false)
    }
  }

  async function saveRegistration() {
    if (!editingReg) return
    try {
      const data = await api<{ registration: any }>(`/admin/registrations/${editingReg.id}`, {
        method: "PUT",
        body: JSON.stringify({
          fullName: editingReg.full_name,
          email: editingReg.email,
          whatsapp: editingReg.whatsapp,
          gender: editingReg.gender,
          age: editingReg.age,
          city: editingReg.city,
          shirtSize: editingReg.shirt_size,
          fullAddress: editingReg.full_address,
          notes: editingReg.notes,
          paymentStatus: editingReg.payment_status,
        }),
      })
      const updated = toRegistration(data.registration)
      if (updated) setRegistrations(prev => prev.map(r => r.id === updated.id ? updated : r))
      setEditingReg(null)
      toast.success("Peserta berhasil diupdate")
    } catch (error) {
      toast.error("Gagal update peserta: " + (error instanceof Error ? error.message : "Terjadi kesalahan"))
    }
  }

  async function deleteRegistration(reg: Registration) {
    if (!confirm(`Hapus peserta ${reg.full_name}?`)) return
    try {
      await api(`/admin/registrations/${reg.id}`, { method: "DELETE" })
      setRegistrations(prev => prev.filter(r => r.id !== reg.id))
      toast.success("Peserta berhasil dihapus")
    } catch (error) {
      toast.error("Gagal hapus peserta: " + (error instanceof Error ? error.message : "Terjadi kesalahan"))
    }
  }

  function resetArticleForm() {
    setArticleForm(emptyArticle)
    setEditingArticleId(null)
  }

  async function uploadArticleImage(file: File, type: "cover" | "gallery") {
    if (!file) return
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      toast.error("Gambar harus JPG atau PNG")
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran gambar maksimal 2MB")
      return
    }
    setUploadingArticleImage(true)
    try {
      const formData = new FormData()
      formData.append("image", file)
      const data = await api<{ url: string }>("/admin/uploads/image", { method: "POST", body: formData })
      if (type === "cover") {
        setArticleForm(prev => ({ ...prev, imageUrl: data.url }))
      } else {
        setArticleForm(prev => ({ ...prev, images: prev.images ? `${prev.images}\n${data.url}` : data.url }))
      }
      toast.success("Gambar berhasil diupload")
    } catch (error) {
      toast.error("Upload gagal: " + (error instanceof Error ? error.message : "Terjadi kesalahan"))
    } finally {
      setUploadingArticleImage(false)
    }
  }

  async function saveArticle() {
    try {
      const path = editingArticleId ? `/admin/articles/${editingArticleId}` : "/admin/articles"
      const method = editingArticleId ? "PUT" : "POST"
      await api(path, { method, body: JSON.stringify(articleForm) })
      resetArticleForm()
      await loadRegistrations()
      toast.success("Artikel berhasil disimpan")
    } catch (error) {
      toast.error("Gagal simpan artikel: " + (error instanceof Error ? error.message : "Terjadi kesalahan"))
    }
  }

  async function deleteArticle(id: number) {
    if (!confirm("Hapus artikel ini?")) return
    try {
      await api(`/admin/articles/${id}`, { method: "DELETE" })
      setArticles(prev => prev.filter(a => a.id !== id))
      toast.success("Artikel berhasil dihapus")
    } catch (error) {
      toast.error("Gagal hapus artikel: " + (error instanceof Error ? error.message : "Terjadi kesalahan"))
    }
  }

  function resetDonationForm() {
    setDonationForm(emptyDonation)
    setEditingDonationId(null)
    setDonationModalOpen(false)
  }

  function openNewDonationModal() {
    setDonationForm(emptyDonation)
    setEditingDonationId(null)
    setDonationModalOpen(true)
  }

  async function saveDonation() {
    try {
      const path = editingDonationId ? `/admin/donations/${editingDonationId}` : "/admin/donations"
      const method = editingDonationId ? "PUT" : "POST"
      await api(path, { method, body: JSON.stringify(donationForm) })
      resetDonationForm()
      await loadRegistrations()
      toast.success("Donasi berhasil disimpan")
    } catch (error) {
      toast.error("Gagal simpan donasi: " + (error instanceof Error ? error.message : "Terjadi kesalahan"))
    }
  }

  async function deleteDonation(id: number) {
    if (!confirm("Hapus data donasi ini?")) return
    try {
      await api(`/admin/donations/${id}`, { method: "DELETE" })
      setDonations(prev => prev.filter(d => d.id !== id))
      toast.success("Donasi berhasil dihapus")
    } catch (error) {
      toast.error("Gagal hapus donasi: " + (error instanceof Error ? error.message : "Terjadi kesalahan"))
    }
  }

  function resetUserForm() {
    setUserForm(emptyUserForm)
    setEditingUserId(null)
    setUserModalOpen(false)
  }

  function openNewUserModal() {
    setUserForm(emptyUserForm)
    setEditingUserId(null)
    setUserModalOpen(true)
  }

  async function saveUser() {
    try {
      const path = editingUserId ? `/admin/users/${editingUserId}` : "/admin/users"
      const method = editingUserId ? "PUT" : "POST"
      const body = editingUserId && !userForm.password ? { ...userForm, password: undefined } : userForm
      await api(path, { method, body: JSON.stringify(body) })
      resetUserForm()
      await loadRegistrations()
      toast.success("User berhasil disimpan")
    } catch (error) {
      toast.error("Gagal simpan user: " + (error instanceof Error ? error.message : "Terjadi kesalahan"))
    }
  }

  async function deleteUser(id: number) {
    if (!confirm("Hapus user ini? Data pendaftaran terkait juga akan terhapus.")) return
    try {
      await api(`/admin/users/${id}`, { method: "DELETE" })
      setUsers(prev => prev.filter(u => u.id !== id))
      toast.success("User berhasil dihapus")
    } catch (error) {
      toast.error("Gagal hapus user: " + (error instanceof Error ? error.message : "Terjadi kesalahan"))
    }
  }

  function exportCSV() {
    const headers = ["No", "No. Pendaftaran", "Nama", "Email", "WhatsApp", "Gender", "Usia", "Kota", "Ukuran Kaos", "Status Pembayaran", "Tanggal Daftar"]
    const rows = filtered.map((r, i) => [
      i + 1,
      r.registration_number,
      r.full_name,
      r.email,
      r.whatsapp,
      r.gender === "ikhwan" ? "Ikhwan" : "Akhwat",
      r.age,
      r.city,
      r.shirt_size || "-",
      PAYMENT_STATUS_CONFIG[r.payment_status].label,
      new Date(r.created_at).toLocaleDateString("id-ID"),
    ])
    const csv = [headers, ...rows].map(row => row.map(v => `"${v}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `peserta_camp39_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Data berhasil diexport ke CSV")
  }

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "peserta", label: "Peserta", icon: <Users className="h-4 w-4" /> },
    { key: "event", label: "Edit Event", icon: <Calendar className="h-4 w-4" /> },
    { key: "artikel", label: "Artikel", icon: <FileText className="h-4 w-4" /> },
    { key: "donasi", label: "Donasi", icon: <Heart className="h-4 w-4" /> },
    { key: "user", label: "User Terdaftar", icon: <Users className="h-4 w-4" /> },
  ]

  return (
    <div className="admin-page min-h-svh bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="CBR Indonesia" className="h-8 w-8 object-contain" />
            <span className="font-black text-sm uppercase tracking-wider">CBR Admin Panel</span>
          </Link>
          <Button variant="outline" size="sm" onClick={signOut} className="flex items-center gap-1.5">
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Keluar</span>
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-foreground mb-1">Panel Admin</h1>
          <p className="text-muted-foreground text-sm">{event?.name || "CAMP BEBAS RIBA INDONESIA"} — {event?.campNumber || "CBR"} {event?.region || "Indonesia"}</p>
        </div>

        {/* Stats */}
        <div className="admin-stats">
          <Card className="border-border/60">
            <CardContent className="p-4 text-center">
              <Users className="h-5 w-5 mx-auto mb-1 text-primary" />
              <p className="text-2xl font-black text-foreground">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Peserta</p>
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardContent className="p-4 text-center">
              <CheckCircle2 className="h-5 w-5 mx-auto mb-1 text-green-500" />
              <p className="text-2xl font-black text-foreground">{stats.lunas}</p>
              <p className="text-xs text-muted-foreground">Lunas</p>
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardContent className="p-4 text-center">
              <Clock3 className="h-5 w-5 mx-auto mb-1 text-yellow-500" />
              <p className="text-2xl font-black text-foreground">{stats.menunggu}</p>
              <p className="text-xs text-muted-foreground">Menunggu</p>
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardContent className="p-4 text-center">
              <AlertCircle className="h-5 w-5 mx-auto mb-1 text-destructive" />
              <p className="text-2xl font-black text-foreground">{stats.belum}</p>
              <p className="text-xs text-muted-foreground">Belum Bayar</p>
            </CardContent>
          </Card>
          <Card className="border-border/60 col-span-2 sm:col-span-1">
            <CardContent className="p-4 text-center">
              <Wallet className="h-5 w-5 mx-auto mb-1 text-fire-orange" />
              <p className="text-2xl font-black text-foreground">{stats.sisa}</p>
              <p className="text-xs text-muted-foreground">Sisa Kuota</p>
            </CardContent>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="admin-tabs">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`admin-tab-button ${activeTab === tab.key ? "admin-tab-active" : ""}`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content: Peserta */}
        {activeTab === "peserta" && (
          <>
            {/* Filters */}
            <Card className="border-border/60 mb-6">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Cari nama, email, WhatsApp, atau kota..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full sm:w-52">
                      <SelectValue placeholder="Filter status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Status</SelectItem>
                      <SelectItem value="belum_bayar">Belum Bayar</SelectItem>
                      <SelectItem value="menunggu_konfirmasi">Menunggu Konfirmasi</SelectItem>
                      <SelectItem value="lunas">Lunas</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={loadRegistrations} title="Refresh">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" onClick={exportCSV} className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      <span className="hidden sm:inline">Export CSV</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Table */}
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-base">
                  Daftar Peserta
                  <span className="ml-2 text-sm font-normal text-muted-foreground">({filtered.length} peserta)</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex items-center justify-center py-16 text-muted-foreground">Memuat data...</div>
                ) : filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <AlertTriangle className="h-8 w-8 mb-2" />
                    <p>Tidak ada peserta ditemukan</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left px-4 py-3 text-muted-foreground font-medium whitespace-nowrap">No</th>
                          <th className="text-left px-4 py-3 text-muted-foreground font-medium whitespace-nowrap">No. Pendaftaran</th>
                          <th className="text-left px-4 py-3 text-muted-foreground font-medium">Nama</th>
                          <th className="text-left px-4 py-3 text-muted-foreground font-medium hidden md:table-cell">Email</th>
                          <th className="text-left px-4 py-3 text-muted-foreground font-medium hidden lg:table-cell">WhatsApp</th>
                          <th className="text-left px-4 py-3 text-muted-foreground font-medium hidden sm:table-cell">Gender</th>
                          <th className="text-left px-4 py-3 text-muted-foreground font-medium hidden lg:table-cell">Kota</th>
                          <th className="text-left px-4 py-3 text-muted-foreground font-medium">Status</th>
                          <th className="text-left px-4 py-3 text-muted-foreground font-medium">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((reg, i) => {
                          const sc = PAYMENT_STATUS_CONFIG[reg.payment_status]
                          return (
                            <tr key={reg.id} className="border-b border-border/40 hover:bg-muted/30 transition-colors">
                              <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                              <td className="px-4 py-3 font-mono text-xs font-semibold whitespace-nowrap">{reg.registration_number}</td>
                              <td className="px-4 py-3 font-medium whitespace-nowrap">{reg.full_name}</td>
                              <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{reg.email}</td>
                              <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{reg.whatsapp}</td>
                              <td className="px-4 py-3 hidden sm:table-cell">
                                <Badge variant="outline" className="text-xs">{reg.gender === "ikhwan" ? "Ikhwan" : "Akhwat"}</Badge>
                              </td>
                              <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{reg.city}</td>
                              <td className="px-4 py-3">
                                <Badge className={`${sc.color} border text-xs whitespace-nowrap`}>
                                  <sc.icon className="h-3 w-3 mr-1" />
                                  {sc.label}
                                </Badge>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1">
                                  <Button
                                    asChild
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2 text-xs"
                                    title="Lihat detail & bukti"
                                  >
                                    <Link to={`/admin/bukti/${reg.id}`}>
                                      <Eye className="h-3.5 w-3.5" />
                                    </Link>
                                  </Button>
                                  <Button
                                    asChild
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2 text-xs text-primary hover:bg-primary/10"
                                    title="Edit peserta"
                                  >
                                    <Link to={`/admin/edit/${reg.id}`}>
                                      <Edit className="h-3.5 w-3.5" />
                                    </Link>
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteRegistration(reg)}
                                    className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10"
                                    title="Hapus peserta"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                  {reg.payment_status !== "lunas" && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleUpdateStatus(reg, "lunas")}
                                      disabled={updatingStatus === reg.id}
                                      className="h-7 px-2 text-xs text-green-600 hover:text-green-700 hover:bg-green-500/10"
                                      title="Tandai lunas"
                                    >
                                      {updatingStatus === reg.id ? (
                                        <span className="h-3 w-3 border border-current rounded-full border-t-transparent animate-spin" />
                                      ) : (
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                      )}
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Tab Content: Edit Event */}
        {activeTab === "event" && (
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" /> Edit Detail Event
              </CardTitle>
              <p className="text-xs text-muted-foreground">Perbarui informasi event. Tekan Simpan untuk menyimpan perubahan.</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Nama Event</label>
                  <Input value={eventForm.name} onChange={e => setEventForm({ ...eventForm, name: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Nomor Camp</label>
                  <Input placeholder="CAMP#39" value={eventForm.campNumber} onChange={e => setEventForm({ ...eventForm, campNumber: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Lokasi Event</label>
                  <Input placeholder="Jabodetabek & Karawang" value={eventForm.region} onChange={e => setEventForm({ ...eventForm, region: e.target.value })} />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-sm font-medium text-foreground">Tema / Tagline</label>
                  <Input placeholder="Lepaskan Beban Hidup dari Jerat Hutang" value={eventForm.theme} onChange={e => setEventForm({ ...eventForm, theme: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Tanggal Mulai</label>
                  <Input type="date" value={eventForm.startDate} onChange={e => setEventForm({ ...eventForm, startDate: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Tanggal Selesai</label>
                  <Input type="date" value={eventForm.endDate} onChange={e => setEventForm({ ...eventForm, endDate: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Waktu Mulai</label>
                  <Input placeholder="08.00 WIB" value={eventForm.startTime} onChange={e => setEventForm({ ...eventForm, startTime: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Lokasi / Venue</label>
                  <Input placeholder="Asrama Haji Bekasi" value={eventForm.venue} onChange={e => setEventForm({ ...eventForm, venue: e.target.value })} />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-sm font-medium text-foreground">Alamat Lengkap</label>
                  <Textarea rows={2} placeholder="Jl. Ir. H. Juanda No.70, Bekasi Timur..." value={eventForm.address} onChange={e => setEventForm({ ...eventForm, address: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Harga (Rp)</label>
                  <Input type="number" min={0} value={eventForm.price} onChange={e => setEventForm({ ...eventForm, price: Number(e.target.value) })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Kuota Peserta</label>
                  <Input type="number" min={0} value={eventForm.quota} onChange={e => setEventForm({ ...eventForm, quota: Number(e.target.value) })} />
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2 border-t border-border/60">
                <Button onClick={saveEvent} disabled={savingEvent} className="bg-fire-red hover:bg-fire-orange text-white border-0 font-bold">
                  <Save className="h-4 w-4 mr-2" />
                  {savingEvent ? "Menyimpan..." : "Simpan Perubahan Event"}
                </Button>
                {event && (
                  <p className="text-xs text-muted-foreground">
                    Terakhir update: {new Date(event.startDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tab Content: Artikel */}
        {activeTab === "artikel" && (
          <Card className="border-border/60">
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg"><FileText className="h-5 w-5" /> Manajemen Artikel</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">Buat, edit, atau hapus artikel publik.</p>
              </div>
              <Button variant="outline" onClick={resetArticleForm}><Plus className="h-4 w-4 mr-2"/> Artikel Baru</Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
                    <p className="text-sm font-semibold text-foreground">{editingArticleId ? "Mode Edit Artikel" : "Buat Artikel Baru"}</p>
                    <p className="text-xs text-muted-foreground">Isi form lalu klik {editingArticleId ? "Update Artikel" : "Publish Artikel"}.</p>
                  </div>
                  <Input placeholder="Judul" value={articleForm.title} onChange={e => {
                    const title = e.target.value
                    const autoSlug = !editingArticleId ? title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") : articleForm.slug
                    setArticleForm({ ...articleForm, title, slug: autoSlug })
                  }} />
                  <Input placeholder="Slug (auto dari judul)" value={articleForm.slug} onChange={e => setArticleForm({ ...articleForm, slug: e.target.value })} />
                  <Textarea placeholder="Excerpt" rows={3} value={articleForm.excerpt ?? ""} onChange={e => setArticleForm({ ...articleForm, excerpt: e.target.value })} />
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Cover Artikel</label>
                    <Input
                      type="file"
                      accept="image/jpeg,image/png"
                      disabled={uploadingArticleImage}
                      onChange={e => {
                        const file = e.target.files?.[0]
                        if (file) uploadArticleImage(file, "cover")
                        e.currentTarget.value = ""
                      }}
                    />
                    {articleForm.imageUrl && (
                      <div className="space-y-2">
                        <img src={articleForm.imageUrl} alt="Cover artikel" className="w-full h-32 object-cover rounded-xl border border-border" />
                        <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => setArticleForm({ ...articleForm, imageUrl: "" })}>
                          <Trash2 className="h-4 w-4 mr-2" /> Hapus Cover
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Foto Tambahan</label>
                    <Input
                      type="file"
                      accept="image/jpeg,image/png"
                      multiple
                      disabled={uploadingArticleImage}
                      onChange={async e => {
                        const files = Array.from(e.target.files || [])
                        for (const file of files) await uploadArticleImage(file, "gallery")
                        e.currentTarget.value = ""
                      }}
                    />
                    {articleForm.images && (
                      <div className="grid grid-cols-3 gap-2">
                        {articleForm.images.split("\n").filter(Boolean).map((img, i, arr) => (
                          <div key={i} className="relative group">
                            <img src={img} alt={`Foto ${i + 1}`} className="h-20 w-full object-cover rounded-lg border border-border" />
                            <button
                              type="button"
                              onClick={() => setArticleForm({ ...articleForm, images: arr.filter((_, idx) => idx !== i).join("\n") })}
                              className="absolute top-1 right-1 bg-black/70 text-white rounded-md p-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                              title="Hapus foto"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Link Video TikTok</label>
                    <Input placeholder="https://www.tiktok.com/@username/video/..." value={articleForm.tiktokUrl ?? ""} onChange={e => setArticleForm({ ...articleForm, tiktokUrl: e.target.value })} />
                  </div>
                  <div className="flex items-center gap-2">
                    <input id="published" type="checkbox" checked={articleForm.isPublished} onChange={e => setArticleForm({ ...articleForm, isPublished: e.target.checked })} className="accent-primary" />
                    <label htmlFor="published" className="text-sm">Terbitkan</label>
                  </div>
                  <Button onClick={saveArticle} className="bg-fire-red hover:bg-fire-orange text-white border-0"><Save className="h-4 w-4 mr-2"/> {editingArticleId ? "Update Artikel" : "Publish Artikel"}</Button>
                </div>
                <div className="space-y-3">
                  <Textarea placeholder="Konten artikel (HTML/teks panjang)" rows={14} value={articleForm.content} onChange={e => setArticleForm({ ...articleForm, content: e.target.value })} />
                </div>
              </div>

              <div className="space-y-3">
                {articles.length === 0 && <p className="text-sm text-muted-foreground italic">Belum ada artikel</p>}
                {articles.map(a => (
                  <div key={a.id} className="flex items-start justify-between gap-4 border border-border/60 rounded-xl p-4">
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground truncate">{a.title}</p>
                      <p className="text-xs text-muted-foreground">{a.slug} · {a.isPublished ? "Published" : "Draft"}</p>
                      {a.excerpt && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{a.excerpt}</p>}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-primary border-primary/40 hover:bg-primary/10"
                        onClick={() => {
                          setEditingArticleId(a.id)
                          setArticleForm({ title: a.title, slug: a.slug, excerpt: a.excerpt ?? "", content: a.content, imageUrl: a.imageUrl ?? "", images: a.images ?? "", tiktokUrl: a.tiktokUrl ?? "", isPublished: a.isPublished })
                          window.scrollTo({ top: 0, behavior: "smooth" })
                        }}
                      >
                        <Edit className="h-4 w-4 mr-1" /> Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive border-destructive/40 hover:bg-destructive/10"
                        onClick={() => deleteArticle(a.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Hapus
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        {/* Tab Content: Donasi */}
        {activeTab === "donasi" && (
          <div className="admin-donation-layout">
            <Card className="admin-donation-card">
              <CardHeader className="admin-donation-header">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg"><Heart className="h-5 w-5" /> Manajemen Donasi</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">Tambah, edit, atau hapus nama donatur.</p>
                </div>
                <Button variant="outline" onClick={openNewDonationModal}><Plus className="h-4 w-4 mr-2"/> Donasi Baru</Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari nama donatur..."
                    value={donationSearch}
                    onChange={e => { setDonationSearch(e.target.value); setDonationPage(1) }}
                    className="pl-9"
                  />
                </div>
                <div className="admin-donation-list">
                  {currentAdminDonations.map((d, i) => (
                    <div key={d.id} className="admin-donation-item">
                      <div className="min-w-0">
                        <p className="admin-donation-name">{(donationPage - 1) * donationPerPage + i + 1}. {d.name}</p>
                        <p className="admin-donation-meta">{d.method} · Rp {new Intl.NumberFormat("id-ID").format(d.amount)} {d.method === "tunai" ? "Tunai" : "Transfer"}</p>
                      </div>
                      <div className="admin-donation-actions">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingDonationId(d.id)
                            setDonationForm({ name: d.name, amount: d.amount, method: d.method, round: d.round, isPaid: d.isPaid })
                            setDonationModalOpen(true)
                          }}
                        >
                          <Edit className="h-4 w-4 mr-1" /> Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteDonation(d.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" /> Hapus
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <Button variant="outline" disabled={donationPage === 1} onClick={() => setDonationPage(p => Math.max(1, p - 1))}>Sebelumnya</Button>
                  <span className="text-sm text-muted-foreground">Halaman {donationPage} / {donationTotalPages}</span>
                  <Button variant="outline" disabled={donationPage === donationTotalPages} onClick={() => setDonationPage(p => Math.min(donationTotalPages, p + 1))}>Selanjutnya</Button>
                </div>
              </CardContent>
            </Card>

          </div>
        )}

        {activeTab === "user" && (
          <Card className="admin-donation-card">
            <CardHeader className="admin-donation-header">
              <div>
                <CardTitle className="text-lg">User Terdaftar</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">CRUD nama, email, password, dan role user.</p>
              </div>
              <Button variant="outline" onClick={openNewUserModal}><Plus className="h-4 w-4 mr-2"/> User Baru</Button>
            </CardHeader>
            <CardContent>
              <div className="admin-email-list">
                {users.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Belum ada user terdaftar.</p>
                ) : users.map((user, i) => (
                  <div key={user.id} className="admin-email-item">
                    <div className="min-w-0">
                      <p className="admin-email-name">{i + 1}. {user.fullName || "Tanpa Nama"}</p>
                      <p className="admin-email-address">{user.email} · {user.role}</p>
                    </div>
                    <div className="admin-donation-actions">
                      <Button asChild variant="outline" size="sm">
                        <Link to={`/admin/user/edit/${user.id}`}>
                          <Edit className="h-4 w-4 mr-1" /> Edit
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => deleteUser(user.id)}>
                        <Trash2 className="h-4 w-4 mr-1" /> Hapus
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={donationModalOpen} onOpenChange={(open) => { if (!open) resetDonationForm(); else setDonationModalOpen(true) }}>
        <DialogContent className="admin-mobile-dialog max-w-md">
          <DialogHeader>
            <DialogTitle>{editingDonationId ? "Edit Donasi" : "Donasi Baru"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <p className="text-sm text-muted-foreground">Nama Donatur</p>
              <Input placeholder="Nama donatur" value={donationForm.name} onChange={e => setDonationForm({ ...donationForm, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <p className="text-sm text-muted-foreground">Total Donasi</p>
              <Input type="number" placeholder="Nominal" value={donationForm.amount} onChange={e => setDonationForm({ ...donationForm, amount: Number(e.target.value) })} />
            </div>
            <div className="space-y-1.5">
              <p className="text-sm text-muted-foreground">Cara Donasi</p>
              <Select value={donationForm.method} onValueChange={value => setDonationForm({ ...donationForm, method: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Metode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transfer">Transfer ✅</SelectItem>
                  <SelectItem value="tunai">Tunai 💰</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={resetDonationForm}>Batal</Button>
              <Button onClick={saveDonation} className="bg-fire-red hover:bg-fire-orange text-white border-0">
                <Save className="h-4 w-4 mr-2" /> {editingDonationId ? "Update Donasi" : "Simpan Donasi"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={userModalOpen} onOpenChange={(open) => { if (!open) resetUserForm(); else setUserModalOpen(true) }}>
        <DialogContent className="admin-mobile-dialog max-w-md">
          <DialogHeader>
            <DialogTitle>{editingUserId ? "Edit User" : "User Baru"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <p className="text-sm text-muted-foreground">Nama</p>
              <Input placeholder="Nama lengkap" value={userForm.fullName} onChange={e => setUserForm({ ...userForm, fullName: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <p className="text-sm text-muted-foreground">Email</p>
              <Input type="email" placeholder="email@example.com" value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <p className="text-sm text-muted-foreground">Password {editingUserId ? "baru (opsional)" : ""}</p>
              <Input type="password" placeholder="Minimal 8 karakter" value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <p className="text-sm text-muted-foreground">Role</p>
              <Select value={userForm.role} onValueChange={value => setUserForm({ ...userForm, role: value as "peserta" | "admin" })}>
                <SelectTrigger>
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="peserta">Peserta</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={resetUserForm}>Batal</Button>
              <Button onClick={saveUser} className="bg-fire-red hover:bg-fire-orange text-white border-0">
                <Save className="h-4 w-4 mr-2" /> {editingUserId ? "Update User" : "Simpan User"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={!!editingReg} onOpenChange={(open) => { if (!open) setEditingReg(null) }}>
        <DialogContent className="admin-mobile-dialog max-w-lg max-h-[90svh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Peserta</DialogTitle>
          </DialogHeader>
          {editingReg && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <p className="text-sm text-muted-foreground">Nama</p>
                <Input value={editingReg.full_name} onChange={e => setEditingReg({ ...editingReg, full_name: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <p className="text-sm text-muted-foreground">Email</p>
                <Input value={editingReg.email} onChange={e => setEditingReg({ ...editingReg, email: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <p className="text-sm text-muted-foreground">WhatsApp</p>
                <Input value={editingReg.whatsapp} onChange={e => setEditingReg({ ...editingReg, whatsapp: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <p className="text-sm text-muted-foreground">Gender</p>
                <Select value={editingReg.gender} onValueChange={v => setEditingReg({ ...editingReg, gender: v as Registration["gender"] })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ikhwan">Ikhwan</SelectItem>
                    <SelectItem value="akhwat">Akhwat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <p className="text-sm text-muted-foreground">Usia</p>
                <Input type="number" value={editingReg.age} onChange={e => setEditingReg({ ...editingReg, age: Number(e.target.value) })} />
              </div>
              <div className="space-y-1.5">
                <p className="text-sm text-muted-foreground">Kota</p>
                <Input value={editingReg.city} onChange={e => setEditingReg({ ...editingReg, city: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <p className="text-sm text-muted-foreground">Ukuran Kaos</p>
                <Input value={editingReg.shirt_size ?? ""} onChange={e => setEditingReg({ ...editingReg, shirt_size: e.target.value || null })} />
              </div>
              <div className="space-y-1.5">
                <p className="text-sm text-muted-foreground">Status</p>
                <Select value={editingReg.payment_status} onValueChange={v => setEditingReg({ ...editingReg, payment_status: v as Registration["payment_status"] })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="belum_bayar">Belum Bayar</SelectItem>
                    <SelectItem value="menunggu_konfirmasi">Menunggu Konfirmasi</SelectItem>
                    <SelectItem value="lunas">Lunas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <p className="text-sm text-muted-foreground">Alamat</p>
                <Textarea value={editingReg.full_address} onChange={e => setEditingReg({ ...editingReg, full_address: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <p className="text-sm text-muted-foreground">Catatan</p>
                <Textarea value={editingReg.notes ?? ""} onChange={e => setEditingReg({ ...editingReg, notes: e.target.value || null })} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setEditingReg(null)}>Batal</Button>
                <Button onClick={saveRegistration} className="bg-fire-red hover:bg-fire-orange text-white border-0"><Save className="h-4 w-4 mr-2"/> Simpan</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={!!selectedReg} onOpenChange={(open) => { if (!open) { setSelectedReg(null); setProofUrl(null) } }}>
        <DialogContent className="admin-mobile-dialog max-w-lg max-h-[90svh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Peserta</DialogTitle>
          </DialogHeader>
          {selectedReg && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="font-mono text-sm font-semibold text-primary">{selectedReg.registration_number}</p>
                <Badge className={`${PAYMENT_STATUS_CONFIG[selectedReg.payment_status].color} border`}>
                  {PAYMENT_STATUS_CONFIG[selectedReg.payment_status].label}
                </Badge>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {[
                  { label: "Nama", value: selectedReg.full_name },
                  { label: "Email", value: selectedReg.email },
                  { label: "WhatsApp", value: selectedReg.whatsapp },
                  { label: "Gender", value: selectedReg.gender === "ikhwan" ? "Ikhwan" : "Akhwat" },
                  { label: "Usia", value: `${selectedReg.age} tahun` },
                  { label: "Kota", value: selectedReg.city },
                  ...(selectedReg.shirt_size ? [{ label: "Ukuran Kaos", value: selectedReg.shirt_size }] : []),
                  { label: "Tgl Daftar", value: new Date(selectedReg.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) },
                ].map(({ label, value }) => (
                  <div key={label} className="flex flex-col gap-0.5">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-semibold">{value}</span>
                  </div>
                ))}
              </div>
              {selectedReg.full_address && (
                <>
                  <Separator />
                  <div className="text-sm">
                    <span className="text-muted-foreground block mb-1">Alamat</span>
                    <span>{selectedReg.full_address}</span>
                  </div>
                </>
              )}
              {selectedReg.notes && (
                <>
                  <Separator />
                  <div className="text-sm">
                    <span className="text-muted-foreground block mb-1">Catatan</span>
                    <span>{selectedReg.notes}</span>
                  </div>
                </>
              )}

              {/* Bukti pembayaran */}
              <Separator />
              <div>
                <p className="text-sm font-semibold mb-2">Bukti Pembayaran</p>
                {proofUrl ? (
                  <div className="space-y-2">
                    {selectedReg.payment_proof_url?.endsWith(".pdf") ? (
                      <Button asChild variant="outline" size="sm" className="flex items-center gap-2">
                        <a href={proofUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                          Buka PDF
                        </a>
                      </Button>
                    ) : (
                      <img src={proofUrl} alt="Bukti pembayaran" className="rounded-lg border border-border max-h-64 w-full object-contain" />
                    )}
                  </div>
                ) : selectedReg.payment_proof_url ? (
                  <p className="text-sm text-muted-foreground">Memuat bukti...</p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Belum diupload</p>
                )}
              </div>

              {/* Update status */}
              <Separator />
              <div>
                <p className="text-sm font-semibold mb-2">Ubah Status Pembayaran</p>
                <div className="flex gap-2 flex-wrap">
                  {(["belum_bayar", "menunggu_konfirmasi", "lunas"] as const).map((s) => (
                    <Button
                      key={s}
                      variant={selectedReg.payment_status === s ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleUpdateStatus(selectedReg, s)}
                      disabled={updatingStatus === selectedReg.id || selectedReg.payment_status === s}
                      className={selectedReg.payment_status === s ? "bg-primary text-primary-foreground" : ""}
                    >
                      {PAYMENT_STATUS_CONFIG[s].label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
