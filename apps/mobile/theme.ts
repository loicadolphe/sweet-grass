import { useColorScheme } from "react-native"
import type { ReadingAction } from "@/lib/api"

export const fonts = {
  headingSemiBold: "Sora_600SemiBold",
  headingBold: "Sora_700Bold",
  body: "Karla_400Regular",
  bodyMedium: "Karla_500Medium",
  bodyBold: "Karla_700Bold",
}

export const spacing = {
  screenPadding: 20,
  cardRadius: 14,
  ctaRadius: 16,
  chipRadius: 8,
}

const palette = {
  light: {
    background: "#f7f5ec",
    backgroundAlt: "#fdfcf7",
    card: "#fdfcf7",
    text: "#1a1f15",
    textMuted: "#5a6054",
    border: "#dad8cd",
    primary: "#2f6633",
    onPrimary: "#f4faf4",
    clay: "#b85e31",
    onClay: "#fffaf6",
    inputBackground: "#ffffff",
  },
  dark: {
    background: "#0e130d",
    backgroundAlt: "#1b211a",
    card: "#1b211a",
    text: "#ecebe4",
    textMuted: "#9a998e",
    border: "#333b31",
    primary: "#66ac69",
    onPrimary: "#050b05",
    clay: "#e08256",
    onClay: "#150a06",
    inputBackground: "#222821",
  },
}

export type Theme = typeof palette.light

// Full-bleed result screen backgrounds, keyed by recommended watering action.
// Hue is the only thing that varies between states; text stays warm-white on all of them.
const resultBackground: Record<Exclude<ReadingAction, "feed">, { light: string; dark: string }> = {
  soak: { light: "#642724", dark: "#5e211f" }, // rust
  water: { light: "#5b3200", dark: "#552c00" }, // amber
  none: { light: "#18491c", dark: "#124317" }, // green
  shower: { light: "#00465f", dark: "#004159" }, // blue
}

const resultCopy: Record<Exclude<ReadingAction, "feed">, { tag: string; headline: string }> = {
  soak: { tag: "BOTTOM SOAK", headline: "Soak it." },
  water: { tag: "TOP WATER", headline: "Water it now." },
  none: { tag: "ALL GOOD", headline: "Leave it alone." },
  shower: { tag: "SHOWER TIME", headline: "Give it a shower." },
}

const resultForeground = "#f8f5ee"

export function useTheme() {
  const scheme = useColorScheme()
  const dark = scheme === "dark"
  return { dark, colors: dark ? palette.dark : palette.light }
}

export function resultTheme(action: Exclude<ReadingAction, "feed">, dark: boolean) {
  const bg = resultBackground[action]
  const copy = resultCopy[action]
  return {
    background: dark ? bg.dark : bg.light,
    foreground: resultForeground,
    tag: copy.tag,
    headline: copy.headline,
  }
}
