// Mock data for the Super Birthday World platformer game
export const mockGameData = {
  playerName: "Samarth",
  birthdayMessages: [
    "Happy Birthday Samarth! 🎂⚽",
    "Another year of jumping to success! 🏆",
    "Birthday boy conquering platforms! 🎉",
    "Level up in life and in the game! ⭐",
    "Super Samarth's birthday adventure! 👑",
    "Keep jumping higher, birthday champion! 🚀",
    "Football goals and birthday goals! ⚽🎂"
  ],
  gameStats: {
    totalGamesPlayed: 0,
    totalCoinsCollected: 0,
    totalEnemiesDefeated: 0,
    highestLevelReached: 0,
    totalJumps: 0,
    totalPlayTime: 0,
    averageScore: 0,
    achievementsUnlocked: 0
  },
  achievements: [
    { id: 1, name: "First Steps", description: "Started your first adventure!", icon: "👟", unlocked: false, requirement: "start_game" },
    { id: 2, name: "Coin Collector", description: "Collected 10 coins!", icon: "⚽", unlocked: false, requirement: 10 },
    { id: 3, name: "Enemy Stomper", description: "Defeated 5 enemies!", icon: "👾", unlocked: false, requirement: "enemies_5" },
    { id: 4, name: "Birthday Bonus", description: "Found the birthday cake!", icon: "🎂", unlocked: false, requirement: "birthday_cake" },
    { id: 5, name: "High Jumper", description: "Made 100 jumps!", icon: "🦘", unlocked: false, requirement: "jumps_100" },
    { id: 6, name: "Level Master", description: "Completed 3 levels!", icon: "🏆", unlocked: false, requirement: "levels_3" },
    { id: 7, name: "Score Champion", description: "Reached 5000 points!", icon: "⭐", unlocked: false, requirement: 5000 },
    { id: 8, name: "Birthday Legend", description: "Reached 10000 points!", icon: "👑", unlocked: false, requirement: 10000 }
  ],
  powerUps: [
    { id: 1, name: "Birthday Cake", description: "Big birthday bonus points!", effect: "500 points", color: "#FFB6C1" },
    { id: 2, name: "Football", description: "Goal! Extra points!", effect: "300 points", color: "#8B4513" },
    { id: 3, name: "Super Jump", description: "Jump higher for 10 seconds!", effect: "Enhanced jumping", color: "#00FF41" },
    { id: 4, name: "Speed Boost", description: "Move faster temporarily!", effect: "Increased speed", color: "#FF6347" }
  ],
  levels: [
    {
      id: 1,
      name: "Birthday Park",
      theme: "grass",
      difficulty: "easy",
      coinsRequired: 8,
      description: "Samarth's birthday celebration begins!"
    },
    {
      id: 2,
      name: "Football Stadium",
      theme: "sports",
      difficulty: "medium", 
      coinsRequired: 12,
      description: "Score goals and collect footballs!"
    },
    {
      id: 3,
      name: "Cake Castle",
      theme: "birthday",
      difficulty: "hard",
      coinsRequired: 15,
      description: "The ultimate birthday adventure!"
    }
  ],
  highScores: [
    { player: "Samarth", score: 0, level: 1, date: new Date().toISOString() }
  ],
  settings: {
    soundEnabled: true,
    difficulty: "normal",
    controls: "wasd", // wasd or arrows
    playerColor: "#FF0000",
    particleEffects: true,
    showFPS: false
  }
};

// Enhanced mock API functions for platformer game
export const mockApi = {
  // Save game completion data
  saveGameSession: async (playerName, score, level, stats) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`🎮 Game session saved - Player: ${playerName}, Score: ${score}, Level: ${level}`);
        
        // Update statistics
        mockGameData.gameStats.totalGamesPlayed++;
        mockGameData.gameStats.totalCoinsCollected += stats.coinsCollected || 0;
        mockGameData.gameStats.totalEnemiesDefeated += stats.enemiesDefeated || 0;
        mockGameData.gameStats.highestLevelReached = Math.max(mockGameData.gameStats.highestLevelReached, level);
        mockGameData.gameStats.totalJumps += stats.jumps || 0;
        mockGameData.gameStats.totalPlayTime += stats.playTime || 0;
        
        // Calculate average score
        if (mockGameData.gameStats.totalGamesPlayed > 0) {
          mockGameData.gameStats.averageScore = Math.round(
            (mockGameData.gameStats.averageScore * (mockGameData.gameStats.totalGamesPlayed - 1) + score) / 
            mockGameData.gameStats.totalGamesPlayed
          );
        }
        
        // Add to high scores
        mockGameData.highScores.push({
          player: playerName,
          score: score,
          level: level,
          date: new Date().toISOString()
        });
        
        // Keep only top 10 scores
        mockGameData.highScores.sort((a, b) => b.score - a.score);
        mockGameData.highScores = mockGameData.highScores.slice(0, 10);
        
        resolve({ success: true, message: "Game session saved! 🏆" });
      }, 500);
    });
  },

  // Check and unlock achievements
  checkAchievements: async (gameStats) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newAchievements = [];
        
        mockGameData.achievements.forEach(achievement => {
          if (!achievement.unlocked) {
            let shouldUnlock = false;
            
            switch(achievement.requirement) {
              case "start_game":
                shouldUnlock = true;
                break;
              case 10:
                shouldUnlock = gameStats.coinsCollected >= 10;
                break;
              case "enemies_5":
                shouldUnlock = gameStats.enemiesDefeated >= 5;
                break;
              case "birthday_cake":
                shouldUnlock = gameStats.foundBirthdayCake;
                break;
              case "jumps_100":
                shouldUnlock = gameStats.totalJumps >= 100;
                break;
              case "levels_3":
                shouldUnlock = gameStats.levelsCompleted >= 3;
                break;
              case 5000:
                shouldUnlock = gameStats.score >= 5000;
                break;
              case 10000:
                shouldUnlock = gameStats.score >= 10000;
                break;
            }
            
            if (shouldUnlock) {
              achievement.unlocked = true;
              achievement.unlockedAt = new Date().toISOString();
              newAchievements.push(achievement);
              mockGameData.gameStats.achievementsUnlocked++;
            }
          }
        });
        
        resolve({
          success: true,
          newAchievements: newAchievements,
          totalUnlocked: mockGameData.gameStats.achievementsUnlocked
        });
      }, 300);
    });
  },

  // Get leaderboard
  getLeaderboard: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const leaderboard = mockGameData.highScores.map((score, index) => ({
          rank: index + 1,
          ...score,
          date: new Date(score.date).toLocaleDateString()
        }));
        
        resolve({
          success: true,
          data: leaderboard
        });
      }, 250);
    });
  },

  // Get player statistics
  getPlayerStats: async (playerName) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: {
            ...mockGameData.gameStats,
            achievements: mockGameData.achievements.filter(a => a.unlocked),
            totalAchievements: mockGameData.achievements.length,
            completionRate: Math.round((mockGameData.gameStats.achievementsUnlocked / mockGameData.achievements.length) * 100)
          }
        });
      }, 200);
    });
  },

  // Get random birthday motivation
  getBirthdayMotivation: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const messages = [
          ...mockGameData.birthdayMessages,
          "Keep jumping to new heights, Samarth! 🚀",
          "Every platform conquered, every year celebrated! 🎈",
          "Super Birthday World champion! 🏆⚽"
        ];
        
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        resolve({
          success: true,
          message: randomMessage
        });
      }, 150);
    });
  },

  // Get level information
  getLevelInfo: async (levelId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const level = mockGameData.levels.find(l => l.id === levelId) || mockGameData.levels[0];
        resolve({
          success: true,
          data: level
        });
      }, 100);
    });
  },

  // Save game settings
  saveSettings: async (settings) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        mockGameData.settings = { ...mockGameData.settings, ...settings };
        console.log("Settings saved:", settings);
        resolve({ success: true, message: "Settings saved!" });
      }, 200);
    });
  },

  // Get power-up information
  getPowerUpInfo: async (powerUpType) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const powerUp = mockGameData.powerUps.find(p => p.name.toLowerCase().includes(powerUpType.toLowerCase()));
        resolve({
          success: true,
          data: powerUp || { name: "Mystery Power-Up", description: "Special birthday surprise!", effect: "Unknown" }
        });
      }, 100);
    });
  }
};