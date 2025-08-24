export type CellState = 'hidden' | 'revealed' | 'flagged';

export interface Cell {
  isMine: boolean;
  neighborMines: number;
  state: CellState;
  position: { row: number; col: number };
}

export interface GameState {
  board: Cell[][];
  gameStatus: 'playing' | 'won' | 'lost' | 'paused';
  mineCount: number;
  flagCount: number;
  cellsRevealed: number;
  startTime: number | null;
  endTime: number | null;
}

export interface MoveResult {
  success: boolean;
  gameOver: boolean;
  cellsRevealed: number;
  wasGuess: boolean;
}

export interface SolverStats {
  totalMoves: number;
  logicalMoves: number;
  guesses: number;
  efficiency: number;
}