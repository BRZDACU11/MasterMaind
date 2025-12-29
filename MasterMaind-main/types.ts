
export type Color = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange';

export interface Feedback {
  black: number; // Correct color, correct position
  white: number; // Correct color, wrong position
}

export interface GuessResult {
  guess: (Color | null)[];
  feedback: Feedback | null;
}

export enum GameStatus {
  PLAYING = 'playing',
  WON = 'won',
  LOST = 'lost'
}

export interface GameState {
  history: GuessResult[];
  solution: Color[];
  status: GameStatus;
  currentTurn: number;
}
