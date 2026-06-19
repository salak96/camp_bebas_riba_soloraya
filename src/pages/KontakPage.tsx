import { Link } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import {
  Flame, Phone, Mail, MapPin, Clock, ArrowRight, Send, MessageCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function KontakPage() {
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
            <Link to="/artikel" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Artikel</Link>
            <Link to="/tentang-kami" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Tentang Kami</Link>
            <Link to="/kontak" className="text-sm font-semibold text-foreground">Kontak Kami</Link>
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
          <Badge className="mb-4 bg-fire-orange/20 text-orange-300 border-fire-orange/40">Hubungi Kami</Badge>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">
            Kontak <span className="text-fire-gradient">Kami</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Punya pertanyaan atau ingin berkonsultasi? Jangan ragu untuk menghubungi kami.
          </p>
        </div>
      </section>

      <Separator />

      {/* Kontak Cards */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Card className="border-border/60 hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-7 w-7 text-green-600" />
                </div>
                <h3 className="font-bold text-foreground mb-1">WhatsApp</h3>
                <p className="text-sm text-muted-foreground mb-4">Hubungi kami via WhatsApp untuk info lebih lanjut</p>
                <Button
                  asChild
                  variant="outline"
                  className="border-green-500/50 text-green-600 hover:bg-green-500/10"
                >
                  <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer">
                    <Send className="mr-2 h-4 w-4" />
                    Chat WhatsApp
                  </a>
                </Button>
              </CardContent>
            </Card>
            <Card className="border-border/60 hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-1">Email</h3>
                <p className="text-sm text-muted-foreground mb-4">Kirim pertanyaan via email</p>
                <Button
                  asChild
                  variant="outline"
                  className="border-primary/50 text-primary hover:bg-primary/10"
                >
                  <a href="mailto:info@campbebasriba.id">
                    <Mail className="mr-2 h-4 w-4" />
                    Kirim Email
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 max-w-xl mx-auto">
            <Card className="border-border/60">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground mb-1">Alamat</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Camp Bebas Riba Indonesia<br />
                      Jl. Ir. H. Juanda No.70<br />
                      Bekasi Timur, Kota Bekasi<br />
                      Jawa Barat 17113
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
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
            Jangan tunda lagi. Hubungi kami sekarang dan ambil langkah pertama menuju kehidupan finansial yang lebih baik.
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
