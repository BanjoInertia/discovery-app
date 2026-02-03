import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import api from '../../services/api';
import { Movie } from '../../types/Movie';

export function Search() {
    const [searchText, setSearchText] = useState('');
    const [results, setResults] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(false);

    const navigation = useNavigation();

    useEffect(() => {
        if (searchText === '') {
            setResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const response = await api.get('/search/movie', {
                    params: {
                        query: searchText,
                        include_adult: false,
                    }
                });
                setResults(response.data.results);
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        }, 500);

        return () => clearTimeout(timer);

    }, [searchText]);

    return (
        <View style={styles.container}>

            <View style={styles.inputContainer}>
                <TextInput
                    placeholder="Digite o nome do filme..."
                    placeholderTextColor="#888"
                    style={styles.input}
                    value={searchText}
                    onChangeText={setSearchText}
                />
            </View>

            {loading && <ActivityIndicator size="large" color="#FFF" style={{ marginTop: 20 }} />}

            <FlatList
                data={results}
                keyExtractor={item => String(item.id)}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.itemContainer}
                        onPress={() => navigation.navigate('details', { movieId: item.id })}
                    >
                        {item.poster_path && (
                            <Image
                                source={{ uri: `https://image.tmdb.org/t/p/w200${item.poster_path}` }}
                                style={styles.poster}
                            />
                        )}

                        <View style={styles.textContainer}>
                            <Text style={styles.title}>{item.title}</Text>
                            <Text style={styles.year}>
                                {item.release_date ? item.release_date.substring(0, 4) : '-'}
                            </Text>
                        </View>
                    </TouchableOpacity>
                )}

                ListEmptyComponent={() => (
                    searchText.length > 0 && !loading ?
                        <Text style={styles.emptyText}>Nenhum filme encontrado.</Text> : null
                )}
            />

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
        padding: 16,
    },
    inputContainer: {
        marginTop: 20,
        marginBottom: 20,
    },
    input: {
        height: 50,
        backgroundColor: '#333',
        borderRadius: 8,
        color: '#FFF',
        paddingHorizontal: 16,
        fontSize: 16
    },
    itemContainer: {
        flexDirection: 'row',
        marginBottom: 16,
        alignItems: 'center',
        backgroundColor: '#1E1E1E',
        borderRadius: 8,
        padding: 8
    },
    poster: {
        width: 60,
        height: 90,
        borderRadius: 4,
        marginRight: 12
    },
    textContainer: {
        flex: 1
    },
    title: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold'
    },
    year: {
        color: '#BBB',
        marginTop: 4
    },
    emptyText: {
        color: '#FFF',
        textAlign: 'center',
        marginTop: 20
    }
});