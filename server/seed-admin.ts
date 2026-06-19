import dotenv from "dotenv"
import bcrypt from "bcryptjs"
import { PrismaClient } from "@prisma/client"

dotenv.config()

const prisma = new PrismaClient()

async function main() {
  const email = "cbradmin2026@gmail.com"
  const passwordHash = await bcrypt.hash("Admin@CBR2026", 10)

  await prisma.user.upsert({
    where: { email },
    update: {
      fullName: "Admin",
      passwordHash,
      role: "admin",
    },
    create: {
      fullName: "Admin",
      email,
      passwordHash,
      role: "admin",
    },
  })

  const existingEvent = await prisma.event.findUnique({ where: { id: 1 } })
  if (existingEvent) {
    await prisma.event.update({
      where: { id: 1 },
      data: { region: existingEvent.region ?? "Jabodetabek & Karawang" },
    })
  } else {
    await prisma.event.create({
      data: {
        id: 1,
        name: "CAMP BEBAS RIBA INDONESIA",
        theme: "Lepaskan Beban Hidup dari Jerat Hutang",
        campNumber: "CAMP#39",
        region: "Jabodetabek & Karawang",
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

  console.log("Admin siap: cbradmin2026@gmail.com")
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
