export type SudokuGrid = (number | null)[][];
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Hint {
  row: number;
  col: number;
  value: number;
  explanation: string;
}

// FIX: Added AspectRatio type to fix import error in ImageGenerator.tsx.
export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
