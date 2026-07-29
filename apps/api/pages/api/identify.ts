import type { NextApiRequest, NextApiResponse } from "next"
import { requireApiKey } from "@/lib/auth"
import { identifyPlant } from "@/lib/plantnet"

export const config = {
  api: { bodyParser: { sizeLimit: "10mb" } },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireApiKey(req, res)) return
  if (req.method !== "POST") {
    res.status(405).json({ error: "method not allowed" })
    return
  }

  const { imageBase64 } = req.body ?? {}
  if (!imageBase64) {
    res.status(400).json({ error: "imageBase64 is required" })
    return
  }

  try {
    const candidates = await identifyPlant(imageBase64)
    res.status(200).json({ candidates })
  } catch (err) {
    res.status(502).json({ error: (err as Error).message })
  }
}
