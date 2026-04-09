export interface Actor {
    id: number;
    nome: string;
    personagem: string;
    imagem: string | null;
}

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
    elenco?: Actor[];
    trailer?: string;
}

export interface MovieResponse {
    results: Movie[];
}