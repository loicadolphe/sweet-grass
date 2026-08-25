import { useEffect, useRef, useState } from "react"
import {
  Animated,
  Easing,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native"
import * as ImagePicker from "expo-image-picker"
import { api, PlantNetCandidate } from "@/lib/api"
import { notify } from "@/lib/alert"
import { preparePhotoForIdentify } from "@/lib/preparePhoto"
import { fonts, spacing, useTheme } from "@/theme"
import { Screen } from "@/components/Screen"
import { ScreenHeader } from "@/components/ScreenHeader"
import { PhotoPlaceholder } from "@/components/PhotoPlaceholder"
import { PrimaryButton } from "@/components/PrimaryButton"

const LOCATION_PRESETS = ["Living room windowsill", "Bedroom", "Kitchen", "Office", "Bathroom"]

type Step = "capture" | "identifying" | "picker" | "details"

export function AddPlantScreen({ navigation }: any) {
  const { colors } = useTheme()
  const [step, setStep] = useState<Step>("capture")
  const [photoUri, setPhotoUri] = useState<string | null>(null)
  const [candidates, setCandidates] = useState<PlantNetCandidate[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [nickname, setNickname] = useState("")
  const [location, setLocation] = useState("")
  const [saving, setSaving] = useState(false)

  async function takePhoto() {
    // On web there is nothing to grant up front: launchCameraAsync renders a
    // file input and the browser prompts for the camera itself when tapped.
    if (Platform.OS !== "web") {
      const permission = await ImagePicker.requestCameraPermissionsAsync()
      if (!permission.granted) {
        notify("Camera permission needed to identify plants.")
        return
      }
    }

    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 })
    if (result.canceled || !result.assets[0]) return

    const asset = result.assets[0]

    setPhotoUri(asset.uri)
    setStep("identifying")

    try {
      const base64 = await preparePhotoForIdentify(asset.uri)
      if (!base64) {
        notify("Couldn't read that photo", "Try taking it again.")
        setStep("capture")
        return
      }

      const { candidates } = await api.identify(base64)
      if (candidates.length === 0) {
        notify("No matches found", "Try another photo with the whole plant in frame.")
        setStep("capture")
        return
      }
      setCandidates(candidates)
      setSelectedIndex(0)
      setStep("picker")
    } catch (err) {
      notify("Identification failed", (err as Error).message)
      setStep("capture")
    }
  }

  async function submitDetails() {
    if (!nickname.trim()) {
      notify("Give your plant a nickname first.")
      return
    }

    const selected = candidates[selectedIndex]
    setSaving(true)
    try {
      let speciesInfo
      try {
        const { species } = await api.lookupSpecies(selected.scientificName)
        speciesInfo = species
      } catch {
        speciesInfo = null
      }

      const { plant } = await api.createPlant({
        nickname: nickname.trim(),
        species: selected.commonNames[0] ?? selected.scientificName,
        scientificName: selected.scientificName,
        location: location.trim() || undefined,
        wateringMethod: speciesInfo?.wateringMethod ?? "top",
        feedFrequencyDays: speciesInfo?.feedFrequencyDays ?? 30,
      })
      navigation.replace("PlantDetail", { plantId: plant.id })
    } catch (err) {
      notify("Couldn't save plant", (err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  if (step === "identifying") {
    return (
      <Screen>
        <View style={styles.identifyingContent}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.identifyingPhoto} />
          ) : (
            <PhotoPlaceholder width={120} radius={20} />
          )}
          <PulsingDots color={colors.primary} />
          <Text style={[styles.identifyingTitle, { color: colors.text, fontFamily: fonts.headingSemiBold }]}>
            Identifying your plant…
          </Text>
          <Text style={[styles.identifyingSubtitle, { color: colors.textMuted }]}>
            Comparing against 40,000+ species
          </Text>
        </View>
      </Screen>
    )
  }

  if (step === "picker") {
    return (
      <Screen>
        <View style={styles.pickerHeader}>
          <Text style={[styles.pickerTitle, { color: colors.text, fontFamily: fonts.headingBold }]}>
            Which one is this?
          </Text>
          <Text style={[styles.pickerSubtitle, { color: colors.textMuted }]}>
            Ranked by confidence, tap to pick
          </Text>
        </View>
        <ScrollView contentContainerStyle={styles.pickerList}>
          {candidates.map((c, i) => {
            const selected = i === selectedIndex
            const pct = Math.round(c.score * 100)
            const name = c.commonNames[0] ?? c.scientificName
            return (
              <Pressable
                key={c.scientificName}
                onPress={() => setSelectedIndex(i)}
                style={[
                  styles.candidateRow,
                  {
                    backgroundColor: selected ? colors.backgroundAlt : colors.card,
                    borderColor: selected ? colors.primary : colors.border,
                    borderWidth: selected ? 2 : 1,
                  },
                ]}
              >
                <View
                  style={[
                    styles.rankBadge,
                    { backgroundColor: selected ? colors.primary : colors.backgroundAlt },
                  ]}
                >
                  <Text
                    style={[
                      styles.rankLabel,
                      { color: selected ? colors.onPrimary : colors.textMuted, fontFamily: fonts.headingBold },
                    ]}
                  >
                    {i + 1}
                  </Text>
                </View>
                <View style={styles.candidateText}>
                  <View style={styles.candidateNameRow}>
                    <Text
                      style={[styles.candidateName, { color: colors.text, fontFamily: fonts.headingSemiBold }]}
                    >
                      {name}
                    </Text>
                    {i === 0 && (
                      <View style={[styles.bestMatchChip, { backgroundColor: colors.primary }]}>
                        <Text style={[styles.bestMatchLabel, { color: colors.onPrimary }]}>BEST MATCH</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.candidateLatin, { color: colors.textMuted }]}>
                    {c.scientificName}
                  </Text>
                  <View style={[styles.confidenceTrack, { backgroundColor: colors.border }]}>
                    <View
                      style={[
                        styles.confidenceFill,
                        { width: `${pct}%`, backgroundColor: selected ? colors.primary : colors.textMuted },
                      ]}
                    />
                  </View>
                </View>
                <Text style={[styles.candidatePct, { color: colors.textMuted, fontFamily: fonts.headingBold }]}>
                  {pct}%
                </Text>
              </Pressable>
            )
          })}
        </ScrollView>
        <View style={styles.stickyFooter}>
          <PrimaryButton label="Confirm" onPress={() => setStep("details")} />
        </View>
      </Screen>
    )
  }

  if (step === "details") {
    const selectedName = candidates[selectedIndex]?.commonNames[0] ?? candidates[selectedIndex]?.scientificName

    return (
      <Screen>
        <ScreenHeader title="Name your plant" onBack={() => setStep("picker")} />
        <ScrollView contentContainerStyle={styles.detailsContent}>
          <Pressable
            onPress={() => setStep("picker")}
            style={[styles.speciesPill, { backgroundColor: colors.backgroundAlt, borderColor: colors.border }]}
          >
            <Text style={{ color: colors.textMuted, fontSize: 13 }}>
              You picked: <Text style={{ color: colors.text, fontFamily: fonts.bodyBold }}>{selectedName}</Text>
              {" · change"}
            </Text>
          </Pressable>

          <View>
            <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Nickname</Text>
            <TextInput
              value={nickname}
              onChangeText={setNickname}
              placeholder="e.g. Phoebe"
              placeholderTextColor={colors.textMuted}
              style={[
                styles.input,
                { borderColor: colors.border, backgroundColor: colors.inputBackground, color: colors.text },
              ]}
            />
          </View>

          <View>
            <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Location</Text>
            <TextInput
              value={location}
              onChangeText={setLocation}
              placeholder="e.g. Living room windowsill"
              placeholderTextColor={colors.textMuted}
              style={[
                styles.input,
                styles.locationInput,
                { borderColor: colors.border, backgroundColor: colors.inputBackground, color: colors.text },
              ]}
            />
            <View style={styles.chipRow}>
              {LOCATION_PRESETS.map((loc) => (
                <Pressable
                  key={loc}
                  onPress={() => setLocation(loc)}
                  style={[styles.chip, { backgroundColor: colors.backgroundAlt, borderColor: colors.border }]}
                >
                  <Text style={{ color: colors.text, fontSize: 12 }}>{loc}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </ScrollView>
        <View style={styles.stickyFooter}>
          <PrimaryButton label="Add plant" onPress={submitDetails} loading={saving} />
        </View>
      </Screen>
    )
  }

  return (
    <Screen>
      <ScreenHeader title="Add a plant" onBack={() => navigation.goBack()} />
      <View style={styles.captureContent}>
        <PhotoPlaceholder width={260} radius={24} fontSize={88} />
        <Text style={[styles.captureHelper, { color: colors.textMuted }]}>
          Get the whole plant in frame, good light helps us get it right.
        </Text>
        <Pressable
          onPress={takePhoto}
          style={[styles.shutter, { backgroundColor: colors.primary, borderColor: colors.backgroundAlt }]}
        />
      </View>
    </Screen>
  )
}

function PulsingDots({ color }: { color: string }) {
  const values = useRef([0, 1, 2].map(() => new Animated.Value(0))).current

  useEffect(() => {
    const animations = values.map((value, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 150),
          Animated.timing(value, { toValue: 1, duration: 500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(value, { toValue: 0, duration: 500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      )
    )
    animations.forEach((a) => a.start())
    return () => animations.forEach((a) => a.stop())
  }, [values])

  return (
    <View style={styles.dotsRow}>
      {values.map((value, i) => (
        <Animated.View
          key={i}
          style={[
            styles.dot,
            {
              backgroundColor: color,
              opacity: value.interpolate({ inputRange: [0, 1], outputRange: [0.25, 1] }),
              transform: [{ scale: value.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }],
            },
          ]}
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  captureContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    gap: 22,
  },
  captureHelper: { fontSize: 13, textAlign: "center", maxWidth: 250, lineHeight: 20 },
  shutter: { width: 76, height: 76, borderRadius: 38, borderWidth: 6 },
  identifyingContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
  },
  identifyingPhoto: { width: 120, height: 120, borderRadius: 20 },
  dotsRow: { flexDirection: "row", gap: 8 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  identifyingTitle: { fontSize: 17 },
  identifyingSubtitle: { fontSize: 13 },
  pickerHeader: { paddingHorizontal: spacing.screenPadding, paddingTop: 4, paddingBottom: 4 },
  pickerTitle: { fontSize: 20 },
  pickerSubtitle: { fontSize: 13, marginTop: 4 },
  pickerList: { paddingHorizontal: spacing.screenPadding, paddingTop: 12, paddingBottom: 100 },
  candidateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
  },
  rankBadge: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  rankLabel: { fontSize: 14 },
  candidateText: { flex: 1, minWidth: 0 },
  candidateNameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  candidateName: { fontSize: 15 },
  candidateLatin: { fontSize: 12, fontStyle: "italic", marginTop: 1 },
  bestMatchChip: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 7 },
  bestMatchLabel: { fontSize: 10, fontFamily: fonts.bodyBold, letterSpacing: 0.3 },
  confidenceTrack: { height: 6, borderRadius: 3, marginTop: 8, overflow: "hidden" },
  confidenceFill: { height: 6, borderRadius: 3 },
  candidatePct: { fontSize: 14, width: 38, textAlign: "right" },
  stickyFooter: { paddingHorizontal: spacing.screenPadding, paddingTop: 14, paddingBottom: 22 },
  detailsContent: { paddingHorizontal: spacing.screenPadding, paddingTop: 16, paddingBottom: 24, gap: 20 },
  speciesPill: {
    flexDirection: "row",
    alignSelf: "flex-start",
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  fieldLabel: { fontSize: 13, fontFamily: fonts.bodyMedium, marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 16, fontFamily: fonts.body },
  locationInput: { marginBottom: 10 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7 },
})
