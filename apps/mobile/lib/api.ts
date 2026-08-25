const API_URL = process.env.EXPO_PUBLIC_API_URL
const API_KEY = process.env.EXPO_PUBLIC_API_KEY

async function request(path: string, options: RequestInit = {}) {
  // EXPO_PUBLIC_* values are compiled in at build time, so an unset one is not
  // an empty string -- it is the literal "undefined", which then reads as a
  // relative URL. On web that resolves against the app's own origin and the
  // SPA rewrite answers with index.html and a 200, so the failure surfaces as
  // an empty plant list rather than anything resembling an error. Say so.
  if (!API_URL) {
    throw new Error(
      "EXPO_PUBLIC_API_URL is not set. On a deployed build it has to be present at build time -- setting it afterwards needs a redeploy."
    )
  }

  let res: Response
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY ?? "",
        ...options.headers,
      },
    })
  } catch {
    // fetch only rejects below the HTTP layer: no connection, DNS, a blocked
    // CORS preflight, or a platform-level rejection (an oversized body, say)
    // whose response carries no CORS headers and so never reaches us.
    throw new Error(`Couldn't reach the API at ${API_URL}`)
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? `Request failed: ${res.status}`)
  }

  if (res.status === 204) return null

  try {
    return await res.json()
  } catch {
    throw new Error(`Expected JSON from ${path} but got ${res.headers.get("content-type") ?? "no content type"}`)
  }
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
  dueForFeeding?: boolean
}

export interface PlantNetCandidate {
  scientificName: string
  commonNames: string[]
  score: number
}

export type ReadingAction = "none" | "water" | "soak" | "shower" | "feed"

export interface Reading {
  id: number
  plantId: number
  moistureValue: number
  recommendedAction: ReadingAction
  actionTaken: ReadingAction | null
  takenAt: string
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
  ): Promise<{ reading: Reading; reason: string }> =>
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
