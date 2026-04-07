import { useEffect, useState } from "react";
import { View, FlatList, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Movie } from '../../types/Movie';
import api from "../../services/api";
import { useNavigation } from "@react-navigation/native";

export function Home() {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [nowPlaying, setNowPlaying] = useState<Movie[]>([]);
    const [genres, setGenres] = useState<{id: number, name: string}[]>([]);
    const [selectedGenre, setSelectedGenre] = useState<number>(0);
    const navigation = useNavigation<any>()

    useEffect(() => {
        async function fetchInitialData() {
            try {
                const [cartazRes, generosRes] = await Promise.all([
                    api.get('/api/filmes/cartaz'),
                    api.get('/api/generos')
                ]);
                setNowPlaying(cartazRes.data);
                setGenres([{id: 0, name: "Todos"}, ...generosRes.data]);
            } catch (error: any) {
                console.log("Erro ao inicializar:", error.message);
            }
        }
        fetchInitialData();
    }, []);

    useEffect(() => {
        async function fetchMovies() {
            try {
                const url = selectedGenre === 0 
                    ? '/api/filmes' 
                    : `/api/filmes?genero_id=${selectedGenre}`;
                const response = await api.get(url);
                setMovies(response.data);
            } catch (error: any) {
                console.log("Erro ao buscar populares:", error.message);
            }
        }
        fetchMovies();
    }, [selectedGenre]);

    async function handleSurprise() {
        try {
            const response = await api.get('/api/surpresa');
            const { id } = response.data;

            navigation.navigate('details', { movieId: id });
        } catch (error) {
            console.log("Erro na roleta:", error);
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>O que vamos assistir?</Text>

                <View style={{ flexDirection: 'row', gap: 15 }}>
                    <TouchableOpacity onPress={handleSurprise}>
                        <Text style={{ fontSize: 24 }}>🎲</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate('favorites')}>
                        <Text style={{ fontSize: 24 }}>❤️</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate('search')}>
                        <Text style={{ fontSize: 24 }}>🔍</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <FlatList
                data={movies}
                keyExtractor={(item) => String(item.id)}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={() => (
                    <View style={{ marginBottom: 16 }}>
                        {nowPlaying.length > 0 && (
                            <>
                                <Text style={styles.sectionTitle}>Em Cartaz</Text>
                                <FlatList
                                    data={nowPlaying}
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    keyExtractor={(item) => String(item.id)}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity 
                                            style={styles.nowPlayingCard}
                                            onPress={() => navigation.navigate('details', { movieId: item.id })}
                                        >
                                            <Image 
                                                source={{ uri: item.imagem || 'https://via.placeholder.com/150x225?text=Sem+Capa' }}
                                                style={styles.nowPlayingPoster}
                                            />
                                        </TouchableOpacity>
                                    )}
                                />
                            </>
                        )}
                        <Text style={[styles.sectionTitle, { marginTop: 24, marginBottom: 16 }]}>Categorias</Text>
                        <FlatList
                            data={genres}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(item) => String(item.id)}
                            renderItem={({ item }) => (
                                <TouchableOpacity 
                                    style={[
                                        styles.genrePill, 
                                        selectedGenre === item.id && styles.genrePillActive
                                    ]}
                                    onPress={() => setSelectedGenre(item.id)}
                                >
                                    <Text style={[
                                        styles.genreText,
                                        selectedGenre === item.id && styles.genreTextActive
                                    ]}>{item.name}</Text>
                                </TouchableOpacity>
                            )}
                        />

                        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Populares</Text>
                    </View>
                )}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => navigation.navigate('details', { movieId: item.id })}
                    >
                        <Image
                            source={{ uri: item.imagem || 'https://via.placeholder.com/150x225?text=Sem+Capa' }}
                            style={styles.poster}
                        />
                        <View>
                            <Text style={styles.title}>{item.titulo}</Text>
                            <Text style={styles.vote}>
                                ⭐ {item.nota ? item.nota.toFixed(1) : "N/A"}
                            </Text>
                        </View>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFF'
    },
    container: {
        flex: 1,
        backgroundColor: '#121212',
        paddingTop: 50,
        paddingHorizontal: 10
    },
    card: {
        flexDirection: 'row',
        marginBottom: 16,
        backgroundColor: '#1E1E1E',
        borderRadius: 8,
        overflow: 'hidden',
        alignItems: 'center'
    },
    poster: {
        width: 100,
        height: 150,
        resizeMode: 'cover',
        marginRight: 12
    },
    title: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 18,
        marginBottom: 4,
        flexShrink: 1
    },
    vote: {
        color: '#BBB'
    },
    sectionTitle: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12
    },
    nowPlayingCard: {
        marginRight: 16,
    },
    nowPlayingPoster: {
        width: 120,
        height: 180,
        borderRadius: 8,
    },
    genrePill: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#2A2A2A',
        borderRadius: 20,
        marginRight: 12,
    },
    genrePillActive: {
        backgroundColor: '#EAB308',
    },
    genreText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    genreTextActive: {
        color: '#121212',
    }
});