import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Play, Pause, RotateCcw, Trophy, Heart, Zap } from 'lucide-react';

const GameScreen = () => {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('menu'); // menu, playing, paused, gameOver
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [speed, setSpeed] = useState(150);
  
  // Snake game state
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [direction, setDirection] = useState({ x: 0, y: 0 });
  const [gameMessage, setGameMessage] = useState('');
  const [particles, setParticles] = useState([]);
  
  const gameLoop = useRef(null);
  const lastRenderTime = useRef(0);
  
  const GRID_SIZE = 20;
  const GRID_WIDTH = 30;
  const GRID_HEIGHT = 25;

  // Birthday messages for scoring
  const birthdayMessages = [
    "Happy Birthday Samarth! 🎂",
    "Another goal for the birthday boy! ⚽",
    "Keep collecting those footballs! 🏆",
    "Birthday streak going strong! 🎉",
    "Samarth the football collector! ⭐"
  ];

  // Initialize game
  const initGame = useCallback(() => {
    setScore(0);
    setSpeed(150);
    setSnake([{ x: 10, y: 10 }]);
    setFood({ x: 15, y: 15 });
    setDirection({ x: 0, y: 0 });
    setGameMessage('');
    setParticles([]);
    setGameState('playing');
  }, []);

  // Generate random food position
  const generateFood = useCallback((snakeBody) => {
    let newFood;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_WIDTH),
        y: Math.floor(Math.random() * GRID_HEIGHT)
      };
    } while (snakeBody.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }, []);

  // Create particle effect
  const createParticles = useCallback((x, y) => {
    const newParticles = [];
    for (let i = 0; i < 8; i++) {
      newParticles.push({
        x: x * GRID_SIZE + GRID_SIZE / 2,
        y: y * GRID_SIZE + GRID_SIZE / 2,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 30,
        color: Math.random() > 0.5 ? '#00FF41' : '#FFB000'
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  }, []);

  // Update game logic
  const updateGame = useCallback(() => {
    if (gameState !== 'playing') return;

    setSnake(prevSnake => {
      const newSnake = [...prevSnake];
      const head = { ...newSnake[0] };
      
      // Move head
      head.x += direction.x;
      head.y += direction.y;
      
      // Check wall collision
      if (head.x < 0 || head.x >= GRID_WIDTH || head.y < 0 || head.y >= GRID_HEIGHT) {
        setGameState('gameOver');
        setHighScore(prev => Math.max(prev, score));
        return prevSnake;
      }
      
      // Check self collision
      if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setGameState('gameOver');
        setHighScore(prev => Math.max(prev, score));
        return prevSnake;
      }
      
      newSnake.unshift(head);
      
      // Check food collision
      if (head.x === food.x && head.y === food.y) {
        // Snake grows, don't remove tail
        setScore(prev => {
          const newScore = prev + 10;
          // Show birthday message every 50 points
          if (newScore % 50 === 0) {
            const randomMessage = birthdayMessages[Math.floor(Math.random() * birthdayMessages.length)];
            setGameMessage(randomMessage);
            setTimeout(() => setGameMessage(''), 2000);
          }
          return newScore;
        });
        
        // Create particle effect
        createParticles(food.x, food.y);
        
        // Generate new food
        setFood(generateFood(newSnake));
        
        // Increase speed slightly
        setSpeed(prev => Math.max(80, prev - 2));
      } else {
        // Remove tail if no food eaten
        newSnake.pop();
      }
      
      return newSnake;
    });
  }, [gameState, direction, food, score, generateFood, createParticles, birthdayMessages]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (gameState !== 'playing') return;
      
      switch(e.key.toLowerCase()) {
        case 'arrowup':
        case 'w':
          if (direction.y === 0) setDirection({ x: 0, y: -1 });
          e.preventDefault();
          break;
        case 'arrowdown':
        case 's':
          if (direction.y === 0) setDirection({ x: 0, y: 1 });
          e.preventDefault();
          break;
        case 'arrowleft':
        case 'a':
          if (direction.x === 0) setDirection({ x: -1, y: 0 });
          e.preventDefault();
          break;
        case 'arrowright':
        case 'd':
          if (direction.x === 0) setDirection({ x: 1, y: 0 });
          e.preventDefault();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState, direction]);

  // Game loop
  useEffect(() => {
    if (gameState === 'playing') {
      gameLoop.current = setInterval(updateGame, speed);
    } else {
      if (gameLoop.current) {
        clearInterval(gameLoop.current);
      }
    }

    return () => {
      if (gameLoop.current) {
        clearInterval(gameLoop.current);
      }
    };
  }, [gameState, updateGame, speed]);

  // Update particles
  useEffect(() => {
    if (particles.length > 0) {
      const particleInterval = setInterval(() => {
        setParticles(prev => prev.map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vy: p.vy + 0.1, // gravity
          life: p.life - 1
        })).filter(p => p.life > 0));
      }, 16);

      return () => clearInterval(particleInterval);
    }
  }, [particles.length]);

  // Render game
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.fillStyle = '#0a4d0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (gameState === 'menu') {
      // Menu screen
      ctx.fillStyle = '#00FF41';
      ctx.font = 'bold 42px Orbitron, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('HAPPY BIRTHDAY', canvas.width/2, 120);
      ctx.fillText('SAMARTH!', canvas.width/2, 170);
      
      ctx.font = 'bold 28px Orbitron, monospace';
      ctx.fillStyle = '#FFB000';
      ctx.fillText('FOOTBALL SNAKE', canvas.width/2, 220);
      
      ctx.font = '18px Orbitron, monospace';
      ctx.fillStyle = '#00FF41';
      ctx.fillText('Collect footballs to grow longer!', canvas.width/2, 260);
      ctx.fillText('Use arrow keys or WASD to move', canvas.width/2, 285);
      ctx.fillText('Don\'t hit the walls or yourself!', canvas.width/2, 310);
      
      ctx.font = 'bold 20px Orbitron, monospace';
      ctx.fillStyle = '#FFB000';
      ctx.fillText(`HIGH SCORE: ${highScore}`, canvas.width/2, 370);
      
      // Draw sample snake and football
      ctx.fillStyle = '#00FF41';
      ctx.fillRect(canvas.width/2 - 60, 400, GRID_SIZE, GRID_SIZE);
      ctx.fillRect(canvas.width/2 - 40, 400, GRID_SIZE, GRID_SIZE);
      ctx.fillRect(canvas.width/2 - 20, 400, GRID_SIZE, GRID_SIZE);
      
      ctx.fillStyle = '#FFB000';
      ctx.beginPath();
      ctx.arc(canvas.width/2 + 20, 410, 10, 0, Math.PI * 2);
      ctx.fill();
      
      return;
    }

    if (gameState === 'gameOver') {
      // Game over screen
      ctx.fillStyle = '#FF4444';
      ctx.font = 'bold 42px Orbitron, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', canvas.width/2, 200);
      
      ctx.fillStyle = '#00FF41';
      ctx.font = '22px Orbitron, monospace';
      ctx.fillText(`Final Score: ${score}`, canvas.width/2, 240);
      ctx.fillText(`Snake Length: ${snake.length}`, canvas.width/2, 270);
      
      ctx.fillStyle = '#FFB000';
      ctx.font = '24px Orbitron, monospace';
      ctx.fillText('Happy Birthday Samarth! 🎂⚽', canvas.width/2, 310);
      
      if (score > highScore) {
        ctx.fillStyle = '#FFB000';
        ctx.font = 'bold 20px Orbitron, monospace';
        ctx.fillText('NEW HIGH SCORE! 🏆', canvas.width/2, 340);
      }
      
      return;
    }

    // Draw football field pattern
    ctx.strokeStyle = '#0d5d0d';
    ctx.lineWidth = 1;
    for (let x = 0; x <= GRID_WIDTH; x++) {
      ctx.beginPath();
      ctx.moveTo(x * GRID_SIZE, 0);
      ctx.lineTo(x * GRID_SIZE, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y <= GRID_HEIGHT; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * GRID_SIZE);
      ctx.lineTo(canvas.width, y * GRID_SIZE);
      ctx.stroke();
    }

    // Draw center circle
    ctx.strokeStyle = '#0d5d0d';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(canvas.width/2, canvas.height/2, 50, 0, Math.PI * 2);
    ctx.stroke();

    // Draw snake (Samarth)
    snake.forEach((segment, index) => {
      if (index === 0) {
        // Head - brighter green
        ctx.fillStyle = '#00FF41';
        ctx.fillRect(segment.x * GRID_SIZE + 2, segment.y * GRID_SIZE + 2, GRID_SIZE - 4, GRID_SIZE - 4);
        
        // Eyes
        ctx.fillStyle = '#000000';
        ctx.fillRect(segment.x * GRID_SIZE + 6, segment.y * GRID_SIZE + 6, 3, 3);
        ctx.fillRect(segment.x * GRID_SIZE + 11, segment.y * GRID_SIZE + 6, 3, 3);
      } else {
        // Body - darker green
        ctx.fillStyle = '#00CC33';
        ctx.fillRect(segment.x * GRID_SIZE + 3, segment.y * GRID_SIZE + 3, GRID_SIZE - 6, GRID_SIZE - 6);
      }
    });

    // Draw food (football)
    ctx.fillStyle = '#FFB000';
    ctx.beginPath();
    ctx.arc(food.x * GRID_SIZE + GRID_SIZE/2, food.y * GRID_SIZE + GRID_SIZE/2, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Football pattern
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(food.x * GRID_SIZE + 4, food.y * GRID_SIZE + GRID_SIZE/2);
    ctx.lineTo(food.x * GRID_SIZE + GRID_SIZE - 4, food.y * GRID_SIZE + GRID_SIZE/2);
    ctx.stroke();

    // Draw particles
    particles.forEach(particle => {
      ctx.globalAlpha = particle.life / 30;
      ctx.fillStyle = particle.color;
      ctx.fillRect(particle.x - 2, particle.y - 2, 4, 4);
    });
    ctx.globalAlpha = 1;

    // Draw UI
    ctx.fillStyle = '#00FF41';
    ctx.font = 'bold 18px Orbitron, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${score}`, 10, 25);
    ctx.fillText(`Length: ${snake.length}`, 10, 50);
    ctx.textAlign = 'right';
    ctx.fillText(`High Score: ${highScore}`, canvas.width - 10, 25);
    ctx.fillText(`Samarth's Birthday Snake!`, canvas.width - 10, 50);
    
    // Show game message
    if (gameMessage) {
      ctx.fillStyle = '#FFB000';
      ctx.font = 'bold 20px Orbitron, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(gameMessage, canvas.width/2, 100);
    }
  }, [gameState, snake, food, particles, score, highScore, gameMessage]);

  // Render on every frame
  useEffect(() => {
    const renderLoop = () => {
      render();
      requestAnimationFrame(renderLoop);
    };
    renderLoop();
  }, [render]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900 to-green-800 flex flex-col items-center justify-center p-4">
      <div className="retro-game-container">
        <Card className="bg-gray-900 border-green-500 border-3 p-6 shadow-2xl">
          <div className="flex flex-col items-center space-y-4">
            <canvas
              ref={canvasRef}
              width={GRID_WIDTH * GRID_SIZE}
              height={GRID_HEIGHT * GRID_SIZE}
              className="border-3 border-green-500 bg-green-800 shadow-lg"
              style={{ imageRendering: 'pixelated' }}
            />
            
            <div className="flex space-x-4">
              {gameState === 'menu' && (
                <Button 
                  onClick={initGame}
                  className="bg-green-500 hover:bg-green-600 text-black font-bold retro-button pulse"
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
                <p>Take a break, birthday boy!</p>
              </div>
            )}
          </div>
        </Card>
        
        <div className="mt-6 text-center">
          <h1 className="text-4xl font-bold text-green-400 font-mono mb-2 pulse">
            <Trophy className="inline w-10 h-10 mr-3" />
            HAPPY BIRTHDAY SAMARTH!
            <Heart className="inline w-10 h-10 ml-3 text-red-500" />
          </h1>
          <p className="text-green-300 font-mono text-lg">
            <Zap className="inline w-5 h-5 mr-1" />
            A retro football snake game made with love ⚽🎂
          </p>
        </div>
      </div>
    </div>
  );
};

export default GameScreen;