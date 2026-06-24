import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { Toaster } from "@/components/ui/sonner"
import SiteFooter from "@/components/SiteFooter"

import LandingPage from "@/pages/LandingPage"
import ArtikelPage from "@/pages/ArtikelPage"
import ArticleDetailPage from "@/pages/ArticleDetailPage"
import TentangKamiPage from "@/pages/TentangKamiPage"
import KontakPage from "@/pages/KontakPage"
import DonasiPage from "@/pages/DonasiPage"
import LoginPage from "@/pages/LoginPage"
import RegisterPage from "@/pages/RegisterPage"
import ForgotPasswordPage from "@/pages/ForgotPasswordPage"
import ResetPasswordPage from "@/pages/ResetPasswordPage"
import DashboardPage from "@/pages/DashboardPage"
import RegistrationFormPage from "@/pages/RegistrationFormPage"
import AdminPage from "@/pages/AdminPage"
import AdminEditRegistrationPage from "@/pages/AdminEditRegistrationPage"
import AdminRegistrationProofPage from "@/pages/AdminRegistrationProofPage"
import AdminEditUserPage from "@/pages/AdminEditUserPage"

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth()
  if (loading) return <div className="flex min-h-svh items-center justify-center bg-background"><div className="text-muted-foreground">Memuat...</div></div>
  if (!session) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { session, profile, loading } = useAuth()
  if (loading) return <div className="flex min-h-svh items-center justify-center bg-background"><div className="text-muted-foreground">Memuat...</div></div>
  if (!session) return <Navigate to="/login" replace />
  if (profile && profile.role !== "admin") return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const { session, profile, loading } = useAuth()
  if (loading) return <div className="flex min-h-svh items-center justify-center bg-background"><div className="text-muted-foreground">Memuat...</div></div>
  if (session && profile) {
    return <Navigate to={profile.role === "admin" ? "/admin" : "/dashboard"} replace />
  }
  return <>{children}</>
}

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/artikel" element={<ArtikelPage />} />
        <Route path="/lengkap/:slug" element={<ArticleDetailPage />} />
        <Route path="/tentang-kami" element={<TentangKamiPage />} />
        <Route path="/kontak" element={<KontakPage />} />
        <Route path="/donasi" element={<DonasiPage />} />
        <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
        <Route path="/lupa-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
        <Route path="/reset-password" element={<GuestRoute><ResetPasswordPage /></GuestRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/daftar" element={<ProtectedRoute><RegistrationFormPage /></ProtectedRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
        <Route path="/admin/edit/:id" element={<AdminRoute><AdminEditRegistrationPage /></AdminRoute>} />
        <Route path="/admin/bukti/:id" element={<AdminRoute><AdminRegistrationProofPage /></AdminRoute>} />
        <Route path="/admin/user/edit/:id" element={<AdminRoute><AdminEditUserPage /></AdminRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <SiteFooter />
      <Toaster richColors position="top-right" />
    </>
  )
}
