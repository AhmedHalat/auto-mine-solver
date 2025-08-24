import { useState, useCallback, useEffect, useRef } from 'react';
import { Cell, SolverStats } from '../types/minesweeper';

interface SolverMove {
  row: number;
  col: number;
  action: 'reveal' | 'flag';
  confidence: number;
  reasoning: string;
}

export const useAutoSolver = (
  board: Cell[][],
  gameStatus: string,
  revealCell: (row: number, col: number) => boolean,
  flagCell: (row: number, col: number) => boolean,
  rows: number,
  cols: number
) => {
  const [isActive, setIsActive] = useState(false);
  const [speed, setSpeed] = useState(200); // ms between moves
  const [stats, setStats] = useState<SolverStats>({
    totalMoves: 0,
    logicalMoves: 0,
    guesses: 0,
    efficiency: 100
  });
  const [currentMove, setCurrentMove] = useState<SolverMove | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const getNeighbors = useCallback((row: number, col: number): Array<{row: number, col: number}> => {
    const neighbors = [];
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = row + dr;
        const nc = col + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && (dr !== 0 || dc !== 0)) {
          neighbors.push({ row: nr, col: nc });
        }
      }
    }
    return neighbors;
  }, [rows, cols]);

  const getRevealedCells = useCallback((): Array<{row: number, col: number}> => {
    const revealed = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (board[r][c].state === 'revealed' && board[r][c].neighborMines > 0) {
          revealed.push({ row: r, col: c });
        }
      }
    }
    return revealed;
  }, [board, rows, cols]);

  const findLogicalMove = useCallback((): SolverMove | null => {
    const revealedCells = getRevealedCells();
    
    for (const { row, col } of revealedCells) {
      const cell = board[row][col];
      const neighbors = getNeighbors(row, col);
      
      const hiddenNeighbors = neighbors.filter(n => board[n.row][n.col].state === 'hidden');
      const flaggedNeighbors = neighbors.filter(n => board[n.row][n.col].state === 'flagged');
      
      // If we've flagged enough mines, reveal remaining hidden neighbors
      if (flaggedNeighbors.length === cell.neighborMines && hiddenNeighbors.length > 0) {
        const target = hiddenNeighbors[0];
        return {
          row: target.row,
          col: target.col,
          action: 'reveal',
          confidence: 100,
          reasoning: `All mines around ${row},${col} are flagged`
        };
      }
      
      // If hidden neighbors equal remaining mines, flag them all
      if (hiddenNeighbors.length === cell.neighborMines - flaggedNeighbors.length && hiddenNeighbors.length > 0) {
        const target = hiddenNeighbors[0];
        return {
          row: target.row,
          col: target.col,
          action: 'flag',
          confidence: 100,
          reasoning: `Must be a mine (${hiddenNeighbors.length} hidden = ${cell.neighborMines - flaggedNeighbors.length} remaining mines)`
        };
      }
    }
    
    return null;
  }, [board, getRevealedCells, getNeighbors]);

  const findGuessMove = useCallback((): SolverMove | null => {
    // Find a hidden cell with the lowest risk
    let bestMove: SolverMove | null = null;
    let lowestRisk = Infinity;
    
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (board[r][c].state === 'hidden') {
          const neighbors = getNeighbors(r, c);
          const revealedNeighbors = neighbors.filter(n => 
            board[n.row][n.col].state === 'revealed' && board[n.row][n.col].neighborMines > 0
          );
          
          if (revealedNeighbors.length === 0) {
            // Corner or edge cells are usually safer
            const risk = Math.random() * 50; // Random but lower risk
            if (risk < lowestRisk) {
              lowestRisk = risk;
              bestMove = {
                row: r,
                col: c,
                action: 'reveal',
                confidence: Math.max(20, 100 - risk),
                reasoning: 'Educated guess - isolated area'
              };
            }
          } else {
            // Calculate risk based on surrounding revealed cells
            let totalMines = 0;
            let totalFlags = 0;
            let totalHidden = 0;
            
            for (const neighbor of revealedNeighbors) {
              const neighborCell = board[neighbor.row][neighbor.col];
              const neighborNeighbors = getNeighbors(neighbor.row, neighbor.col);
              const flaggedCount = neighborNeighbors.filter(n => board[n.row][n.col].state === 'flagged').length;
              const hiddenCount = neighborNeighbors.filter(n => board[n.row][n.col].state === 'hidden').length;
              
              totalMines += neighborCell.neighborMines;
              totalFlags += flaggedCount;
              totalHidden += hiddenCount;
            }
            
            const risk = totalHidden > 0 ? ((totalMines - totalFlags) / totalHidden) * 100 : 50;
            
            if (risk < lowestRisk) {
              lowestRisk = risk;
              bestMove = {
                row: r,
                col: c,
                action: 'reveal',
                confidence: Math.max(10, 100 - risk),
                reasoning: `Calculated risk: ${risk.toFixed(1)}%`
              };
            }
          }
        }
      }
    }
    
    return bestMove;
  }, [board, rows, cols, getNeighbors]);

  const makeMove = useCallback((): boolean => {
    if (gameStatus !== 'playing') return false;
    
    // First, try logical moves
    let move = findLogicalMove();
    let wasGuess = false;
    
    // If no logical move, make a guess
    if (!move) {
      move = findGuessMove();
      wasGuess = true;
    }
    
    if (!move) return false;
    
    setCurrentMove(move);
    
    let success = false;
    if (move.action === 'reveal') {
      success = revealCell(move.row, move.col);
    } else {
      success = flagCell(move.row, move.col);
    }
    
    if (success) {
      setStats(prev => ({
        totalMoves: prev.totalMoves + 1,
        logicalMoves: prev.logicalMoves + (wasGuess ? 0 : 1),
        guesses: prev.guesses + (wasGuess ? 1 : 0),
        efficiency: prev.totalMoves > 0 
          ? Math.round((prev.logicalMoves + (wasGuess ? 0 : 1)) / (prev.totalMoves + 1) * 100)
          : 100
      }));
    }
    
    // Clear current move after a short delay
    setTimeout(() => setCurrentMove(null), 1000);
    
    return success;
  }, [gameStatus, findLogicalMove, findGuessMove, revealCell, flagCell]);

  const startSolver = useCallback(() => {
    if (gameStatus !== 'playing') return;
    
    setIsActive(true);
    
    // If no cells are revealed yet, start with a corner
    const hasRevealedCells = board.some(row => row.some(cell => cell.state === 'revealed'));
    if (!hasRevealedCells) {
      revealCell(0, 0);
      setStats(prev => ({
        ...prev,
        totalMoves: 1,
        logicalMoves: 1,
        efficiency: 100
      }));
    }
  }, [gameStatus, board, revealCell]);

  const stopSolver = useCallback(() => {
    setIsActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const resetStats = useCallback(() => {
    setStats({
      totalMoves: 0,
      logicalMoves: 0,
      guesses: 0,
      efficiency: 100
    });
    setCurrentMove(null);
  }, []);

  // Auto-solver loop
  useEffect(() => {
    if (isActive && gameStatus === 'playing') {
      intervalRef.current = setInterval(() => {
        const success = makeMove();
        if (!success) {
          setIsActive(false);
        }
      }, speed);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, gameStatus, makeMove, speed]);

  // Stop solver when game ends
  useEffect(() => {
    if (gameStatus !== 'playing') {
      setIsActive(false);
    }
  }, [gameStatus]);

  return {
    isActive,
    speed,
    setSpeed,
    stats,
    currentMove,
    startSolver,
    stopSolver,
    resetStats,
    makeMove
  };
};