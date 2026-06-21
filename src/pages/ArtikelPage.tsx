import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import SiteNavbar from "@/components/SiteNavbar"
import { api } from "@/lib/api"
import {
  Flame, ArrowRight, BookOpen, Users, Calendar, MapPin, ChevronRight, Play
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

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
  createdAt: string
}

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
  const [articles, setArticles] = useState<Article[]>([])

  useEffect(() => {
    async function load() {
      try {
        const articleData = await api<{ articles: Article[] }>("/articles")
        setArticles(articleData.articles)
      } catch {
        // ignore
      }
    }
    load()
  }, [])

  return (
    <div className="min-h-svh bg-background text-foreground">
      <SiteNavbar active="artikel" />

      {/* Hero */}
      <section className="article-hero py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Badge className="article-badge mb-4">Artikel</Badge>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">
            Bebaskan Diri Anda dari<br />
            <span className="text-fire-gradient">Jeratan Utang dan Riba!</span>
          </h1>
          <p className="article-hero-text text-lg max-w-2xl mx-auto leading-relaxed">
            CBR Indonesia merupakan organisasi Masyarakat yang berdedikasi untuk membantu masyarakat keluar dari jeratan utang riba dan membangun kehidupan finansial yang sehat.
          </p>
        </div>
      </section>

      <Separator />

      {/* Artikel dari Admin */}
      {articles.length > 0 && (
        <section className="py-20">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Artikel Terbaru</Badge>
              <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-4">
                Baca <span className="text-fire-gradient">Artikel Kami</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {articles.map(a => (
                <Link key={a.id} to={`/lengkap/${a.slug}`} className="block">
                  <Card className="border-border/60 hover:shadow-lg transition-shadow cursor-pointer h-full overflow-hidden">
                    {a.imageUrl && (
                      <div className="aspect-video overflow-hidden bg-muted">
                        <img src={a.imageUrl} alt={a.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    {!a.imageUrl && (
                      <div className="aspect-video bg-fire-gradient-subtle flex items-center justify-center">
                        <Flame className="h-12 w-12 text-fire-orange" />
                      </div>
                    )}
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 mb-2">
                        {a.tiktokUrl && <Badge className="bg-black text-white border-0 text-xs"><Play className="h-3 w-3 mr-1" /> TikTok</Badge>}
                        <Badge variant="outline" className="text-xs">{new Date(a.createdAt).toLocaleDateString("id-ID")}</Badge>
                      </div>
                      <h3 className="font-bold text-lg text-foreground mb-2 line-clamp-2">{a.title}</h3>
                      {a.excerpt && <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{a.excerpt}</p>}
                      <span className="inline-flex items-center text-fire-orange font-semibold text-sm">
                        Baca Selengkapnya <ChevronRight className="ml-1 h-4 w-4" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

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
      <section className="article-cta py-16 text-white text-center">
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

    </div>
  )
}
