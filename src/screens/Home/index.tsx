import { useEffect, useState, useRef, useCallback } from "react";
import { View, FlatList, Text, StyleSheet, Image, TouchableOpacity, Dimensions, ActivityIndicator, Animated, RefreshControl } from "react-native";
import { Movie } from '../../types/Movie';
import api from "../../services/api";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { FallbackImage } from '../../components/FallbackImage';
import { Skeleton } from '../../components/Skeleton';

const { width } = Dimensions.get('window');
const COLUMN_GAP = 12;
const CARD_WIDTH = (width - 32 - COLUMN_GAP) / 2;

export function Home() {
    const { theme, colors, toggleTheme } = useTheme();
    const [movies, setMovies] = useState<Movie[]>([]);
    const [nowPlaying, setNowPlaying] = useState<Movie[]>([]);
    const [bestRated, setBestRated] = useState<Movie[]>([]);
    const [genres, setGenres] = useState<{ id: number, name: string }[]>([]);
    const [selectedGenre, setSelectedGenre] = useState<number>(0);
    const [selectedDecade, setSelectedDecade] = useState<number>(0);
    const [page, setPage] = useState(1);
    const [loadingMore, setLoadingMore] = useState(false);
    const [filterLoading, setFilterLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const navigation = useNavigation<any>();

    const scrollY = useRef(new Animated.Value(0)).current;

    const headerTranslateY = scrollY.interpolate({
        inputRange: [0, 64],
        outputRange: [0, -64],
        extrapolate: 'clamp',
    });

    useEffect(() => {
        async function fetchInitialData() {
            try {
                const [cartazRes, generosRes, melhoresRes] = await Promise.all([
                    api.get('/api/filmes/cartaz'),
                    api.get('/api/generos'),
                    api.get('/api/filmes/melhores')
                ]);
                setNowPlaying(cartazRes.data);
                setGenres([{ id: 0, name: "Todos" }, ...generosRes.data]);
                setBestRated(melhoresRes.data);
            } catch (error: any) {
                console.log("Erro ao inicializar:", error.message);
            } finally {
                setInitialLoading(false);
            }
        }
        fetchInitialData();
    }, []);

    const decades = [
        { id: 0, label: 'Todas' },
        { id: 2020, label: '2020s' },
        { id: 2010, label: '2010s' },
        { id: 2000, label: '2000s' },
        { id: 1990, label: '90s' },
        { id: 1980, label: '80s' },
        { id: 1970, label: '70s' },
    ];

    useEffect(() => {
        async function fetchMovies() {
            try {
                if (page === 1) setFilterLoading(true);
                if (page > 1) setLoadingMore(true);
                let url = `/api/filmes?pagina=${page}`;
                if (selectedGenre !== 0) url += `&genero_id=${selectedGenre}`;
                if (selectedDecade !== 0) url += `&decada=${selectedDecade}`;
                const response = await api.get(url);
                if (page === 1) {
                    setMovies(response.data);
                } else {
                    setMovies(prev => [...prev, ...response.data]);
                }
            } catch (error: any) {
                console.log("Erro ao buscar populares:", error.message);
            } finally {
                setLoadingMore(false);
                setFilterLoading(false);
            }
        }
        fetchMovies();
    }, [selectedGenre, selectedDecade, page]);

    async function handleSurprise() {
        try {
            const response = await api.get('/api/surpresa');
            const { id } = response.data;
            navigation.navigate('details', { movieId: id });
        } catch (error) {
            console.log("Erro na roleta:", error);
        }
    }

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            const [cartazRes, melhoresRes] = await Promise.all([
                api.get('/api/filmes/cartaz'),
                api.get('/api/filmes/melhores')
            ]);
            setNowPlaying(cartazRes.data);
            setBestRated(melhoresRes.data);
            setPage(1);
            let url = `/api/filmes?pagina=1`;
            if (selectedGenre !== 0) url += `&genero_id=${selectedGenre}`;
            if (selectedDecade !== 0) url += `&decada=${selectedDecade}`;
            const moviesRes = await api.get(url);
            setMovies(moviesRes.data);
        } catch (error: any) {
            console.log("Erro no refresh:", error.message);
        } finally {
            setRefreshing(false);
        }
    }, [selectedGenre, selectedDecade]);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 60, backgroundColor: colors.background, zIndex: 30 }} />

            <Animated.View style={{
                position: 'absolute',
                top: 60,
                left: 0,
                right: 0,
                zIndex: 20,
                backgroundColor: colors.background,
                paddingHorizontal: 16,
                paddingBottom: 16,
                transform: [{ translateY: headerTranslateY }]
            }}>
                <View style={{ marginBottom: 16 }}>
                    <Text style={[styles.greetingText, { color: colors.textSecondary }]}>Bem-vindo ao seu</Text>
                    <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Acervo Cinematográfico</Text>
                </View>

                <View style={styles.iconContainer}>
                    <View style={styles.iconWrapper}>
                        <TouchableOpacity onPress={toggleTheme} style={[styles.iconButton, { backgroundColor: colors.surface }]} activeOpacity={0.7}>
                            <Ionicons name={theme === 'dark' ? "moon-outline" : "sunny-outline"} size={25} color={colors.icon} />
                        </TouchableOpacity>
                        <Text style={[styles.iconLabel, { color: colors.textSecondary }]}>Tema</Text>
                    </View>

                    <View style={styles.iconWrapper}>
                        <TouchableOpacity onPress={handleSurprise} style={[styles.iconButton, { backgroundColor: colors.surface }]} activeOpacity={0.7}>
                            <Ionicons name="dice-outline" size={25} color={colors.icon} />
                        </TouchableOpacity>
                        <Text style={[styles.iconLabel, { color: colors.textSecondary }]}>Roleta</Text>
                    </View>

                    <View style={styles.iconWrapper}>
                        <TouchableOpacity onPress={() => navigation.navigate('watchlist')} style={[styles.iconButton, { backgroundColor: colors.surface }]} activeOpacity={0.7}>
                            <Ionicons name="bookmark-outline" size={25} color={colors.icon} />
                        </TouchableOpacity>
                        <Text style={[styles.iconLabel, { color: colors.textSecondary }]}>Reserva</Text>
                    </View>

                    <View style={styles.iconWrapper}>
                        <TouchableOpacity onPress={() => navigation.navigate('favorites')} style={[styles.iconButton, { backgroundColor: colors.surface }]} activeOpacity={0.7}>
                            <Ionicons name="heart-outline" size={25} color={colors.icon} />
                        </TouchableOpacity>
                        <Text style={[styles.iconLabel, { color: colors.textSecondary }]}>Favoritos</Text>
                    </View>

                    <View style={styles.iconWrapper}>
                        <TouchableOpacity onPress={() => navigation.navigate('search')} style={[styles.iconButton, { backgroundColor: colors.surface }]} activeOpacity={0.7}>
                            <Ionicons name="search-outline" size={25} color={colors.icon} />
                        </TouchableOpacity>
                        <Text style={[styles.iconLabel, { color: colors.textSecondary }]}>Buscar</Text>
                    </View>

                    <View style={styles.iconWrapper}>
                        <TouchableOpacity onPress={() => navigation.navigate('profile')} style={[styles.iconButton, { backgroundColor: colors.surface }]} activeOpacity={0.7}>
                            <Ionicons name="person-outline" size={25} color={colors.icon} />
                        </TouchableOpacity>
                        <Text style={[styles.iconLabel, { color: colors.textSecondary }]}>Perfil</Text>
                    </View>
                </View>
            </Animated.View>

            <Animated.FlatList
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true }
                )}
                scrollEventThrottle={16}
                data={filterLoading ? [] : movies}
                keyExtractor={(item, index) => String(item.id) + '-' + index}
                showsVerticalScrollIndicator={false}
                numColumns={2}
                columnWrapperStyle={styles.columnWrapper}
                contentContainerStyle={{ paddingTop: 250, paddingHorizontal: 16, paddingBottom: 100 }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor={colors.accent}
                        colors={[colors.accent]}
                        progressViewOffset={250}
                    />
                }
                onEndReached={() => {
                    if (!loadingMore && movies.length >= 20) {
                        setPage(prev => prev + 1);
                    }
                }}
                onEndReachedThreshold={0.5}
                ListFooterComponent={() => loadingMore ? (
                    <View style={{ paddingVertical: 24 }}>
                        <ActivityIndicator size="large" color={colors.accent} />
                    </View>
                ) : <View style={{ height: 40 }} />}
                ListHeaderComponent={(
                    <View style={{ marginBottom: 16 }}>
                        {initialLoading ? (
                            <>
                                <View style={[styles.sectionHeader, { marginTop: 0 }]}>
                                    <Skeleton width={150} height={24} />
                                </View>
                                <View style={{ flexDirection: 'row' }}>
                                    <Skeleton width={220} height={330} borderRadius={16} style={{ marginRight: 16 }} />
                                    <Skeleton width={220} height={330} borderRadius={16} style={{ marginRight: 16 }} />
                                </View>

                                <View style={[styles.sectionHeader, { marginTop: 48 }]}>
                                    <Skeleton width={200} height={24} />
                                </View>
                                <View style={{ flexDirection: 'row' }}>
                                    <Skeleton width={130} height={195} borderRadius={12} style={{ marginRight: 12 }} />
                                    <Skeleton width={130} height={195} borderRadius={12} style={{ marginRight: 12 }} />
                                    <Skeleton width={130} height={195} borderRadius={12} style={{ marginRight: 12 }} />
                                </View>

                                <View style={[styles.sectionHeader, { marginTop: 48, marginBottom: 16 }]}>
                                    <Skeleton width={180} height={24} />
                                </View>
                                <View style={{ flexDirection: 'row' }}>
                                    <Skeleton width={100} height={40} borderRadius={24} style={{ marginRight: 12 }} />
                                    <Skeleton width={80} height={40} borderRadius={24} style={{ marginRight: 12 }} />
                                    <Skeleton width={120} height={40} borderRadius={24} style={{ marginRight: 12 }} />
                                </View>

                                <Skeleton width={150} height={20} style={{ marginTop: 24 }} />
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
                                    <Skeleton width={CARD_WIDTH} height={CARD_WIDTH * 1.5} borderRadius={12} />
                                    <Skeleton width={CARD_WIDTH} height={CARD_WIDTH * 1.5} borderRadius={12} />
                                </View>
                            </>
                        ) : (
                            <>
                                {nowPlaying.length > 0 && (
                                    <>
                                        <View style={[styles.sectionHeader, { marginTop: 0 }]}>
                                            <View style={[styles.sectionAccent, { backgroundColor: colors.accent }]} />
                                            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Em Cartaz</Text>
                                        </View>
                                        <FlatList
                                            data={nowPlaying}
                                            horizontal
                                            showsHorizontalScrollIndicator={false}
                                            keyExtractor={(item) => String(item.id)}
                                            snapToInterval={220 + 16}
                                            decelerationRate="fast"
                                            renderItem={({ item }) => (
                                                <TouchableOpacity
                                                    style={styles.heroCard}
                                                    onPress={() => navigation.navigate('details', { movieId: item.id, imagem: item.imagem })}
                                                    activeOpacity={0.8}
                                                >
                                                    <FallbackImage
                                                        uri={item.imagem}
                                                        style={styles.heroPoster}
                                                    />
                                                    <LinearGradient
                                                        colors={['transparent', 'rgba(0,0,0,0.8)', '#000']}
                                                        style={styles.heroGradient}
                                                    />
                                                    <View style={styles.heroTextContainer}>
                                                        <Text numberOfLines={2} style={styles.heroTitle}>{item.titulo}</Text>
                                                        <Text style={styles.heroVote}>⭐ {item.nota ? item.nota.toFixed(1) : "N/A"}</Text>
                                                    </View>
                                                </TouchableOpacity>
                                            )}
                                        />
                                    </>
                                )}
                                {bestRated.length > 0 && (
                                    <>
                                        <View style={[styles.sectionHeader, { marginTop: 48 }]}>
                                            <View style={[styles.sectionAccent, { backgroundColor: colors.accent }]} />
                                            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Melhores Avaliados</Text>
                                        </View>
                                        <FlatList
                                            data={bestRated}
                                            horizontal
                                            showsHorizontalScrollIndicator={false}
                                            keyExtractor={(item) => String(item.id)}
                                            renderItem={({ item }) => (
                                                <TouchableOpacity
                                                    style={styles.nowPlayingCard}
                                                    onPress={() => navigation.navigate('details', { movieId: item.id, imagem: item.imagem })}
                                                    activeOpacity={0.8}
                                                >
                                                    <FallbackImage
                                                        uri={item.imagem}
                                                        style={styles.nowPlayingPoster}
                                                    />
                                                </TouchableOpacity>
                                            )}
                                        />
                                    </>
                                )}

                                <View style={[styles.sectionHeader, { marginTop: 48, marginBottom: 16 }]}>
                                    <View style={[styles.sectionAccent, { backgroundColor: colors.accent }]} />
                                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Navegue por Categoria</Text>
                                </View>
                                <FlatList
                                    data={genres}
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    keyExtractor={(item) => String(item.id)}
                                    renderItem={({ item }) => {
                                        const isActive = selectedGenre === item.id;
                                        return (
                                            <TouchableOpacity
                                                style={[
                                                    styles.genrePill,
                                                    { backgroundColor: isActive ? colors.accent : colors.surface }
                                                ]}
                                                onPress={() => {
                                                    if (selectedGenre !== item.id) {
                                                        setSelectedGenre(item.id);
                                                        setPage(1);
                                                    }
                                                }}
                                                activeOpacity={0.8}
                                            >
                                                <Text style={[
                                                    styles.genreText,
                                                    {
                                                        color: isActive ? '#000' : colors.textSecondary,
                                                        fontWeight: isActive ? 'bold' : '600'
                                                    }
                                                ]}>{item.name}</Text>
                                            </TouchableOpacity>
                                        );
                                    }}
                                />

                                <View style={[styles.sectionHeader, { marginTop: 24, marginBottom: 16 }]}>
                                    <View style={[styles.sectionAccent, { backgroundColor: colors.accent }]} />
                                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Por Década</Text>
                                </View>
                                <FlatList
                                    data={decades}
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    keyExtractor={(item) => String(item.id)}
                                    renderItem={({ item }) => {
                                        const isActive = selectedDecade === item.id;
                                        return (
                                            <TouchableOpacity
                                                style={[
                                                    styles.genrePill,
                                                    { backgroundColor: isActive ? colors.accent : colors.surface }
                                                ]}
                                                onPress={() => {
                                                    if (selectedDecade !== item.id) {
                                                        setSelectedDecade(item.id);
                                                        setPage(1);
                                                    }
                                                }}
                                                activeOpacity={0.8}
                                            >
                                                <Text style={[
                                                    styles.genreText,
                                                    {
                                                        color: isActive ? '#000' : colors.textSecondary,
                                                        fontWeight: isActive ? 'bold' : '600'
                                                    }
                                                ]}>{item.label}</Text>
                                            </TouchableOpacity>
                                        );
                                    }}
                                />

                                <Text style={[styles.sectionSubtitle, { marginTop: 24, color: colors.textSecondary }]}>Resultados Populares</Text>

                                {filterLoading && (
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                                        <Skeleton width={CARD_WIDTH} height={CARD_WIDTH * 1.5} borderRadius={12} />
                                        <Skeleton width={CARD_WIDTH} height={CARD_WIDTH * 1.5} borderRadius={12} />
                                    </View>
                                )}
                            </>
                        )}
                    </View>
                )}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.gridCard}
                        onPress={() => navigation.navigate('details', { movieId: item.id, imagem: item.imagem })}
                        activeOpacity={0.8}
                    >
                        <FallbackImage
                            uri={item.imagem}
                            style={styles.gridPoster}
                        />
                        <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.7)', '#000']}
                            style={styles.gridGradient}
                        />
                        <View style={styles.gridTextContainer}>
                            <Text numberOfLines={2} style={styles.gridTitle}>{item.titulo}</Text>
                        </View>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    greetingText: {
        fontSize: 14,
        marginBottom: 4,
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: '900',
        letterSpacing: -0.5
    },
    iconContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    iconWrapper: {
        alignItems: 'center',
        width: 60,
    },
    iconButton: {
        width: 60,
        height: 60,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    iconLabel: {
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionAccent: {
        width: 4,
        height: 24,
        borderRadius: 2,
        marginRight: 10,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '900',
        letterSpacing: -0.5
    },
    sectionSubtitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 16,
        letterSpacing: -0.5
    },
    heroCard: {
        width: 220,
        height: 330,
        marginRight: 16,
        borderRadius: 16,
        overflow: 'hidden',
    },
    heroPoster: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    heroGradient: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        height: '50%',
    },
    heroTextContainer: {
        position: 'absolute',
        bottom: 16,
        left: 16,
        right: 16,
    },
    heroTitle: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    heroVote: {
        color: '#EAB308',
        fontSize: 14,
        fontWeight: 'bold'
    },
    nowPlayingCard: {
        marginRight: 12,
    },
    nowPlayingPoster: {
        width: 130,
        height: 195,
        borderRadius: 12,
    },
    genrePill: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 24,
        marginRight: 12,
    },
    genreText: {
        fontSize: 14,
    },
    columnWrapper: {
        justifyContent: 'space-between',
        marginBottom: COLUMN_GAP,
    },
    gridCard: {
        width: CARD_WIDTH,
        height: CARD_WIDTH * 1.5,
        borderRadius: 12,
        overflow: 'hidden',
    },
    gridPoster: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    gridGradient: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        height: '50%',
    },
    gridTextContainer: {
        position: 'absolute',
        bottom: 12,
        left: 12,
        right: 12,
    },
    gridTitle: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
    }
});