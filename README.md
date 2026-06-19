# Camp Bebas Riba Indonesia - Website

Website organisasi masyarakat yang didedikasikan untuk membantu masyarakat keluar dari jeratan utang dan riba serta membangun kehidupan finansial yang sehat sesuai prinsip syariah.

## 🚀 Teknologi yang Digunakan

- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Bahasa**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Backend/Database**: [Supabase](https://supabase.com/)
- **Routing**: [React Router DOM v7](https://reactrouter.com/)
- **UI Components**: Shadcn UI / Radix UI
- **Icons**: Lucide React

## 🛠️ Panduan Instalasi

### 1. Prasyarat
Pastikan Anda sudah menginstal:
- [Node.js](https://nodejs.org/) (versi terbaru LTS direkomendasikan)
- [npm](https://www.npmjs.com/)

### 2. Kloning Repositori
```bash
git clone <repository-url>
cd campbebasriba
```

### 3. Instalasi Dependensi
```bash
npm install
```

### 4. Konfigurasi Environment
Buat file `.env` di root direktori dan tambahkan kredensial Supabase Anda:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Menjalankan Project
Untuk menjalankan mode development:
```bash
npm run dev
```
Akses website di: `http://localhost:5173`

## 📦 Perintah Lainnya

- **Type Check**: `npm run typecheck` (untuk memverifikasi tipe data TypeScript)
- **Build**: `npm run build` (untuk memproduksi build versi produksi)
- **Preview**: `npm run preview` (untuk melihat hasil build produksi secara lokal)

## 📁 Struktur Folder Utama

- `src/pages/`: Berisi halaman utama aplikasi (Landing, Dashboard, Login, Register, dll)
- `src/components/`: Komponen UI yang dapat digunakan kembali
- `src/contexts/`: State management global (AuthContext)
- `src/lib/`: Konfigurasi library eksternal (Supabase client, utils)
- `supabase/`: Migrasi database dan fungsi server-side (Edge Functions)

## 📝 Catatan Penting
Pastikan tabel `registrations` dan `profiles` sudah terkonfigurasi di database Supabase sesuai dengan migrasi yang ada di folder `supabase/migrations/`.
