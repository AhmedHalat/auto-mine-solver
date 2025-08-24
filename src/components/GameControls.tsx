import React from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Slider } from './ui/slider';
import { Play, Pause, RotateCcw, Zap } from 'lucide-react';
import { SolverStats } from '../types/minesweeper';

interface GameControlsProps {
  gameStatus: string;
  mineCount: number;
  flagCount: number;
  cellsRevealed: number;
  totalCells: number;
  isAutoSolving: boolean;
  solverSpeed: number;
  stats: SolverStats;
  onStartSolver: () => void;
  onStopSolver: () => void;
  onResetGame: () => void;
  onSpeedChange: (speed: number) => void;
  onMakeMove: () => void;
}

export const GameControls: React.FC<GameControlsProps> = ({
  gameStatus,
  mineCount,
  flagCount,
  cellsRevealed,
  totalCells,
  isAutoSolving,
  solverSpeed,
  stats,
  onStartSolver,
  onStopSolver,
  onResetGame,
  onSpeedChange,
  onMakeMove
}) => {
  const getStatusColor = () => {
    switch (gameStatus) {
      case 'won': return 'bg-gradient-to-r from-green-500 to-emerald-600';
      case 'lost': return 'bg-gradient-to-r from-red-500 to-rose-600';
      case 'paused': return 'bg-gradient-to-r from-yellow-500 to-amber-600';
      default: return 'bg-gradient-primary';
    }
  };

  const getStatusText = () => {
    switch (gameStatus) {
      case 'won': return '🎉 Victory!';
      case 'lost': return '💥 Game Over';
      case 'paused': return '⏸️ Paused';
      default: return '🤖 AI Solving...';
    }
  };

  return (
    <div className="space-y-4">
      {/* Status Banner */}
      <Card className={`p-4 text-center text-white font-bold text-lg ${getStatusColor()}`}>
        {getStatusText()}
      </Card>

      {/* Game Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-3 text-center bg-gradient-card border-border/50">
          <div className="text-sm text-muted-foreground">Mines</div>
          <div className="text-xl font-bold text-game-cell-mine">
            {mineCount - flagCount}
          </div>
        </Card>
        
        <Card className="p-3 text-center bg-gradient-card border-border/50">
          <div className="text-sm text-muted-foreground">Flags</div>
          <div className="text-xl font-bold text-game-cell-flag">
            {flagCount}
          </div>
        </Card>
        
        <Card className="p-3 text-center bg-gradient-card border-border/50">
          <div className="text-sm text-muted-foreground">Progress</div>
          <div className="text-xl font-bold text-primary">
            {Math.round((cellsRevealed / (totalCells - mineCount)) * 100)}%
          </div>
        </Card>
      </div>

      {/* Solver Controls */}
      <Card className="p-4 bg-gradient-card border-border/50">
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={isAutoSolving ? onStopSolver : onStartSolver}
              disabled={gameStatus !== 'playing'}
              variant={isAutoSolving ? "destructive" : "default"}
              className="flex-1"
            >
              {isAutoSolving ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Stop Auto-Solve
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start Auto-Solve
                </>
              )}
            </Button>
            
            <Button
              onClick={onMakeMove}
              disabled={gameStatus !== 'playing' || isAutoSolving}
              variant="outline"
            >
              <Zap className="w-4 h-4 mr-2" />
              Step
            </Button>
            
            <Button onClick={onResetGame} variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>

          {/* Speed Control */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Solver Speed</span>
              <Badge variant="outline">{Math.round(1000/solverSpeed)} moves/sec</Badge>
            </div>
            <Slider
              value={[1100 - solverSpeed]}
              onValueChange={(value) => onSpeedChange(1100 - value[0])}
              min={100}
              max={1000}
              step={50}
              className="w-full"
            />
          </div>
        </div>
      </Card>

      {/* Solver Stats */}
      <Card className="p-4 bg-gradient-card border-border/50">
        <h3 className="text-sm font-semibold mb-3 text-muted-foreground">AI Performance</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center">
            <div className="text-lg font-bold text-primary">{stats.totalMoves}</div>
            <div className="text-xs text-muted-foreground">Total Moves</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-game-number-2">{stats.logicalMoves}</div>
            <div className="text-xs text-muted-foreground">Logical</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-game-number-3">{stats.guesses}</div>
            <div className="text-xs text-muted-foreground">Guesses</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-accent">{stats.efficiency}%</div>
            <div className="text-xs text-muted-foreground">Efficiency</div>
          </div>
        </div>
      </Card>
    </div>
  );
};