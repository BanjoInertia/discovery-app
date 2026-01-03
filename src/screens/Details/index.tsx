import { useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native'
import { Movie } from '../../types/Movie';
import api from '../../services/api';

type ParamsProps = {
    movieId: number;
}

export function Details() {
    const route = useRoute();
    const { movieId } = route.params as ParamsProps;

    const [movieDetails, setMovieDetails] = useState<Movie | null>(null);

    useEffect(() => {
        async function fetchMovieById() {
            try {
                const response = await api.get(`/movie/${movieId}`);
                setMovieDetails(response.data);

                console.log(response.data);
            } catch (error) {
                console.log(error);
            }
        }

        fetchMovieById();
    }, [movieId])

    if (!movieDetails) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Carregando...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Image
                    source={{ uri: `https://image.tmdb.org/t/p/w500${movieDetails?.poster_path}` }}
                    style={styles.posterImage}
                />
            </View>

            <ScrollView style={styles.contentContainer}>
                <Text style={styles.title}>{movieDetails?.title}</Text>

                <View style={styles.ratingContainer}>
                    <Text style={styles.rating}>⭐ {movieDetails?.vote_average.toFixed(1)}/10</Text>
                </View>

                <Text style={styles.subtitle}>Sinopse</Text>
                <Text style={styles.overview}>{movieDetails?.overview}</Text>
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
    }
});