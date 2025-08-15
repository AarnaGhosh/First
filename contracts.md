# Game Backend Integration Contracts

## API Endpoints to Implement

### 1. Player Management
- `POST /api/players` - Create/register player
- `GET /api/players/{name}` - Get player profile
- `PUT /api/players/{name}` - Update player stats

### 2. Game Scores
- `POST /api/scores` - Save game score
- `GET /api/scores/leaderboard` - Get high scores
- `GET /api/scores/player/{name}` - Get player's scores

### 3. Game Statistics
- `POST /api/stats` - Save game statistics
- `GET /api/stats/player/{name}` - Get player stats

### 4. Achievements
- `POST /api/achievements/unlock` - Unlock achievement
- `GET /api/achievements/player/{name}` - Get player achievements

### 5. Birthday Content
- `GET /api/birthday/message` - Get random birthday message
- `GET /api/football/fact` - Get random football fact

## Mock Data to Replace

All data currently in `/app/frontend/src/mock/gameData.js` will be replaced with actual API calls:

1. **Player Profile**: Store Samarth's game progress
2. **High Scores**: Persistent leaderboard
3. **Game Statistics**: Track total games, hits, play time
4. **Achievements**: Unlock and track achievements
5. **Birthday Messages**: Dynamic birthday content
6. **Football Facts**: Random facts for game over screen

## Database Models

### Player
```javascript
{
  name: String,
  highScore: Number,
  totalGamesPlayed: Number,
  totalFootballsHit: Number,
  highestLevel: Number,
  totalPlayTime: Number,
  createdAt: Date,
  lastPlayed: Date
}
```

### GameScore
```javascript
{
  playerName: String,
  score: Number,
  level: Number,
  duration: Number,
  timestamp: Date
}
```

### Achievement
```javascript
{
  id: Number,
  playerName: String,
  achievementType: String,
  unlockedAt: Date
}
```

## Frontend Integration Points

1. **Game Over**: Call save score API
2. **Achievement System**: Check and unlock achievements
3. **Statistics**: Update player stats after each game
4. **Birthday Messages**: Fetch from API instead of mock array
5. **Leaderboard**: Real-time high scores

## Error Handling
- Graceful fallback to local storage if API fails
- Show connection status in game UI
- Retry mechanisms for critical operations

## Testing Requirements
- Test all API endpoints
- Verify game state persistence
- Check achievement unlock logic
- Validate score submission