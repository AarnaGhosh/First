import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Play, Pause, RotateCcw, Trophy, Heart } from 'lucide-react';

const GameScreen = () => {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('menu'); // menu, playing, paused, gameOver
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [highScore, setHighScore] = useState(0);
  
  // Game objects
  const [player, setPlayer] = useState({ x: 400, y: 550, width: 60, height: 20 });
  const [footballs, setFootballs] = useState([]);
  const [shots, setShots] = useState([]);
  const [particles, setParticles] = useState([]);
  
  const gameLoop = useRef(null);
  const keys = useRef({ left: false, right: false, space: false });

  // Initialize game
  const initGame = useCallback(() => {
    setScore(0);
    setLives(3);
    setLevel(1);
    setPlayer({ x: 400, y: 550, width: 60, height: 20 });
    setFootballs([]);
    setShots([]);
    setParticles([]);
    setGameState('playing');
  }, []);

  // Create initial footballs formation
  const createFootballs = useCallback(() => {
    const newFootballs = [];
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 8; col++) {
        newFootballs.push({
          x: 100 + col * 80,
          y: 100 + row * 60,
          width: 30,
          height: 30,
          active: true
        });
      }
    }
    return newFootballs;
  }, []);

  // Game update logic
  const updateGame = useCallback(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Update player movement
    setPlayer(prev => {
      let newX = prev.x;
      if (keys.current.left && newX > 0) newX -= 5;
      if (keys.current.right && newX < canvas.width - prev.width) newX += 5;
      return { ...prev, x: newX };
    });

    // Update shots
    setShots(prev => prev.map(shot => ({ ...shot, y: shot.y - 8 })).filter(shot => shot.y > 0));

    // Update footballs (simple downward movement)
    setFootballs(prev => prev.map(football => ({ 
      ...football, 
      y: football.y + 0.5 + level * 0.2
    })));

    // Check collisions between shots and footballs
    setShots(prevShots => {
      setFootballs(prevFootballs => {
        const newFootballs = [...prevFootballs];
        const newShots = prevShots.filter(shot => {
          let hit = false;
          newFootballs.forEach((football, index) => {
            if (football.active && 
                shot.x < football.x + football.width &&
                shot.x + shot.width > football.x &&
                shot.y < football.y + football.height &&
                shot.y + shot.height > football.y) {
              newFootballs[index] = { ...football, active: false };
              setScore(prev => prev + 10);
              
              // Add particle effect
              setParticles(prev => [...prev, {
                x: football.x + football.width/2,
                y: football.y + football.height/2,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                life: 30
              }]);
              
              hit = true;
            }
          });
          return !hit;
        });
        return newFootballs;
      });
      return prevShots.filter(shot => {
        let hit = false;
        footballs.forEach(football => {
          if (football.active && 
              shot.x < football.x + football.width &&
              shot.x + shot.width > football.x &&
              shot.y < football.y + football.height &&
              shot.y + shot.height > football.y) {
            hit = true;
          }
        });
        return !hit;
      });
    });

    // Check if footballs reached bottom or hit player
    setFootballs(prevFootballs => {
      const reachedBottom = prevFootballs.some(football => 
        football.active && football.y > canvas.height - 100
      );
      
      if (reachedBottom) {
        setLives(prev => {
          const newLives = prev - 1;
          if (newLives <= 0) {
            setGameState('gameOver');
            setHighScore(prev => Math.max(prev, score));
          }
          return newLives;
        });
        return createFootballs();
      }
      return prevFootballs;
    });

    // Update particles
    setParticles(prev => prev.map(p => ({
      ...p,
      x: p.x + p.vx,
      y: p.y + p.vy,
      life: p.life - 1
    })).filter(p => p.life > 0));

    // Check level completion
    const activeFootballs = footballs.filter(f => f.active).length;
    if (activeFootballs === 0) {
      setLevel(prev => prev + 1);
      setFootballs(createFootballs());
    }
  }, [gameState, footballs, score, level, createFootballs]);

  // Render game
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Clear canvas with retro black background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (gameState === 'menu') {
      // Menu screen
      ctx.fillStyle = '#00FF41';
      ctx.font = 'bold 48px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('HAPPY BIRTHDAY', canvas.width/2, 150);
      ctx.fillText('SAMARTH!', canvas.width/2, 210);
      
      ctx.font = 'bold 32px monospace';
      ctx.fillStyle = '#FFB000';
      ctx.fillText('FOOTBALL DEFENDER', canvas.width/2, 280);
      
      ctx.font = '20px monospace';
      ctx.fillStyle = '#00FF41';
      ctx.fillText('Defend the goal posts from incoming footballs!', canvas.width/2, 320);
      ctx.fillText('Use ← → arrows to move, SPACE to shoot', canvas.width/2, 350);
      
      ctx.font = 'bold 24px monospace';
      ctx.fillStyle = '#FFB000';
      ctx.fillText(`HIGH SCORE: ${highScore}`, canvas.width/2, 420);
      
      return;
    }

    if (gameState === 'gameOver') {
      // Game over screen
      ctx.fillStyle = '#FF4444';
      ctx.font = 'bold 48px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', canvas.width/2, 250);
      
      ctx.fillStyle = '#00FF41';
      ctx.font = '24px monospace';
      ctx.fillText(`Final Score: ${score}`, canvas.width/2, 300);
      ctx.fillText(`Happy Birthday Samarth!`, canvas.width/2, 330);
      
      if (score > highScore) {
        ctx.fillStyle = '#FFB000';
        ctx.fillText('NEW HIGH SCORE!', canvas.width/2, 360);
      }
      
      return;
    }

    // Game playing state
    ctx.textAlign = 'left';
    
    // Draw player (goal keeper)
    ctx.fillStyle = '#00FF41';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Draw goal posts
    ctx.strokeStyle = '#00FF41';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(player.x - 20, player.y + 20);
    ctx.lineTo(player.x - 20, player.y - 30);
    ctx.lineTo(player.x + player.width + 20, player.y - 30);
    ctx.lineTo(player.x + player.width + 20, player.y + 20);
    ctx.stroke();

    // Draw footballs
    footballs.forEach(football => {
      if (football.active) {
        ctx.fillStyle = '#FFB000';
        ctx.beginPath();
        ctx.arc(football.x + football.width/2, football.y + football.height/2, football.width/2, 0, Math.PI * 2);
        ctx.fill();
        
        // Football pattern
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(football.x + football.width/2, football.y + football.height/2, football.width/3, 0, Math.PI * 2);
        ctx.stroke();
      }
    });

    // Draw shots
    ctx.fillStyle = '#00FF41';
    shots.forEach(shot => {
      ctx.fillRect(shot.x, shot.y, shot.width, shot.height);
    });

    // Draw particles
    ctx.fillStyle = '#FFB000';
    particles.forEach(particle => {
      ctx.globalAlpha = particle.life / 30;
      ctx.fillRect(particle.x, particle.y, 3, 3);
    });
    ctx.globalAlpha = 1;

    // Draw UI
    ctx.fillStyle = '#00FF41';
    ctx.font = '20px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${score}`, 20, 30);
    ctx.fillText(`Level: ${level}`, 20, 55);
    ctx.fillText(`Lives: ${lives}`, 200, 30);
    ctx.fillText(`Samarth's Birthday Game!`, 350, 30);
  }, [gameState, player, footballs, shots, particles, score, level, lives, highScore]);

  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch(e.code) {
        case 'ArrowLeft':
          keys.current.left = true;
          e.preventDefault();
          break;
        case 'ArrowRight':
          keys.current.right = true;
          e.preventDefault();
          break;
        case 'Space':
          if (gameState === 'playing' && !keys.current.space) {
            setShots(prev => [...prev, {
              x: player.x + player.width/2 - 2,
              y: player.y - 10,
              width: 4,
              height: 10
            }]);
          }
          keys.current.space = true;
          e.preventDefault();
          break;
      }
    };

    const handleKeyUp = (e) => {
      switch(e.code) {
        case 'ArrowLeft':
          keys.current.left = false;
          break;
        case 'ArrowRight':
          keys.current.right = false;
          break;
        case 'Space':
          keys.current.space = false;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, player]);

  // Game loop
  useEffect(() => {
    if (gameState === 'playing') {
      gameLoop.current = setInterval(() => {
        updateGame();
        render();
      }, 1000/60);
    } else {
      if (gameLoop.current) {
        clearInterval(gameLoop.current);
      }
      render();
    }

    return () => {
      if (gameLoop.current) {
        clearInterval(gameLoop.current);
      }
    };
  }, [gameState, updateGame, render]);

  // Initialize footballs on game start
  useEffect(() => {
    if (gameState === 'playing' && footballs.length === 0) {
      setFootballs(createFootballs());
    }
  }, [gameState, footballs.length, createFootballs]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="retro-game-container">
        <Card className="bg-gray-900 border-green-500 border-2 p-6 shadow-2xl">
          <div className="flex flex-col items-center space-y-4">
            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              className="border-2 border-green-500 bg-black"
              style={{ imageRendering: 'pixelated' }}
            />
            
            <div className="flex space-x-4">
              {gameState === 'menu' && (
                <Button 
                  onClick={initGame}
                  className="bg-green-500 hover:bg-green-600 text-black font-bold retro-button"
                >
                  <Play className="w-4 h-4 mr-2" />
                  START GAME
                </Button>
              )}
              
              {gameState === 'playing' && (
                <Button 
                  onClick={() => setGameState('paused')}
                  className="bg-yellow-600 hover:bg-yellow-700 text-black font-bold retro-button"
                >
                  <Pause className="w-4 h-4 mr-2" />
                  PAUSE
                </Button>
              )}
              
              {gameState === 'paused' && (
                <Button 
                  onClick={() => setGameState('playing')}
                  className="bg-green-500 hover:bg-green-600 text-black font-bold retro-button"
                >
                  <Play className="w-4 h-4 mr-2" />
                  RESUME
                </Button>
              )}
              
              {(gameState === 'gameOver' || gameState === 'paused') && (
                <Button 
                  onClick={() => setGameState('menu')}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold retro-button"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  MENU
                </Button>
              )}
            </div>
            
            {gameState === 'paused' && (
              <div className="text-green-500 text-center font-mono">
                <h3 className="text-xl font-bold">GAME PAUSED</h3>
                <p>Take a break, Samarth!</p>
              </div>
            )}
          </div>
        </Card>
        
        <div className="mt-6 text-center">
          <h1 className="text-3xl font-bold text-green-500 font-mono mb-2">
            <Trophy className="inline w-8 h-8 mr-2" />
            HAPPY BIRTHDAY SAMARTH!
            <Heart className="inline w-8 h-8 ml-2 text-red-500" />
          </h1>
          <p className="text-green-400 font-mono">
            A retro football defender game made with love ⚽
          </p>
        </div>
      </div>
    </div>
  );
};

export default GameScreen;