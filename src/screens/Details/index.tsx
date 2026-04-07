import { useRoute, useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, FlatList } from 'react-native'
import { saveFavorite, removeFavorite, isFavorite } from '../../services/storage';
import { Movie } from '../../types/Movie';
import api from '../../services/api';

type ParamsProps = {
    movieId: number;
}

export function Details() {
    const route = useRoute();
    const navigation = useNavigation<any>();
    const { movieId } = route.params as ParamsProps;

    const [movieDetails, setMovieDetails] = useState<Movie | null>(null);
    const [similarMovies, setSimilarMovies] = useState<Movie[]>([]);
    const [isFavorited, setIsFavorited] = useState(false);

    useEffect(() => {
        async function fetchMovieById() {
            try {
                const response = await api.get(`/api/filmes/${movieId}`);
                setMovieDetails(response.data);

                console.log(response.data);
            } catch (error) {
                console.log(error);
            }
        }

        async function loadFavoriteStatus() {
            const status = await isFavorite(movieId);
            setIsFavorited(status);
        }

        async function loadData() {
            try {
                const response = await api.get(`/api/filmes/${movieId}`);
                setMovieDetails(response.data);

                const similarRes = await api.get(`/api/filmes/${movieId}/similares`);
                setSimilarMovies(similarRes.data);

            } catch (error) {
                console.log(error);
            }
        }

        loadData();
        fetchMovieById();
        loadFavoriteStatus();
    }, [movieId])

    if (!movieDetails) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Carregando...</Text>
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

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Image
                    source={{ uri: movieDetails?.imagem || 'https://via.placeholder.com/500x750?text=Sem+Imagem' }}
                    style={styles.posterImage}
                />

                <TouchableOpacity
                    style={styles.favoriteButton}
                    onPress={handleFavorite}
                >
                    <Text style={{ fontSize: 30 }}>
                        {isFavorited ? "❤️" : "🤍"}
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.contentContainer}>
                <Text style={styles.title}>{movieDetails?.titulo}</Text>

                <View style={styles.ratingContainer}>
                    <Text style={styles.rating}>
                        ⭐ {movieDetails?.nota ? movieDetails.nota.toFixed(1) : "N/A"}/10
                    </Text>
                </View>

                <View style={styles.infoContainer}>
                    <Text style={styles.infoText}>📅 {movieDetails?.ano.substring(0, 4)}</Text>

                    <Text style={styles.infoText}>⏳ {movieDetails?.duracao} min</Text>
                </View>

                <Text style={styles.genres}>
                    {movieDetails?.generos?.join(', ') || "Gênero não informado"}
                </Text>

                <Text style={styles.subtitle}>Sinopse</Text>
                <Text style={styles.overview}>{movieDetails?.sinopse}</Text>

                <View style={styles.directorContainer}>
                    <Text style={styles.directorLabel}>Direção:</Text>
                    <Text style={styles.directorName}>
                        {movieDetails?.diretor}
                    </Text>
                </View>

                <Text style={styles.subtitle}>Filmes Similares</Text>

                <FlatList
                    horizontal
                    data={similarMovies}
                    keyExtractor={(item) => String(item.id)}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 70 }}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.similarCard}
                            onPress={() => navigation.push('details', { movieId: item.id })}
                        >
                            <Image
                                source={{ uri: item.imagem || 'https://via.placeholder.com/100x150' }}
                                style={styles.similarPoster}
                            />
                            <Text numberOfLines={1} style={styles.similarTitle}>{item.titulo}</Text>
                        </TouchableOpacity>
                    )}
                />
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    header: {
        width: '100%',
        height: 300,
    },
    posterImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
        opacity: 0.8
    },
    favoriteButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        backgroundColor: '#00000080',
        padding: 8,
        borderRadius: 20
    },
    contentContainer: {
        flex: 1,
        padding: 24,
        marginTop: -20,
        backgroundColor: '#121212',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    title: {
        color: '#FFF',
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    ratingContainer: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    rating: {
        color: '#EAB308',
        fontSize: 16,
        fontWeight: 'bold'
    },
    subtitle: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
        marginTop: 16
    },
    overview: {
        color: '#CCCCCC',
        fontSize: 16,
        lineHeight: 24,
        paddingBottom: 40
    },
    infoContainer: {
        flexDirection: 'row',
        marginBottom: 12,
        gap: 16
    },
    infoText: {
        color: '#BBB',
        fontSize: 14
    },
    genres: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 16
    },
    directorContainer: {
        marginTop: 16,
        marginBottom: 24,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8
    },
    directorLabel: {
        color: '#BBB',
        fontSize: 16
    },
    directorName: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold'
    },
    similarCard: {
        width: 110,
        marginLeft: 16,
    },
    similarPoster: {
        width: 100,
        height: 150,
        borderRadius: 8,
    },
    similarTitle: {
        color: '#FFF',
        fontSize: 12,
        marginTop: 5,
        textAlign: 'center',
    },
});