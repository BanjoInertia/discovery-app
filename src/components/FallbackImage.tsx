import React, { useState } from 'react';
import { View, Image, StyleSheet, StyleProp, ImageStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

interface FallbackImageProps {
    uri?: string | null;
    style?: StyleProp<ImageStyle>;
    type?: 'movie' | 'actor';
}

export function FallbackImage({ uri, style, type = 'movie' }: FallbackImageProps) {
    const { colors } = useTheme();
    const [error, setError] = useState(false);

    if (!uri || error) {
        return (
            <View style={[style, styles.fallbackContainer, { backgroundColor: colors.surface }]}>
                <Ionicons 
                    name={type === 'actor' ? "person" : "film-outline"} 
                    size={32} 
                    color={colors.textSecondary} 
                />
            </View>
        );
    }

    return (
        <Image 
            source={{ uri }} 
            style={style} 
            onError={() => setError(true)}
        />
    );
}

const styles = StyleSheet.create({
    fallbackContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    }
});
