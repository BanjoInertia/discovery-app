import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { FallbackImage } from '../../components/FallbackImage';

import { getFavorites } from '../../services/storage';
import { Movie } from '../../types/Movie';

const { width } = Dimensions.get('window');

export function Favorites() {
    const { theme, colors } = useTheme();
    const [movies, setMovies] = useState<Movie[]>([]);
    const navigation = useNavigation<any>();

    useFocusEffect(useCallback(() => {
        async function loadFavorites() {
            const data = await getFavorites();
            setMovies(data);
        }

        loadFavorites();
    }, []));

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity 
                    onPress={() => navigation.goBack()}
                    style={[styles.backButton, { backgroundColor: colors.surface }]}
                >
                    <Ionicons name="chevron-back" size={24} color={colors.icon} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.textPrimary }]}>Meus Favoritos</Text>
                <View style={{ width: 45 }} />
            </View>

            {movies.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <View style={[styles.emptyIconContainer, { backgroundColor: colors.surface }]}>
                        <Ionicons name="heart-dislike-outline" size={64} color={colors.textSecondary} />
                    </View>
                    <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Nenhum favorito</Text>
                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                        Você ainda não adicionou nenhum filme aos seus favoritos.
                    </Text>
                    <TouchableOpacity 
                        style={[styles.exploreButton, { backgroundColor: colors.accent }]}
                        onPress={() => navigation.navigate('Home')}
                    >
                        <Text style={styles.exploreText}>Explorar Filmes</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={movies}
                    keyExtractor={(item) => String(item.id)}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 40 }}
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
                                <View>
                                    <Text numberOfLines={2} style={[styles.movieTitle, { color: colors.textPrimary }]}>
                                        {item.titulo}
                                    </Text>
                                    <View style={styles.ratingContainer}>
                                        <Ionicons name="star" size={14} color={colors.accent} />
                                        <Text style={[styles.movieRate, { color: colors.accent }]}>
                                            {item.nota ? item.nota.toFixed(1) : "N/A"}/10
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.cardFooter}>
                                    <Text style={[styles.viewDetailsText, { color: colors.textSecondary }]}>
                                        Ver detalhes
                                    </Text>
                                    <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
                                </View>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            )}
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
        marginBottom: 32,
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
        paddingBottom: 80,
    },
    emptyIconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
    },
    exploreButton: {
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 30,
        elevation: 2,
    },
    exploreText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
    },
    card: {
        flexDirection: 'row',
        marginBottom: 16,
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 3,
    },
    poster: {
        width: 100,
        height: 150,
        resizeMode: 'cover',
    },
    cardContent: {
        flex: 1,
        padding: 16,
        justifyContent: 'space-between',
    },
    movieTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    movieRate: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 4,
    },
    viewDetailsText: {
        fontSize: 14,
        fontWeight: '600',
    }
});