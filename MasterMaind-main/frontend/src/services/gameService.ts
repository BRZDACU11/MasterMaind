import { Color, Feedback } from '../types';

// Adres naszego backendu, tu wysyłamy wszystkie zapytania
const API_URL = 'http://localhost:8000';

export const startGameApi = async (difficulty: string = 'normal'): Promise<{ gameId: string, maxAttempts: number }> => {
  const response = await fetch(`${API_URL}/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ difficulty }),
  });
  if (!response.ok) throw new Error('Failed to start game');
  const data = await response.json();
  return { gameId: data.game_id, maxAttempts: data.max_attempts };
};

export const checkGuessApi = async (gameId: string, guess: Color[]): Promise<Feedback> => {
  try {
    const response = await fetch(`${API_URL}/guess`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ game_id: gameId, guess }),
    });
    if (!response.ok) throw new Error("Failed to submit guess");
    const data = await response.json();
    return { black: data.black, white: data.white };
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

export interface ScoreEntry {
  name: string;
  time: number;
  attempts: number;
}

export const getRankingApi = async (): Promise<ScoreEntry[]> => {
  try {
    const response = await fetch(`${API_URL}/ranking`);
    if (!response.ok) throw new Error("Failed to fetch ranking");
    const data = await response.json();
    return data.ranking;
  } catch (error) {
    console.error("API Error:", error);
    return [];
  }
};

export const submitScoreApi = async (name: string, time: number, attempts: number): Promise<ScoreEntry[]> => {
  try {
    const response = await fetch(`${API_URL}/ranking`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, time, attempts }),
    });
    if (!response.ok) throw new Error("Failed to submit score");
    const data = await response.json();
    return data.ranking;
  } catch (error) {
    console.error("API Error:", error);
    return [];
  }
};
