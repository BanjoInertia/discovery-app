import AsyncStorage from '@react-native-async-storage/async-storage';
import { Movie } from '../types/Movie';

const STORAGE_KEY = '@cineexplorer:favorites';

export async function getFavorites(): Promise<Movie[]> {
    const storage = await AsyncStorage.getItem(STORAGE_KEY);
    return storage ? JSON.parse(storage) : [];
}

export async function saveFavorite(movie: Movie): Promise<void> {
    const movies = await getFavorites();
    const hasMovie = movies.some(item => item.id === movie.id);
    if (hasMovie) return;

    const newMovies = [...movies, movie];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newMovies));
}

export async function removeFavorite(movieId: number): Promise<void> {
    const movies = await getFavorites();
    const newMovies = movies.filter(item => item.id !== movieId);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newMovies));
}

export async function isFavorite(movieId: number): Promise<boolean> {
    const movies = await getFavorites();
    return movies.some(item => item.id === movieId);
}