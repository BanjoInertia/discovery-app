import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Home } from "../screens/Home";
import { Details } from "../screens/Details";

const Stack = createNativeStackNavigator();

export function AppRoutes() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="home" component={Home}/>
            <Stack.Screen name="details" component={Details}/>
        </Stack.Navigator>
    );
};