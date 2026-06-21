import { useEffect, useState } from "react"
import SiteNavbar from "@/components/SiteNavbar"
import { Heart, Copy, MessageCircle, Landmark } from "lucide-react"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

type Donation = {
  id: number
  name: string
  amount: number
  method: string
  round: number
  isPaid: boolean
}

function rupiah(value: number) {
  return new Intl.NumberFormat("id-ID").format(value)
}

export default function DonasiPage() {
  const rekening = "771101008660535"
  const [donations, setDonations] = useState<Donation[]>([])
  const [total, setTotal] = useState(3635000)
  const [cashBalance, setCashBalance] = useState(818000)
  const [page, setPage] = useState(1)
  const perPage = 5
  const sortedDonations = [...donations].sort((a, b) => b.amount - a.amount)
  const totalPages = Math.max(1, Math.ceil(sortedDonations.length / perPage))
  const currentDonations = sortedDonations.slice((page - 1) * perPage, page * perPage)

  useEffect(() => {
    async function loadDonations() {
      try {
        const data = await api<{ donations: Donation[]; total: number; cashBalance: number }>("/donations")
        setDonations(data.donations)
        setTotal(data.total)
        setCashBalance(data.cashBalance)
      } catch {
        // ignore
      }
    }
    loadDonations()
  }, [])

  async function copyRekening() {
    await navigator.clipboard.writeText(rekening)
    toast.success("Nomor rekening berhasil disalin")
  }

  return (
    <div className="donasi-page min-h-svh bg-background text-foreground">
      <SiteNavbar active="donasi" />

      <section className="donasi-hero py-20 text-center text-white">
        <div className="max-w-3xl mx-auto px-4">
          <Badge className="mb-4 bg-fire-orange/20 text-white border-white/20">Open Donasi</Badge>
          <Heart className="h-14 w-14 mx-auto mb-4 text-fire-orange" />
          <h1 className="text-4xl sm:text-5xl font-black mb-3">CBR Sedekah Beras</h1>
          <p className="text-xl text-gray-300 font-semibold">Putaran ke 3</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 space-y-8">
          <Card className="border-border/60 shadow-lg">
            <CardContent className="p-6 sm:p-8 text-center">
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                Bagi yang berkenan Sedekah Beras dalam bentuk uang bisa transfer melalui rekening berikut:
              </p>

              <div className="rounded-2xl border border-border bg-muted/40 p-6 mb-6">
                <Landmark className="h-10 w-10 mx-auto mb-3 text-primary" />
                <p className="text-sm text-muted-foreground mb-1">No. Rekening BRI</p>
                <p className="text-3xl font-black text-foreground tracking-wide mb-2">{rekening}</p>
                <p className="font-semibold text-foreground">Ami Fajarwati</p>
                <Button variant="outline" className="mt-4" onClick={copyRekening}>
                  <Copy className="h-4 w-4 mr-2" /> Salin Nomor Rekening
                </Button>
              </div>

              <Separator className="my-6" />

              <p className="font-bold text-foreground mb-3">Konfirmasi Transfer</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <Button asChild className="bg-fire-red hover:bg-fire-orange text-white border-0">
                  <a href="https://wa.me/6282213136076" target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-4 w-4 mr-2" /> Ikhwan
                  </a>
                </Button>
                <Button asChild className="bg-fire-red hover:bg-fire-orange text-white border-0">
                  <a href="https://wa.me/6282122303876" target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-4 w-4 mr-2" /> Akhwat
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardContent className="p-6 sm:p-8">
              <div className="text-center mb-6">
                <Badge className="mb-3 bg-primary/10 text-primary border-primary/20">List Sedekah</Badge>
                <h2 className="text-2xl sm:text-3xl font-black text-foreground">Donatur Tertinggi</h2>
                <p className="text-sm text-muted-foreground mt-1">Maksimal 5 nama per halaman</p>
              </div>
              <div className="space-y-2">
                {currentDonations.map((item, i) => (
                  <div key={item.id} className="flex items-center justify-between gap-4 rounded-xl border border-border/60 px-4 py-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground truncate">{(page - 1) * perPage + i + 1}. {item.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{item.method === "tunai" ? "Tunai" : "Transfer"}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-black text-foreground">Rp {rupiah(item.amount)}</p>
                      <p className="text-xs">{item.method === "tunai" ? "💰" : "✅"}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-3 mt-5">
                <Button variant="outline" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Sebelumnya</Button>
                <span className="text-sm text-muted-foreground">Halaman {page} / {totalPages}</span>
                <Button variant="outline" disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Selanjutnya</Button>
              </div>
              <Separator className="my-6" />
              <div className="donasi-total rounded-2xl text-white p-6 text-center">
                <p className="text-sm text-gray-300 mb-1">Total perolehan donasi Putaran ke 3 per hari ini</p>
                <p className="text-4xl font-black mb-4">Rp {rupiah(total)}</p>
                <p className="text-sm text-gray-300">Saldo Kas Sedekah Beras</p>
                <p className="text-2xl font-black">Rp {rupiah(cashBalance)}</p>
              </div>
              <p className="text-center text-sm text-muted-foreground mt-6">
                Jazakumullah Khoiran katsiran. Semoga menjadi jalan wasilah kita semua. Aamiin.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
