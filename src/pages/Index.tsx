import React, { useEffect, useMemo } from 'react';
import { useMinesweeper } from '../hooks/useMinesweeper';
import { useAutoSolver } from '../hooks/useAutoSolver';
import { MinesweeperBoard } from '../components/MinesweeperBoard';
import { ThemeToggle } from '../components/ThemeToggle';
import { Github, Linkedin, MapPin, Briefcase, GraduationCap } from 'lucide-react';

const Index = () => {
  // Calculate grid size based on viewport
  const { rows, cols } = useMemo(() => {
    const cellSize = 20; // pixels per cell
    const viewportRows = Math.floor(window.innerHeight / cellSize);
    const viewportCols = Math.floor(window.innerWidth / cellSize);
    const mineRatio = 0.15; // 15% mines
    const totalCells = viewportRows * viewportCols;
    const mineCount = Math.floor(totalCells * mineRatio);
    
    return {
      rows: Math.max(20, viewportRows),
      cols: Math.max(30, viewportCols),
      mineCount: Math.max(40, mineCount)
    };
  }, []);

  const { gameState, revealCell, flagCell, resetGame } = useMinesweeper(rows, cols, Math.floor(rows * cols * 0.15));
  
  const {
    isActive: isAutoSolving,
    currentMove,
    startSolver,
    makeMove
  } = useAutoSolver(
    gameState.board,
    gameState.gameStatus,
    revealCell,
    flagCell,
    rows,
    cols
  );

  // Auto-start the solver and auto-restart on game end
  useEffect(() => {
    if (!isAutoSolving && gameState.gameStatus === 'playing') {
      const timer = setTimeout(() => {
        startSolver();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [gameState.gameStatus, isAutoSolving, startSolver]);

  // Auto-restart when game ends
  useEffect(() => {
    if (gameState.gameStatus === 'won' || gameState.gameStatus === 'lost') {
      const timer = setTimeout(() => {
        resetGame();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [gameState.gameStatus, resetGame]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Theme Toggle */}
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Full Screen Minesweeper Background */}
      <div className="fixed inset-0 opacity-20">
        <div 
          className="w-full h-full grid bg-border/10"
          style={{ 
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`
          }}
        >
          {gameState.board.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`
                  border border-border/20 flex items-center justify-center text-xs font-bold
                  ${cell.state === 'hidden' ? 'bg-muted/40' : 
                    cell.state === 'flagged' ? 'bg-game-cell-flag/40' :
                    cell.isMine ? 'bg-game-cell-mine/40' : 'bg-game-cell-revealed/40'}
                  ${currentMove?.row === rowIndex && currentMove?.col === colIndex ? 'animate-glow' : ''}
                `}
              >
                {cell.state === 'revealed' && !cell.isMine && cell.neighborMines > 0 && (
                  <span 
                    className={`
                      ${cell.neighborMines === 1 ? 'text-game-number-1' :
                        cell.neighborMines === 2 ? 'text-game-number-2' :
                        cell.neighborMines === 3 ? 'text-game-number-3' :
                        cell.neighborMines === 4 ? 'text-game-number-4' :
                        cell.neighborMines === 5 ? 'text-game-number-5' :
                        'text-game-number-6'}
                    `}
                  >
                    {cell.neighborMines}
                  </span>
                )}
                {cell.state === 'flagged' && '🚩'}
                {cell.state === 'revealed' && cell.isMine && '💣'}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 py-12 min-h-screen flex flex-col justify-center">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-6xl md:text-7xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
              Ahmed Halat
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-4">
              Full Stack Developer crafting digital experiences
            </p>
            <p className="text-sm text-muted-foreground/70 italic">
              Powered by an AI solving minesweeper in the background
            </p>
          </div>

          {/* Info Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8 animate-fade-in">
            <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-lg p-6">
              <Briefcase className="w-8 h-8 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-card-foreground mb-2">Current Role</h3>
              <p className="text-sm text-muted-foreground">Full Stack Developer II</p>
              <p className="text-sm text-muted-foreground">at Verto Health</p>
            </div>

            <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-lg p-6">
              <GraduationCap className="w-8 h-8 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-card-foreground mb-2">Education</h3>
              <p className="text-sm text-muted-foreground">HBsc Computer Science Specialist</p>
              <p className="text-sm text-muted-foreground">University of Toronto</p>
            </div>

            <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-lg p-6">
              <MapPin className="w-8 h-8 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-card-foreground mb-2">Location</h3>
              <p className="text-sm text-muted-foreground">Toronto, Canada</p>
              <p className="text-sm text-muted-foreground">Ex-SDE Intern at AWS</p>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex justify-center gap-6 animate-fade-in">
            <a
              href="https://github.com/AhmedHalat"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-card/80 backdrop-blur-sm border border-border/50 rounded-lg px-6 py-3 hover:bg-card hover:scale-105 transition-all duration-300"
            >
              <Github className="w-5 h-5" />
              <span className="font-medium">GitHub</span>
            </a>
            <a
              href="https://www.linkedin.com/in/ahmed-halat/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-card/80 backdrop-blur-sm border border-border/50 rounded-lg px-6 py-3 hover:bg-card hover:scale-105 transition-all duration-300"
            >
              <Linkedin className="w-5 h-5" />
              <span className="font-medium">LinkedIn</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
