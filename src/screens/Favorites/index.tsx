import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import { getFavorites } from '../../services/storage';
import { Movie } from '../../types/Movie';

export function Favorites() {
    const [movies, setMovies] = useState<Movie[]>([]);
    const navigation = useNavigation();

    useFocusEffect(useCallback(() => {
        async function loadFavorites() {
            const data = await getFavorites();
            setMovies(data);
        }

        loadFavorites();
    }, []));

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Meus Favoritos</Text>

            {movies.length === 0 && (
                <Text style={styles.emptyText}>Você ainda não tem filmes favoritos</Text>
            )}

            <FlatList
                data={movies}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => navigation.navigate('details', { movieId: item.id })}
                    >
                        <Image
                            source={{ uri: item.imagem || 'https://via.placeholder.com/80x120?text=Sem+Imagem' }}
                            style={styles.poster}
                        />
                        <View style={{ flex: 1, justifyContent: 'center' }}>
                            <Text style={styles.movieTitle}>{item.titulo}</Text>
                            <Text style={styles.movieRate}>
                                ⭐ {item.nota ? item.nota.toFixed(1) : "N/A"}/10
                            </Text>
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
        backgroundColor: '#121212',
        padding: 24,
    },
    title: {
        color: '#FFF',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 24,
    },
    emptyText: {
        color: '#FFF',
        textAlign: 'center',
        marginTop: 50,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#1E1E1E',
        marginBottom: 12,
        borderRadius: 8,
        overflow: 'hidden'
    },
    poster: {
        width: 80,
        height: 120,
        resizeMode: 'cover',
        marginRight: 12
    },
    movieTitle: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    movieRate: {
        color: '#EAB308',
        marginTop: 8
    }
});