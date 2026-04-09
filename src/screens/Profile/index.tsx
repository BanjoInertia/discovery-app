import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { getFavorites, getWatchlist, getAllRatings } from '../../services/storage';
import { Movie } from '../../types/Movie';

const { width } = Dimensions.get('window');

type StatCardProps = {
    icon: any;
    label: string;
    value: string | number;
    color: string;
    bgColor: string;
};

function StatCard({ icon, label, value, color, bgColor }: StatCardProps) {
    return (
        <View style={[styles.statCard, { backgroundColor: bgColor }]}>
            <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
                <Ionicons name={icon} size={24} color={color} />
            </View>
            <Text style={[styles.statValue, { color }]}>{value}</Text>
            <Text style={[styles.statLabel, { color: color + 'CC' }]}>{label}</Text>
        </View>
    );
}

export function Profile() {
    const { colors } = useTheme();
    const navigation = useNavigation<any>();

    const [favorites, setFavorites] = useState<Movie[]>([]);
    const [watchlist, setWatchlist] = useState<Movie[]>([]);
    const [ratingsCount, setRatingsCount] = useState(0);
    const [avgRating, setAvgRating] = useState(0);
    const [topGenre, setTopGenre] = useState<string>('—');
    const [totalMinutes, setTotalMinutes] = useState(0);

    useFocusEffect(useCallback(() => {
        async function loadStats() {
            const [favs, watch, ratings] = await Promise.all([
                getFavorites(),
                getWatchlist(),
                getAllRatings(),
            ]);

            setFavorites(favs);
            setWatchlist(watch);

            const ratingValues = Object.values(ratings);
            setRatingsCount(ratingValues.length);
            if (ratingValues.length > 0) {
                const sum = ratingValues.reduce((a, b) => a + b, 0);
                setAvgRating(parseFloat((sum / ratingValues.length).toFixed(1)));
            } else {
                setAvgRating(0);
            }

            const genreCount: { [key: string]: number } = {};
            favs.forEach(movie => {
                movie.generos?.forEach(g => {
                    genreCount[g] = (genreCount[g] || 0) + 1;
                });
            });
            const sorted = Object.entries(genreCount).sort((a, b) => b[1] - a[1]);
            setTopGenre(sorted.length > 0 ? sorted[0][0] : '—');

            const minutes = favs.reduce((acc, m) => acc + (m.duracao || 0), 0);
            setTotalMinutes(minutes);
        }

        loadStats();
    }, []));

    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={[styles.backButton, { backgroundColor: colors.surface }]}
                >
                    <Ionicons name="chevron-back" size={24} color={colors.icon} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.textPrimary }]}>Meu Perfil</Text>
                <View style={{ width: 45 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                <View style={styles.avatarSection}>
                    <View style={[styles.avatarCircle, { backgroundColor: colors.accent }]}>
                        <Ionicons name="person" size={48} color="#000" />
                    </View>
                    <Text style={[styles.userName, { color: colors.textPrimary }]}>Cinéfilo</Text>
                    <Text style={[styles.userBio, { color: colors.textSecondary }]}>
                        Explorando o mundo do cinema 🎬
                    </Text>
                </View>

                <View style={styles.statsGrid}>
                    <StatCard
                        icon="heart"
                        label="Favoritos"
                        value={favorites.length}
                        color="#EF4444"
                        bgColor={colors.surface}
                    />
                    <StatCard
                        icon="bookmark"
                        label="Watchlist"
                        value={watchlist.length}
                        color="#3B82F6"
                        bgColor={colors.surface}
                    />
                    <StatCard
                        icon="star"
                        label="Avaliados"
                        value={ratingsCount}
                        color="#EAB308"
                        bgColor={colors.surface}
                    />
                    <StatCard
                        icon="trending-up"
                        label="Nota Média"
                        value={avgRating > 0 ? `${avgRating}★` : '—'}
                        color="#10B981"
                        bgColor={colors.surface}
                    />
                </View>

                <View style={[styles.insightCard, { backgroundColor: colors.surface }]}>
                    <View style={styles.insightRow}>
                        <View style={[styles.insightIcon, { backgroundColor: colors.accent + '20' }]}>
                            <Ionicons name="film" size={22} color={colors.accent} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.insightLabel, { color: colors.textSecondary }]}>Gênero Favorito</Text>
                            <Text style={[styles.insightValue, { color: colors.textPrimary }]}>{topGenre}</Text>
                        </View>
                    </View>

                    <View style={[styles.divider, { backgroundColor: colors.background }]} />

                    <View style={styles.insightRow}>
                        <View style={[styles.insightIcon, { backgroundColor: colors.accent + '20' }]}>
                            <Ionicons name="time" size={22} color={colors.accent} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.insightLabel, { color: colors.textSecondary }]}>Tempo em Favoritos</Text>
                            <Text style={[styles.insightValue, { color: colors.textPrimary }]}>
                                {totalMinutes > 0 ? `${hours}h ${mins}min` : 'Nenhum dado ainda'}
                            </Text>
                        </View>
                    </View>
                </View>

                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Acesso Rápido</Text>

                <TouchableOpacity
                    style={[styles.linkCard, { backgroundColor: colors.surface }]}
                    onPress={() => navigation.navigate('favorites')}
                    activeOpacity={0.7}
                >
                    <View style={styles.linkLeft}>
                        <Ionicons name="heart" size={20} color="#EF4444" />
                        <Text style={[styles.linkText, { color: colors.textPrimary }]}>Meus Favoritos</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.linkCard, { backgroundColor: colors.surface }]}
                    onPress={() => navigation.navigate('watchlist')}
                    activeOpacity={0.7}
                >
                    <View style={styles.linkLeft}>
                        <Ionicons name="bookmark" size={20} color="#3B82F6" />
                        <Text style={[styles.linkText, { color: colors.textPrimary }]}>Minha Watchlist</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.linkCard, { backgroundColor: colors.surface }]}
                    onPress={() => navigation.navigate('search')}
                    activeOpacity={0.7}
                >
                    <View style={styles.linkLeft}>
                        <Ionicons name="search" size={20} color={colors.accent} />
                        <Text style={[styles.linkText, { color: colors.textPrimary }]}>Buscar Filmes</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
            </ScrollView>
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
    avatarSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    avatarCircle: {
        width: 96,
        height: 96,
        borderRadius: 48,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    userName: {
        fontSize: 26,
        fontWeight: '900',
        letterSpacing: -0.5,
        marginBottom: 4,
    },
    userBio: {
        fontSize: 15,
        fontWeight: '500',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 24,
        gap: 12,
    },
    statCard: {
        width: (width - 44) / 2,
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    statIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    statValue: {
        fontSize: 28,
        fontWeight: '900',
        marginBottom: 2,
    },
    statLabel: {
        fontSize: 13,
        fontWeight: '600',
    },
    insightCard: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 32,
    },
    insightRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    insightIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    insightLabel: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 2,
    },
    insightValue: {
        fontSize: 18,
        fontWeight: '800',
    },
    divider: {
        height: 1,
        marginVertical: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '900',
        marginBottom: 16,
        letterSpacing: -0.5,
    },
    linkCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 18,
        borderRadius: 16,
        marginBottom: 12,
    },
    linkLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    linkText: {
        fontSize: 16,
        fontWeight: '700',
    },
});
