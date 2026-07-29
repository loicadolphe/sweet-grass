import type { NextApiRequest, NextApiResponse } from "next"
import { requireApiKey } from "@/lib/auth"
import { lookupSpecies } from "@/lib/perenual"
import { db } from "@/lib/db"
import { speciesCache } from "../../../drizzle/schema"
import { eq } from "drizzle-orm"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireApiKey(req, res)) return
  if (req.method !== "GET") {
    res.status(405).json({ error: "method not allowed" })
    return
  }

  const query = String(req.query.query ?? "").trim()
  if (!query) {
    res.status(400).json({ error: "query is required" })
    return
  }

  const [cached] = await db
    .select()
    .from(speciesCache)
    .where(eq(speciesCache.query, query.toLowerCase()))
    .limit(1)

  if (cached) {
    res.status(200).json({ species: cached, fromCache: true })
    return
  }

  try {
    const info = await lookupSpecies(query)
    if (!info) {
      res.status(404).json({ error: "species not found" })
      return
    }

    const [inserted] = await db
      .insert(speciesCache)
      .values({
        query: query.toLowerCase(),
        commonName: info.commonName,
        scientificName: info.scientificName,
        wateringMethod: info.wateringMethod ?? "top",
        feedFrequencyDays: info.feedFrequencyDays,
        sunlightNeeds: info.sunlight?.join(", ") ?? null,
        raw: info,
      })
      .returning()

    res.status(200).json({ species: inserted, fromCache: false })
  } catch (err) {
    res.status(502).json({ error: (err as Error).message })
  }
}
