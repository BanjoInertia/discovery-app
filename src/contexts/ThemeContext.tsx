import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeType = 'dark' | 'light';

interface ThemeColors {
    background: string;
    surface: string;
    textPrimary: string;
    textSecondary: string;
    accent: string;
    icon: string;
}

const darkColors: ThemeColors = {
    background: '#0F1014',
    surface: '#1F2937',
    textPrimary: '#FFF',
    textSecondary: '#9CA3AF',
    accent: '#EAB308',
    icon: '#FFF',
};

const lightColors: ThemeColors = {
    background: '#F9FAFB',
    surface: '#FFFFFF',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    accent: '#EAB308', 
    icon: '#111827',
};

interface ThemeContextData {
    theme: ThemeType;
    colors: ThemeColors;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextData>({} as ThemeContextData);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<ThemeType>('dark');

    useEffect(() => {
        async function loadTheme() {
            const storagedTheme = await AsyncStorage.getItem('@discovery_theme');
            if (storagedTheme) {
                setTheme(storagedTheme as ThemeType);
            }
        }
        loadTheme();
    }, []);

    async function toggleTheme() {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        await AsyncStorage.setItem('@discovery_theme', newTheme);
    }

    const colors = theme === 'dark' ? darkColors : lightColors;

    return (
        <ThemeContext.Provider value={{ theme, colors, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
