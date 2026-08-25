import { Alert, Platform } from "react-native"

/**
 * react-native-web ships no Alert implementation, so calling Alert.alert in a
 * browser silently does nothing. Every message in this app is a fire-and-forget
 * "here's what went wrong" with no choices to make, which maps cleanly onto the
 * browser's own dialog.
 */
export function notify(title: string, message?: string) {
  if (Platform.OS === "web") {
    window.alert(message ? `${title}\n\n${message}` : title)
    return
  }

  Alert.alert(title, message)
}
