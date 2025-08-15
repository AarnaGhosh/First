import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Play, Pause, RotateCcw, Trophy, Heart, Zap } from 'lucide-react';

const GameScreen = () => {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('menu'); // menu, playing, paused, gameOver, levelComplete
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [highScore, setHighScore] = useState(0);
  const [gameMessage, setGameMessage] = useState('');
  
  // Player state
  const [player, setPlayer] = useState({
    x: 100,
    y: 300,
    width: 32,
    height: 32,
    vx: 0,
    vy: 0,
    onGround: false,
    direction: 1, // 1 for right, -1 for left
    canJump: true
  });
  
  // Game objects
  const [camera, setCamera] = useState({ x: 0, y: 0 });
  const [platforms, setPlatforms] = useState([]);
  const [coins, setCoins] = useState([]);
  const [enemies, setEnemies] = useState([]);
  const [particles, setParticles] = useState([]);
  const [powerUps, setPowerUps] = useState([]);
  
  const gameLoop = useRef(null);
  const keys = useRef({ a: false, d: false, w: false, s: false, space: false });
  
  const GRAVITY = 0.5;
  const JUMP_FORCE = -12;
  const MOVE_SPEED = 4;
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 400;

  // Birthday messages for collecting items
  const birthdayMessages = [
    "Happy Birthday Samarth! 🎂",
    "Birthday boy collecting goals! ⚽",
    "Another year, another level! 🏆",
    "Keep jumping, birthday champion! 🎉",
    "Samarth's birthday adventure! ⭐"
  ];

  // Create level platforms and objects
  const createLevel = useCallback((levelNum) => {
    const newPlatforms = [
      // Ground platforms
      { x: 0, y: 350, width: 200, height: 50, type: 'ground' },
      { x: 250, y: 350, width: 150, height: 50, type: 'ground' },
      { x: 450, y: 350, width: 200, height: 50, type: 'ground' },
      { x: 700, y: 350, width: 200, height: 50, type: 'ground' },
      { x: 950, y: 350, width: 300, height: 50, type: 'ground' },
      
      // Floating platforms
      { x: 300, y: 280, width: 100, height: 20, type: 'platform' },
      { x: 500, y: 220, width: 100, height: 20, type: 'platform' },
      { x: 750, y: 180, width: 120, height: 20, type: 'platform' },
      { x: 1000, y: 250, width: 100, height: 20, type: 'platform' },
      { x: 1200, y: 200, width: 150, height: 20, type: 'platform' },
      
      // Higher platforms for advanced gameplay
      { x: 600, y: 120, width: 80, height: 20, type: 'platform' },
      { x: 800, y: 80, width: 100, height: 20, type: 'platform' },
      { x: 1100, y: 100, width: 120, height: 20, type: 'platform' }
    ];

    const newCoins = [
      { x: 320, y: 240, width: 20, height: 20, collected: false, value: 100 },
      { x: 520, y: 180, width: 20, height: 20, collected: false, value: 100 },
      { x: 780, y: 140, width: 20, height: 20, collected: false, value: 100 },
      { x: 1020, y: 210, width: 20, height: 20, collected: false, value: 100 },
      { x: 1220, y: 160, width: 20, height: 20, collected: false, value: 100 },
      { x: 620, y: 80, width: 20, height: 20, collected: false, value: 200 },
      { x: 820, y: 40, width: 20, height: 20, collected: false, value: 200 },
      { x: 1120, y: 60, width: 20, height: 20, collected: false, value: 200 }
    ];

    const newEnemies = [
      { x: 300, y: 320, width: 24, height: 24, vx: -1, type: 'goomba', active: true },
      { x: 600, y: 320, width: 24, height: 24, vx: 1, type: 'goomba', active: true },
      { x: 900, y: 320, width: 24, height: 24, vx: -1, type: 'goomba', active: true },
      { x: 1100, y: 320, width: 24, height: 24, vx: 1, type: 'goomba', active: true }
    ];

    const newPowerUps = [
      { x: 400, y: 300, width: 24, height: 24, type: 'birthday_cake', collected: false },
      { x: 1000, y: 200, width: 24, height: 24, type: 'football', collected: false }
    ];

    setPlatforms(newPlatforms);
    setCoins(newCoins);
    setEnemies(newEnemies);
    setPowerUps(newPowerUps);
  }, []);

  // Initialize game
  const initGame = useCallback(() => {
    setScore(0);
    setLives(3);
    setLevel(1);
    setPlayer({
      x: 100,
      y: 300,
      width: 32,
      height: 32,
      vx: 0,
      vy: 0,
      onGround: false,
      direction: 1,
      canJump: true
    });
    setCamera({ x: 0, y: 0 });
    setGameMessage('');
    setParticles([]);
    createLevel(1);
    setGameState('playing');
  }, [createLevel]);

  // Create particle effect
  const createParticles = useCallback((x, y, color = '#FFB000', count = 6) => {
    const newParticles = [];
    for (let i = 0; i < count; i++) {
      newParticles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 8,
        vy: Math.random() * -6 - 2,
        life: 40,
        color: color,
        size: Math.random() * 4 + 2
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  }, []);

  // Collision detection
  const checkCollision = useCallback((rect1, rect2) => {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
  }, []);

  // Update game logic
  const updateGame = useCallback(() => {
    if (gameState !== 'playing') return;

    setPlayer(prevPlayer => {
      let newPlayer = { ...prevPlayer };
      
      // Handle input
      if (keys.current.a) {
        newPlayer.vx = -MOVE_SPEED;
        newPlayer.direction = -1;
      } else if (keys.current.d) {
        newPlayer.vx = MOVE_SPEED;
        newPlayer.direction = 1;
      } else {
        newPlayer.vx *= 0.8; // Friction
      }
      
      // Jumping
      if ((keys.current.w || keys.current.space) && newPlayer.onGround && newPlayer.canJump) {
        newPlayer.vy = JUMP_FORCE;
        newPlayer.onGround = false;
        newPlayer.canJump = false;
      }
      
      // Apply gravity
      newPlayer.vy += GRAVITY;
      
      // Move player
      newPlayer.x += newPlayer.vx;
      newPlayer.y += newPlayer.vy;
      
      // Reset onGround
      newPlayer.onGround = false;
      
      // Platform collision
      platforms.forEach(platform => {
        if (checkCollision(newPlayer, platform)) {
          // Landing on top
          if (prevPlayer.y + prevPlayer.height <= platform.y && newPlayer.vy > 0) {
            newPlayer.y = platform.y - newPlayer.height;
            newPlayer.vy = 0;
            newPlayer.onGround = true;
            newPlayer.canJump = true;
          }
          // Hitting from below
          else if (prevPlayer.y >= platform.y + platform.height && newPlayer.vy < 0) {
            newPlayer.y = platform.y + platform.height;
            newPlayer.vy = 0;
          }
          // Side collisions
          else if (newPlayer.vy === 0 || Math.abs(newPlayer.vy) < 2) {
            if (prevPlayer.x + prevPlayer.width <= platform.x) {
              newPlayer.x = platform.x - newPlayer.width;
            } else if (prevPlayer.x >= platform.x + platform.width) {
              newPlayer.x = platform.x + platform.width;
            }
          }
        }
      });
      
      // Boundary checks
      if (newPlayer.y > CANVAS_HEIGHT) {
        // Player fell off the world
        setLives(prev => {
          const newLives = prev - 1;
          if (newLives <= 0) {
            setGameState('gameOver');
            setHighScore(prev => Math.max(prev, score));
          } else {
            // Respawn player
            newPlayer.x = 100;
            newPlayer.y = 300;
            newPlayer.vx = 0;
            newPlayer.vy = 0;
          }
          return newLives;
        });
      }
      
      if (newPlayer.x < 0) newPlayer.x = 0;
      
      return newPlayer;
    });

    // Update camera to follow player
    setCamera(prevCamera => {
      const targetX = Math.max(0, player.x - CANVAS_WIDTH / 2);
      return {
        x: prevCamera.x + (targetX - prevCamera.x) * 0.1,
        y: 0
      };
    });

    // Update enemies
    setEnemies(prevEnemies => {
      return prevEnemies.map(enemy => {
        if (!enemy.active) return enemy;
        
        let newEnemy = { ...enemy };
        newEnemy.x += newEnemy.vx;
        
        // Simple AI - change direction at platform edges
        let onPlatform = false;
        platforms.forEach(platform => {
          if (newEnemy.y + newEnemy.height >= platform.y && 
              newEnemy.y + newEnemy.height <= platform.y + platform.height &&
              newEnemy.x + newEnemy.width > platform.x && 
              newEnemy.x < platform.x + platform.width) {
            onPlatform = true;
            
            // Change direction at edges
            if (newEnemy.x <= platform.x || newEnemy.x + newEnemy.width >= platform.x + platform.width) {
              newEnemy.vx *= -1;
            }
          }
        });
        
        // Check collision with player
        if (checkCollision(player, newEnemy)) {
          // Player jumped on enemy
          if (player.y + player.height - 10 < newEnemy.y && player.vy > 0) {
            newEnemy.active = false;
            setScore(prev => prev + 200);
            createParticles(newEnemy.x + newEnemy.width/2, newEnemy.y + newEnemy.height/2, '#FF4444');
            setPlayer(prevPlayer => ({ ...prevPlayer, vy: JUMP_FORCE * 0.5 }));
          } else {
            // Player hit enemy - lose life
            setLives(prev => {
              const newLives = prev - 1;
              if (newLives <= 0) {
                setGameState('gameOver');
                setHighScore(prev => Math.max(prev, score));
              }
              return newLives;
            });
            // Knockback player
            setPlayer(prevPlayer => ({ 
              ...prevPlayer, 
              vx: newEnemy.x < prevPlayer.x ? 3 : -3,
              vy: -5
            }));
          }
        }
        
        return newEnemy;
      });
    });

    // Check coin collection
    setCoins(prevCoins => {
      return prevCoins.map(coin => {
        if (coin.collected) return coin;
        
        if (checkCollision(player, coin)) {
          setScore(prev => {
            const newScore = prev + coin.value;
            // Show birthday message every 500 points
            if (Math.floor(newScore / 500) > Math.floor(prev / 500)) {
              const randomMessage = birthdayMessages[Math.floor(Math.random() * birthdayMessages.length)];
              setGameMessage(randomMessage);
              setTimeout(() => setGameMessage(''), 2000);
            }
            return newScore;
          });
          
          createParticles(coin.x + coin.width/2, coin.y + coin.height/2, '#FFB000');
          return { ...coin, collected: true };
        }
        return coin;
      });
    });

    // Check power-up collection
    setPowerUps(prevPowerUps => {
      return prevPowerUps.map(powerUp => {
        if (powerUp.collected) return powerUp;
        
        if (checkCollision(player, powerUp)) {
          if (powerUp.type === 'birthday_cake') {
            setScore(prev => prev + 500);
            setGameMessage("Happy Birthday Bonus! 🎂");
            setTimeout(() => setGameMessage(''), 2000);
          } else if (powerUp.type === 'football') {
            setScore(prev => prev + 300);
            setGameMessage("Goal! ⚽");
            setTimeout(() => setGameMessage(''), 1500);
          }
          
          createParticles(powerUp.x + powerUp.width/2, powerUp.y + powerUp.height/2, '#00FF41', 10);
          return { ...powerUp, collected: true };
        }
        return powerUp;
      });
    });

    // Update particles
    setParticles(prev => prev.map(p => ({
      ...p,
      x: p.x + p.vx,
      y: p.y + p.vy,
      vy: p.vy + 0.2,
      life: p.life - 1
    })).filter(p => p.life > 0));

    // Check level completion
    const allCoinsCollected = coins.every(coin => coin.collected);
    const allPowerUpsCollected = powerUps.every(powerUp => powerUp.collected);
    
    if (allCoinsCollected && allPowerUpsCollected && player.x > 1300) {
      setGameState('levelComplete');
      setLevel(prev => prev + 1);
    }

  }, [gameState, player, platforms, coins, enemies, powerUps, score, checkCollision, createParticles, birthdayMessages]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch(e.key.toLowerCase()) {
        case 'a':
          keys.current.a = true;
          e.preventDefault();
          break;
        case 'd':
          keys.current.d = true;
          e.preventDefault();
          break;
        case 'w':
          keys.current.w = true;
          e.preventDefault();
          break;
        case 's':
          keys.current.s = true;
          e.preventDefault();
          break;
        case ' ':
          keys.current.space = true;
          e.preventDefault();
          break;
      }
    };

    const handleKeyUp = (e) => {
      switch(e.key.toLowerCase()) {
        case 'a':
          keys.current.a = false;
          break;
        case 'd':
          keys.current.d = false;
          break;
        case 'w':
          keys.current.w = false;
          break;
        case 's':
          keys.current.s = false;
          break;
        case ' ':
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
  }, []);

  // Game loop
  useEffect(() => {
    if (gameState === 'playing') {
      gameLoop.current = setInterval(updateGame, 1000/60);
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
  }, [gameState, updateGame]);

  // Render game
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Clear canvas with sky blue background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#98FB98');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (gameState === 'menu') {
      // Menu screen
      ctx.fillStyle = '#2E8B57';
      ctx.font = 'bold 36px Orbitron, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('HAPPY BIRTHDAY', canvas.width/2, 100);
      ctx.fillText('SAMARTH!', canvas.width/2, 145);
      
      ctx.font = 'bold 24px Orbitron, monospace';
      ctx.fillStyle = '#FF6347';
      ctx.fillText('SUPER BIRTHDAY WORLD', canvas.width/2, 185);
      
      ctx.font = '16px Orbitron, monospace';
      ctx.fillStyle = '#2E8B57';
      ctx.fillText('A = Move Left, D = Move Right', canvas.width/2, 220);
      ctx.fillText('W = Jump (or Spacebar)', canvas.width/2, 245);
      ctx.fillText('Collect all footballs and reach the end!', canvas.width/2, 270);
      
      ctx.font = 'bold 18px Orbitron, monospace';
      ctx.fillStyle = '#FF6347';
      ctx.fillText(`HIGH SCORE: ${highScore}`, canvas.width/2, 320);
      
      // Draw sample character
      ctx.fillStyle = '#FF0000';
      ctx.fillRect(canvas.width/2 - 16, 340, 32, 32);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(canvas.width/2 - 12, 345, 8, 8);
      ctx.fillRect(canvas.width/2 + 4, 345, 8, 8);
      
      return;
    }

    if (gameState === 'gameOver') {
      // Game over screen
      ctx.fillStyle = '#FF4444';
      ctx.font = 'bold 36px Orbitron, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', canvas.width/2, 150);
      
      ctx.fillStyle = '#2E8B57';
      ctx.font = '20px Orbitron, monospace';
      ctx.fillText(`Final Score: ${score}`, canvas.width/2, 190);
      ctx.fillText(`Level Reached: ${level}`, canvas.width/2, 220);
      
      ctx.fillStyle = '#FF6347';
      ctx.font = '22px Orbitron, monospace';
      ctx.fillText('Happy Birthday Samarth! 🎂⚽', canvas.width/2, 260);
      
      if (score > highScore) {
        ctx.fillStyle = '#FFB000';
        ctx.font = 'bold 18px Orbitron, monospace';
        ctx.fillText('NEW HIGH SCORE! 🏆', canvas.width/2, 290);
      }
      
      return;
    }

    if (gameState === 'levelComplete') {
      // Level complete screen
      ctx.fillStyle = '#00FF41';
      ctx.font = 'bold 36px Orbitron, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('LEVEL COMPLETE!', canvas.width/2, 150);
      
      ctx.fillStyle = '#FF6347';
      ctx.font = '20px Orbitron, monospace';
      ctx.fillText(`Score: ${score}`, canvas.width/2, 190);
      ctx.fillText('Another birthday level conquered!', canvas.width/2, 220);
      
      return;
    }

    // Game playing - apply camera transform
    ctx.save();
    ctx.translate(-camera.x, -camera.y);

    // Draw platforms
    platforms.forEach(platform => {
      if (platform.type === 'ground') {
        ctx.fillStyle = '#8B4513';
      } else {
        ctx.fillStyle = '#32CD32';
      }
      ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
      
      // Add texture
      ctx.fillStyle = '#228B22';
      ctx.fillRect(platform.x, platform.y, platform.width, 4);
    });

    // Draw coins (footballs)
    coins.forEach(coin => {
      if (!coin.collected) {
        ctx.fillStyle = '#FFB000';
        ctx.beginPath();
        ctx.arc(coin.x + coin.width/2, coin.y + coin.height/2, coin.width/2, 0, Math.PI * 2);
        ctx.fill();
        
        // Football pattern
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(coin.x + 2, coin.y + coin.height/2);
        ctx.lineTo(coin.x + coin.width - 2, coin.y + coin.height/2);
        ctx.stroke();
      }
    });

    // Draw power-ups
    powerUps.forEach(powerUp => {
      if (!powerUp.collected) {
        if (powerUp.type === 'birthday_cake') {
          ctx.fillStyle = '#FFB6C1';
          ctx.fillRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
          ctx.fillStyle = '#FF1493';
          ctx.fillRect(powerUp.x + 2, powerUp.y + 2, powerUp.width - 4, 4);
        } else if (powerUp.type === 'football') {
          ctx.fillStyle = '#8B4513';
          ctx.beginPath();
          ctx.ellipse(powerUp.x + powerUp.width/2, powerUp.y + powerUp.height/2, 
                     powerUp.width/2, powerUp.height/3, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    });

    // Draw enemies
    enemies.forEach(enemy => {
      if (enemy.active) {
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        // Eyes
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(enemy.x + 4, enemy.y + 4, 4, 4);
        ctx.fillRect(enemy.x + 16, enemy.y + 4, 4, 4);
        ctx.fillStyle = '#000000';
        ctx.fillRect(enemy.x + 6, enemy.y + 6, 2, 2);
        ctx.fillRect(enemy.x + 18, enemy.y + 6, 2, 2);
      }
    });

    // Draw player (Samarth)
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Player details
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(player.x + 4, player.y + 4, 8, 8);
    ctx.fillRect(player.x + 20, player.y + 4, 8, 8);
    
    // Direction indicator
    if (player.direction > 0) {
      ctx.fillStyle = '#000000';
      ctx.fillRect(player.x + 24, player.y + 6, 4, 4);
    } else {
      ctx.fillStyle = '#000000';
      ctx.fillRect(player.x + 4, player.y + 6, 4, 4);
    }

    // Draw particles
    particles.forEach(particle => {
      ctx.globalAlpha = particle.life / 40;
      ctx.fillStyle = particle.color;
      ctx.fillRect(particle.x - particle.size/2, particle.y - particle.size/2, particle.size, particle.size);
    });
    ctx.globalAlpha = 1;

    ctx.restore();

    // Draw UI (not affected by camera)
    ctx.fillStyle = '#2E8B57';
    ctx.font = 'bold 16px Orbitron, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${score}`, 10, 25);
    ctx.fillText(`Lives: ${lives}`, 10, 50);
    ctx.fillText(`Level: ${level}`, 200, 25);
    ctx.textAlign = 'right';
    ctx.fillText(`Samarth's Birthday Adventure!`, canvas.width - 10, 25);
    
    // Show game message
    if (gameMessage) {
      ctx.fillStyle = '#FF6347';
      ctx.font = 'bold 18px Orbitron, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(gameMessage, canvas.width/2, 80);
    }
  }, [gameState, player, platforms, coins, enemies, powerUps, particles, camera, score, lives, level, highScore, gameMessage]);

  // Render on every frame
  useEffect(() => {
    const renderLoop = () => {
      render();
      requestAnimationFrame(renderLoop);
    };
    renderLoop();
  }, [render]);

  // Continue to next level
  const nextLevel = () => {
    createLevel(level);
    setPlayer(prev => ({ ...prev, x: 100, y: 300, vx: 0, vy: 0 }));
    setCamera({ x: 0, y: 0 });
    setGameState('playing');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 to-green-400 flex flex-col items-center justify-center p-4">
      <div className="retro-game-container">
        <Card className="bg-gray-900 border-green-500 border-3 p-6 shadow-2xl">
          <div className="flex flex-col items-center space-y-4">
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className="border-3 border-green-500 bg-sky-200 shadow-lg"
              style={{ imageRendering: 'pixelated' }}
            />
            
            <div className="flex space-x-4 flex-wrap justify-center">
              {gameState === 'menu' && (
                <Button 
                  onClick={initGame}
                  className="bg-green-500 hover:bg-green-600 text-black font-bold retro-button pulse"
                >
                  <Play className="w-4 h-4 mr-2" />
                  START ADVENTURE
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
              
              {gameState === 'levelComplete' && (
                <Button 
                  onClick={nextLevel}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold retro-button"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  NEXT LEVEL
                </Button>
              )}
              
              {(gameState === 'gameOver' || gameState === 'paused' || gameState === 'levelComplete') && (
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
                <p>Take a breath, birthday hero!</p>
              </div>
            )}
          </div>
        </Card>
        
        <div className="mt-6 text-center">
          <h1 className="text-4xl font-bold text-green-800 font-mono mb-2 pulse">
            <Trophy className="inline w-10 h-10 mr-3" />
            HAPPY BIRTHDAY SAMARTH!
            <Heart className="inline w-10 h-10 ml-3 text-red-500" />
          </h1>
          <p className="text-green-700 font-mono text-lg">
            <Zap className="inline w-5 h-5 mr-1" />
            A super Mario-style birthday adventure ⚽🎂
          </p>
        </div>
      </div>
    </div>
  );
};

export default GameScreen;