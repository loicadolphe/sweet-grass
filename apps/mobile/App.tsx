import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { StatusBar } from "expo-status-bar"
import { useFonts, Sora_600SemiBold, Sora_700Bold } from "@expo-google-fonts/sora"
import { Karla_400Regular, Karla_500Medium, Karla_700Bold } from "@expo-google-fonts/karla"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { View } from "react-native"
import { PlantListScreen } from "@/screens/PlantListScreen"
import { AddPlantScreen } from "@/screens/AddPlantScreen"
import { PlantDetailScreen } from "@/screens/PlantDetailScreen"
import { LogReadingScreen } from "@/screens/LogReadingScreen"
import { useTheme } from "@/theme"

const Stack = createNativeStackNavigator()

function AppNavigator() {
  const { colors } = useTheme()

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="PlantList" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="PlantList" component={PlantListScreen} />
        <Stack.Screen name="AddPlant" component={AddPlantScreen} />
        <Stack.Screen name="PlantDetail" component={PlantDetailScreen} />
        <Stack.Screen name="LogReading" component={LogReadingScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Sora_600SemiBold,
    Sora_700Bold,
    Karla_400Regular,
    Karla_500Medium,
    Karla_700Bold,
  })

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: "#f7f5ec" }} />
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <AppNavigator />
    </SafeAreaProvider>
  )
}
