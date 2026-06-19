import { useState } from "react"
import { Link } from "react-router-dom"
import { Menu, X } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"

type Active = "home" | "artikel" | "donasi" | "tentang"

export default function SiteNavbar({ active }: { active?: Active }) {
  const { session, profile } = useAuth()
  const [open, setOpen] = useState(false)
  const links = [
    { to: "/", label: "Home", key: "home" as const },
    { to: "/artikel", label: "Artikel", key: "artikel" as const },
    { to: "/donasi", label: "Donasi", key: "donasi" as const },
    { to: "/tentang-kami", label: "Tentang", key: "tentang" as const },
  ]

  return (
    <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/95 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="CBR Indonesia" className="h-8 w-8 object-contain" />
            <span className="font-black text-sm uppercase tracking-wider">CBR Indonesia</span>
          </Link>

        <button className="md:hidden p-2 rounded-lg hover:bg-muted" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <div className="hidden md:flex items-center gap-4">
          {links.map(link => (
            <Link key={link.to} to={link.to} className={`text-sm transition-colors ${active === link.key ? "font-semibold text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              {link.label}
            </Link>
          ))}
          <div className="h-4 w-px bg-border mx-1" />
          {session ? (
            <Button asChild size="sm" className="bg-fire-red hover:bg-fire-orange text-white border-0">
              <Link to={profile?.role === "admin" ? "/admin" : "/dashboard"}>Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm"><Link to="/login">Masuk</Link></Button>
              <Button asChild size="sm" className="bg-fire-red hover:bg-fire-orange text-white border-0"><Link to="/register">Daftar</Link></Button>
            </>
          )}
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background px-4 py-4 space-y-2">
          {links.map(link => (
            <Link key={link.to} to={link.to} onClick={() => setOpen(false)} className={`block rounded-lg px-3 py-2 text-sm ${active === link.key ? "bg-muted font-semibold text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
              {link.label}
            </Link>
          ))}
          <div className="pt-2 flex gap-2">
            {session ? (
              <Button asChild size="sm" className="w-full bg-fire-red hover:bg-fire-orange text-white border-0">
                <Link to={profile?.role === "admin" ? "/admin" : "/dashboard"}>Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="outline" size="sm" className="w-full"><Link to="/login">Masuk</Link></Button>
                <Button asChild size="sm" className="w-full bg-fire-red hover:bg-fire-orange text-white border-0"><Link to="/register">Daftar</Link></Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
