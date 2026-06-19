import { Link } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import {
  Flame, ArrowRight, BookOpen, Users, Calendar, MapPin, ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

const programList = [
  {
    icon: BookOpen,
    title: "SOLUNAR",
    subtitle: "Seminar 1 Hari",
    desc: "Seminar 1 hari \"Solusi Lunas Utang Tanpa Riba\" adalah program edukasi dan pemberdayaan yang dirancang untuk membantu masyarakat memahami langkah-langkah praktis dan islami dalam melunasi utang tanpa terjerumus ke dalam praktik riba.",
    tag: "Seminar",
  },
  {
    icon: Calendar,
    title: "CAMP 2 HARI 1 MALAM",
    subtitle: "Program Intensif",
    desc: "Seminar Camp 2 hari 1 malam adalah program lanjutan yang bertujuan memberikan pemahaman mendalam, motivasi, serta solusi aplikatif bagi peserta untuk keluar dari jeratan utang dan membangun kehidupan finansial yang lebih baik.",
    tag: "Camp",
  },
  {
    icon: Users,
    title: "SOLUSIGN",
    subtitle: "Solusi Lunas Utang Signifikan",
    desc: "Program ini bertujuan mencetak individu yang tidak hanya kompeten secara teknis, tetapi juga memiliki integritas dan semangat pengabdian untuk membantu masyarakat menuju kehidupan yang lebih baik.",
    tag: "Program",
  },
  {
    icon: MapPin,
    title: "Masyarakat Memakmurkan Masjid",
    subtitle: "Bakti Sosial",
    desc: "Program ini salah satu bentuk bakti sosial kami yang bertujuan untuk menjaga kebersihan dan kenyamanan masjid sebagai pusat ibadah dan aktivitas umat Islam.",
    tag: "Sosial",
  },
]

export default function ArtikelPage() {
  const { session, profile } = useAuth()

  return (
    <div className="min-h-svh bg-background text-foreground">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Flame className="h-6 w-6 text-fire-orange" />
            <span className="font-black text-sm uppercase tracking-wider">CBR Indonesia</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Home</Link>
            <Link to="/artikel" className="text-sm font-semibold text-foreground">Artikel</Link>
            <Link to="/tentang-kami" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Tentang Kami</Link>
            <Link to="/kontak" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Kontak Kami</Link>
            <div className="h-4 w-px bg-border mx-1" />
            {session ? (
              <Button asChild size="sm" className="bg-fire-red hover:bg-fire-orange text-white border-0">
                <Link to={profile?.role === "admin" ? "/admin" : "/dashboard"}>Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm"><Link to="/login">Masuk</Link></Button>
                <Button asChild size="sm" className="bg-fire-red hover:bg-fire-orange text-white border-0">
                  <Link to="/register">Daftar</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative bg-fire-gradient-subtle py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Badge className="mb-4 bg-fire-orange/20 text-orange-300 border-fire-orange/40">Artikel</Badge>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">
            Bebaskan Diri Anda dari<br />
            <span className="text-fire-gradient">Jeratan Utang dan Riba!</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            CBR Indonesia merupakan organisasi Masyarakat yang berdedikasi untuk membantu masyarakat keluar dari jeratan utang riba dan membangun kehidupan finansial yang sehat, bebas dari praktik yang tidak sesuai dengan prinsip syariah.
          </p>
        </div>
      </section>

      <Separator />

      {/* Program */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Program Kami</Badge>
            <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-4">
              Apa yang <span className="text-fire-gradient">Kami Lakukan</span>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Event Seminar, Pelatihan dan Program
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {programList.map((item, i) => (
              <Card key={i} className="hover:shadow-md transition-shadow border-border/60 flex flex-col">
                <CardContent className="p-6 flex flex-col h-full">
                  <Badge className="mb-3 self-start bg-primary/10 text-primary border-primary/20 text-xs">
                    {item.tag}
                  </Badge>
                  <div className="flex items-start gap-4 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <item.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-black text-foreground text-lg">{item.title}</h3>
                      <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">{item.desc}</p>
                  <div className="mt-4">
                    <Button variant="link" className="p-0 h-auto text-fire-orange font-semibold text-sm">
                      Baca Selengkapnya <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-fire-gradient-subtle text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-4">
            Siap Bebas dari <span className="text-fire-gradient">Riba?</span>
          </h2>
          <p className="text-gray-400 mb-6">
            Bergabunglah dengan ribuan orang yang telah berubah hidupnya bersama CBR Indonesia.
          </p>
          <Button asChild size="lg" className="bg-fire-red hover:bg-fire-orange text-white border-0 font-bold rounded-xl">
            <Link to="/register">Daftar Sekarang <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border bg-background">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Flame className="h-5 w-5 text-fire-orange" />
            <span className="font-black text-sm uppercase tracking-wider">Camp Bebas Riba Indonesia</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © 2026 Camp Bebas Riba Indonesia. Semua hak dilindungi.
          </p>
        </div>
      </footer>
    </div>
  )
}
