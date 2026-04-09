import { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { AppRoutes } from "./app.routes";
import { ThemeProvider } from "../contexts/ThemeContext";
import { getHasSeenOnboarding } from "../services/storage";
import { View, ActivityIndicator } from "react-native";

export function Routes() {
    const [isReady, setIsReady] = useState(false);
    const [initialRoute, setInitialRoute] = useState("home");

    useEffect(() => {
        async function checkOnboarding() {
            try {
                const hasSeen = await getHasSeenOnboarding();
                if (!hasSeen) {
                    setInitialRoute("onboarding");
                } else {
                    setInitialRoute("home");
                }
            } catch (error) {
                console.log("Error checking onboarding status:", error);
            } finally {
                setIsReady(true);
            }
        }

        checkOnboarding();
    }, []);

    if (!isReady) {
        return (
            <View style={{ flex: 1, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#EAB308" />
            </View>
        );
    }

    return (
        <ThemeProvider>
            <NavigationContainer>
                <AppRoutes initialRouteName={initialRoute} />
            </NavigationContainer>
        </ThemeProvider>
    );
}