import type { WateringMethod, ReadingAction } from "../drizzle/schema"

export interface Plant {
  id: number
  nickname: string
  species: string
  scientificName: string | null
  location: string | null
  wateringMethod: WateringMethod
  moistureMin: number
  moistureMax: number
  feedFrequencyDays: number | null
  lastFedAt: Date | string | null
  addedAt: Date | string
}

export interface Reading {
  id: number
  plantId: number
  moistureValue: number
  recommendedAction: ReadingAction
  actionTaken: ReadingAction | null
  takenAt: Date | string
}
