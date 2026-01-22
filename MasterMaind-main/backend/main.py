from fastapi import FastAPI, HTTPException, Body, Path
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Optional
import uuid
import random
import json
import os
import time
from enum import Enum
from logic import calculate_hits, generate_hint

app = FastAPI()

# Odblokowujemy CORS, żeby frontend mógł bez przeszkód gadać z naszym serwerem
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Podstawowe zasady gry - kolory i długość kodu
COLORS = ["red", "blue", "green", "yellow", "orange", "purple"]
CODE_LENGTH = 4

class Difficulty(str, Enum):
    EASY = "easy"       # Brak powtórzeń, 10 prób na start
    NORMAL = "normal"   # Powtórzenia dozwolone, też 10 prób
    HARD = "hard"       # Powtórzenia dozwolone, ale tylko 8 prób!

class GameStatus(str, Enum):
    PLAYING = "playing"
    WON = "won"
    LOST = "lost"

class GameState(BaseModel):
    game_id: str
    secret_code: List[str]
    difficulty: Difficulty
    status: GameStatus = GameStatus.PLAYING
    start_time: float
    end_time: Optional[float] = None
    guesses: List[Dict] = [] 
    max_attempts: int = 10 

# Nasz "magazyn" w pamięci - tu trzymamy wszystkie aktywne sesje gier
GAMES: Dict[str, GameState] = {}

# --- Modele danych (czyli jak wyglądają nasze prośby i odpowiedzi) ---

class StartRequest(BaseModel):
    difficulty: Difficulty = Difficulty.NORMAL

class StartResponse(BaseModel):
    game_id: str
    message: str
    start_time: float
    max_attempts: int

class GuessRequest(BaseModel):
    game_id: str
    guess: List[str]

class GuessResponse(BaseModel):
    black: int
    white: int
    message: str
    status: GameStatus

class HintResponse(BaseModel):
    hint: str

class ScoreEntry(BaseModel):
    name: str = "Anonymous"
    time: float
    attempts: int
    game_id: Optional[str] = None

class RankingResponse(BaseModel):
    ranking: List[ScoreEntry]

@app.post("/start", response_model=StartResponse)
def start_game(request: StartRequest = Body(...)):
    game_id = str(uuid.uuid4())
    max_attempts = 10
    
    if request.difficulty == Difficulty.EASY:
        # Tryb łatwy: kolory się nie powtarzają
        secret_code = random.sample(COLORS, CODE_LENGTH)
        max_attempts = 10
    elif request.difficulty == Difficulty.HARD:
        # Tryb trudny: kolory mogą się powtarzać i mamy mniej czasu (prób)
        secret_code = [random.choice(COLORS) for _ in range(CODE_LENGTH)]
        max_attempts = 8
    else:
        # Tryb normalny: klasyka, powtórzenia dozwolone, 10 prób
        secret_code = [random.choice(COLORS) for _ in range(CODE_LENGTH)]
        max_attempts = 10
    
    game = GameState(
        game_id=game_id,
        secret_code=secret_code,
        difficulty=request.difficulty,
        start_time=time.time(),
        guesses=[],
        max_attempts=max_attempts
    )
    GAMES[game_id] = game
    
    return StartResponse(
        game_id=game_id, 
        message=f"Game started ({request.difficulty} mode)!",
        start_time=game.start_time,
        max_attempts=max_attempts
    )

@app.get("/game/{game_id}", response_model=GameState)
def get_game_state(game_id: str = Path(...)):
    if game_id not in GAMES:
        raise HTTPException(status_code=404, detail="Game not found")
    # W prawdziwej aplikacji nie wysyłalibyśmy kodu do frontendu, 
    # bo ktoś sprytny mógłby go podejrzeć w konsoli (F12).
    # Na razie ufoamy graczom, ale docelowo warto tu zrobić PublicGameState.
    return GAMES[game_id] 

@app.post("/guess", response_model=GuessResponse)
def make_guess(request: GuessRequest):
    game_id = request.game_id
    guess = request.guess

    if game_id not in GAMES:
        raise HTTPException(status_code=404, detail="Game not found")
    
    game = GAMES[game_id]
    
    if game.status != GameStatus.PLAYING:
         raise HTTPException(status_code=400, detail="Game is already over")

    if len(guess) != CODE_LENGTH:
        raise HTTPException(status_code=400, detail=f"Guess must contain exactly {CODE_LENGTH} colors")

    black, white = calculate_hits(game.secret_code, guess)
    
    # Zapisujemy strzał gracza w historii
    guess_entry = {
        "guess": guess,
        "black": black,
        "white": white,
        "timestamp": time.time()
    }
    game.guesses.append(guess_entry)
    
    message = "Keep trying!"
    if black == CODE_LENGTH:
        game.status = GameStatus.WON
        game.end_time = time.time()
        message = "Gratulacje! Złamałeś kod!"
    elif len(game.guesses) >= game.max_attempts: 
        game.status = GameStatus.LOST
        game.end_time = time.time()
        message = "Koniec gry. Skończyły Ci się próby."

    return GuessResponse(
        black=black, 
        white=white, 
        message=message,
        status=game.status
    )

@app.post("/hint", response_model=HintResponse)
def get_hint(game_id: str = Body(..., embed=True)):
    if game_id not in GAMES:
        raise HTTPException(status_code=404, detail="Game not found")
    
    game = GAMES[game_id]
    if game.status != GameStatus.PLAYING:
        raise HTTPException(status_code=400, detail="Game is not active")
        
    hint = generate_hint(game.secret_code)
    return HintResponse(hint=hint)

# --- Ranking Najlepszych Graczy ---
RANKING_FILE = "ranking.json"

def load_ranking() -> List[Dict]:
    try:
        if not os.path.exists(RANKING_FILE):
             return []
        with open(RANKING_FILE, "r") as f:
            data = json.load(f)
            return data
    except Exception:
        return []

def save_ranking(ranking: List[Dict]):
    try:
        with open(RANKING_FILE, "w") as f:
            json.dump(ranking, f, indent=4)
    except Exception as e:
        print(f"Error saving ranking: {e}")

@app.get("/ranking", response_model=RankingResponse)
def get_ranking():
    scores = load_ranking()
    sorted_scores = sorted(scores, key=lambda x: (x['attempts'], x['time']))
    return RankingResponse(ranking=sorted_scores[:10])

@app.post("/ranking", response_model=RankingResponse)
def submit_score(score: ScoreEntry):
    # Sprawdzamy czas gry po stronie serwera, żeby nikt nie oszukiwał ;)
    if score.game_id and score.game_id in GAMES:
        game = GAMES[score.game_id]
        if game.end_time and game.start_time:
            server_time = game.end_time - game.start_time
            # Jeśli czas z frontendu jest inny, nadpisujemy go tym z serwera
            score.time = server_time
            print(f"Zweryfikowano czas dla gry {score.game_id}: {server_time}s")
    
    scores = load_ranking()
    scores.append(score.dict())
    save_ranking(scores)
    
    sorted_scores = sorted(scores, key=lambda x: (x['attempts'], x['time']))
    return RankingResponse(ranking=sorted_scores[:10])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
