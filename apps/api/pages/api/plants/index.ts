import type { NextApiRequest, NextApiResponse } from "next"
import { requireApiKey } from "@/lib/auth"
import { db } from "@/lib/db"
import { plants } from "../../../drizzle/schema"
import { desc } from "drizzle-orm"
import { isDueForFeeding } from "@/lib/wateringLogic"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireApiKey(req, res)) return

  if (req.method === "GET") {
    const all = await db.select().from(plants).orderBy(desc(plants.addedAt))
    res.status(200).json({
      plants: all.map((plant) => ({ ...plant, dueForFeeding: isDueForFeeding(plant) })),
    })
    return
  }

  if (req.method === "POST") {
    const {
      nickname,
      species,
      scientificName,
      location,
      wateringMethod,
      moistureMin,
      moistureMax,
      feedFrequencyDays,
    } = req.body ?? {}

    if (!nickname || !species) {
      res.status(400).json({ error: "nickname and species are required" })
      return
    }

    const [created] = await db
      .insert(plants)
      .values({
        nickname,
        species,
        scientificName: scientificName ?? null,
        location: location ?? null,
        wateringMethod: wateringMethod ?? "top",
        moistureMin: moistureMin ?? 3,
        moistureMax: moistureMax ?? 7,
        feedFrequencyDays: feedFrequencyDays ?? 30,
      })
      .returning()

    res.status(201).json({ plant: created })
    return
  }

  res.status(405).json({ error: "method not allowed" })
}
