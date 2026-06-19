import { Link } from "react-router-dom"
import { MessageCircle, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-black py-10 text-white">
      <div className="max-w-6xl mx-auto px-4 grid gap-8 sm:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <img src="/logo.png" alt="CBR Indonesia" className="h-8 w-8 object-contain" />
            <span className="font-black text-sm uppercase tracking-wider">CBR Indonesia</span>
          </div>
          <p className="text-sm text-gray-400">Camp Bebas Riba Indonesia.</p>
        </div>
        <div>
          <h3 className="font-bold text-white mb-3">Tentang Kami</h3>
          <Link to="/tentang-kami" className="text-sm text-gray-400 hover:text-white">Profil Organisasi</Link>
        </div>
        <div>
          <h3 className="font-bold text-white mb-3">Hubungi Kami</h3>
          <div className="space-y-2">
            <a href="https://www.facebook.com/groups/495111958710478/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white">
              <ExternalLink className="h-4 w-4" /> Facebook
            </a>
            <a href="https://www.tiktok.com/@camp.bebas.riba/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white">
              <ExternalLink className="h-4 w-4" /> TikTok
            </a>
            <a href="https://www.youtube.com/@campbebasribasoloraya/videos" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white">
              <ExternalLink className="h-4 w-4" /> YouTube
            </a>
          </div>
        </div>
        <div>
          <h3 className="font-bold text-white mb-3">Dukung Kami</h3>
          <Link to="/donasi" className="text-sm text-gray-400 hover:text-white">Donasi</Link>
          <div className="mt-4">
            <p className="text-xs text-gray-400 mb-2">Pembuat Website: Lambang</p>
            <Button asChild variant="outline" size="sm" className="border-white/20 bg-transparent text-white hover:bg-white hover:text-black">
              <a href="https://wa.me/6285642268279" target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4 mr-2" /> 085642268279
              </a>
            </Button>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 mt-8 pt-6 border-t border-white/10 text-center">
        <p className="text-xs text-gray-400">© 2026 Camp Bebas Riba Indonesia. Semua hak dilindungi.</p>
      </div>
    </footer>
  )
}
