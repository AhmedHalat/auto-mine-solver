import React, { useEffect } from 'react';
import { useMinesweeper } from '../hooks/useMinesweeper';
import { useAutoSolver } from '../hooks/useAutoSolver';
import { MinesweeperBoard } from '../components/MinesweeperBoard';
import { Github, Linkedin, MapPin, Briefcase, GraduationCap } from 'lucide-react';

const Index = () => {
  const { gameState, revealCell, flagCell, resetGame, rows, cols } = useMinesweeper(12, 20, 40);
  
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
      {/* Blurred Minesweeper Background */}
      <div className="fixed inset-0 flex items-center justify-center opacity-30 blur-sm scale-75 pointer-events-none">
        <MinesweeperBoard 
          board={gameState.board} 
          currentMove={currentMove ? {
            row: currentMove.row,
            col: currentMove.col,
            confidence: currentMove.confidence
          } : null}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 py-12 min-h-screen flex flex-col justify-center">
        <div className="max-w-4xl mx-auto text-center">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-6xl md:text-7xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-6">
              Ahmed Halat
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8">
              Full Stack Developer crafting digital experiences
            </p>
          </div>

          {/* Info Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
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
          <div className="flex justify-center gap-6">
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
