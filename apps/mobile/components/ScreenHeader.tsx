import { Pressable, StyleSheet, Text, View } from "react-native"
import { fonts, useTheme } from "@/theme"

export function ScreenHeader({ title, onBack }: { title?: string; onBack: () => void }) {
  const { colors } = useTheme()

  return (
    <View style={styles.row}>
      <Pressable
        onPress={onBack}
        hitSlop={8}
        style={[styles.back, { backgroundColor: colors.backgroundAlt }]}
      >
        <Text style={[styles.chevron, { color: colors.text }]}>‹</Text>
      </Pressable>
      {title ? (
        <Text style={[styles.title, { color: colors.text, fontFamily: fonts.headingSemiBold }]}>
          {title}
        </Text>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingTop: 4, paddingBottom: 4 },
  back: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  chevron: { fontSize: 22, lineHeight: 22 },
  title: { fontSize: 18 },
})
