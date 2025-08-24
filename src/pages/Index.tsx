import React from 'react';
import { useMinesweeper } from '../hooks/useMinesweeper';
import { useAutoSolver } from '../hooks/useAutoSolver';
import { MinesweeperBoard } from '../components/MinesweeperBoard';
import { GameControls } from '../components/GameControls';

const Index = () => {
  const { gameState, revealCell, flagCell, resetGame, rows, cols } = useMinesweeper(16, 30, 99);
  
  const {
    isActive: isAutoSolving,
    speed: solverSpeed,
    setSpeed: setSolverSpeed,
    stats,
    currentMove,
    startSolver,
    stopSolver,
    resetStats,
    makeMove
  } = useAutoSolver(
    gameState.board,
    gameState.gameStatus,
    revealCell,
    flagCell,
    rows,
    cols
  );

  const handleResetGame = () => {
    resetGame();
    resetStats();
  };

  const totalCells = rows * cols;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            AI Minesweeper
          </h1>
          <p className="text-muted-foreground">
            Watch the AI solve minesweeper using logical deduction and educated guesses
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
          {/* Game Board */}
          <div className="flex justify-center">
            <MinesweeperBoard 
              board={gameState.board} 
              currentMove={currentMove ? {
                row: currentMove.row,
                col: currentMove.col,
                confidence: currentMove.confidence
              } : null}
            />
          </div>

          {/* Controls */}
          <div className="w-full lg:w-80">
            <GameControls
              gameStatus={gameState.gameStatus}
              mineCount={gameState.mineCount}
              flagCount={gameState.flagCount}
              cellsRevealed={gameState.cellsRevealed}
              totalCells={totalCells}
              isAutoSolving={isAutoSolving}
              solverSpeed={solverSpeed}
              stats={stats}
              onStartSolver={startSolver}
              onStopSolver={stopSolver}
              onResetGame={handleResetGame}
              onSpeedChange={setSolverSpeed}
              onMakeMove={makeMove}
            />
          </div>
        </div>

        {/* Current Move Display */}
        {currentMove && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-card border border-border/50 rounded-lg p-4 shadow-lg">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">AI Reasoning:</div>
              <div className="font-medium">{currentMove.reasoning}</div>
              <div className="text-xs text-muted-foreground mt-1">
                Position: ({currentMove.row}, {currentMove.col}) • 
                Action: {currentMove.action} • 
                Confidence: {currentMove.confidence}%
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
