import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { StatusBar } from "expo-status-bar"
import { PlantListScreen } from "@/screens/PlantListScreen"
import { AddPlantScreen } from "@/screens/AddPlantScreen"
import { PlantDetailScreen } from "@/screens/PlantDetailScreen"
import { LogReadingScreen } from "@/screens/LogReadingScreen"

const Stack = createNativeStackNavigator()

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator initialRouteName="PlantList">
        <Stack.Screen name="PlantList" component={PlantListScreen} options={{ title: "Sweet Grass" }} />
        <Stack.Screen name="AddPlant" component={AddPlantScreen} options={{ title: "Add a plant" }} />
        <Stack.Screen name="PlantDetail" component={PlantDetailScreen} options={{ title: "Plant" }} />
        <Stack.Screen name="LogReading" component={LogReadingScreen} options={{ title: "Log reading" }} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
