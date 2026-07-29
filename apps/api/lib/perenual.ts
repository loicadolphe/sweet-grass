const PERENUAL_API_URL = "https://perenual.com/api"

export interface SpeciesCareInfo {
  commonName: string | null
  scientificName: string | null
  sunlight: string[] | null
  wateringMethod: "top" | "bottom" | "shower" | null
  feedFrequencyDays: number | null
}

// Perenual's "watering" field is a rough frequency label, not a method.
// We infer a reasonable default watering method from indoor/cycle hints
// until we have better per-species data.
function inferWateringMethod(watering: string | undefined): "top" | "bottom" | "shower" {
  if (!watering) return "top"
  const lower = watering.toLowerCase()
  if (lower.includes("minimum") || lower.includes("succulent")) return "top"
  return "top"
}

function inferFeedFrequency(watering: string | undefined): number {
  if (!watering) return 30
  const lower = watering.toLowerCase()
  if (lower.includes("minimum")) return 75 // succulent/cactus-like: every ~2-3 months
  return 21 // tropical-ish default: every 2-4 weeks
}

export async function lookupSpecies(query: string): Promise<SpeciesCareInfo | null> {
  if (!process.env.PERENUAL_API_KEY) {
    throw new Error("PERENUAL_API_KEY is not set")
  }

  const searchUrl = `${PERENUAL_API_URL}/species-list?key=${process.env.PERENUAL_API_KEY}&q=${encodeURIComponent(query)}`
  const searchRes = await fetch(searchUrl)
  if (!searchRes.ok) {
    throw new Error(`Perenual search failed: ${searchRes.status}`)
  }
  const searchData = await searchRes.json()
  const match = searchData.data?.[0]
  if (!match) return null

  return {
    commonName: match.common_name ?? null,
    scientificName: match.scientific_name?.[0] ?? null,
    sunlight: match.sunlight ?? null,
    wateringMethod: inferWateringMethod(match.watering),
    feedFrequencyDays: inferFeedFrequency(match.watering),
  }
}
