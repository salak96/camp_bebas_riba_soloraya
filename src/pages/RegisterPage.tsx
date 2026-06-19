import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Flame, Eye, EyeOff, UserPlus } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

const schema = z.object({
  full_name: z.string().min(3, "Nama minimal 3 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
  confirm_password: z.string(),
}).refine((d) => d.password === d.confirm_password, {
  message: "Password tidak cocok",
  path: ["confirm_password"],
})

type FormValues = z.infer<typeof schema>

export default function RegisterPage() {
  const navigate = useNavigate()
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(values: FormValues) {
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: { full_name: values.full_name, role: "peserta" },
      },
    })
    setLoading(false)
    if (error) {
      const msg = error.message || error.status?.toString() || JSON.stringify(error) || "Terjadi kesalahan"
      toast.error("Registrasi gagal: " + msg)
      console.error("Signup error:", error)
      return
    }
    toast.success("Akun berhasil dibuat! Silakan masuk.")
    navigate("/dashboard")
  }

  return (
    <div className="min-h-svh bg-fire-gradient-subtle flex items-center justify-center px-4 py-8">
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
            <CardTitle className="text-2xl font-black text-center">Buat Akun</CardTitle>
            <CardDescription className="text-center">
              Daftarkan akun Anda untuk mendaftar event
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="full_name">Nama Lengkap</Label>
                <Input
                  id="full_name"
                  placeholder="Masukkan nama lengkap Anda"
                  autoComplete="name"
                  {...register("full_name")}
                  aria-invalid={!!errors.full_name}
                />
                {errors.full_name && <p className="text-xs text-destructive">{errors.full_name.message}</p>}
              </div>

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
                    placeholder="Minimal 8 karakter"
                    autoComplete="new-password"
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

              <div className="space-y-1.5">
                <Label htmlFor="confirm_password">Konfirmasi Password</Label>
                <div className="relative">
                  <Input
                    id="confirm_password"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Ulangi password"
                    autoComplete="new-password"
                    {...register("confirm_password")}
                    aria-invalid={!!errors.confirm_password}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirm_password && <p className="text-xs text-destructive">{errors.confirm_password.message}</p>}
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
                    <UserPlus className="h-4 w-4" />
                    Buat Akun
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm text-muted-foreground">
              Sudah punya akun?{" "}
              <Link to="/login" className="text-primary font-semibold hover:underline">
                Masuk di sini
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
