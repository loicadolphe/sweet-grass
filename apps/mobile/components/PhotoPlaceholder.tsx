import { DimensionValue, StyleSheet, Text, View } from "react-native"
import { useTheme } from "@/theme"

export function PhotoPlaceholder({
  width,
  height,
  radius = 14,
  fontSize = 40,
}: {
  width: DimensionValue
  height?: DimensionValue
  radius?: number
  fontSize?: number
}) {
  const { colors } = useTheme()

  return (
    <View
      style={[
        styles.box,
        {
          width,
          height: height ?? width,
          borderRadius: radius,
          backgroundColor: colors.backgroundAlt,
          borderColor: colors.border,
        },
      ]}
    >
      <Text style={{ fontSize }}>🌿</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  box: { alignItems: "center", justifyContent: "center", borderWidth: 1, overflow: "hidden" },
})
