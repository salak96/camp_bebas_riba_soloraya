import { useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const schema = z.object({ password: z.string().min(8, "Password minimal 8 karakter"), confirmPassword: z.string() }).refine(d => d.password === d.confirmPassword, { message: "Password tidak cocok", path: ["confirmPassword"] })
type FormValues = z.infer<typeof schema>

export default function ResetPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = params.get("token") || ""
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    setLoading(true)
    try {
      await api("/auth/reset-password", { method: "POST", body: JSON.stringify({ token, password: values.password }) })
      toast.success("Password berhasil direset")
      navigate("/login")
    } catch (error) {
      toast.error("Reset gagal: " + (error instanceof Error ? error.message : "Terjadi kesalahan"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-svh bg-fire-gradient-subtle flex items-center justify-center px-4">
      <Card className="w-full max-w-md border-border/60 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-black text-center">Reset Password</CardTitle>
          <CardDescription className="text-center">Buat password baru untuk akun Anda</CardDescription>
        </CardHeader>
        <CardContent>
          {!token ? <p className="text-sm text-destructive text-center">Token reset tidak ditemukan.</p> : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="password">Password Baru</Label>
                <Input id="password" type="password" autoComplete="new-password" {...register("password")} />
                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                <Input id="confirmPassword" type="password" autoComplete="new-password" {...register("confirmPassword")} />
                {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
              </div>
              <Button disabled={loading} className="w-full bg-fire-red hover:bg-fire-orange text-white border-0 font-bold">{loading ? "Menyimpan..." : "Reset Password"}</Button>
            </form>
          )}
          <div className="mt-4 text-center text-sm"><Link to="/login" className="text-primary font-semibold hover:underline">Kembali login</Link></div>
        </CardContent>
      </Card>
    </div>
  )
}
