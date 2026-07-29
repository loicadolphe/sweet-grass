import { useState } from "react"
import { Text, View, TextInput, Pressable, Alert } from "react-native"
import { api } from "@/lib/api"

export function LogReadingScreen({ route, navigation }: any) {
  const { plantId } = route.params
  const [value, setValue] = useState("")
  const [reason, setReason] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function submit() {
    const moistureValue = Number(value)
    if (!Number.isFinite(moistureValue)) {
      Alert.alert("Enter a number for the moisture reading.")
      return
    }

    setSaving(true)
    try {
      const { reason } = await api.logReading(plantId, moistureValue)
      setReason(reason)
    } catch (err) {
      Alert.alert("Couldn't log reading", (err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ marginBottom: 8 }}>What does the meter read?</Text>
      <TextInput
        value={value}
        onChangeText={setValue}
        keyboardType="numeric"
        placeholder="e.g. 3"
        style={{ borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 10, marginBottom: 12 }}
      />
      <Pressable
        onPress={submit}
        disabled={saving}
        style={{ backgroundColor: "#2e7d32", padding: 14, borderRadius: 12 }}
      >
        <Text style={{ color: "white", textAlign: "center", fontWeight: "600" }}>
          {saving ? "Checking..." : "Get recommendation"}
        </Text>
      </Pressable>

      {reason && (
        <View style={{ marginTop: 20, padding: 16, backgroundColor: "#eef7ee", borderRadius: 12 }}>
          <Text style={{ fontSize: 16 }}>{reason}</Text>
          <Pressable onPress={() => navigation.goBack()} style={{ marginTop: 12 }}>
            <Text style={{ color: "#2e7d32", fontWeight: "600" }}>Done</Text>
          </Pressable>
        </View>
      )}
    </View>
  )
}
