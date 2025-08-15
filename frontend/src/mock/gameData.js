// Mock data for the retro football game
export const mockGameData = {
  playerName: "Samarth",
  birthdayMessages: [
    "Happy Birthday Samarth! 🎂",
    "Hope you have a fantastic day! ⚽",
    "Keep defending those goals! 🥅",
    "Another year of amazing saves! 🏆",
    "Celebrate like a champion! 🎉"
  ],
  footballFacts: [
    "Did you know? The first football was made of pig's bladder!",
    "A football field is 100-130 yards long!",
    "The fastest recorded football kick was 131 mph!",
    "Football is played in over 200 countries!",
    "The World Cup trophy weighs 13.6 pounds!"
  ],
  achievements: [
    { id: 1, name: "First Save", description: "Blocked your first football!", icon: "🥅", unlocked: false },
    { id: 2, name: "Sharp Shooter", description: "Hit 10 footballs in a row!", icon: "🎯", unlocked: false },
    { id: 3, name: "Level Master", description: "Completed level 5!", icon: "🏆", unlocked: false },
    { id: 4, name: "Birthday Hero", description: "Scored 1000 points!", icon: "🎂", unlocked: false },
    { id: 5, name: "Football Legend", description: "Survived 10 levels!", icon: "⚽", unlocked: false }
  ],
  highScores: [
    { player: "Samarth", score: 0, date: new Date().toISOString() }
  ],
  gameStats: {
    totalGamesPlayed: 0,
    totalFootballsHit: 0,
    highestLevel: 0,
    totalPlayTime: 0
  },
  settings: {
    soundEnabled: true,
    difficulty: "normal", // easy, normal, hard
    playerColor: "#00FF41",
    footballColor: "#FFB000"
  }
};

// Mock API functions (these will be replaced with real backend calls later)
export const mockApi = {
  // Save game score
  saveScore: async (playerName, score, level) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Saving score for ${playerName}: ${score} points, level ${level}`);
        resolve({ success: true, message: "Score saved successfully!" });
      }, 500);
    });
  },

  // Get high scores
  getHighScores: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: mockGameData.highScores
        });
      }, 300);
    });
  },

  // Save game statistics
  saveGameStats: async (stats) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("Saving game stats:", stats);
        resolve({ success: true, message: "Stats saved!" });
      }, 400);
    });
  },

  // Get random birthday message
  getBirthdayMessage: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const randomMessage = mockGameData.birthdayMessages[
          Math.floor(Math.random() * mockGameData.birthdayMessages.length)
        ];
        resolve({
          success: true,
          message: randomMessage
        });
      }, 200);
    });
  },

  // Get random football fact
  getFootballFact: async () => {
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

  // Unlock achievement
  unlockAchievement: async (achievementId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const achievement = mockGameData.achievements.find(a => a.id === achievementId);
        if (achievement) {
          achievement.unlocked = true;
          console.log(`Achievement unlocked: ${achievement.name}`);
        }
        resolve({
          success: true,
          achievement: achievement
        });
      }, 300);
    });
  }
};