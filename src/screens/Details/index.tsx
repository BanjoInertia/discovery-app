import { useRoute, useNavigation } from '@react-navigation/native';
import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, FlatList, Dimensions, ActivityIndicator } from 'react-native'
import { saveFavorite, removeFavorite, isFavorite, saveWatchlist, removeWatchlist, isWatchlisted, getRating, saveRating, removeRating } from '../../services/storage';
import { Movie } from '../../types/Movie';
import api from '../../services/api';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import { FallbackImage } from '../../components/FallbackImage';
import { Skeleton } from '../../components/Skeleton';
import { StarRating } from '../../components/StarRating';
import YoutubeIframe from 'react-native-youtube-iframe';

type ParamsProps = {
    movieId: number;
    imagem?: string;
}

const { width } = Dimensions.get('window');
const POSTER_HEIGHT = width * 1.45;

export function Details() {
    const route = useRoute();
    const navigation = useNavigation<any>();
    const { movieId, imagem } = route.params as ParamsProps;
    const { theme, colors, toggleTheme } = useTheme();

    const [movieDetails, setMovieDetails] = useState<Movie | null>(null);
    const [similarMovies, setSimilarMovies] = useState<Movie[]>([]);
    const [isFavorited, setIsFavorited] = useState(false);
    const [isWatchlistedState, setIsWatchlistedState] = useState(false);
    const [loading, setLoading] = useState(true);
    const [playing, setPlaying] = useState(false);
    const [userRating, setUserRating] = useState<number | null>(null);

    const onStateChange = useCallback((state: string) => {
        if (state === "ended") {
            setPlaying(false);
        }
    }, []);

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            try {
                const [detailsRes, similarRes, favStatus, watchStatus, ratingValue] = await Promise.all([
                    api.get(`/api/filmes/${movieId}`),
                    api.get(`/api/filmes/${movieId}/similares`),
                    isFavorite(movieId),
                    isWatchlisted(movieId),
                    getRating(movieId),
                ]);

                setMovieDetails(detailsRes.data);
                setSimilarMovies(similarRes.data);
                setIsFavorited(favStatus);
                setIsWatchlistedState(watchStatus);
                setUserRating(ratingValue);
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [movieId])

    if (loading || !movieDetails) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={[styles.header, { backgroundColor: colors.surface }]}>
                    <Skeleton width="100%" height="100%" borderRadius={0} />
                    <View style={styles.topActions}>
                        <TouchableOpacity style={[styles.iconButton, { backgroundColor: 'rgba(0,0,0,0.6)' }]} onPress={() => navigation.goBack()}>
                            <Ionicons name="arrow-back" size={24} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={[styles.contentContainer, { backgroundColor: colors.background }]}>
                    <Skeleton width="70%" height={38} style={{ marginBottom: 16 }} />
                    
                    <View style={styles.metaRow}>
                        <Skeleton width={60} height={32} borderRadius={16} />
                        <Skeleton width={80} height={32} borderRadius={16} />
                        <Skeleton width={80} height={32} borderRadius={16} />
                    </View>

                    <Skeleton width="90%" height={20} style={{ marginBottom: 24 }} />

                    <Skeleton width={100} height={26} style={{ marginTop: 24, marginBottom: 12 }} />
                    <Skeleton width="100%" height={20} style={{ marginBottom: 8 }} />
                    <Skeleton width="100%" height={20} style={{ marginBottom: 8 }} />
                    <Skeleton width="80%" height={20} style={{ marginBottom: 8 }} />
                    <Skeleton width="90%" height={20} style={{ marginBottom: 16 }} />

                    <Skeleton width="100%" height={80} borderRadius={12} style={{ marginBottom: 24, marginTop: 8 }} />
                </View>
            </View>
        );
    }

    async function handleFavorite() {
        if (!movieDetails) return;

        if (isFavorited) {
            await removeFavorite(movieDetails.id);
            setIsFavorited(false);
        } else {
            await saveFavorite(movieDetails);
            setIsFavorited(true);
        }
    }

    async function handleWatchlist() {
        if (!movieDetails) return;

        if (isWatchlistedState) {
            await removeWatchlist(movieDetails.id);
            setIsWatchlistedState(false);
        } else {
            await saveWatchlist(movieDetails);
            setIsWatchlistedState(true);
        }
    }

    async function handleRate(value: number) {
        await saveRating(movieId, value);
        setUserRating(value);
    }

    async function handleClearRating() {
        await removeRating(movieId);
        setUserRating(null);
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false} bounces={false}>
                <View style={styles.header}>
                    <FallbackImage
                        uri={movieDetails?.imagem || imagem}
                        style={styles.posterImage}
                    />

                    <View style={styles.topActions}>
                        <TouchableOpacity style={[styles.iconButton, { backgroundColor: 'rgba(0,0,0,0.6)' }]} onPress={() => navigation.goBack()}>
                            <Ionicons name="arrow-back" size={24} color="#FFF" />
                        </TouchableOpacity>

                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <TouchableOpacity onPress={toggleTheme} style={[styles.iconButton, { backgroundColor: 'rgba(0,0,0,0.6)' }]} activeOpacity={0.7}>
                                <Ionicons name={theme === 'dark' ? "moon-outline" : "sunny-outline"} size={22} color="#FFF" />
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.iconButton, { backgroundColor: 'rgba(0,0,0,0.6)' }]} onPress={handleWatchlist}>
                                <Ionicons name={isWatchlistedState ? "bookmark" : "bookmark-outline"} size={22} color={isWatchlistedState ? colors.accent : "#FFF"} />
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.iconButton, { backgroundColor: 'rgba(0,0,0,0.6)' }]} onPress={handleFavorite}>
                                <Ionicons name={isFavorited ? "heart" : "heart-outline"} size={24} color={isFavorited ? "#EF4444" : "#FFF"} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <View style={[styles.contentContainer, { backgroundColor: colors.background }]}>
                    <Text style={[styles.title, { color: colors.textPrimary }]}>{movieDetails?.titulo}</Text>

                    <View style={styles.metaRow}>
                        <View style={styles.metaBadge}>
                            <Ionicons name="star" size={16} color={colors.accent} />
                            <Text style={[styles.metaText, { color: colors.textPrimary, fontWeight: 'bold', marginLeft: 4 }]}>
                                {movieDetails?.nota ? movieDetails.nota.toFixed(1) : "N/A"}
                            </Text>
                        </View>

                        <View style={[styles.metaBadge, { backgroundColor: colors.surface }]}>
                            <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
                            <Text style={[styles.metaText, { color: colors.textSecondary, marginLeft: 6 }]}>
                                {movieDetails?.ano.substring(0, 4)}
                            </Text>
                        </View>

                        <View style={[styles.metaBadge, { backgroundColor: colors.surface }]}>
                            <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                            <Text style={[styles.metaText, { color: colors.textSecondary, marginLeft: 6 }]}>
                                {movieDetails?.duracao} min
                            </Text>
                        </View>
                    </View>

                    <Text style={[styles.genres, { color: colors.accent }]}>
                        {movieDetails?.generos?.join(' • ') || "Gênero não informado"}
                    </Text>

                    <View style={[styles.ratingContainer, { backgroundColor: colors.surface }]}>
                        <View style={styles.sectionHeader}>
                            <View style={[styles.sectionAccent, { backgroundColor: colors.accent }]} />
                            <Text style={[styles.ratingLabel, { color: colors.textPrimary }]}>Sua Avaliação</Text>
                        </View>
                        <StarRating
                            rating={userRating}
                            onRate={handleRate}
                            onClear={handleClearRating}
                        />
                    </View>

                    <Text style={[styles.subtitle, { color: colors.textPrimary }]}>Sinopse</Text>
                    <Text style={[styles.overview, { color: colors.textSecondary }]}>{movieDetails?.sinopse}</Text>

                    {movieDetails?.trailer && (
                        <View style={styles.trailerContainer}>
                            <Text style={[styles.subtitle, { color: colors.textPrimary, marginTop: 8 }]}>Trailer Oficial</Text>
                            <View style={styles.youtubeWrapper}>
                                <YoutubeIframe
                                    height={220}
                                    play={playing}
                                    videoId={movieDetails.trailer}
                                    onChangeState={onStateChange}
                                />
                            </View>
                        </View>
                    )}

                    {movieDetails?.diretor && (
                        <View style={[styles.directorContainer, { borderLeftColor: colors.accent, backgroundColor: colors.surface }]}>
                            <Text style={[styles.directorLabel, { color: colors.textSecondary }]}>Direção</Text>
                            <Text style={[styles.directorName, { color: colors.textPrimary }]}>
                                {movieDetails.diretor}
                            </Text>
                        </View>
                    )}

                    {movieDetails?.elenco && movieDetails.elenco.length > 0 && (
                        <>
                            <View style={styles.sectionHeader}>
                                <View style={[styles.sectionAccent, { backgroundColor: colors.accent }]} />
                                <Text style={[styles.subtitle, { color: colors.textPrimary, marginTop: 0 }]}>Elenco</Text>
                            </View>
                            <FlatList
                                horizontal
                                data={movieDetails.elenco}
                                keyExtractor={(item) => String(item.id)}
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{ paddingBottom: 24, marginTop: 8 }}
                                renderItem={({ item }) => (
                                    <View style={styles.castCard}>
                                        <FallbackImage
                                            uri={item.imagem}
                                            style={styles.castImage}
                                            type="actor"
                                        />
                                        <Text numberOfLines={1} style={[styles.castName, { color: colors.textPrimary }]}>{item.nome}</Text>
                                        <Text numberOfLines={1} style={[styles.castCharacter, { color: colors.textSecondary }]}>{item.personagem}</Text>
                                    </View>
                                )}
                            />
                        </>
                    )}

                    {similarMovies && similarMovies.length > 0 && (
                        <>
                            <View style={styles.sectionHeader}>
                                <View style={[styles.sectionAccent, { backgroundColor: colors.accent }]} />
                                <Text style={[styles.subtitle, { color: colors.textPrimary, marginTop: 0 }]}>Títulos Similares</Text>
                            </View>
                            <FlatList
                                horizontal
                                data={similarMovies}
                                keyExtractor={(item) => String(item.id)}
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{ paddingBottom: 60 }}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.similarCard}
                                        onPress={() => navigation.push('details', { movieId: item.id })}
                                        activeOpacity={0.8}
                                    >
                                        <FallbackImage
                                            uri={item.imagem}
                                            style={styles.similarPoster}
                                        />
                                        <Text numberOfLines={2} style={[styles.similarTitle, { color: colors.textPrimary }]}>{item.titulo}</Text>
                                    </TouchableOpacity>
                                )}
                            />
                        </>
                    )}
                </View>
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    scrollContainer: {
        flex: 1,
    },
    header: {
        width: width,
        height: POSTER_HEIGHT,
        position: 'relative',
        backgroundColor: '#000'
    },
    posterImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    topActions: {
        position: 'absolute',
        top: 50,
        left: 20,
        right: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        zIndex: 10
    },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 36,
        marginTop: -40,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        marginBottom: 16,
        letterSpacing: -1,
        lineHeight: 38
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        flexWrap: 'wrap',
        gap: 12
    },
    metaBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    metaText: {
        fontSize: 14,
        fontWeight: '600'
    },
    genres: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 24,
        letterSpacing: 0.5
    },
    subtitle: {
        fontSize: 22,
        fontWeight: '900',
        marginBottom: 12,
        marginTop: 24,
        letterSpacing: -0.5
    },
    overview: {
        fontSize: 16,
        lineHeight: 26,
        marginBottom: 16
    },
    directorContainer: {
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
        marginBottom: 24,
        marginTop: 8
    },
    directorLabel: {
        fontSize: 14,
        marginBottom: 4,
        fontWeight: '600'
    },
    directorName: {
        fontSize: 18,
        fontWeight: '900'
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 16,
    },
    sectionAccent: {
        width: 4,
        height: 24,
        borderRadius: 2,
        marginRight: 10,
    },
    similarCard: {
        width: 120,
        marginRight: 16,
    },
    similarPoster: {
        width: 120,
        height: 180,
        borderRadius: 12,
        marginBottom: 8
    },
    similarTitle: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    castCard: {
        width: 90,
        marginRight: 16,
        alignItems: 'center',
    },
    castImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 8,
    },
    castName: {
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 2
    },
    castCharacter: {
        fontSize: 12,
        textAlign: 'center',
    },
    trailerContainer: {
        marginBottom: 24,
    },
    youtubeWrapper: {
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#000',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    ratingContainer: {
        padding: 16,
        borderRadius: 16,
        marginBottom: 8,
    },
    ratingLabel: {
        fontSize: 18,
        fontWeight: '800',
        marginTop: 0,
        marginBottom: 0,
    },
});