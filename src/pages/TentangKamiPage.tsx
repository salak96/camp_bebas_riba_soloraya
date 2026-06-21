import { Link } from "react-router-dom"
import {
  Flame, Heart, Shield, Scale, Users, BookOpen, Target, Eye, Lightbulb,
  Handshake, ArrowRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import SiteNavbar from "@/components/SiteNavbar"

const nilaiList = [
  { icon: Heart, label: "Keikhlasan", desc: "Berkomitmen membantu dengan niat tulus demi kebaikan bersama." },
  { icon: Shield, label: "Integritas", desc: "Menjalankan program dengan transparansi dan kejujuran." },
  { icon: Scale, label: "Keadilan", desc: "Memastikan solusi keuangan yang adil dan memberdayakan masyarakat tanpa diskriminasi." },
  { icon: Users, label: "Empati", desc: "Mendampingi setiap individu dengan penuh perhatian dan penghargaan terhadap tantangan yang mereka hadapi." },
]

const misiList = [
  { icon: BookOpen, label: "Edukasi dan Kesadaran", desc: "Mengedukasi masyarakat tentang bahaya riba dan pentingnya pengelolaan keuangan yang sehat sesuai prinsip syariah." },
  { icon: Users, label: "Bimbingan dan Pendampingan", desc: "Menyediakan pendampingan praktis bagi individu dan keluarga yang terlilit hutang untuk menemukan solusi yang efektif dan berkesinambungan." },
  { icon: Lightbulb, label: "Solusi Keuangan Alternatif", desc: "Mengembangkan dan mempromosikan sistem keuangan berbasis syariah yang adil, transparan, dan bebas riba." },
  { icon: Handshake, label: "Kemitraan Strategis", desc: "Bekerja sama dengan lembaga keuangan, pemerintah, dan komunitas untuk menciptakan ekosistem ekonomi yang bebas dari praktik riba." },
  { icon: TrendingUp, label: "Pemberdayaan Ekonomi", desc: "Mendorong kemandirian finansial melalui pelatihan, akses ke peluang usaha, dan penguatan komunitas dalam menjalankan usaha halal." },
  { icon: Heart, label: "Dukungan Spiritual", desc: "Memotivasi dan memperkuat iman masyarakat dengan pendekatan yang berlandaskan ajaran agama untuk menghadapi tantangan hutang dan riba." },
]

const fokusList = [
  { icon: BookOpen, label: "Pendidikan Keuangan Syariah", desc: "Menyediakan pelatihan dan seminar tentang pengelolaan keuangan pribadi dan bisnis yang sesuai dengan prinsip syariah." },
  { icon: Users, label: "Konsultasi dan Pendampingan", desc: "Memberikan konsultasi keuangan individu dan keluarga untuk menyelesaikan masalah hutang, khususnya yang berbasis riba, dengan solusi yang realistis dan sesuai syariah." },
  { icon: Flame, label: "Komunitas Dukungan", desc: "Membentuk jaringan komunitas untuk saling mendukung, berbagi pengalaman, dan menginspirasi satu sama lain dalam perjalanan menuju bebas riba." },
  { icon: Scale, label: "Advokasi Kebijakan", desc: "Mendorong perubahan kebijakan yang mendukung sistem keuangan yang adil dan bebas riba melalui kolaborasi dengan pemerintah, lembaga keuangan, dan akademisi." },
]

export default function TentangKamiPage() {
  return (
    <div className="about-page min-h-svh bg-background text-foreground">
      <SiteNavbar active="tentang" />

      {/* Hero */}
      <section className="about-hero py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Badge className="about-badge mb-4">Tentang Kami</Badge>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">
            Camp Bebas Riba <span className="text-fire-gradient">Indonesia</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Sebuah organisasi masyarakat yang didedikasikan untuk membantu masyarakat keluar dari jeratan utang dan riba serta membangun kehidupan finansial yang sehat, bebas dari praktik yang tidak sesuai dengan prinsip syariah.
          </p>
        </div>
      </section>

      <Separator />

      {/* Visi */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Visi</Badge>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                <Eye className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h2 className="vision-title">
              Menciptakan generasi yang bebas riba dan memiliki ketahanan finansial, spiritual, dan sosial untuk menciptakan masyarakat yang lebih sejahtera dan harmonis.
            </h2>
          </div>
        </div>
      </section>

      <Separator />

      {/* Misi */}
      <section className="about-light-section py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Misi</Badge>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                <Target className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-4">
              Misi <span className="text-fire-gradient">Kami</span>
            </h2>
          </div>
          <div className="about-grid about-grid-3">
            {misiList.map((item, i) => (
              <Card key={i} className="about-card">
                <CardContent className="p-6">
                  <div className="mb-4 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">{item.label}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Separator />

      {/* Fokus Utama */}
      <section className="about-light-section py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Fokus Kami</Badge>
            <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-4">
              Fokus <span className="text-fire-gradient">Utama</span>
            </h2>
          </div>
          <div className="about-grid about-grid-2">
            {fokusList.map((item, i) => (
              <Card key={i} className="about-card">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <item.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground mb-1">{item.label}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Separator />

      {/* Nilai-Nilai Utama */}
      <section className="values-section">
        <div className="values-container">
          <div className="values-header">
            <div className="values-badge">Nilai Kami</div>
            <h2>Nilai-Nilai <span>Utama</span></h2>
          </div>
          <div className="values-list">
            {nilaiList.map((item, i) => (
              <div key={i} className="value-item">
                <h3>{item.label}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-background text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground mb-4">
            Bergabung Bersama <span className="text-fire-gradient">Kami</span>
          </h2>
          <p className="text-muted-foreground mb-6">
            Mari bersama-sama menciptakan masyarakat yang bebas riba dan sejahtera.
          </p>
          <Button asChild size="lg" className="bg-fire-red hover:bg-fire-orange text-white border-0 font-bold rounded-xl">
            <Link to="/register">Daftar Sekarang <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
        </div>
      </section>

    </div>
  )
}

function TrendingUp(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  )
}
