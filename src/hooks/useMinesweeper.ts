import { useState, useCallback } from 'react';
import { Cell, GameState, CellState } from '../types/minesweeper';

export const useMinesweeper = (rows: number = 16, cols: number = 30, mineCount: number = 99) => {
  const createEmptyBoard = useCallback((): Cell[][] => {
    return Array(rows).fill(null).map((_, row) =>
      Array(cols).fill(null).map((_, col) => ({
        isMine: false,
        neighborMines: 0,
        state: 'hidden' as CellState,
        position: { row, col }
      }))
    );
  }, [rows, cols]);

  const placeMines = useCallback((board: Cell[][], totalMines: number): Cell[][] => {
    const newBoard = board.map(row => row.map(cell => ({ ...cell })));
    const positions: Array<{row: number, col: number}> = [];

    // Get all positions
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        positions.push({ row: r, col: c });
      }
    }

    // Shuffle and place mines
    for (let i = positions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [positions[i], positions[j]] = [positions[j], positions[i]];
    }

    // Place mines in first totalMines positions
    for (let i = 0; i < totalMines && i < positions.length; i++) {
      const { row, col } = positions[i];
      newBoard[row][col].isMine = true;
    }

    return newBoard;
  }, [rows, cols]);

  const calculateNeighbors = useCallback((board: Cell[][]): Cell[][] => {
    const newBoard = board.map(row => row.map(cell => ({ ...cell })));

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!newBoard[r][c].isMine) {
          let count = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = r + dr;
              const nc = c + dc;
              if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && newBoard[nr][nc].isMine) {
                count++;
              }
            }
          }
          newBoard[r][c].neighborMines = count;
        }
      }
    }

    return newBoard;
  }, [rows, cols]);

  const initializeGame = useCallback((state={}): GameState => {
    let board = createEmptyBoard();
    board = placeMines(board, mineCount);
    board = calculateNeighbors(board);

    return {
      board,
      gameStatus: 'playing',
      mineCount,
      flagCount: 0,
      cellsRevealed: 0,
      startTime: Date.now(),
      endTime: null,
      ...state
    };
  }, [createEmptyBoard, placeMines, calculateNeighbors, mineCount]);

  const [gameState, setGameState] = useState<GameState>(initializeGame);

  const revealCell = useCallback((row: number, col: number): boolean => {
    const cell = gameState.board[row][col];
    if (cell.state !== 'hidden') return false;

    const newBoard = gameState.board.map(boardRow =>
      boardRow.map(boardCell => ({ ...boardCell }))
    );

    const toReveal: Array<{row: number, col: number}> = [{ row, col }];
    let cellsRevealed = 0;

    while (toReveal.length > 0) {
      const { row: r, col: c } = toReveal.pop()!;

      if (r < 0 || r >= rows || c < 0 || c >= cols) continue;
      if (newBoard[r][c].state !== 'hidden') continue;

      newBoard[r][c].state = 'revealed';
      cellsRevealed++;

      // If it's a mine, game over
      if (newBoard[r][c].isMine) {
        setGameState(prev => ({
          ...prev,
          board: newBoard,
          gameStatus: 'lost',
          endTime: Date.now()
        }));
        return false;
      }

      // If it has no neighboring mines, reveal neighbors
      if (newBoard[r][c].neighborMines === 0) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            toReveal.push({ row: r + dr, col: c + dc });
          }
        }
      }
    }

    const totalCellsRevealed = gameState.cellsRevealed + cellsRevealed;
    const totalCells = rows * cols;
    const isWon = totalCellsRevealed === totalCells - mineCount;

    setGameState(prev => ({
      ...prev,
      board: newBoard,
      cellsRevealed: totalCellsRevealed,
      gameStatus: isWon ? 'won' : gameState.gameStatus,
      endTime: isWon ? Date.now() : null
    }));

    return true;
  }, [gameState, rows, cols, mineCount]);

  const flagCell = useCallback((row: number, col: number): boolean => {
    const cell = gameState.board[row][col];
    if (cell.state === 'revealed') return false;

    const newBoard = gameState.board.map(boardRow =>
      boardRow.map(boardCell => ({ ...boardCell }))
    );

    const newState = cell.state === 'flagged' ? 'hidden' : 'flagged';
    newBoard[row][col].state = newState;

    const flagDelta = newState === 'flagged' ? 1 : -1;

    setGameState(prev => ({
      ...prev,
      board: newBoard,
      flagCount: prev.flagCount + flagDelta
    }));

    return true;
  }, [gameState]);

  const resetGame = useCallback((state={}) => {
    setGameState(initializeGame(state));
  }, [initializeGame]);

  const pauseGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      gameStatus: prev.gameStatus === 'paused' ? 'playing' : 'paused'
    }));
  }, []);

  return {
    gameState,
    revealCell,
    flagCell,
    resetGame,
    pauseGame,
    rows,
    cols
  };
};