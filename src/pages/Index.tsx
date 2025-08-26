import React, { useEffect, useMemo, useState } from 'react';
import { useMinesweeper } from '../hooks/useMinesweeper';
import { useAutoSolver } from '../hooks/useAutoSolver';
import { ThemeToggle } from '../components/ThemeToggle';
import { Github, Linkedin, MapPin, Briefcase, GraduationCap, Gamepad2, RefreshCw  } from 'lucide-react';
import { Button } from '../components/ui/button';
import { MinesweeperBoard } from '@/components/MinesweeperBoard';

const Index = () => {
  // Calculate grid size based on viewport
  const { rows, cols } = useMemo(() => {
    const cellSize = window.innerWidth < 640 ? 28 : 40; // smaller cells on mobile
    const minRows = window.innerWidth < 640 ? 12 : 20;
    const minCols = window.innerWidth < 640 ? 10 : 30;
    const viewportRows = Math.floor(window.innerHeight / cellSize);
    const viewportCols = Math.floor(window.innerWidth / cellSize);
    return {
      rows: Math.max(minRows, viewportRows),
      cols: Math.max(minCols, viewportCols),
    };
  }, []);

  const { gameState, revealCell, flagCell, resetGame } = useMinesweeper(rows, cols, Math.floor(rows * cols * 0.15));
  const {
    isActive: isAutoSolving,
    currentMove,
    startSolver,
    makeMove,
    stopSolver,
  } = useAutoSolver(
    gameState.board,
    gameState.gameStatus,
    revealCell,
    flagCell,
    rows,
    cols
  );

  const [manual, setmanual] = useState(false);

  const getCellContent = (cell) => {
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

  const getCellColorClass = (cell) => {
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

  const getBackgroundClass = (cell) => {
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

  // Auto-start the solver and auto-restart on game end
  useEffect(() => {
    startSolver()
  }, [startSolver]);

  // Auto-restart when game ends
  useEffect(() => {
    if (gameState.gameStatus === 'won' || gameState.gameStatus === 'lost') {
      const timer = setTimeout(() => {

        if (!manual) {
          resetGame();
          startSolver();
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [gameState.gameStatus, resetGame]);

  const restartGame = () => {
    resetGame({ gameStatus: manual ? 'paused' : 'playing' });
    if (!manual) startSolver();
    else stopSolver();
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Theme Toggle */}
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
        <Button
          variant="ghost"
          size="icon"
          data-tooltip="Swap to manual gameplay. Right-click to place a flag, Left-click to select a spot."
          className="hover-scale relative"
          onMouseEnter={e => {
            const btn = e.currentTarget;
            let tooltip = document.createElement('div');
            tooltip.innerText = btn.getAttribute('data-tooltip') || '';
            tooltip.className = 'absolute right-0 top-full mt-2 mr-0 px-5 py-2 min-w-[260px] rounded bg-card text-xs text-card-foreground shadow-lg z-50 pointer-events-none transition-opacity duration-200 opacity-0 group-hover:opacity-100';
            tooltip.style.opacity = '1';
            tooltip.style.whiteSpace = 'pre-line';
            tooltip.id = 'manual-tooltip';
            btn.appendChild(tooltip);
          }}
          onMouseLeave={e => {
            const btn = e.currentTarget;
            const tooltip = btn.querySelector('#manual-tooltip');
            if (tooltip) btn.removeChild(tooltip);
          }}
          onClick={() => {
            const newValue = !manual;
            if (newValue) {
              console.log("stopping");
              stopSolver();
              gameState.gameStatus = 'paused';
            } else {
              resetGame();
            }
            setmanual(newValue)
          }}
        >
          <Gamepad2 className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Gamepad2 className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Manual game toggle</span>
        </Button>
        <Button
          variant="ghost"
          className="ml-2"
          onClick={restartGame}
        >
          <RefreshCw className="h-5 w-5" />
          <span className="sr-only">Restart game</span>
        </Button>
      </div>

      {manual && gameState.gameStatus === 'won' && (
        <div className="fixed inset-0 bg-green-500/80 flex items-center justify-center z-[100]">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold">🎉 You Won!</h1>
            <Button onClick={restartGame} className="mt-4">Play Again</Button>
          </div>
        </div>
      )}

      {manual && gameState.gameStatus === 'lost' && (
        <div className="fixed inset-0 bg-red-500/80 flex items-center justify-center z-[100]">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold">💥 Game Over</h1>
            <Button onClick={restartGame} className="mt-4">Try Again</Button>
          </div>
        </div>
      )}

      {/* Full Screen Minesweeper Background */}
      <div className={`fixed inset-0 ${!manual ? 'opacity-20' : ''}`}>
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
                style={{ userSelect: 'none' }}
                onClick={() => {
                  if (manual && cell.state === 'hidden') {
                    revealCell(rowIndex, colIndex);
                  }
                }}
                onContextMenu={e => {
                  e.preventDefault();
                  if (manual && cell.state === 'hidden') {
                    flagCell(rowIndex, colIndex);
                  } else if (manual && cell.state === 'flagged') {
                    flagCell(rowIndex, colIndex); // Unflag
                  }
                }}
                className={`
                  border border-border/20 flex items-center justify-center text-xs font-bold
                  ${getBackgroundClass(cell)}
                  ${getCellColorClass(cell)}
                `}
              >
                {getCellContent(cell)}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Content */}
      {!manual && (
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
              Enjoy a game of Minesweeper while you explore my portfolio!
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
      )}
    </div>
  );
};

export default Index;
