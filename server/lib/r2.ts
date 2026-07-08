import dotenv from "dotenv"
dotenv.config()

import { S3Client } from "@aws-sdk/client-s3"
import { Upload } from "@aws-sdk/lib-storage"
import { NodeHttpHandler } from "@smithy/node-http-handler"
import { Agent } from "node:https"
import type { Readable } from "node:stream"

const httpsAgent = new Agent({
  rejectUnauthorized: false,
  keepAlive: true,
  minVersion: "TLSv1.2",
})

const r2Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
  requestHandler: new NodeHttpHandler({ httpsAgent, requestTimeout: 30_000 }),
  forcePathStyle: true,
})

const bucket = process.env.R2_BUCKET || "cbr-images"
const publicUrl = process.env.R2_PUBLIC_URL

export async function uploadToR2(key: string, body: Buffer | Readable | string, contentType: string) {
  const upload = new Upload({
    client: r2Client,
    params: { Bucket: bucket, Key: key, Body: body, ContentType: contentType },
  })
  await upload.done()
  const url = publicUrl ? `${publicUrl.replace(/\/$/, "")}/${key}` : key
  return { key, url }
}

export async function deleteFromR2(key: string) {
  await r2Client.send(new (await import("@aws-sdk/client-s3")).DeleteObjectCommand({
    Bucket: bucket,
    Key: key,
  }))
}
