import type { Plant, Reading } from "./types"
import type { ReadingAction } from "../drizzle/schema"

const GROWING_SEASON_MONTHS = [2, 3, 4, 5, 6, 7, 8] // Mar-Sep, 0-indexed

function isGrowingSeason(date: Date): boolean {
  return GROWING_SEASON_MONTHS.includes(date.getMonth())
}

export function recommendAction(
  plant: Plant,
  moistureValue: number,
  now: Date = new Date()
): { action: ReadingAction; reason: string } {
  if (moistureValue < plant.moistureMin) {
    if (plant.wateringMethod === "shower") {
      return {
        action: "shower",
        reason: `${plant.nickname} is bone dry — put it in the bathtub and give it a shower to soak the roots and rinse the leaves.`,
      }
    }
    if (plant.wateringMethod === "bottom") {
      return {
        action: "soak",
        reason: `${plant.nickname} is dry — sit it in a tray of water for 10-15 minutes so it can soak up from the bottom.`,
      }
    }
    return {
      action: "water",
      reason: `${plant.nickname} is dry — water it from the top until it drains.`,
    }
  }

  if (moistureValue > plant.moistureMax) {
    return {
      action: "none",
      reason: `${plant.nickname} is still wet — hold off on watering.`,
    }
  }

  return {
    action: "none",
    reason: `${plant.nickname} is in range — no action needed.`,
  }
}

export function isDueForFeeding(
  plant: Plant,
  now: Date = new Date()
): boolean {
  if (!isGrowingSeason(now)) return false
  if (!plant.feedFrequencyDays) return false
  if (!plant.lastFedAt) return true

  const daysSinceFed =
    (now.getTime() - new Date(plant.lastFedAt).getTime()) / (1000 * 60 * 60 * 24)
  return daysSinceFed >= plant.feedFrequencyDays
}

export type { Reading }
