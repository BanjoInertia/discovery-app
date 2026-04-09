import AsyncStorage from '@react-native-async-storage/async-storage';
import { Movie } from '../types/Movie';

const STORAGE_KEY = '@cineexplorer:favorites';
const WATCHLIST_KEY = '@cineexplorer:watchlist';
const ONBOARDING_KEY = '@cineexplorer:onboarding';
const RATINGS_KEY = '@cineexplorer:ratings';

type RatingsMap = { [movieId: number]: number };

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

export async function getWatchlist(): Promise<Movie[]> {
    const storage = await AsyncStorage.getItem(WATCHLIST_KEY);
    return storage ? JSON.parse(storage) : [];
}

export async function saveWatchlist(movie: Movie): Promise<void> {
    const movies = await getWatchlist();
    const hasMovie = movies.some(item => item.id === movie.id);
    if (hasMovie) return;

    const newMovies = [...movies, movie];
    await AsyncStorage.setItem(WATCHLIST_KEY, JSON.stringify(newMovies));
}

export async function removeWatchlist(movieId: number): Promise<void> {
    const movies = await getWatchlist();
    const newMovies = movies.filter(item => item.id !== movieId);
    await AsyncStorage.setItem(WATCHLIST_KEY, JSON.stringify(newMovies));
}

export async function isWatchlisted(movieId: number): Promise<boolean> {
    const movies = await getWatchlist();
    return movies.some(item => item.id === movieId);
}

export async function getHasSeenOnboarding(): Promise<boolean> {
    const storage = await AsyncStorage.getItem(ONBOARDING_KEY);
    return storage === 'true';
}

export async function setHasSeenOnboarding(): Promise<void> {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
}

export async function getAllRatings(): Promise<RatingsMap> {
    const storage = await AsyncStorage.getItem(RATINGS_KEY);
    return storage ? JSON.parse(storage) : {};
}

export async function getRating(movieId: number): Promise<number | null> {
    const ratings = await getAllRatings();
    return ratings[movieId] ?? null;
}

export async function saveRating(movieId: number, rating: number): Promise<void> {
    const ratings = await getAllRatings();
    ratings[movieId] = rating;
    await AsyncStorage.setItem(RATINGS_KEY, JSON.stringify(ratings));
}

export async function removeRating(movieId: number): Promise<void> {
    const ratings = await getAllRatings();
    delete ratings[movieId];
    await AsyncStorage.setItem(RATINGS_KEY, JSON.stringify(ratings));
}