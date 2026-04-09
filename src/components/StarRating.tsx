import { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

interface StarRatingProps {
    rating: number | null;
    onRate: (rating: number) => void;
    onClear?: () => void;
}

export function StarRating({ rating, onRate, onClear }: StarRatingProps) {
    const { colors } = useTheme();
    const stars = [1, 2, 3, 4, 5];

    return (
        <View style={styles.container}>
            <View style={styles.starsRow}>
                {stars.map((star) => (
                    <TouchableOpacity
                        key={star}
                        onPress={() => onRate(star)}
                        activeOpacity={0.6}
                        style={styles.starButton}
                    >
                        <Ionicons
                            name={rating && star <= rating ? 'star' : 'star-outline'}
                            size={32}
                            color={rating && star <= rating ? '#EAB308' : colors.textSecondary}
                        />
                    </TouchableOpacity>
                ))}
            </View>

            {rating && (
                <View style={styles.ratingInfo}>
                    <Text style={[styles.ratingText, { color: colors.textPrimary }]}>
                        Sua nota: {rating}/5
                    </Text>
                    {onClear && (
                        <TouchableOpacity onPress={onClear} activeOpacity={0.7}>
                            <Text style={[styles.clearText, { color: colors.textSecondary }]}>Remover</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 8,
        marginBottom: 24,
    },
    starsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    starButton: {
        padding: 4,
    },
    ratingInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    ratingText: {
        fontSize: 15,
        fontWeight: '700',
    },
    clearText: {
        fontSize: 14,
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
});
