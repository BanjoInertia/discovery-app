import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { FallbackImage } from '../../components/FallbackImage';
import { Skeleton } from '../../components/Skeleton';

import api from '../../services/api';
import { Movie } from '../../types/Movie';

export function Search() {
    const { theme, colors } = useTheme();
    const [searchText, setSearchText] = useState('');
    const [results, setResults] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [loadingMore, setLoadingMore] = useState(false);

    const navigation = useNavigation<any>();

    useEffect(() => {
        if (searchText === '') {
            setResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            if (page === 1) setLoading(true);
            else setLoadingMore(true);
            try {
                const response = await api.get('/api/pesquisa', {
                    params: {
                        nome: searchText,
                        pagina: page
                    }
                });
                if (page === 1) {
                    setResults(response.data);
                } else {
                    setResults(prev => [...prev, ...response.data]);
                }
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
                setLoadingMore(false);
            }
        }, page === 1 ? 500 : 0);

        return () => clearTimeout(timer);

    }, [searchText, page]);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            
            <View style={styles.header}>
                <TouchableOpacity 
                    onPress={() => navigation.goBack()}
                    style={[styles.backButton, { backgroundColor: colors.surface }]}
                >
                    <Ionicons name="chevron-back" size={24} color={colors.icon} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.textPrimary }]}>Buscar</Text>
                <View style={{ width: 45 }} />
            </View>

            <View style={[styles.inputContainer, { backgroundColor: colors.surface }]}>
                <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
                <TextInput
                    placeholder="Filmes, séries, atores..."
                    placeholderTextColor={colors.textSecondary}
                    style={[styles.input, { color: colors.textPrimary }]}
                    value={searchText}
                    onChangeText={(text) => {
                        setSearchText(text);
                        setPage(1);
                    }}
                    autoFocus={true}
                />
                {searchText.length > 0 && (
                    <TouchableOpacity onPress={() => { setSearchText(''); setPage(1); }} style={styles.clearButton}>
                        <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                )}
            </View>

            {loading ? (
                <View style={{ gap: 16 }}>
                    {[1, 2, 3, 4, 5].map((item) => (
                        <View key={item} style={[styles.card, { backgroundColor: colors.surface }]}>
                            <Skeleton width={80} height={120} borderRadius={0} />
                            <View style={styles.cardContent}>
                                <View style={{ flex: 1, paddingRight: 8, justifyContent: 'center' }}>
                                    <Skeleton width="100%" height={18} style={{ marginBottom: 12 }} />
                                    <Skeleton width="40%" height={18} />
                                </View>
                            </View>
                        </View>
                    ))}
                </View>
            ) : searchText === '' ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="search-outline" size={64} color={colors.textSecondary} style={{ marginBottom: 16 }} />
                    <Text style={[styles.emptyStateTitle, { color: colors.textPrimary }]}>O que vamos assistir?</Text>
                    <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                        Digite o nome do filme, série ou gênero que você está procurando.
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={results}
                    keyExtractor={(item, index) => String(item.id) + '-' + index}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    onEndReached={() => {
                        if (!loading && !loadingMore && results.length >= 20) {
                            setPage(prev => prev + 1);
                        }
                    }}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={() => loadingMore ? (
                        <View style={{ paddingVertical: 24 }}>
                            <ActivityIndicator size="large" color={colors.accent} />
                        </View>
                    ) : <View style={{ height: 40 }} />}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[styles.card, { backgroundColor: colors.surface }]}
                            onPress={() => navigation.navigate('details', { movieId: item.id })}
                            activeOpacity={0.8}
                        >
                            <FallbackImage
                                uri={item.imagem}
                                style={styles.poster}
                            />
                            
                            <View style={styles.cardContent}>
                                <View style={{ flex: 1, paddingRight: 8 }}>
                                    <Text numberOfLines={2} style={[styles.movieTitle, { color: colors.textPrimary }]}>
                                        {item.titulo}
                                    </Text>
                                    <View style={styles.metaContainer}>
                                        <Text style={[styles.year, { color: colors.textSecondary }]}>
                                            {item.ano ? item.ano.substring(0, 4) : 'N/A'}
                                        </Text>
                                        <View style={[styles.dot, { backgroundColor: colors.textSecondary }]} />
                                        <Ionicons name="star" size={12} color={colors.accent} />
                                        <Text style={[styles.rate, { color: colors.accent }]}>
                                            {item.nota ? item.nota.toFixed(1) : "N/A"}
                                        </Text>
                                    </View>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                            </View>
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={() => (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="sad-outline" size={64} color={colors.textSecondary} style={{ marginBottom: 16 }} />
                            <Text style={[styles.emptyStateTitle, { color: colors.textPrimary }]}>Nenhum resultado</Text>
                            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                                Não encontramos filmes que correspondam à sua busca "{searchText}".
                            </Text>
                        </View>
                    )}
                />
            )}
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
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 56,
        borderRadius: 16,
        paddingHorizontal: 16,
        marginBottom: 24,
        elevation: 2,
    },
    searchIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        height: '100%',
    },
    clearButton: {
        padding: 4,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
        paddingBottom: 80,
    },
    emptyStateTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptyStateText: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
    },
    card: {
        flexDirection: 'row',
        marginBottom: 16,
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 2,
    },
    poster: {
        width: 80,
        height: 120,
        resizeMode: 'cover',
    },
    cardContent: {
        flex: 1,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    movieTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    metaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    year: {
        fontSize: 14,
        fontWeight: '600',
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
    },
    rate: {
        fontSize: 14,
        fontWeight: 'bold',
        marginLeft: -2,
    }
});