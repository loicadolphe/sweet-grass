import type { NextApiRequest, NextApiResponse } from "next"

export function requireApiKey(req: NextApiRequest, res: NextApiResponse): boolean {
  const key = req.headers["x-api-key"]
  if (!process.env.API_SECRET || key !== process.env.API_SECRET) {
    res.status(401).json({ error: "unauthorized" })
    return false
  }
  return true
}
