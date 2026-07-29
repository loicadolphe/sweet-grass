import type { NextApiRequest, NextApiResponse } from "next"
import { requireApiKey } from "@/lib/auth"
import { db } from "@/lib/db"
import { plants, readings } from "../../../../drizzle/schema"
import { eq, desc } from "drizzle-orm"
import { recommendAction } from "@/lib/wateringLogic"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireApiKey(req, res)) return

  const plantId = Number(req.query.id)
  if (!Number.isInteger(plantId)) {
    res.status(400).json({ error: "invalid plant id" })
    return
  }

  if (req.method === "GET") {
    const history = await db
      .select()
      .from(readings)
      .where(eq(readings.plantId, plantId))
      .orderBy(desc(readings.takenAt))
      .limit(50)
    res.status(200).json({ readings: history })
    return
  }

  if (req.method === "POST") {
    const { moistureValue } = req.body ?? {}
    if (typeof moistureValue !== "number") {
      res.status(400).json({ error: "moistureValue (number) is required" })
      return
    }

    const [plant] = await db.select().from(plants).where(eq(plants.id, plantId)).limit(1)
    if (!plant) {
      res.status(404).json({ error: "plant not found" })
      return
    }

    const { action, reason } = recommendAction(plant, moistureValue)

    const [created] = await db
      .insert(readings)
      .values({
        plantId,
        moistureValue,
        recommendedAction: action,
      })
      .returning()

    res.status(201).json({ reading: created, reason })
    return
  }

  res.status(405).json({ error: "method not allowed" })
}
