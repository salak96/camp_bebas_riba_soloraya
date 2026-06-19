import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Flame, Eye, EyeOff, LogIn } from "lucide-react"
import { supabase } from "@/lib/supabase"

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
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(values: FormValues) {
    setLoading(true)
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    })
    setLoading(false)
    if (error) {
      const msg = error.message || (error as any).status?.toString() || JSON.stringify(error) || "Email atau password salah"
      toast.error("Login gagal: " + msg)
      console.error("Login error:", error)
      return
    }
    toast.success("Login berhasil! Selamat datang.")
    // Fetch profile to determine redirect
    const { data: prof } = await supabase.from("profiles").select("role").eq("id", authData.user!.id).maybeSingle()
    navigate(prof?.role === "admin" ? "/admin" : "/dashboard")
  }

  return (
    <div className="min-h-svh bg-fire-gradient-subtle flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-orange-300 hover:text-orange-200 transition-colors mb-4">
            <Flame className="h-8 w-8" />
            <span className="font-black text-xl uppercase tracking-wider">CBR Indonesia</span>
          </Link>
          <p className="text-gray-400 text-sm">CAMP#39 Jabodetabek & Karawang</p>
        </div>

        <Card className="border-border/60 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-black text-center">Masuk</CardTitle>
            <CardDescription className="text-center">
              Masuk ke akun Anda untuk mengakses dashboard peserta
            </CardDescription>
          </CardHeader>
          <CardContent>
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
