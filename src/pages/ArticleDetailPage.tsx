import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { ArrowLeft, Play } from "lucide-react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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

function parseImages(images: string | null): string[] {
  if (!images) return []
  return images.split("\n").map(s => s.trim()).filter(Boolean)
}

function TikTokEmbed({ url }: { url: string }) {
  const videoId = url.match(/\/video\/(\d+)/)?.[1]
  if (!videoId) return null
  return (
    <div className="relative w-full aspect-[9/16] max-h-[600px] rounded-xl overflow-hidden bg-black">
      <iframe
        src={`https://www.tiktok.com/embed/v2/${videoId}`}
        className="absolute inset-0 w-full h-full border-0"
        allowFullScreen
        title="TikTok Video"
      />
    </div>
  )
}

export default function ArticleDetailPage() {
  const { slug } = useParams()
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadArticle() {
      try {
        const data = await api<{ articles: Article[] }>("/articles")
        setArticle(data.articles.find(a => a.slug === slug) ?? null)
      } finally {
        setLoading(false)
      }
    }
    loadArticle()
  }, [slug])

  if (loading) {
    return <div className="min-h-svh flex items-center justify-center text-muted-foreground">Memuat artikel...</div>
  }

  if (!article) {
    return (
      <div className="min-h-svh flex flex-col items-center justify-center gap-4 text-center px-4">
        <p className="text-xl font-bold text-foreground">Artikel tidak ditemukan</p>
        <Button asChild variant="outline"><Link to="/artikel">Kembali ke Artikel</Link></Button>
      </div>
    )
  }

  const gallery = parseImages(article.images)

  return (
    <div className="min-h-svh bg-background text-foreground">
      <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/95 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="CBR Indonesia" className="h-8 w-8 object-contain" />
            <span className="font-black text-sm uppercase tracking-wider">CBR Indonesia</span>
          </Link>
          <Button asChild variant="outline" size="sm">
            <Link to="/artikel"><ArrowLeft className="h-4 w-4 mr-2" /> Kembali</Link>
          </Button>
        </div>
      </nav>

      <article className="max-w-4xl mx-auto px-4 py-10">
        <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Artikel</Badge>
        <h1 className="text-3xl sm:text-5xl font-black text-foreground mb-4 leading-tight">{article.title}</h1>
        <p className="text-sm text-muted-foreground mb-6">
          {new Date(article.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
        </p>
        {article.excerpt && <p className="text-lg text-muted-foreground italic mb-6">{article.excerpt}</p>}
        {article.imageUrl && (
          <img src={article.imageUrl} alt={article.title} className="w-full max-h-[520px] object-cover rounded-2xl border border-border mb-8" />
        )}
        <Separator className="mb-8" />
        <div className="text-base sm:text-lg leading-8 whitespace-pre-wrap text-foreground">
          {article.content}
        </div>

        {gallery.length > 0 && (
          <section className="mt-10">
            <h2 className="text-2xl font-black text-foreground mb-4">Galeri Foto</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {gallery.map((img, i) => (
                <img key={i} src={img} alt={`Foto artikel ${i + 1}`} className="w-full h-64 object-cover rounded-xl border border-border" />
              ))}
            </div>
          </section>
        )}

        {article.tiktokUrl && (
          <section className="mt-10">
            <h2 className="text-2xl font-black text-foreground mb-4 flex items-center gap-2"><Play className="h-6 w-6" /> Video TikTok</h2>
            <TikTokEmbed url={article.tiktokUrl} />
          </section>
        )}
      </article>
    </div>
  )
}
