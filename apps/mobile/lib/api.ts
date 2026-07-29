const API_URL = process.env.EXPO_PUBLIC_API_URL
const API_KEY = process.env.EXPO_PUBLIC_API_KEY

async function request(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY ?? "",
      ...options.headers,
    },
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? `Request failed: ${res.status}`)
  }

  if (res.status === 204) return null
  return res.json()
}

export interface Plant {
  id: number
  nickname: string
  species: string
  scientificName: string | null
  location: string | null
  wateringMethod: "top" | "bottom" | "shower"
  moistureMin: number
  moistureMax: number
  feedFrequencyDays: number | null
  lastFedAt: string | null
  addedAt: string
}

export interface PlantNetCandidate {
  scientificName: string
  commonNames: string[]
  score: number
}

export const api = {
  listPlants: (): Promise<{ plants: Plant[] }> => request("/api/plants"),

  createPlant: (input: {
    nickname: string
    species: string
    scientificName?: string
    location?: string
    wateringMethod?: "top" | "bottom" | "shower"
    moistureMin?: number
    moistureMax?: number
    feedFrequencyDays?: number
  }): Promise<{ plant: Plant }> =>
    request("/api/plants", { method: "POST", body: JSON.stringify(input) }),

  getPlant: (id: number): Promise<{ plant: Plant; dueForFeeding: boolean }> =>
    request(`/api/plants/${id}`),

  logReading: (
    plantId: number,
    moistureValue: number
  ): Promise<{ reading: unknown; reason: string }> =>
    request(`/api/plants/${plantId}/readings`, {
      method: "POST",
      body: JSON.stringify({ moistureValue }),
    }),

  identify: (imageBase64: string): Promise<{ candidates: PlantNetCandidate[] }> =>
    request("/api/identify", {
      method: "POST",
      body: JSON.stringify({ imageBase64 }),
    }),

  lookupSpecies: (query: string): Promise<{ species: any }> =>
    request(`/api/species/lookup?query=${encodeURIComponent(query)}`),
}
