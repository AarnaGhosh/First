// Mock data for the retro football snake game
export const mockGameData = {
  playerName: "Samarth",
  birthdayMessages: [
    "Happy Birthday Samarth! 🎂⚽",
    "Growing longer like your years of wisdom! 🐍",
    "Another football collected, another year celebrated! 🏆",
    "Keep slithering to success, birthday boy! 🎉",
    "Snake champion on his special day! 🥇",
    "Birthday goals achieved! ⚽🎂",
    "Samarth the Snake Master! 🐍👑"
  ],
  footballFacts: [
    "Fun fact: Snakes can't eat footballs in real life! 🐍⚽",
    "The longest recorded snake was 32 feet - beat that score!",
    "Football fields are perfect hunting grounds for birthday snakes!",
    "Did you know? This snake only eats on birthdays! 🎂",
    "Real snakes shed their skin, but this one just grows longer!"
  ],
  achievements: [
    { id: 1, name: "First Bite", description: "Collected your first football!", icon: "⚽", unlocked: false, requirement: 1 },
    { id: 2, name: "Growing Up", description: "Reached length of 10!", icon: "🐍", unlocked: false, requirement: 10 },
    { id: 3, name: "Birthday Feast", description: "Scored 500 points!", icon: "🎂", unlocked: false, requirement: 500 },
    { id: 4, name: "Snake Master", description: "Reached length of 25!", icon: "👑", unlocked: false, requirement: 25 },
    { id: 5, name: "Legendary", description: "Scored 1000 points!", icon: "🏆", unlocked: false, requirement: 1000 },
    { id: 6, name: "Speed Demon", description: "Survived at maximum speed!", icon: "⚡", unlocked: false, requirement: "max_speed" },
    { id: 7, name: "Century Club", description: "Reached length of 100!", icon: "💯", unlocked: false, requirement: 100 }
  ],
  powerUps: [
    { id: 1, name: "Birthday Boost", description: "Double points for 10 seconds!", color: "#FFB000", duration: 10000 },
    { id: 2, name: "Slow Motion", description: "Slows down time!", color: "#00BFFF", duration: 5000 },
    { id: 3, name: "Super Growth", description: "Grow 3 segments instead of 1!", color: "#FF69B4", duration: 15000 }
  ],
  highScores: [
    { player: "Samarth", score: 0, length: 1, date: new Date().toISOString() }
  ],
  gameStats: {
    totalGamesPlayed: 0,
    totalFootballsEaten: 0,
    longestSnake: 0,
    totalPlayTime: 0,
    averageScore: 0,
    achievementsUnlocked: 0
  },
  settings: {
    soundEnabled: true,
    difficulty: "normal", // easy, normal, hard, insane
    snakeColor: "#00FF41",
    footballColor: "#FFB000",
    fieldColor: "#0a4d0a",
    particleEffects: true
  },
  leaderboard: [
    { rank: 1, player: "Samarth", score: 0, length: 1, date: "Today" }
  ]
};

// Enhanced mock API functions
export const mockApi = {
  // Save game score and statistics
  saveGameResult: async (playerName, score, snakeLength, duration) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`🎮 Game completed - Player: ${playerName}, Score: ${score}, Length: ${snakeLength}, Duration: ${duration}s`);
        
        // Update stats
        mockGameData.gameStats.totalGamesPlayed++;
        mockGameData.gameStats.totalFootballsEaten += Math.floor(score / 10);
        mockGameData.gameStats.longestSnake = Math.max(mockGameData.gameStats.longestSnake, snakeLength);
        mockGameData.gameStats.totalPlayTime += duration;
        mockGameData.gameStats.averageScore = mockGameData.gameStats.totalGamesPlayed > 0 
          ? Math.round((mockGameData.gameStats.averageScore + score) / 2) 
          : score;
        
        // Add to high scores
        if (score > 0) {
          mockGameData.highScores.push({
            player: playerName,
            score: score,
            length: snakeLength,
            date: new Date().toISOString()
          });
          
          // Keep only top 10 scores
          mockGameData.highScores.sort((a, b) => b.score - a.score);
          mockGameData.highScores = mockGameData.highScores.slice(0, 10);
        }
        
        resolve({ success: true, message: "Game result saved! 🏆" });
      }, 600);
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
      }, 300);
    });
  },

  // Check and unlock achievements
  checkAchievements: async (score, snakeLength, gameStats) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newAchievements = [];
        
        mockGameData.achievements.forEach(achievement => {
          if (!achievement.unlocked) {
            let shouldUnlock = false;
            
            switch(achievement.requirement) {
              case 1:
                shouldUnlock = score >= 10; // First football
                break;
              case 10:
                shouldUnlock = snakeLength >= 10;
                break;
              case 25:
                shouldUnlock = snakeLength >= 25;
                break;
              case 100:
                shouldUnlock = snakeLength >= 100;
                break;
              case 500:
                shouldUnlock = score >= 500;
                break;
              case 1000:
                shouldUnlock = score >= 1000;
                break;
              case "max_speed":
                shouldUnlock = score >= 200; // Survived long enough at high speed
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
      }, 400);
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
            totalAchievements: mockGameData.achievements.length
          }
        });
      }, 250);
    });
  },

  // Get random motivational message
  getBirthdayMotivation: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const messages = [
          ...mockGameData.birthdayMessages,
          "Keep growing, Samarth! 🐍✨",
          "Another year older, another level completed! 🎮",
          "Birthday snake skills are unmatched! 🏆"
        ];
        
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        resolve({
          success: true,
          message: randomMessage
        });
      }, 200);
    });
  },

  // Get random football/snake fact
  getGameFact: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const randomFact = mockGameData.footballFacts[
          Math.floor(Math.random() * mockGameData.footballFacts.length)
        ];
        resolve({
          success: true,
          fact: randomFact
        });
      }, 200);
    });
  },

  // Save game settings
  saveSettings: async (settings) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        mockGameData.settings = { ...mockGameData.settings, ...settings };
        console.log("Settings saved:", settings);
        resolve({ success: true, message: "Settings saved!" });
      }, 300);
    });
  }
};