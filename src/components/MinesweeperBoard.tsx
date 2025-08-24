import React from 'react';
import { Cell } from '../types/minesweeper';
import { MinesweeperCell } from './MinesweeperCell';

interface MinesweeperBoardProps {
  board: Cell[][];
  currentMove: { row: number; col: number; confidence: number } | null;
}

export const MinesweeperBoard: React.FC<MinesweeperBoardProps> = ({ 
  board, 
  currentMove 
}) => {
  return (
    <div className="inline-block p-4 bg-gradient-card rounded-lg border border-border/50">
      <div 
        className="grid gap-px bg-border/20 p-2 rounded"
        style={{ 
          gridTemplateColumns: `repeat(${board[0]?.length || 0}, minmax(0, 1fr))` 
        }}
      >
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <MinesweeperCell
              key={`${rowIndex}-${colIndex}`}
              cell={cell}
              isCurrentMove={
                currentMove?.row === rowIndex && currentMove?.col === colIndex
              }
              moveConfidence={
                currentMove?.row === rowIndex && currentMove?.col === colIndex
                  ? currentMove.confidence
                  : 0
              }
            />
          ))
        )}
      </div>
    </div>
  );
};