import { useCallback, useState } from "react"
import { FlatList, Pressable, Text, View, ActivityIndicator } from "react-native"
import { useFocusEffect } from "@react-navigation/native"
import { api, Plant } from "@/lib/api"

export function PlantListScreen({ navigation }: any) {
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

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    )
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <FlatList
        data={plants}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 32 }}>
            No plants yet — add your first one.
          </Text>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => navigation.navigate("PlantDetail", { plantId: item.id })}
            style={{
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderBottomColor: "#ddd",
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "600" }}>{item.nickname}</Text>
            <Text style={{ color: "#666" }}>{item.species}</Text>
          </Pressable>
        )}
      />
      <Pressable
        onPress={() => navigation.navigate("AddPlant")}
        style={{
          backgroundColor: "#2e7d32",
          padding: 14,
          borderRadius: 12,
          marginTop: 12,
        }}
      >
        <Text style={{ color: "white", textAlign: "center", fontWeight: "600" }}>
          Add a plant
        </Text>
      </Pressable>
    </View>
  )
}
