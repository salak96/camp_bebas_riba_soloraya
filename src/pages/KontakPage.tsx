import { Link } from "react-router-dom"
import {
  Mail, MapPin, ArrowRight, Send, MessageCircle, ExternalLink
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import SiteNavbar from "@/components/SiteNavbar"

export default function KontakPage() {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <SiteNavbar />

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
                  <a href="https://wa.me/628111013677" target="_blank" rel="noopener noreferrer">
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
                      Jl. Prof. M Yamin VII No.08, RT.006/RW.004<br />
                      Karangpucung, Kec. Purwokerto Selatan<br />
                      Kabupaten Banyumas, Jawa Tengah 53144
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 max-w-xl mx-auto">
            <Card className="border-border/60">
              <CardContent className="p-6 text-center">
                <h3 className="font-bold text-foreground mb-2">Sosial Media</h3>
                <p className="text-sm text-muted-foreground mb-5">Ikuti update kegiatan Camp Bebas Riba Indonesia</p>
                <div className="grid sm:grid-cols-3 gap-3">
                  <Button asChild variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
                    <a href="https://www.facebook.com/groups/495111958710478/" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" /> Facebook
                    </a>
                  </Button>
                  <Button asChild variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
                    <a href="https://www.tiktok.com/@camp.bebas.riba/" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" /> TikTok
                    </a>
                  </Button>
                  <Button asChild variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
                    <a href="https://www.youtube.com/@campbebasribasoloraya/videos" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" /> YouTube
                    </a>
                  </Button>
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

    </div>
  )
}
