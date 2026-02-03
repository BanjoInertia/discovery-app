import { useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native'
import { saveFavorite, removeFavorite, isFavorite } from '../../services/storage';
import { Movie } from '../../types/Movie';
import api from '../../services/api';

type ParamsProps = {
    movieId: number;
}

export function Details() {
    const route = useRoute();
    const { movieId } = route.params as ParamsProps;

    const [movieDetails, setMovieDetails] = useState<Movie | null>(null);
    const [isFavorited, setIsFavorited] = useState(false);

    useEffect(() => {
        async function fetchMovieById() {
            try {
                const response = await api.get(`/movie/${movieId}?append_to_response=credits`);
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
                    source={{ uri: `https://image.tmdb.org/t/p/w500${movieDetails?.poster_path}` }}
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
                <Text style={styles.title}>{movieDetails?.title}</Text>

                <View style={styles.ratingContainer}>
                    <Text style={styles.rating}>⭐ {movieDetails?.vote_average.toFixed(1)}/10</Text>
                </View>

                <View style={styles.infoContainer}>
                    <Text style={styles.infoText}>📅 {movieDetails?.release_date.substring(0, 4)}</Text>

                    <Text style={styles.infoText}>⏳ {movieDetails?.runtime} min</Text>
                </View>

                <Text style={styles.genres}>
                    {movieDetails?.genres.map(g => g.name).join(', ')}
                </Text>

                <Text style={styles.subtitle}>Sinopse</Text>
                <Text style={styles.overview}>{movieDetails?.overview}</Text>

                <View style={styles.directorContainer}>
                    <Text style={styles.directorLabel}>Direção:</Text>
                    <Text style={styles.directorName}>
                        {movieDetails?.credits?.crew
                            .filter(person => person.job === 'Director')
                            .map(director => director.name)
                            .join(', ')
                        }
                    </Text>
                </View>
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
    }
});