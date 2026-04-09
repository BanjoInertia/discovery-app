import os
import requests
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import random
from cachetools import TTLCache

load_dotenv()
API_KEY = os.getenv("TMDB_API_KEY")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

cache = TTLCache(maxsize=256, ttl=300)

TMDB_BASE = "https://api.themoviedb.org/3"


def tmdb_get(path: str, params: dict = {}) -> dict:
    cache_key = f"{path}|{sorted(params.items())}"
    if cache_key in cache:
        return cache[cache_key]

    params["api_key"] = API_KEY
    params["language"] = "pt-BR"
    resp = requests.get(f"{TMDB_BASE}{path}", params=params)
    data = resp.json()
    cache[cache_key] = data
    return data


def poster_url(path, size="w500"):
    return f"https://image.tmdb.org/t/p/{size}{path}" if path else None


@app.get("/api/filmes")
def get_filmes(genero_id: int = None, pagina: int = 1, decada: int = None):
    if genero_id or decada:
        params = {
            "sort_by": "popularity.desc",
            "page": pagina
        }
        if genero_id:
            params["with_genres"] = genero_id
        if decada:
            params["primary_release_date.gte"] = f"{decada}-01-01"
            params["primary_release_date.lte"] = f"{decada + 9}-12-31"
        dados = tmdb_get("/discover/movie", params)
    else:
        dados = tmdb_get("/movie/popular", {"page": pagina})

    return [
        {
            "id": f.get("id"),
            "titulo": f.get("title"),
            "nota": f.get("vote_average"),
            "sinopse": f.get("overview"),
            "imagem": poster_url(f.get("poster_path")),
        }
        for f in dados.get("results", [])
    ]


@app.get("/api/pesquisa")
def pesquisar_filmes(nome: str, pagina: int = 1):
    dados = tmdb_get("/search/movie", {"query": nome, "page": pagina})

    return [
        {
            "id": f.get("id"),
            "titulo": f.get("title"),
            "ano": f.get("release_date")[:4] if f.get("release_date") else "N/A",
            "imagem": poster_url(f.get("poster_path"), "w200"),
        }
        for f in dados.get("results", [])
    ]


@app.get("/api/generos")
def get_generos():
    dados = tmdb_get("/genre/movie/list")
    return dados.get("genres", [])


@app.get("/api/filmes/cartaz")
def filmes_em_cartaz():
    dados = tmdb_get("/movie/now_playing", {"page": 1})

    return [
        {
            "id": f.get("id"),
            "titulo": f.get("title"),
            "nota": f.get("vote_average"),
            "imagem": poster_url(f.get("poster_path")),
        }
        for f in dados.get("results", [])
    ]


@app.get("/api/filmes/melhores")
def melhores_filmes():
    dados = tmdb_get("/movie/top_rated", {"page": 1})

    return [
        {
            "id": f.get("id"),
            "titulo": f.get("title"),
            "nota": f.get("vote_average"),
            "imagem": poster_url(f.get("poster_path")),
        }
        for f in dados.get("results", [])
    ]


@app.get("/api/filmes/{filme_id}")
def detalhes_filme(filme_id: int):
    f = tmdb_get(f"/movie/{filme_id}", {
        "append_to_response": "credits,videos"
    })

    equipe = f.get("credits", {}).get("crew", [])
    diretores = [p.get("name") for p in equipe if p.get("job") == "Director"]

    elenco_bruto = f.get("credits", {}).get("cast", [])
    elenco = [
        {
            "id": a.get("id"),
            "nome": a.get("name"),
            "personagem": a.get("character"),
            "imagem": poster_url(a.get("profile_path"), "w200"),
        }
        for a in elenco_bruto[:15]
    ]

    videos = f.get("videos", {}).get("results", [])
    trailer_url = None
    for v in videos:
        if v.get("type") == "Trailer" and v.get("site") == "YouTube":
            trailer_url = v.get("key")
            break

    return {
        "id": f.get("id"),
        "titulo": f.get("title"),
        "sinopse": f.get("overview"),
        "nota": f.get("vote_average"),
        "imagem": poster_url(f.get("poster_path")),
        "ano": f.get("release_date")[:4] if f.get("release_date") else "N/A",
        "duracao": f.get("runtime"),
        "generos": [g.get("name") for g in f.get("genres", [])],
        "diretor": ", ".join(diretores),
        "elenco": elenco,
        "trailer": trailer_url,
    }


@app.get("/api/filmes/{filme_id}/similares")
def buscar_similares(filme_id: int):
    dados = tmdb_get(f"/movie/{filme_id}/similar", {"page": 1})

    return [
        {
            "id": f.get("id"),
            "titulo": f.get("title"),
            "nota": f.get("vote_average"),
            "imagem": poster_url(f.get("poster_path"), "w200"),
        }
        for f in dados.get("results", [])[:10]
    ]


@app.get("/api/surpresa")
def filme_aleatorio():
    pagina_aleatoria = random.randint(1, 100)

    dados = tmdb_get("/discover/movie", {
        "sort_by": "popularity.desc",
        "page": pagina_aleatoria
    })
    filmes = dados.get("results", [])

    if not filmes:
        return {"error": "Nenhum filme encontrado"}

    filmes_com_conteudo = [
        f for f in filmes if f.get("poster_path") and f.get("overview")
    ]

    filme_sorteado = random.choice(filmes_com_conteudo)

    return {"id": filme_sorteado.get("id"), "titulo": filme_sorteado.get("title")}
