import { useCallback, useState } from "react"
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native"
import { useFocusEffect } from "@react-navigation/native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { api, Plant } from "@/lib/api"
import { fonts, spacing, useTheme } from "@/theme"
import { Screen } from "@/components/Screen"
import { PhotoPlaceholder } from "@/components/PhotoPlaceholder"
import { PrimaryButton } from "@/components/PrimaryButton"

export function PlantListScreen({ navigation }: any) {
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()
  const [plants, setPlants] = useState<Plant[]>([])
  const [loading, setLoading] = useState(true)

  useFocusEffect(
    useCallback(() => {
      let active = true
      setLoading(true)
      api
        .listPlants()
        .then(({ plants }) => {
          if (active) setPlants(plants)
        })
        .finally(() => {
          if (active) setLoading(false)
        })
      return () => {
        active = false
      }
    }, [])
  )

  const hasPlants = plants.length > 0

  return (
    <Screen style={{ position: "relative" }}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text, fontFamily: fonts.headingBold }]}>
          Sweet Grass
        </Text>
        {hasPlants && (
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            {plants.length} plant{plants.length === 1 ? "" : "s"} growing
          </Text>
        )}
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : hasPlants ? (
        <FlatList
          data={plants}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => navigation.navigate("PlantDetail", { plantId: item.id })}
              style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <PhotoPlaceholder width={56} height={56} radius={14} fontSize={22} />
              <View style={styles.rowText}>
                <Text style={[styles.nickname, { color: colors.text, fontFamily: fonts.headingSemiBold }]}>
                  {item.nickname}
                </Text>
                <Text style={[styles.species, { color: colors.textMuted }]}>{item.species}</Text>
                {item.location ? (
                  <Text style={[styles.location, { color: colors.textMuted }]}>{item.location}</Text>
                ) : null}
                {item.dueForFeeding && (
                  <View style={[styles.badge, { backgroundColor: colors.clay }]}>
                    <Text style={[styles.badgeText, { color: colors.onClay }]}>FEEDING DUE</Text>
                  </View>
                )}
              </View>
            </Pressable>
          )}
        />
      ) : (
        <View style={styles.empty}>
          <PhotoPlaceholder width={140} radius={20} fontSize={56} />
          <Text style={[styles.emptyTitle, { color: colors.text, fontFamily: fonts.headingBold }]}>
            No plants yet
          </Text>
          <Text style={[styles.emptyBody, { color: colors.textMuted }]}>
            Add your first plant and we&rsquo;ll tell you exactly what it needs, and when.
          </Text>
          <PrimaryButton
            label="Add a plant"
            onPress={() => navigation.navigate("AddPlant")}
            style={styles.emptyButton}
          />
        </View>
      )}

      <Pressable
        onPress={() => navigation.navigate("AddPlant")}
        style={[styles.fab, { backgroundColor: colors.primary, bottom: 24 + insets.bottom }]}
      >
        <View style={styles.plusIcon}>
          <View style={[styles.plusBar, { backgroundColor: colors.onPrimary }]} />
          <View style={[styles.plusBar, styles.plusBarHorizontal, { backgroundColor: colors.onPrimary }]} />
        </View>
      </Pressable>
    </Screen>
  )
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.screenPadding, paddingTop: 4, paddingBottom: 4 },
  title: { fontSize: 24 },
  subtitle: { fontSize: 13, marginTop: 2 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  list: { paddingHorizontal: spacing.screenPadding, paddingTop: 12, paddingBottom: 100 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  rowText: { flex: 1, minWidth: 0 },
  nickname: { fontSize: 16 },
  species: { fontSize: 13, fontStyle: "italic", marginTop: 1 },
  location: { fontSize: 12, marginTop: 1 },
  badge: {
    alignSelf: "flex-start",
    marginTop: 6,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: { fontSize: 11, fontFamily: fonts.bodyBold, letterSpacing: 0.4 },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    gap: 16,
  },
  emptyTitle: { fontSize: 20 },
  emptyBody: { fontSize: 14, textAlign: "center", maxWidth: 260, lineHeight: 21 },
  emptyButton: { paddingVertical: 14, paddingHorizontal: 24, borderRadius: 14, marginTop: 8 },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 20,
    elevation: 6,
  },
  plusIcon: { width: 20, height: 20 },
  plusBar: { position: "absolute", left: 9, top: 0, width: 2, height: 20, borderRadius: 1 },
  plusBarHorizontal: { left: 0, top: 9, width: 20, height: 2 },
})
