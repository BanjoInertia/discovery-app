import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Home } from "../screens/Home";
import { Details } from "../screens/Details";
import { Search } from "../screens/Search";
import { Favorites } from "../screens/Favorites";

const Stack = createNativeStackNavigator();

export function AppRoutes() {
    return (
        <Stack.Navigator screenOptions={{ 
            headerShown: false, 
            contentStyle: { backgroundColor: '#121212' }
        }}
        >
            <Stack.Screen name="home" component={Home}/>
            <Stack.Screen name="details" component={Details}/>
            <Stack.Screen name="search" component={Search}/>
            <Stack.Screen name="favorites" component={Favorites} />
        </Stack.Navigator>
    );
};