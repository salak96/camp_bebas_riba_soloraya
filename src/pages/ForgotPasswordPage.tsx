import { useState } from "react"
import { Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const schema = z.object({ email: z.string().email("Email tidak valid") })
type FormValues = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    setLoading(true)
    try {
      await api("/auth/forgot-password", { method: "POST", body: JSON.stringify(values) })
      toast.success("Jika email terdaftar, link reset password sudah dikirim")
    } catch (error) {
      toast.error("Gagal mengirim link: " + (error instanceof Error ? error.message : "Terjadi kesalahan"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-svh bg-fire-gradient-subtle flex items-center justify-center px-4">
      <Card className="w-full max-w-md border-border/60 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-black text-center">Lupa Password</CardTitle>
          <CardDescription className="text-center">Masukkan email untuk menerima link reset password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="nama@email.com" {...register("email")} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <Button disabled={loading} className="w-full bg-fire-red hover:bg-fire-orange text-white border-0 font-bold">{loading ? "Mengirim..." : "Kirim Link Reset"}</Button>
          </form>
          <div className="mt-4 text-center text-sm"><Link to="/login" className="text-primary font-semibold hover:underline">Kembali login</Link></div>
        </CardContent>
      </Card>
    </div>
  )
}
