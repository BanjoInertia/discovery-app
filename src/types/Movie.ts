export interface Movie {
    id: number;
    title: string;
    poster_path: string;
    vote_average: number;
    overview: string;
    backdrop_path: string;
    runtime: number;
    release_date: string;
    genres: {
        id: number;
        name: string;
    }[];
    credits?: {
        crew: {
            job: string;
            name: string;
        }[]
    }
}

export interface MovieResponse {
    results: Movie[];
}