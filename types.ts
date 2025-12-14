export interface Question {
  category: string;
  answer: string;
  hint?: string; // Additional context if needed
}

export interface GameState {
  status: 'menu' | 'loading' | 'playing' | 'victory' | 'gameover' | 'completed';
  score: number;
  currentLevel: number;
  timeLeft: number;
  skipsLeft: number;
}

export interface MaskedChar {
  char: string;
  isVisible: boolean;
  isSpace: boolean;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface WordData {
  word: string;
  hint: string;
  category: string;
}