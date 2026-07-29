import { useState } from "react"
import { Text, View, TextInput, Pressable, Image, ActivityIndicator, Alert } from "react-native"
import * as ImagePicker from "expo-image-picker"
import { api, PlantNetCandidate } from "@/lib/api"

export function AddPlantScreen({ navigation }: any) {
  const [photoUri, setPhotoUri] = useState<string | null>(null)
  const [candidates, setCandidates] = useState<PlantNetCandidate[]>([])
  const [selected, setSelected] = useState<PlantNetCandidate | null>(null)
  const [nickname, setNickname] = useState("")
  const [location, setLocation] = useState("")
  const [identifying, setIdentifying] = useState(false)
  const [saving, setSaving] = useState(false)

  async function takePhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync()
    if (!permission.granted) {
      Alert.alert("Camera permission needed to identify plants.")
      return
    }

    const result = await ImagePicker.launchCameraAsync({
      base64: true,
      quality: 0.7,
    })
    if (result.canceled || !result.assets[0]) return

    const asset = result.assets[0]
    setPhotoUri(asset.uri)
    setCandidates([])
    setSelected(null)

    if (!asset.base64) return

    setIdentifying(true)
    try {
      const { candidates } = await api.identify(asset.base64)
      setCandidates(candidates)
    } catch (err) {
      Alert.alert("Identification failed", (err as Error).message)
    } finally {
      setIdentifying(false)
    }
  }

  async function save() {
    if (!selected || !nickname) {
      Alert.alert("Pick a species match and give it a nickname first.")
      return
    }

    setSaving(true)
    try {
      let speciesInfo
      try {
        const { species } = await api.lookupSpecies(selected.scientificName)
        speciesInfo = species
      } catch {
        speciesInfo = null
      }

      await api.createPlant({
        nickname,
        species: selected.commonNames[0] ?? selected.scientificName,
        scientificName: selected.scientificName,
        location: location || undefined,
        wateringMethod: speciesInfo?.wateringMethod ?? "top",
        feedFrequencyDays: speciesInfo?.feedFrequencyDays ?? 30,
      })
      navigation.navigate("PlantList")
    } catch (err) {
      Alert.alert("Couldn't save plant", (err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      {photoUri && (
        <Image source={{ uri: photoUri }} style={{ width: "100%", height: 200, borderRadius: 12 }} />
      )}

      <Pressable
        onPress={takePhoto}
        style={{ backgroundColor: "#2e7d32", padding: 14, borderRadius: 12, marginTop: 12 }}
      >
        <Text style={{ color: "white", textAlign: "center", fontWeight: "600" }}>
          {photoUri ? "Retake photo" : "Take a photo"}
        </Text>
      </Pressable>

      {identifying && <ActivityIndicator style={{ marginTop: 16 }} />}

      {candidates.length > 0 && (
        <View style={{ marginTop: 16 }}>
          <Text style={{ fontWeight: "600", marginBottom: 8 }}>Which one is it?</Text>
          {candidates.map((c) => (
            <Pressable
              key={c.scientificName}
              onPress={() => setSelected(c)}
              style={{
                padding: 12,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: selected?.scientificName === c.scientificName ? "#2e7d32" : "#ddd",
                marginBottom: 8,
              }}
            >
              <Text style={{ fontWeight: "600" }}>{c.commonNames[0] ?? c.scientificName}</Text>
              <Text style={{ color: "#666", fontSize: 12 }}>
                {c.scientificName} · {Math.round(c.score * 100)}% match
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {selected && (
        <View style={{ marginTop: 16 }}>
          <TextInput
            placeholder="Nickname (e.g. Phoebe)"
            value={nickname}
            onChangeText={setNickname}
            style={{ borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 10, marginBottom: 8 }}
          />
          <TextInput
            placeholder="Location (e.g. Living room windowsill)"
            value={location}
            onChangeText={setLocation}
            style={{ borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 10, marginBottom: 8 }}
          />
          <Pressable
            onPress={save}
            disabled={saving}
            style={{ backgroundColor: "#2e7d32", padding: 14, borderRadius: 12 }}
          >
            <Text style={{ color: "white", textAlign: "center", fontWeight: "600" }}>
              {saving ? "Saving..." : "Add to my plants"}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  )
}
