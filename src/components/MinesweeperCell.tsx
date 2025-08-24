import React from 'react';
import { Cell } from '../types/minesweeper';
import { cn } from '../lib/utils';

interface MinesweeperCellProps {
  cell: Cell;
  isCurrentMove?: boolean;
  moveConfidence?: number;
}

export const MinesweeperCell: React.FC<MinesweeperCellProps> = ({ 
  cell, 
  isCurrentMove = false,
  moveConfidence = 0
}) => {
  const getCellContent = () => {
    if (cell.state === 'flagged') {
      return '🚩';
    }
    
    if (cell.state === 'hidden') {
      return '';
    }
    
    if (cell.isMine) {
      return '💣';
    }
    
    if (cell.neighborMines > 0) {
      return cell.neighborMines.toString();
    }
    
    return '';
  };

  const getCellColorClass = () => {
    if (cell.state === 'revealed' && !cell.isMine && cell.neighborMines > 0) {
      const colorMap = {
        1: 'text-game-number-1',
        2: 'text-game-number-2',
        3: 'text-game-number-3',
        4: 'text-game-number-4',
        5: 'text-game-number-5',
        6: 'text-game-number-6',
      };
      return colorMap[cell.neighborMines as keyof typeof colorMap] || 'text-foreground';
    }
    return 'text-foreground';
  };

  const getBackgroundClass = () => {
    if (cell.state === 'hidden') {
      return 'bg-game-cell-hidden hover:bg-game-cell-hidden/80';
    }
    
    if (cell.state === 'flagged') {
      return 'bg-game-cell-flag hover:bg-game-cell-flag/80';
    }
    
    if (cell.isMine) {
      return 'bg-game-cell-mine';
    }
    
    return 'bg-game-cell-revealed';
  };

  return (
    <div
      className={cn(
        'w-6 h-6 border border-border/30 flex items-center justify-center text-xs font-bold transition-all duration-200 relative',
        getBackgroundClass(),
        getCellColorClass(),
        cell.state === 'revealed' && 'animate-cell-reveal',
        isCurrentMove && 'animate-glow ring-2 ring-primary/50',
        'hover:scale-105 cursor-default select-none'
      )}
    >
      {getCellContent()}
      
      {isCurrentMove && moveConfidence > 0 && (
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground text-xs px-1 py-0.5 rounded text-center whitespace-nowrap pointer-events-none">
          {moveConfidence}%
        </div>
      )}
    </div>
  );
};