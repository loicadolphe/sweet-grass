import { useEffect, useState } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { api, Plant, ReadingAction } from "@/lib/api"
import { notify } from "@/lib/alert"
import { fonts, resultTheme, useTheme } from "@/theme"
import { Screen } from "@/components/Screen"
import { ScreenHeader } from "@/components/ScreenHeader"
import { PrimaryButton } from "@/components/PrimaryButton"

const MIN_MOISTURE = 1
const MAX_MOISTURE = 10

export function LogReadingScreen({ route, navigation }: any) {
  const { plantId } = route.params
  const { colors, dark } = useTheme()
  const [plant, setPlant] = useState<Plant | null>(null)
  const [moisture, setMoisture] = useState(5)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ action: ReadingAction; reason: string } | null>(null)

  useEffect(() => {
    let active = true
    api.getPlant(plantId).then((data) => {
      if (active) setPlant(data.plant)
    })
    return () => {
      active = false
    }
  }, [plantId])

  async function submit() {
    setSubmitting(true)
    try {
      const { reading, reason } = await api.logReading(plantId, moisture)
      setResult({ action: reading.recommendedAction, reason })
    } catch (err) {
      notify("Couldn't log reading", (err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  if (result) {
    const action = result.action === "feed" ? "none" : result.action
    const theme = resultTheme(action, dark)

    return (
      <Screen backgroundColor={theme.background}>
        <View style={styles.resultContent}>
          <Text style={[styles.resultTag, { color: theme.foreground }]}>{theme.tag}</Text>
          <Text
            style={[styles.resultHeadline, { color: theme.foreground, fontFamily: fonts.headingBold }]}
          >
            {theme.headline}
          </Text>
          <Text style={[styles.resultBody, { color: theme.foreground }]}>{result.reason}</Text>
          <Pressable
            onPress={() => navigation.goBack()}
            style={[styles.doneButton, { backgroundColor: theme.foreground }]}
          >
            <Text
              style={[styles.doneLabel, { color: theme.background, fontFamily: fonts.headingSemiBold }]}
            >
              Done
            </Text>
          </Pressable>
        </View>
      </Screen>
    )
  }

  return (
    <Screen>
      <ScreenHeader title="Moisture reading" onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        <Text style={[styles.helper, { color: colors.textMuted }]}>
          Enter the reading from {plant?.nickname ?? "your plant"}&rsquo;s moisture meter
        </Text>

        <View style={styles.stepperRow}>
          <Pressable
            onPress={() => setMoisture((m) => Math.max(MIN_MOISTURE, m - 1))}
            style={[styles.stepperButton, { borderColor: colors.border }]}
          >
            <Text style={[styles.stepperGlyph, { color: colors.text }]}>−</Text>
          </Pressable>
          <Text style={[styles.moistureValue, { color: colors.text, fontFamily: fonts.headingBold }]}>
            {moisture}
          </Text>
          <Pressable
            onPress={() => setMoisture((m) => Math.min(MAX_MOISTURE, m + 1))}
            style={[styles.stepperButton, { borderColor: colors.border }]}
          >
            <Text style={[styles.stepperGlyph, { color: colors.text }]}>+</Text>
          </Pressable>
        </View>

        <View style={styles.ticks}>
          {Array.from({ length: MAX_MOISTURE }, (_, i) => (
            <View
              key={i}
              style={[
                styles.tick,
                { backgroundColor: i < moisture ? colors.primary : colors.border },
              ]}
            />
          ))}
        </View>
        <View style={styles.tickLabels}>
          <Text style={[styles.tickLabel, { color: colors.textMuted }]}>DRY</Text>
          <Text style={[styles.tickLabel, { color: colors.textMuted }]}>SOAKED</Text>
        </View>

        <PrimaryButton
          label="Get recommendation"
          onPress={submit}
          loading={submitting}
          style={styles.cta}
        />
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    gap: 28,
  },
  helper: { fontSize: 14, textAlign: "center", maxWidth: 260, lineHeight: 21 },
  stepperRow: { flexDirection: "row", alignItems: "center", gap: 24 },
  stepperButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperGlyph: { fontSize: 22 },
  moistureValue: { fontSize: 56, width: 80, textAlign: "center" },
  ticks: { flexDirection: "row", gap: 6, width: "100%" },
  tick: { flex: 1, height: 32, borderRadius: 6 },
  tickLabels: { flexDirection: "row", justifyContent: "space-between", width: "100%" },
  tickLabel: { fontSize: 11 },
  cta: { width: "100%" },
  resultContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingVertical: 36,
    gap: 18,
  },
  resultTag: { fontSize: 12, fontWeight: "700", letterSpacing: 1.2, opacity: 0.85 },
  resultHeadline: { fontSize: 38, lineHeight: 42, textAlign: "center" },
  resultBody: { fontSize: 15, lineHeight: 24, textAlign: "center", maxWidth: 280, opacity: 0.92 },
  doneButton: { marginTop: 20, paddingHorizontal: 32, paddingVertical: 16, borderRadius: 16 },
  doneLabel: { fontSize: 16 },
})
