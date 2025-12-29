from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict
import uuid
import random
import json
import os
from logic import calculate_hits

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# In-memory storage for games
# Key: game_id (str), Value: secret_code (List[str])
GAMES: Dict[str, List[str]] = {}

# Available colors
COLORS = ["red", "blue", "green", "yellow", "orange", "purple"]
CODE_LENGTH = 4

class StartResponse(BaseModel):
    game_id: str
    message: str

class GuessRequest(BaseModel):
    game_id: str
    guess: List[str]

class GuessResponse(BaseModel):
    black: int
    white: int
    message: str

@app.post("/start", response_model=StartResponse)
def start_game():
    """
    Starts a new game by generating a random code.
    """
    game_id = str(uuid.uuid4())
    secret_code = [random.choice(COLORS) for _ in range(CODE_LENGTH)]
    GAMES[game_id] = secret_code
    return StartResponse(
        game_id=game_id, 
        message="Game started! Guess the 4-color code."
    )

# Ranking persistence
RANKING_FILE = "ranking.json"

class ScoreEntry(BaseModel):
    name: str = "Anonymous"
    time: float
    attempts: int
    
class RankingResponse(BaseModel):
    ranking: List[ScoreEntry]

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
    # Sort by attempts (asc), then time (asc)
    sorted_scores = sorted(scores, key=lambda x: (x['attempts'], x['time']))
    return RankingResponse(ranking=sorted_scores[:10])

@app.post("/ranking", response_model=RankingResponse)
def submit_score(score: ScoreEntry):
    scores = load_ranking()
    scores.append(score.dict())
    save_ranking(scores)
    
    sorted_scores = sorted(scores, key=lambda x: (x['attempts'], x['time']))
    return RankingResponse(ranking=sorted_scores[:10])

@app.post("/guess", response_model=GuessResponse)
def make_guess(request: GuessRequest):
    """
    Evaluates a guess against the secret code.
    """
    game_id = request.game_id
    guess = request.guess

    if game_id not in GAMES:
        raise HTTPException(status_code=404, detail="Game not found")

    if len(guess) != CODE_LENGTH:
        raise HTTPException(status_code=400, detail=f"Guess must contain exactly {CODE_LENGTH} colors")

    secret_code = GAMES[game_id]
    black, white = calculate_hits(secret_code, guess)
    
    message = "Keep trying!"
    if black == CODE_LENGTH:
        message = "Congratulations! You won!"
        # Optionally cleanup game
        # del GAMES[game_id] 

    return GuessResponse(black=black, white=white, message=message)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
