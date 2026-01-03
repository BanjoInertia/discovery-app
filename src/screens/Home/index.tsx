import { useEffect, useState } from "react";
import { View, FlatList, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Movie } from '../../types/Movie';
import api from "../../services/api";
import { useNavigation } from "@react-navigation/native";

export function Home() {
    const [movies, setMovies] = useState<Movie[]>([]);
    const navigation = useNavigation()

    useEffect(() => {
        async function fetchMovies() {
            try {
                const response = await api.get('/movie/popular');
                setMovies(response.data.results);
            } catch (error) {
                console.log(error);
            }
        }

        fetchMovies();
    }, []);

    return (
        <View style={styles.container}>
            <FlatList
                data={movies}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => (
                    <TouchableOpacity 
                        style={styles.card}
                        onPress={() => navigation.navigate('details')}
                    >
                        <Image
                            source={{ uri: `https://image.tmdb.org/t/p/w500${item.poster_path}` }}
                            style={styles.poster}
                        />
                        <View>
                            <Text style={styles.title}>{item.title}</Text>
                            <Text style={styles.vote}>⭐ {item.vote_average}</Text>
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
    }
});