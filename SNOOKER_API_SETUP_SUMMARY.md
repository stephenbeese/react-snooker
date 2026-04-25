# Snooker.org API Setup - Complete Summary

## ✅ Setup Complete

Your snooker.org API client is fully configured and ready to use. Here's what has been created:

## 📁 Files Created

### Core API Files
- **`src/api/snooker.ts`** - Main API client with 21 endpoints
- **`src/types/snooker.ts`** - Complete TypeScript type definitions
- **`src/hooks/useSnookerApi.ts`** - React hooks with automatic caching
- **`src/api/utils.ts`** - Utility functions for data processing

### Documentation & Examples
- **`API_SETUP.md`** - Comprehensive setup and usage guide
- **`src/components/ExampleApiUsage.tsx`** - 5 example components

## 🚀 Quick Start

### 1. Verify Environment Setup
Your `.env` file already contains:
```env
VITE_X_REQUESTED_BY=your_approved_value
```

### 2. Use in Components

**Option A: Using React Hooks (Recommended)**
```typescript
import { useRankings, useOngoingMatches } from '@/hooks/useSnookerApi';

function MyComponent() {
  const { data: rankings, loading } = useRankings('MoneyRankings', 2024);
  const { data: liveMatches } = useOngoingMatches('main');

  if (loading) return <div>Loading...</div>;
  return <div>{rankings?.[0]?.Player_Name}</div>;
}
```

**Option B: Direct API Calls**
```typescript
import * as snookerApi from '@/api/snooker';

const rankings = await snookerApi.getRankings('MoneyRankings', 2024);
const liveMatches = await snookerApi.getOngoingMatches('main');
```

## 📊 Available Endpoints (21 Total)

### Player Data
- `getPlayer()` - Single player profile
- `getAllPlayers()` - All players in season
- `getPlayersByEvent()` - Players in tournament
- `getPlayerMatches()` - Player's match history

### Events & Tournaments
- `getEvent()` - Event details
- `getEventsBySeason()` - All events in season
- `getEventSeeding()` - Tournament seeding
- `getEventFinals()` - Finals history
- `getEventCandidates()` - Upcoming match candidates

### Matches & Results
- `getMatch()` - Specific match details
- `getMatchesByEvent()` - All event matches
- `getOngoingMatches()` - Live matches
- `getUpcomingMatches()` - Scheduled matches
- `getRecentResults()` - Results from last N days
- `getMatchesAroundNow()` - Matches ±60 minutes

### Rankings & Stats
- `getRankings()` - Official rankings
- `getEventRankingPoints()` - Event ranking points
- `getHeadToHead()` - Player H2H record

### Other
- `getCurrentSeason()` - Current season info
- `getRoundInfo()` - Round information

## 🔧 Key Features

✅ **Full TypeScript Support** - All responses are fully typed
✅ **Automatic Caching** - 5-minute cache to reduce API load
✅ **Error Handling** - Comprehensive error handling built-in
✅ **React Hooks** - Easy integration with React components
✅ **Utility Functions** - Data formatting and processing helpers
✅ **Environment Variables** - Secure API key management

## 📝 Utility Functions

```typescript
import * as utils from '@/api/utils';

// Formatting
utils.formatDate(dateString)
utils.formatDateTime(dateString)
utils.formatCurrency(amount)
utils.formatMatchScore(match)

// Match utilities
utils.isMatchLive(match)
utils.didPlayerWin(match, playerId)
utils.getPlayerScore(match, playerId)
utils.getOpponent(match, playerId)

// Sorting
utils.sortMatchesByDate(matches)
utils.sortPlayersByRanking(players)
utils.sortRankingsByPosition(rankings)

// Filtering
utils.filterMatchesByPlayer(matches, playerId)
utils.filterMatchesByEvent(matches, eventId)

// Statistics
utils.calculateFrameWinPercentage(won, played)
utils.calculateH2HStats(matches, p1Id, p2Id)
utils.calculatePlayerStats(matches, playerId)

// Grouping
utils.groupMatchesByEvent(matches)
utils.groupMatchesByRound(matches)
```

## 🎯 Common Use Cases

### Display Rankings
```typescript
const { data: rankings } = useRankings('MoneyRankings', 2024);
rankings?.map(r => `${r.Position}. ${r.Player_Name}`)
```

### Show Live Matches
```typescript
const { data: matches } = useOngoingMatches('main');
matches?.map(m => `${m.Player1_Name} vs ${m.Player2_Name}`)
```

### Get Player Profile
```typescript
const { data: player } = usePlayer(1);
// Mark J Williams profile
```

### Head-to-Head Comparison
```typescript
const { data: h2h } = useHeadToHead(1, 5); // Williams vs Trump
```

## 🔄 Caching

Automatic 5-minute cache for all API calls:

```typescript
import { clearApiCache, clearCacheEntry } from '@/hooks/useSnookerApi';

// Clear all cache
clearApiCache();

// Clear specific entry
clearCacheEntry('getPlayer:1');
```

## ⚙️ Configuration

### Change Cache Duration
Edit `src/hooks/useSnookerApi.ts`:
```typescript
const CACHE_DURATION = 5 * 60 * 1000; // Change this value
```

### Add New Endpoints
1. Add function to `src/api/snooker.ts`
2. Add type to `src/types/snooker.ts`
3. Add hook to `src/hooks/useSnookerApi.ts`

## 📚 Documentation

- **`API_SETUP.md`** - Full setup guide with examples
- **`src/components/ExampleApiUsage.tsx`** - 5 working examples
- **Inline comments** - All functions are documented

## 🐛 Troubleshooting

### "VITE_X_REQUESTED_BY not set"
- Check `.env` file has the variable
- Restart dev server after updating `.env`

### Empty Results
- Verify season/tour parameters are correct
- Check event/player IDs are valid
- Some endpoints may not have data for all seasons

### Slow Performance
- Check Network tab in DevTools
- Verify caching is working (5-min TTL)
- Use specific queries to minimize data

## 📖 Next Steps

1. **Review Examples** - Check `src/components/ExampleApiUsage.tsx`
2. **Read Full Guide** - See `API_SETUP.md` for detailed documentation
3. **Start Building** - Use hooks in your components
4. **Test Endpoints** - Try different API calls to understand data structure

## 🎓 Example Component

```typescript
import { useRankings } from '@/hooks/useSnookerApi';

export function TopPlayers() {
  const { data: rankings, loading, error } = useRankings('MoneyRankings', 2024);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Top 10 Players</h2>
      <ol>
        {rankings?.slice(0, 10).map(rank => (
          <li key={rank.Position}>
            {rank.Player_Name} - £{rank.Money?.toLocaleString()}
          </li>
        ))}
      </ol>
    </div>
  );
}
```

## ✨ You're All Set!

The API client is production-ready and fully integrated. Start using it in your components right away!

For questions or issues, refer to `API_SETUP.md` or check the example components.
