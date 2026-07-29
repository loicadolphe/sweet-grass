import type { NextApiRequest, NextApiResponse } from "next"
import { requireApiKey } from "@/lib/auth"
import { db } from "@/lib/db"
import { plants } from "../../../drizzle/schema"
import { eq } from "drizzle-orm"
import { isDueForFeeding } from "@/lib/wateringLogic"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireApiKey(req, res)) return

  const id = Number(req.query.id)
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "invalid plant id" })
    return
  }

  if (req.method === "GET") {
    const [plant] = await db.select().from(plants).where(eq(plants.id, id)).limit(1)
    if (!plant) {
      res.status(404).json({ error: "not found" })
      return
    }
    res.status(200).json({ plant, dueForFeeding: isDueForFeeding(plant) })
    return
  }

  if (req.method === "PATCH") {
    const updates = req.body ?? {}
    const [updated] = await db
      .update(plants)
      .set(updates)
      .where(eq(plants.id, id))
      .returning()
    if (!updated) {
      res.status(404).json({ error: "not found" })
      return
    }
    res.status(200).json({ plant: updated })
    return
  }

  if (req.method === "DELETE") {
    await db.delete(plants).where(eq(plants.id, id))
    res.status(204).end()
    return
  }

  res.status(405).json({ error: "method not allowed" })
}
