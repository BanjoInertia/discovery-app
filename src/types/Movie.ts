export interface Movie {
    id: number;
    titulo: string;
    nota: number;
    sinopse: string;
    imagem: string | null;
    ano: string;
    duracao?: number;
    generos?: string[];
    diretor?: string;
}

export interface MovieResponse {
    results: Movie[];
}