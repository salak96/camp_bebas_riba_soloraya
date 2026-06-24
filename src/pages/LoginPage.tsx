import { useState, useEffect, useCallback } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Eye, EyeOff, LogIn } from "lucide-react"
import { api, saveToken, type User, type EventData } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

const schema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
})

type FormValues = z.infer<typeof schema>

export default function LoginPage() {
  const navigate = useNavigate()
  const { refreshAuth } = useAuth()
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [event, setEvent] = useState<EventData | null>(null)

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

  const handleGoogleCredential = useCallback(async (response: { credential: string }) => {
    setLoading(true)
    try {
      const data = await api<{ token: string; user: User }>("/auth/google", { method: "POST", body: JSON.stringify({ credential: response.credential }) })
      saveToken(data.token)
      await refreshAuth()
      toast.success("Login Google berhasil")
      navigate(data.user.role === "admin" ? "/admin" : "/dashboard")
    } catch (error) {
      toast.error("Login Google gagal: " + (error instanceof Error ? error.message : "Terjadi kesalahan"))
    } finally {
      setLoading(false)
    }
  }, [navigate, refreshAuth])

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    if (!clientId) return
    const script = document.createElement("script")
    script.src = "https://accounts.google.com/gsi/client"
    script.async = true
    script.onload = () => {
      ;(window as any).google?.accounts.id.initialize({ client_id: clientId, callback: handleGoogleCredential })
      ;(window as any).google?.accounts.id.renderButton(document.getElementById("google-login"), { theme: "outline", size: "large", width: 360, text: "signin_with" })
    }
    document.body.appendChild(script)
    return () => {
      script.remove()
    }
  }, [handleGoogleCredential])

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(values: FormValues) {
    setLoading(true)
    try {
      const data = await api<{ token: string; user: User }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: values.email, password: values.password }),
      })
      saveToken(data.token)
      await refreshAuth()
      toast.success("Login berhasil! Selamat datang.")
      navigate(data.user.role === "admin" ? "/admin" : "/dashboard")
    } catch (error) {
      toast.error("Login gagal: " + (error instanceof Error ? error.message : "Email atau password salah"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-svh bg-black sm:bg-fire-gradient-subtle flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-orange-300 hover:text-orange-200 transition-colors mb-4">
            <img src="/logo.png" alt="CBR Indonesia" className="h-10 w-10 object-contain" />
            <span className="font-black text-xl uppercase tracking-wider">CBR Indonesia</span>
          </Link>
          <p className="text-gray-400 text-sm">{event?.campNumber || "CBR"} {event?.region || "Indonesia"}</p>
        </div>

        <Card className="border-border/60 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-black text-center">Masuk</CardTitle>
            <CardDescription className="text-center">
              Masuk ke akun Anda untuk mengakses dashboard peserta
            </CardDescription>
          </CardHeader>
          <CardContent>
            {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
              <div id="google-login" className="mb-4 flex justify-center" />
            ) : (
              <Button type="button" variant="outline" className="mb-4 w-full font-semibold" onClick={() => toast.error("VITE_GOOGLE_CLIENT_ID belum diisi di .env") }>
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Masuk dengan Google
              </Button>
            )}
            <div className="mb-4 flex items-center gap-3 text-xs text-muted-foreground"><div className="h-px flex-1 bg-border" />atau masuk manual<div className="h-px flex-1 bg-border" /></div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@email.com"
                  autoComplete="email"
                  {...register("email")}
                  aria-invalid={!!errors.email}
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPass ? "text" : "password"}
                    placeholder="Masukkan password"
                    autoComplete="current-password"
                    {...register("password")}
                    aria-invalid={!!errors.password}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
                <div className="text-right">
                  <Link to="/lupa-password" className="text-xs text-primary font-semibold hover:underline">Lupa password?</Link>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-fire-red hover:bg-fire-orange text-white border-0 font-bold"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Memproses...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    Masuk
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm text-muted-foreground">
              Belum punya akun?{" "}
              <Link to="/register" className="text-primary font-semibold hover:underline">
                Daftar di sini
              </Link>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-600 mt-4">
          <Link to="/" className="hover:text-gray-400 transition-colors">← Kembali ke halaman utama</Link>
        </p>
      </div>
    </div>
  )
}
