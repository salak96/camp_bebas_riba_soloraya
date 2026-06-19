import { useState, useEffect, useCallback } from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import {
  Flame, LogOut, Search, Download, Eye, CheckCircle2, AlertCircle, Clock3,
  Users, Wallet, AlertTriangle, RefreshCw, ExternalLink
} from "lucide-react"
import { supabase, EVENT_ID, type Registration } from "@/lib/supabase"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const PAYMENT_STATUS_CONFIG = {
  belum_bayar: { label: "Belum Bayar", color: "bg-destructive/10 text-destructive border-destructive/20", icon: AlertCircle },
  menunggu_konfirmasi: { label: "Menunggu Konfirmasi", color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20", icon: Clock3 },
  lunas: { label: "Lunas", color: "bg-green-500/10 text-green-600 border-green-500/20", icon: CheckCircle2 },
}

const QUOTA = 150

export default function AdminPage() {
  const { signOut } = useAuth()
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null)
  const [proofUrl, setProofUrl] = useState<string | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)

  const loadRegistrations = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("registrations")
      .select("*")
      .eq("event_id", EVENT_ID)
      .order("created_at", { ascending: false })
    if (error) { toast.error("Gagal memuat data"); setLoading(false); return }
    setRegistrations(data || [])
    setLoading(false)
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
    sisa: QUOTA - registrations.length,
  }

  async function handleUpdateStatus(reg: Registration, status: "menunggu_konfirmasi" | "lunas" | "belum_bayar") {
    setUpdatingStatus(reg.id)
    const { error } = await supabase
      .from("registrations")
      .update({ payment_status: status, updated_at: new Date().toISOString() })
      .eq("id", reg.id)
    if (error) {
      toast.error("Gagal update status: " + error.message)
    } else {
      toast.success(`Status berhasil diubah ke: ${PAYMENT_STATUS_CONFIG[status].label}`)
      setRegistrations(prev => prev.map(r => r.id === reg.id ? { ...r, payment_status: status } : r))
      if (selectedReg?.id === reg.id) setSelectedReg(prev => prev ? { ...prev, payment_status: status } : prev)
    }
    setUpdatingStatus(null)
  }

  async function viewProof(reg: Registration) {
    setSelectedReg(reg)
    if (!reg.payment_proof_url) { setProofUrl(null); return }
    const { data } = await supabase.storage.from("payment-proofs").createSignedUrl(reg.payment_proof_url, 300)
    setProofUrl(data?.signedUrl ?? null)
  }

  function exportCSV() {
    const headers = ["No", "No. Pendaftaran", "Nama", "Email", "WhatsApp", "Gender", "Usia", "Kota", "Ukuran Kaos", "Ukuran Khimar", "Status Pembayaran", "Tanggal Daftar"]
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
      r.hijab_size || "-",
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

  return (
    <div className="min-h-svh bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Flame className="h-6 w-6 text-fire-orange" />
            <span className="font-black text-sm uppercase tracking-wider">CBR Admin Panel</span>
          </Link>
          <Button variant="outline" size="sm" onClick={signOut} className="flex items-center gap-1.5">
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Keluar</span>
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-foreground mb-1">Panel Admin</h1>
          <p className="text-muted-foreground text-sm">CAMP BEBAS RIBA INDONESIA — CAMP#39 Jabodetabek & Karawang</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
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
                                variant="ghost"
                                size="sm"
                                onClick={() => viewProof(reg)}
                                className="h-7 px-2 text-xs"
                                title="Lihat detail & bukti"
                              >
                                <Eye className="h-3.5 w-3.5" />
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
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedReg} onOpenChange={(open) => { if (!open) { setSelectedReg(null); setProofUrl(null) } }}>
        <DialogContent className="max-w-lg max-h-[90svh] overflow-y-auto">
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
                  ...(selectedReg.hijab_size ? [{ label: "Ukuran Khimar", value: selectedReg.hijab_size }] : []),
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
