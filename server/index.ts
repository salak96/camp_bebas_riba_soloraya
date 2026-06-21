import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import multer from "multer"
import path from "node:path"
import fs from "node:fs"
import crypto from "node:crypto"
import { fileURLToPath } from "node:url"
import nodemailer from "nodemailer"
import { OAuth2Client } from "google-auth-library"
import { PrismaClient, PaymentStatus, UserRole } from "@prisma/client"

dotenv.config()

const prisma = new PrismaClient()
const app = express()
const port = Number(process.env.PORT || 4000)
const jwtSecret = process.env.JWT_SECRET || "dev-secret-change-me"
const appUrl = process.env.APP_URL || "http://localhost:5173"
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const uploadDir = path.join(__dirname, "uploads")

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

app.use(cors({ origin: true, credentials: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use("/uploads", express.static(uploadDir))

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, "")}`),
  }),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = ["image/jpeg", "image/png", "application/pdf"].includes(file.mimetype)
    cb(ok ? null : new Error("Format file harus JPG, PNG, atau PDF"), ok)
  },
})

type JwtPayload = { id: number; email: string; role: UserRole }

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

function tokenFor(user: { id: number; email: string; role: UserRole }) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, jwtSecret, { expiresIn: "7d" })
}

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex")
}

async function sendResetEmail(email: string, link: string) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`Reset password link for ${email}: ${link}`)
    return
  }
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    tls: { rejectUnauthorized: process.env.SMTP_TLS_REJECT_UNAUTHORIZED === "true" },
  })
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: "Reset Password CBR Indonesia",
    text: `Klik link berikut untuk reset password: ${link}\n\nLink berlaku 1 jam.`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111">
        <h2>Reset Password CBR Indonesia</h2>
        <p>Klik tombol di bawah untuk membuat password baru.</p>
        <p><a href="${link}" style="display:inline-block;background:#dc2626;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:bold">Reset Password</a></p>
        <p>Jika tombol tidak bisa diklik, salin URL ini ke browser:</p>
        <p style="word-break:break-all"><a href="${link}">${link}</a></p>
        <p>Link berlaku 1 jam.</p>
      </div>
    `,
  })
}

function auth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const header = req.headers.authorization
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null
  if (!token) return res.status(401).json({ message: "Unauthorized" })
  try {
    req.user = jwt.verify(token, jwtSecret) as JwtPayload
    next()
  } catch {
    res.status(401).json({ message: "Token tidak valid" })
  }
}

function admin(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (req.user?.role !== "admin") return res.status(403).json({ message: "Forbidden" })
  next()
}

async function activeEvent() {
  let event = await prisma.event.findFirst({ where: { isActive: true }, orderBy: { id: "desc" } })
  if (!event) {
    event = await prisma.event.create({
      data: {
        name: "CAMP BEBAS RIBA INDONESIA",
        theme: "Lepaskan Beban Hidup dari Jerat Hutang",
        campNumber: "CAMP#39",
        startDate: new Date("2026-07-25T00:00:00.000Z"),
        endDate: new Date("2026-07-26T00:00:00.000Z"),
        startTime: "08.00 WIB",
        venue: "Asrama Haji Bekasi",
        address: "Jl. Ir. H. Juanda No.70, Bekasi Timur, Kota Bekasi, Jawa Barat 17113",
        price: 500000,
        quota: 150,
      },
    })
  }
  return event
}

async function registrationNumber() {
  const count = await prisma.registration.count()
  return `CBR39-${String(count + 1).padStart(4, "0")}`
}

app.get("/api/health", (_req, res) => res.json({ ok: true }))

app.post("/api/auth/register", async (req, res) => {
  const fullName = req.body.fullName || req.body.full_name || req.body.name || req.body.nama
  const { email, password } = req.body
  if (!fullName || !email || !password) return res.status(422).json({ message: "Nama, email, password wajib" })
  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists) return res.status(409).json({ message: "Email sudah terdaftar" })
  const passwordHash = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({ data: { fullName, email, passwordHash } })
  res.json({ token: tokenFor(user), user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role } })
})

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ message: "Email atau password salah" })
  res.json({ token: tokenFor(user), user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role } })
})

app.post("/api/auth/google", async (req, res) => {
  const { credential } = req.body
  if (!process.env.GOOGLE_CLIENT_ID) return res.status(500).json({ message: "GOOGLE_CLIENT_ID belum diset" })
  const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: process.env.GOOGLE_CLIENT_ID })
  const payload = ticket.getPayload()
  if (!payload?.email) return res.status(401).json({ message: "Login Google gagal" })
  const existing = await prisma.user.findUnique({ where: { email: payload.email } })
  const user = existing
    ? await prisma.user.update({ where: { id: existing.id }, data: { googleId: payload.sub, fullName: existing.fullName || payload.name || null } })
    : await prisma.user.create({ data: { email: payload.email, fullName: payload.name || null, googleId: payload.sub, passwordHash: await bcrypt.hash(crypto.randomUUID(), 10) } })
  res.json({ token: tokenFor(user), user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role } })
})

app.post("/api/auth/forgot-password", async (req, res) => {
  const { email } = req.body
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user && process.env.NODE_ENV !== "production") return res.status(404).json({ message: "Email belum terdaftar" })
  if (user) {
    const token = crypto.randomBytes(32).toString("hex")
    const link = `${appUrl}/reset-password?token=${token}`
    await prisma.user.update({ where: { id: user.id }, data: { resetTokenHash: hashToken(token), resetTokenExpiresAt: new Date(Date.now() + 60 * 60 * 1000) } })
    await sendResetEmail(email, link)
    console.log(`Reset password email sent to ${email}: ${link}`)
  }
  res.json({ ok: true })
})

app.post("/api/auth/reset-password", async (req, res) => {
  const { token, password } = req.body
  if (!token || !password || password.length < 8) return res.status(422).json({ message: "Token dan password minimal 8 karakter wajib" })
  const user = await prisma.user.findFirst({ where: { resetTokenHash: hashToken(token), resetTokenExpiresAt: { gt: new Date() } } })
  if (!user) return res.status(400).json({ message: "Link reset tidak valid atau kedaluwarsa" })
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(password, 10), resetTokenHash: null, resetTokenExpiresAt: null } })
  res.json({ ok: true })
})

app.get("/api/auth/me", auth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id }, select: { id: true, email: true, fullName: true, role: true } })
  res.json({ user })
})

app.get("/api/events/active", async (_req, res) => res.json({ event: await activeEvent() }))

app.get("/api/my/registration", auth, async (req, res) => {
  const event = await activeEvent()
  const registration = await prisma.registration.findUnique({ where: { userId_eventId: { userId: req.user!.id, eventId: event.id } } })
  res.json({ registration })
})

app.post("/api/registrations", auth, async (req, res) => {
  const event = await activeEvent()
  const exists = await prisma.registration.findUnique({ where: { userId_eventId: { userId: req.user!.id, eventId: event.id } } })
  if (exists) return res.status(409).json({ message: "Anda sudah mendaftar untuk event ini" })
  const { fullName, email, whatsapp, gender, age, city, shirtSize, hijabSize, fullAddress, notes } = req.body
  if (!fullName || !email || !whatsapp || !gender || !age || !city || !fullAddress) return res.status(422).json({ message: "Data wajib belum lengkap" })
  const registration = await prisma.registration.create({
    data: {
      registrationNumber: await registrationNumber(),
      userId: req.user!.id,
      eventId: event.id,
      fullName,
      email,
      whatsapp,
      gender,
      age: Number(age),
      city,
      shirtSize: gender === "ikhwan" ? shirtSize || null : null,
      hijabSize: gender === "akhwat" ? hijabSize || null : null,
      fullAddress,
      notes: notes || null,
    },
  })
  res.json({ registration })
})

app.post("/api/my/registration/proof", auth, upload.single("proof"), async (req, res) => {
  const event = await activeEvent()
  const registration = await prisma.registration.findUnique({ where: { userId_eventId: { userId: req.user!.id, eventId: event.id } } })
  if (!registration) return res.status(404).json({ message: "Pendaftaran tidak ditemukan" })
  if (!req.file) return res.status(422).json({ message: "File wajib diupload" })
  const updated = await prisma.registration.update({
    where: { id: registration.id },
    data: { proofFile: req.file.filename, paymentStatus: "menunggu_konfirmasi" },
  })
  res.json({ registration: updated })
})

app.get("/api/admin/stats", auth, admin, async (_req, res) => {
  const event = await activeEvent()
  const [total, lunas, menunggu, belum] = await Promise.all([
    prisma.registration.count({ where: { eventId: event.id } }),
    prisma.registration.count({ where: { eventId: event.id, paymentStatus: "lunas" } }),
    prisma.registration.count({ where: { eventId: event.id, paymentStatus: "menunggu_konfirmasi" } }),
    prisma.registration.count({ where: { eventId: event.id, paymentStatus: "belum_bayar" } }),
  ])
  res.json({ total, lunas, menunggu, belum, sisa: Math.max(event.quota - total, 0), quota: event.quota })
})

app.get("/api/admin/registrations", auth, admin, async (req, res) => {
  const event = await activeEvent()
  const q = String(req.query.q || "")
  const status = String(req.query.status || "") as PaymentStatus | ""
  const where: any = { eventId: event.id }
  if (q) where.OR = ["fullName", "email", "whatsapp", "city"].map((field) => ({ [field]: { contains: q } }))
  if (status) where.paymentStatus = status
  const registrations = await prisma.registration.findMany({ where, orderBy: { createdAt: "desc" } })
  res.json({ registrations })
})

app.patch("/api/admin/registrations/:id/status", auth, admin, async (req, res) => {
  const paymentStatus = req.body.paymentStatus as PaymentStatus
  if (!["belum_bayar", "menunggu_konfirmasi", "lunas"].includes(paymentStatus)) return res.status(422).json({ message: "Status tidak valid" })
  const registration = await prisma.registration.update({ where: { id: Number(req.params.id) }, data: { paymentStatus } })
  res.json({ registration })
})

app.put("/api/admin/registrations/:id", auth, admin, async (req, res) => {
  const { fullName, email, whatsapp, gender, age, city, shirtSize, hijabSize, fullAddress, notes, paymentStatus } = req.body
  const registration = await prisma.registration.update({
    where: { id: Number(req.params.id) },
    data: {
      fullName,
      email,
      whatsapp,
      gender,
      age: Number(age),
      city,
      shirtSize: gender === "ikhwan" ? shirtSize || null : null,
      hijabSize: gender === "akhwat" ? hijabSize || null : null,
      fullAddress,
      notes: notes || null,
      paymentStatus,
    },
  })
  res.json({ registration })
})

app.delete("/api/admin/registrations/:id", auth, admin, async (req, res) => {
  await prisma.registration.delete({ where: { id: Number(req.params.id) } })
  res.json({ ok: true })
})

app.get("/api/admin/events/active", auth, admin, async (_req, res) => {
  const event = await activeEvent()
  res.json({ event })
})

app.patch("/api/admin/events/active", auth, admin, async (req, res) => {
  const event = await activeEvent()
  const { name, theme, campNumber, region, startDate, endDate, startTime, venue, address, price, quota } = req.body
  const updated = await prisma.event.update({
    where: { id: event.id },
    data: {
      name: name || event.name,
      theme: theme ?? event.theme,
      campNumber: campNumber ?? event.campNumber,
      region: region ?? event.region,
      startDate: startDate ? new Date(startDate) : event.startDate,
      endDate: endDate ? new Date(endDate) : event.endDate,
      startTime: startTime ?? event.startTime,
      venue: venue ?? event.venue,
      address: address ?? event.address,
      price: Number(price) || event.price,
      quota: Number(quota) || event.quota,
    },
  })
  res.json({ event: updated })
})

app.get("/api/admin/registrations/export.csv", auth, admin, async (req, res) => {
  const event = await activeEvent()
  const registrations = await prisma.registration.findMany({ where: { eventId: event.id }, orderBy: { createdAt: "desc" } })
  const headers = ["No", "No Pendaftaran", "Nama", "Email", "WhatsApp", "Gender", "Usia", "Kota", "Status", "Tanggal Daftar"]
  const rows = registrations.map((r, i) => [i + 1, r.registrationNumber, r.fullName, r.email, r.whatsapp, r.gender, r.age, r.city, r.paymentStatus, r.createdAt.toISOString()])
  const csv = [headers, ...rows].map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n")
  res.header("Content-Type", "text/csv")
  res.attachment("registrations.csv")
  res.send(csv)
})

app.get("/api/donations", async (_req, res) => {
  const donations = await prisma.$queryRawUnsafe<any[]>("SELECT id, name, amount, method, round, is_paid AS isPaid, created_at AS createdAt, updated_at AS updatedAt FROM donations WHERE round = 3 ORDER BY id ASC")
  const total = donations.reduce((sum, item) => sum + Number(item.amount || 0), 0)
  res.json({ donations, total, cashBalance: 818000, round: 3 })
})

app.get("/api/admin/donations", auth, admin, async (_req, res) => {
  const donations = await prisma.$queryRawUnsafe<any[]>("SELECT id, name, amount, method, round, is_paid AS isPaid, created_at AS createdAt, updated_at AS updatedAt FROM donations ORDER BY id ASC")
  res.json({ donations })
})

app.post("/api/admin/donations", auth, admin, async (req, res) => {
  const { name, amount, method = "transfer", round = 3, isPaid = true } = req.body
  await prisma.$executeRawUnsafe("INSERT INTO donations (name, amount, method, round, is_paid) VALUES (?, ?, ?, ?, ?)", name, Number(amount), method, Number(round), Boolean(isPaid))
  res.json({ ok: true })
})

app.put("/api/admin/donations/:id", auth, admin, async (req, res) => {
  const { name, amount, method = "transfer", round = 3, isPaid = true } = req.body
  await prisma.$executeRawUnsafe("UPDATE donations SET name = ?, amount = ?, method = ?, round = ?, is_paid = ? WHERE id = ?", name, Number(amount), method, Number(round), Boolean(isPaid), Number(req.params.id))
  res.json({ ok: true })
})

app.delete("/api/admin/donations/:id", auth, admin, async (req, res) => {
  await prisma.$executeRawUnsafe("DELETE FROM donations WHERE id = ?", Number(req.params.id))
  res.json({ ok: true })
})

app.get("/api/articles", async (_req, res) => {
  const articles = await prisma.article.findMany({ where: { isPublished: true }, orderBy: { createdAt: "desc" } })
  res.json({ articles })
})

app.post("/api/admin/uploads/image", auth, admin, upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(422).json({ message: "File gambar wajib diupload" })
  if (!["image/jpeg", "image/png"].includes(req.file.mimetype)) return res.status(422).json({ message: "Format gambar harus JPG atau PNG" })
  const baseUrl = `${req.protocol}://${req.get("host")}`
  res.json({ url: `${baseUrl}/uploads/${req.file.filename}` })
})

app.get("/api/admin/articles", auth, admin, async (_req, res) => {
  const articles = await prisma.article.findMany({ orderBy: { createdAt: "desc" } })
  res.json({ articles })
})

app.post("/api/admin/articles", auth, admin, async (req, res) => {
  const { title, slug, excerpt, content, imageUrl, images, tiktokUrl, isPublished } = req.body
  let finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
  const existing = await prisma.article.findUnique({ where: { slug: finalSlug } })
  if (existing) finalSlug = `${finalSlug}-${Date.now()}`
  const article = await prisma.article.create({ data: { title, slug: finalSlug, excerpt, content, imageUrl, images: images || null, tiktokUrl: tiktokUrl || null, isPublished: !!isPublished, authorId: req.user!.id } })
  res.json({ article })
})

app.put("/api/admin/articles/:id", auth, admin, async (req, res) => {
  const { title, slug, excerpt, content, imageUrl, images, tiktokUrl, isPublished } = req.body
  let finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
  const existing = await prisma.article.findFirst({ where: { slug: finalSlug, NOT: { id: Number(req.params.id) } } })
  if (existing) finalSlug = `${finalSlug}-${Date.now()}`
  const article = await prisma.article.update({ where: { id: Number(req.params.id) }, data: { title, slug: finalSlug, excerpt, content, imageUrl, images: images || null, tiktokUrl: tiktokUrl || null, isPublished: !!isPublished } })
  res.json({ article })
})

app.delete("/api/admin/articles/:id", auth, admin, async (req, res) => {
  await prisma.article.delete({ where: { id: Number(req.params.id) } })
  res.json({ ok: true })
})

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err)
  res.status(500).json({ message: "Terjadi kesalahan server. Silakan coba lagi nanti." })
})

app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`)
})
