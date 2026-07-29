const PLANTNET_API_URL = "https://my-api.plantnet.org/v2/identify/all"

export interface PlantNetCandidate {
  scientificName: string
  commonNames: string[]
  score: number
}

export async function identifyPlant(imageBase64: string): Promise<PlantNetCandidate[]> {
  if (!process.env.PLANTNET_API_KEY) {
    throw new Error("PLANTNET_API_KEY is not set")
  }

  const imageBuffer = Buffer.from(imageBase64, "base64")
  const form = new FormData()
  form.append("images", new Blob([imageBuffer]), "plant.jpg")
  form.append("organs", "leaf")

  const url = `${PLANTNET_API_URL}?api-key=${process.env.PLANTNET_API_KEY}`
  const response = await fetch(url, { method: "POST", body: form })

  if (!response.ok) {
    throw new Error(`PlantNet request failed: ${response.status}`)
  }

  const data = await response.json()

  return (data.results ?? []).slice(0, 5).map((result: any) => ({
    scientificName: result.species?.scientificNameWithoutAuthor ?? "Unknown",
    commonNames: result.species?.commonNames ?? [],
    score: result.score ?? 0,
  }))
}
