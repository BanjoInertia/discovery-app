import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { FallbackImage } from '../../components/FallbackImage';

import { getWatchlist } from '../../services/storage';
import { Movie } from '../../types/Movie';

export function Watchlist() {
    const { theme, colors } = useTheme();
    const navigation = useNavigation<any>();
    const [movies, setMovies] = useState<Movie[]>([]);

    useFocusEffect(
        useCallback(() => {
            let isActive = true;

            async function fetchMovies() {
                const result = await getWatchlist();
                if (isActive) {
                    setMovies(result);
                }
            }
            fetchMovies();

            return () => {
                isActive = false;
            }
        }, [])
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity 
                    onPress={() => navigation.goBack()}
                    style={[styles.backButton, { backgroundColor: colors.surface }]}
                >
                    <Ionicons name="chevron-back" size={24} color={colors.icon} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.textPrimary }]}>Quero Assistir</Text>
                <View style={{ width: 45 }} />
            </View>

            <FlatList
                data={movies}
                keyExtractor={item => String(item.id)}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[styles.card, { backgroundColor: colors.surface }]}
                        onPress={() => navigation.navigate('details', { movieId: item.id })}
                        activeOpacity={0.8}
                    >
                        <FallbackImage
                            uri={item.imagem}
                            style={styles.poster}
                        />
                        <View style={styles.cardContent}>
                            <View style={{ flex: 1, paddingRight: 8 }}>
                                <Text numberOfLines={2} style={[styles.movieTitle, { color: colors.textPrimary }]}>
                                    {item.titulo}
                                </Text>
                                <View style={styles.metaContainer}>
                                    <Ionicons name="star" size={14} color={colors.accent} />
                                    <Text style={[styles.rate, { color: colors.accent }]}>
                                        {item.nota ? item.nota.toFixed(1) : "N/A"}
                                    </Text>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                        </View>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="bookmark-outline" size={80} color={colors.textSecondary} style={{ marginBottom: 16 }} />
                        <Text style={[styles.emptyStateTitle, { color: colors.textPrimary }]}>Sua lista está vazia</Text>
                        <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                            Explore títulos e adicione aqueles que você quer assistir mais tarde!
                        </Text>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 60,
        paddingHorizontal: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    backButton: {
        width: 45,
        height: 45,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 22,
        fontWeight: '900',
        letterSpacing: -0.5,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
        marginTop: 60,
    },
    emptyStateTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptyStateText: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
    },
    card: {
        flexDirection: 'row',
        marginBottom: 16,
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 2,
    },
    poster: {
        width: 80,
        height: 120,
        resizeMode: 'cover',
    },
    cardContent: {
        flex: 1,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    movieTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    metaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    rate: {
        fontSize: 14,
        fontWeight: 'bold',
        marginLeft: -2,
    }
});
