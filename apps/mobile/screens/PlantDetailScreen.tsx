import { useCallback, useState } from "react"
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native"
import { useFocusEffect } from "@react-navigation/native"
import { api, Plant } from "@/lib/api"
import { fonts, spacing, useTheme } from "@/theme"
import { Screen } from "@/components/Screen"
import { ScreenHeader } from "@/components/ScreenHeader"
import { PhotoPlaceholder } from "@/components/PhotoPlaceholder"
import { PrimaryButton } from "@/components/PrimaryButton"

export function PlantDetailScreen({ route, navigation }: any) {
  const { colors } = useTheme()
  const { plantId } = route.params
  const [plant, setPlant] = useState<Plant | null>(null)
  const [dueForFeeding, setDueForFeeding] = useState(false)
  const [loading, setLoading] = useState(true)

  useFocusEffect(
    useCallback(() => {
      let active = true
      setLoading(true)
      api
        .getPlant(plantId)
        .then((data) => {
          if (active) {
            setPlant(data.plant)
            setDueForFeeding(data.dueForFeeding)
          }
        })
        .finally(() => {
          if (active) setLoading(false)
        })
      return () => {
        active = false
      }
    }, [plantId])
  )

  return (
    <Screen>
      <ScreenHeader onBack={() => navigation.goBack()} />

      {loading || !plant ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <PhotoPlaceholder width="100%" height={220} radius={20} fontSize={72} />
          <Text style={[styles.nickname, { color: colors.text, fontFamily: fonts.headingBold }]}>
            {plant.nickname}
          </Text>
          <Text style={[styles.species, { color: colors.textMuted }]}>{plant.species}</Text>
          {plant.location ? (
            <Text style={[styles.location, { color: colors.textMuted }]}>{plant.location}</Text>
          ) : null}

          {dueForFeeding && (
            <View style={[styles.banner, { backgroundColor: colors.clay }]}>
              <Text style={[styles.bannerText, { color: colors.onClay, fontFamily: fonts.bodyBold }]}>
                Feeding is due — give it a light feed today.
              </Text>
            </View>
          )}

          <PrimaryButton
            label="Log a moisture reading"
            onPress={() => navigation.navigate("LogReading", { plantId })}
            style={styles.cta}
          />
        </ScrollView>
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { paddingHorizontal: spacing.screenPadding, paddingBottom: 24 },
  nickname: { fontSize: 26, marginTop: 16 },
  species: { fontSize: 14, fontStyle: "italic", marginTop: 2 },
  location: { fontSize: 13, marginTop: 2 },
  banner: { marginTop: 16, padding: 14, borderRadius: 14 },
  bannerText: { fontSize: 14 },
  cta: { marginTop: 28 },
})
