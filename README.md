# Camp Bebas Riba Indonesia

Website + backend admin panel sederhana untuk pendaftaran CAMP CBR, artikel, pembayaran, export CSV, dan dashboard peserta.

## Stack

- Frontend: React + Vite + TypeScript + Tailwind CSS
- Backend: Express + TypeScript
- Database: MySQL
- ORM/Migration: Prisma
- Upload: Multer, file lokal `server/uploads/`

## Prasyarat

- Node.js LTS
- npm
- MySQL aktif

## Instalasi

```bash
npm install
```

Copy env:

```bash
cp .env.example .env
```

Isi `.env`:

```env
DATABASE_URL="mysql://root:password@localhost:3306/campbebasriba"
JWT_SECRET="ganti_dengan_secret_panjang"
PORT=4000
VITE_API_URL="http://localhost:4000/api"
```

Buat database MySQL:

```sql
CREATE DATABASE campbebasriba CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Generate Prisma Client:

```bash
npm run prisma:generate
```

Jalankan migration:

```bash
npm run prisma:migrate
```

Jalankan backend API:

```bash
npm run dev:api
```

Jalankan frontend:

```bash
npm run dev
```

Frontend: `http://localhost:5173`  
API: `http://localhost:4000/api`

## Script

```bash
npm run dev              # frontend
npm run dev:api          # backend API
npm run build            # build frontend
npm run typecheck        # typecheck frontend
npm run prisma:generate  # generate Prisma client
npm run prisma:migrate   # jalankan migration MySQL
npm run prisma:studio    # buka Prisma Studio
```

## Database

Migration ada di:

```text
prisma/schema.prisma
prisma/migrations/20260619000000_init_mysql/migration.sql
```

Tabel:

- `users`
- `events`
- `registrations`
- `articles`

Status pembayaran disimpan di `registrations.payment_status` dan bukti bayar di `registrations.proof_file`.

## API Admin

Admin harus login memakai akun dengan `role = admin`.

Endpoint utama:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/admin/stats`
- `GET /api/admin/registrations?q=&status=`
- `PATCH /api/admin/registrations/:id/status`
- `GET /api/admin/registrations/export.csv`
- `POST /api/admin/articles`
- `PUT /api/admin/articles/:id`
- `DELETE /api/admin/articles/:id`

## Validasi Backend

- Email user unik
- WhatsApp wajib saat daftar peserta
- Upload bukti bayar hanya JPG, PNG, PDF
- Maksimal file 2MB
- Satu user hanya bisa daftar satu kali per event (`unique userId + eventId`)

## Membuat Admin

Cara cepat via Prisma Studio:

```bash
npm run prisma:studio
```

Buat user biasa lewat register, lalu ubah kolom `role` menjadi `admin` di tabel `users`.
