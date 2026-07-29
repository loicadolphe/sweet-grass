import { useCallback, useState } from "react"
import { Text, View, Pressable, ActivityIndicator } from "react-native"
import { useFocusEffect } from "@react-navigation/native"
import { api, Plant } from "@/lib/api"

export function PlantDetailScreen({ route, navigation }: any) {
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

  if (loading || !plant) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    )
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>{plant.nickname}</Text>
      <Text style={{ color: "#666", marginBottom: 16 }}>
        {plant.species}
        {plant.location ? ` · ${plant.location}` : ""}
      </Text>

      {dueForFeeding && (
        <View style={{ backgroundColor: "#fff3cd", padding: 12, borderRadius: 8, marginBottom: 16 }}>
          <Text>Due for feeding</Text>
        </View>
      )}

      <Pressable
        onPress={() => navigation.navigate("LogReading", { plantId })}
        style={{ backgroundColor: "#2e7d32", padding: 14, borderRadius: 12 }}
      >
        <Text style={{ color: "white", textAlign: "center", fontWeight: "600" }}>
          Log a moisture reading
        </Text>
      </Pressable>
    </View>
  )
}
