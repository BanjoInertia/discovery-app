import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Home } from "../screens/Home";
import { Details } from "../screens/Details";
import { Search } from "../screens/Search";
import { Favorites } from "../screens/Favorites";
import { Watchlist } from "../screens/Watchlist";
import { Onboarding } from "../screens/Onboarding";
import { Profile } from "../screens/Profile";

const Stack = createNativeStackNavigator();

export function AppRoutes({ initialRouteName = "home" }: { initialRouteName?: string }) {
    return (
        <Stack.Navigator 
            initialRouteName={initialRouteName as any}
            screenOptions={{ 
                headerShown: false, 
                contentStyle: { backgroundColor: '#121212' }
            }}
        >
            <Stack.Screen name="onboarding" component={Onboarding}/>
            <Stack.Screen name="home" component={Home}/>
            <Stack.Screen name="details" component={Details}/>
            <Stack.Screen name="search" component={Search}/>
            <Stack.Screen name="favorites" component={Favorites} />
            <Stack.Screen name="watchlist" component={Watchlist} />
            <Stack.Screen name="profile" component={Profile} />
        </Stack.Navigator>
    );
};