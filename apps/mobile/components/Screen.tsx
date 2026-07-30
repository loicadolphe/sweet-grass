import { ReactNode } from "react"
import { View, ViewStyle } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useTheme } from "@/theme"

export function Screen({
  children,
  style,
  backgroundColor,
}: {
  children: ReactNode
  style?: ViewStyle
  backgroundColor?: string
}) {
  const insets = useSafeAreaInsets()
  const { colors } = useTheme()

  return (
    <View
      style={[
        { flex: 1, backgroundColor: backgroundColor ?? colors.background, paddingTop: insets.top },
        style,
      ]}
    >
      {children}
    </View>
  )
}
