
import { Color } from './types';

export const COLORS: Color[] = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];

export const COLOR_MAP: Record<Color, string> = {
  red: 'bg-rose-500 shadow-rose-500/50',
  blue: 'bg-blue-500 shadow-blue-500/50',
  green: 'bg-emerald-500 shadow-emerald-500/50',
  yellow: 'bg-amber-400 shadow-amber-400/50',
  purple: 'bg-violet-500 shadow-violet-500/50',
  orange: 'bg-orange-500 shadow-orange-500/50',
};

export const MAX_ATTEMPTS = 10;
export const CODE_LENGTH = 4;
