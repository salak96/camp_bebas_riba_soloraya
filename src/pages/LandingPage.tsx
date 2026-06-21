import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { api, type EventData } from "@/lib/api"
import {
  Flame, MapPin, Calendar, Clock, Users, Phone, Mail,
  CheckCircle2, AlertTriangle, Star, BookOpen, TrendingUp, Shield,
  Heart, Award, Coffee, Bed, Tag, Wifi
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import SiteNavbar from "@/components/SiteNavbar"

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

function formatDateRange(start: string, end: string) {
  const s = new Date(start)
  const e = new Date(end)
  const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"]
  if (s.getMonth() === e.getMonth()) {
    return `${s.getDate()}–${e.getDate()} ${months[s.getMonth()]} ${s.getFullYear()}`
  }
  return `${s.getDate()} ${months[s.getMonth()]} – ${e.getDate()} ${months[e.getMonth()]} ${s.getFullYear()}`
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID").format(amount)
}

function getTimeLeft(eventDate: Date) {
  const diff = Math.max(eventDate.getTime() - Date.now(), 0)
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

function Countdown({ eventDate }: { eventDate: Date }) {
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(eventDate))

  useEffect(() => {
    const id = window.setInterval(() => {
      setTimeLeft(getTimeLeft(eventDate))
    }, 1000)
    return () => window.clearInterval(id)
  }, [eventDate])

  const blocks = [
    { label: "Hari", value: timeLeft.days },
    { label: "Jam", value: timeLeft.hours },
    { label: "Menit", value: timeLeft.minutes },
    { label: "Detik", value: timeLeft.seconds },
  ]

  return (
    <div className="flex gap-3 justify-center flex-wrap">
      {blocks.map(({ label, value }) => (
        <div key={label} className="countdown-card flex flex-col items-center rounded-xl px-4 py-3 min-w-[70px]">
          <span className="text-3xl font-extrabold text-fire-gradient tabular-nums">{String(value).padStart(2, "0")}</span>
          <span className="text-xs text-orange-300 mt-1 uppercase tracking-wider">{label}</span>
        </div>
      ))}
    </div>
  )
}

const masalahList = [
  { icon: AlertTriangle, text: "Dikejar debt collector dan penagih utang setiap hari" },
  { icon: AlertTriangle, text: "Jaminan akan dilelang — rumah, kendaraan, terancam" },
  { icon: AlertTriangle, text: "Dagangan habis, utang masih tetap utuh tak terbayar" },
  { icon: AlertTriangle, text: "Angsuran lebih besar dari pemasukan setiap bulannya" },
  { icon: AlertTriangle, text: "Kerja keras siang malam tapi hutang malah bertambah" },
  { icon: AlertTriangle, text: "Rumah tangga berantakan karena tekanan finansial" },
]

const materiList = [
  { icon: Shield, title: "Pemantapan Iman", desc: "Memperkuat fondasi iman sebagai sumber kekuatan menghadapi segala tekanan" },
  { icon: Heart, title: "Penguatan Mental", desc: "Strategi menghadapi tekanan psikologis dampak jerat riba dan utang" },
  { icon: TrendingUp, title: "Strategi Lunasi Hutang", desc: "Langkah-langkah konkret dan terstruktur untuk menyelesaikan hutang" },
  { icon: Star, title: "Motivasi Bangkit", desc: "Membangkitkan semangat untuk pulih dan bangkit secara ekonomi" },
  { icon: BookOpen, title: "Pengembangan Bisnis", desc: "Membangun usaha halal yang berkah dan berkelanjutan" },
]

const benefitList = [
  { icon: Bed, text: "Penginapan selama 2 hari 1 malam" },
  { icon: Coffee, text: "Makan 4x lengkap selama event" },
  { icon: Coffee, text: "Coffee break 4x sepanjang acara" },
  { icon: Tag, text: "Seminar kit & name tag eksklusif" },
  { icon: BookOpen, text: "Ilmu bermanfaat dari para narasumber ahli" },
  { icon: Award, text: "E-certificate resmi keikutsertaan" },
  { icon: Users, text: "Konsultasi gratis dengan panitia/mentor" },
  { icon: Wifi, text: "Relasi bisnis dengan sesama peserta" },
]

export default function LandingPage() {
  const { session, profile } = useAuth()
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

  const cta = session
    ? profile?.role === "admin" ? "/admin" : "/dashboard"
    : "/register"

  const ctaLabel = session ? "Lihat Dashboard Saya" : "Daftar Sekarang"

  const dateRange = formatDateRange(event.startDate, event.endDate)
  const eventTime = event.startTime || "08.00 WIB – Selesai"
  const venue = event.venue || "Lokasi TBA"
  const priceFormatted = formatCurrency(event.price)

  return (
    <div className="min-h-svh bg-background text-foreground">
      <SiteNavbar active="home" />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="hero-welcome mb-8">
            <p className="hero-welcome-small">Selamat datang Camp Bebas Riba Indonesia</p>
            <h2>Tinggalkan Riba, Lunasi Hutang, Tuntaskan!</h2>
            <p>Membantu masyarakat menuju kehidupan finansial yang bebas, sejahtera, dan berlandaskan nilai-nilai spiritual.</p>
          </div>

          <Badge className="hero-badge mb-6 px-4 py-1.5 text-sm font-semibold">
            <Flame className="h-3.5 w-3.5 mr-1.5" />
            {event.campNumber || "CBR"} {event.region || "Indonesia"}
          </Badge>

          <div className="mb-2">
            <Badge variant="outline" className="hero-quota text-xs uppercase tracking-widest">
              Kuota Terbatas!
            </Badge>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-tight tracking-tight mb-4">
            CAMP BEBAS RIBA<br />
            <span className="text-fire-gradient">INDONESIA</span>
          </h1>

          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="h-px w-12 bg-fire-orange/60" />
            <p className="text-orange-300 text-lg sm:text-xl font-semibold italic px-2">
              "{event.theme || 'Lepaskan Beban Hidup dari Jerat Hutang'}"
            </p>
            <div className="h-px w-12 bg-fire-orange/60" />
          </div>

          {/* Event info cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto mb-8">
             <div className="hero-info-card flex items-center gap-2 rounded-xl px-4 py-3 text-left">
              <Calendar className="h-5 w-5 text-fire-orange shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Tanggal</p>
                <p className="text-sm font-semibold text-white">{dateRange}</p>
              </div>
            </div>
             <div className="hero-info-card flex items-center gap-2 rounded-xl px-4 py-3 text-left">
              <Clock className="h-5 w-5 text-fire-orange shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Waktu</p>
                <p className="text-sm font-semibold text-white">{eventTime}</p>
              </div>
            </div>
             <div className="hero-info-card flex items-center gap-2 rounded-xl px-4 py-3 text-left">
              <MapPin className="h-5 w-5 text-fire-orange shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Lokasi</p>
                <p className="text-sm font-semibold text-white">{venue}</p>
              </div>
            </div>
          </div>

          {/* Price */}
          <div className="mb-8">
            <span className="text-4xl font-black text-white">Rp {priceFormatted}</span>
            <span className="text-gray-400 ml-2 text-sm">/ peserta</span>
          </div>

          {/* Countdown */}
          <div className="mb-8">
            <p className="text-gray-400 text-sm mb-3 uppercase tracking-widest">Menghitung mundur</p>
            <Countdown eventDate={new Date(event.startDate)} />
          </div>

          <Button
            asChild
            size="lg"
            className="hero-button text-white border-0 text-lg font-bold px-10 py-6 rounded-2xl"
          >
            <Link to={cta}>{ctaLabel}</Link>
          </Button>

          <div className="mt-4 text-xs text-gray-500">{dateRange} • {venue}</div>
        </div>

      </section>

      {/* Masalah Peserta */}
      <section className="problem-section mobile-safe py-20 bg-white text-black">
        <div className="max-w-5xl mx-auto px-4">
          <div className="problem-header">
            <div className="problem-badge">Apakah Anda Mengalami Ini?</div>
            <h2>
              Masalah yang Menghantui<br />
              <span>Setiap Hari</span>
            </h2>
            <p>
              Jutaan orang Indonesia terjerat masalah hutang dan riba. Anda tidak sendirian.
            </p>
          </div>
          <div className="problem-grid">
            {masalahList.map((item, i) => (
              <div key={i} className="problem-card">
                <AlertTriangle className="problem-icon" />
                <p>{item.text}</p>
              </div>
            ))}
          </div>
          <div className="problem-footer">
            <p>
              Kalau iya, <span>CAMP BEBAS RIBA</span> adalah solusi untuk Anda!
            </p>
          </div>
        </div>
      </section>

      <Separator />

      {/* Materi Seminar */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Apa yang Akan Dipelajari</Badge>
            <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-4">
              Materi <span className="text-fire-gradient">Seminar Lengkap</span>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Materi yang dirancang khusus untuk membantu Anda keluar dari jerat hutang dan riba.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {materiList.map((item, i) => (
              <Card key={i} className="hover:shadow-md transition-shadow border-border/60">
                <CardContent className="p-6">
                  <div className="mb-4 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefit */}
      <section className="benefit-section">
        <div className="max-w-5xl mx-auto px-4">
          <div className="benefit-header">
            <div className="benefit-badge">Yang Anda Dapatkan</div>
            <h2>Benefit <span>Peserta</span></h2>
            <p>Semua sudah termasuk dalam HTM <strong>Rp {priceFormatted}</strong></p>
          </div>
          <div className="benefit-grid">
            {benefitList.map((item, i) => (
              <div key={i} className="benefit-card">
                <CheckCircle2 className="benefit-icon" />
                <p>{item.text}</p>
              </div>
            ))}
          </div>

          <div className="price-box-wrap">
            <div className="price-box">
              <p className="price-label">Harga Tiket</p>
              <p className="price-value">Rp {priceFormatted}</p>
              <p className="price-desc">Per peserta — termasuk seluruh benefit di atas</p>
              <div className="price-badge">Kuota Terbatas!</div>
              <Button asChild size="lg" className="price-button">
                <Link to={cta}>{ctaLabel}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Lokasi */}
      <section className="py-20 bg-background">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Lokasi Event</Badge>
          <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-6">
            {venue}
          </h2>
          <Card className="border-border/60">
            <CardContent className="p-8">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <MapPin className="h-8 w-8 text-primary" />
                </div>
              </div>
              {event.address?.split(",").map((line, i) => (
                <p key={i} className="text-muted-foreground mb-1">{line.trim()}</p>
              ))}
              <Separator className="mb-4" />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <p className="text-muted-foreground">Tanggal</p>
                  <p className="font-semibold text-foreground">{dateRange}</p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground">Mulai</p>
                  <p className="font-semibold text-foreground">{eventTime}</p>
                </div>
                <div className="text-center sm:col-span-1 col-span-2">
                  <p className="text-muted-foreground">Format</p>
                  <p className="font-semibold text-foreground">
                    {new Date(event.startDate).toLocaleDateString("id-ID", { weekday: "long" })} – {new Date(event.endDate).toLocaleDateString("id-ID", { weekday: "long" })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Kontak */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Hubungi Panitia</Badge>
          <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-6">
            Ada Pertanyaan?
          </h2>
          <div className="grid sm:grid-cols-2 gap-4 max-w-xl mx-auto">
            <Card className="border-border/60 hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Phone className="h-6 w-6 text-green-600" />
                </div>
                <p className="font-semibold text-foreground mb-1">WhatsApp Panitia</p>
                <p className="text-sm text-muted-foreground">Hubungi via WhatsApp untuk info lebih lanjut</p>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="mt-3 border-green-500/50 text-green-600 hover:bg-green-500/10"
                >
                  <a href="https://wa.me/6281393122822" target="_blank" rel="noopener noreferrer">
                    Chat WhatsApp
                  </a>
                </Button>
              </CardContent>
            </Card>
            <Card className="border-border/60 hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <p className="font-semibold text-foreground mb-1">Email Panitia</p>
                <p className="text-sm text-muted-foreground">Kirim pertanyaan via email kami</p>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="mt-3"
                >
                  <a href="mailto:info@campbebasriba.id">Kirim Email</a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="home-final-cta py-20 text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <img src="/logo.png" alt="CBR Indonesia" className="home-final-logo mx-auto mb-4" />
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            Saatnya Bangkit!<br />
            <span className="text-fire-gradient">Jangan Tunggu Besok</span>
          </h2>
          <p className="text-gray-400 mb-8 text-lg">
            Kuota terbatas. Daftar sekarang sebelum kehabisan tempat.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-fire-red hover:bg-fire-orange text-white border-0 text-xl font-bold px-12 py-7 rounded-2xl shadow-xl animate-pulse-fire"
          >
            <Link to={cta}>{ctaLabel}</Link>
          </Button>
          <p className="text-gray-500 text-sm mt-4">{dateRange} • {venue}</p>
        </div>
      </section>

    </div>
  )
}
