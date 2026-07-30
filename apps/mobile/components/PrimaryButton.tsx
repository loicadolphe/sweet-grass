import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from "react-native"
import { fonts, spacing, useTheme } from "@/theme"

export function PrimaryButton({
  label,
  onPress,
  disabled,
  loading,
  style,
}: {
  label: string
  onPress: () => void
  disabled?: boolean
  loading?: boolean
  style?: ViewStyle
}) {
  const { colors } = useTheme()

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        { backgroundColor: colors.primary, opacity: disabled || loading ? 0.6 : 1 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.onPrimary} />
      ) : (
        <Text style={[styles.label, { color: colors.onPrimary, fontFamily: fonts.headingSemiBold }]}>
          {label}
        </Text>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    borderRadius: spacing.ctaRadius,
    alignItems: "center",
    justifyContent: "center",
  },
  label: { fontSize: 16 },
})
