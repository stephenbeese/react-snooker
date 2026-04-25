# Snooker.org API Setup Guide

## Overview

This project includes a complete API client for the snooker.org API with TypeScript types, React hooks, and utility functions for data processing.

## Environment Setup

### 1. API Key Configuration

Your API key is stored in `.env` as `VITE_X_REQUESTED_BY`. This header is required for all API requests.

```env
VITE_X_REQUESTED_BY=your_approved_value_here
```

The API client automatically includes this header in all requests.

## Project Structure

```
src/
├── api/
│   ├── snooker.ts          # Main API client with all endpoints
│   └── utils.ts            # Utility functions for data processing
├── hooks/
│   └── useSnookerApi.ts    # React hooks for API calls with caching
└── types/
    └── snooker.ts          # TypeScript type definitions
```

## API Client Usage

### Direct API Calls

Import and use the API functions directly:

```typescript
import * as snookerApi from '@/api/snooker';

// Get current season
const season = await snookerApi.getCurrentSeason();

// Get all pro players
const players = await snookerApi.getAllPlayers(2024, 'p');

// Get live matches
const liveMatches = await snookerApi.getOngoingMatches('main');

// Get player profile
const player = await snookerApi.getPlayer(1); // Mark J Williams

// Get rankings
const rankings = await snookerApi.getRankings('MoneyRankings', 2024);
```

### React Hooks (Recommended)

Use custom hooks in React components for automatic caching and state management:

```typescript
import { useCurrentSeason, useAllPlayers, useRankings } from '@/hooks/useSnookerApi';

function MyComponent() {
  const { data: season, loading, error } = useCurrentSeason();
  const { data: players } = useAllPlayers(2024, 'p');
  const { data: rankings } = useRankings('MoneyRankings', 2024);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Current Season: {season?.Name}</h1>
      <p>Players: {players?.length}</p>
      <p>Top Player: {rankings?.[0]?.Player_Name}</p>
    </div>
  );
}
```

## Available API Endpoints

### Player Data

- `getPlayer(playerId)` - Get player profile
- `getAllPlayers(season, status, gender)` - Get all players
- `getPlayersByEvent(eventId)` - Get players in an event
- `getPlayerMatches(playerId, season, tour)` - Get player's matches

### Events & Tournaments

- `getEvent(eventId)` - Get event details
- `getEventsBySeason(season, tour)` - Get events in a season
- `getEventSeeding(eventId)` - Get tournament seeding
- `getEventFinals(eventId)` - Get finals for an event
- `getEventCandidates(eventId)` - Get candidates for upcoming matches

### Matches & Results

- `getMatch(eventId, roundId, matchNumber)` - Get specific match
- `getMatchesByEvent(eventId)` - Get all matches in an event
- `getOngoingMatches(tour)` - Get live matches
- `getUpcomingMatches(tour)` - Get scheduled matches
- `getRecentResults(days, tour)` - Get results from last N days
- `getMatchesAroundNow(tour)` - Get matches ±60 minutes from now

### Rankings & Statistics

- `getRankings(rankingType, season)` - Get rankings
- `getEventRankingPoints(eventId)` - Get ranking points for event
- `getHeadToHead(player1Id, player2Id, season, tour)` - Get H2H record

### Other

- `getCurrentSeason()` - Get current season info
- `getRoundInfo(eventId, season)` - Get round information

## Utility Functions

### Data Processing

```typescript
import * as utils from '@/api/utils';

// Formatting
utils.formatDate('2024-01-15');
utils.formatDateTime('2024-01-15T14:30:00');
utils.formatCurrency(100000);

// Match utilities
utils.formatMatchScore(match);
utils.getMatchStatusLabel('R');
utils.isMatchLive(match);
utils.didPlayerWin(match, playerId);
utils.getPlayerScore(match, playerId);

// Sorting
utils.sortMatchesByDate(matches);
utils.sortPlayersByRanking(players);
utils.sortRankingsByPosition(rankings);

// Filtering
utils.filterMatchesByPlayer(matches, playerId);
utils.filterMatchesByEvent(matches, eventId);

// Statistics
utils.calculateFrameWinPercentage(framesWon, framesPlayed);
utils.calculateH2HStats(matches, player1Id, player2Id);
utils.calculatePlayerStats(matches, playerId);

// Grouping
utils.groupMatchesByEvent(matches);
utils.groupMatchesByRound(matches);
```

## Caching

The React hooks include automatic caching with a 5-minute TTL:

```typescript
import { clearApiCache, clearCacheEntry } from '@/hooks/useSnookerApi';

// Clear all cached data
clearApiCache();

// Clear specific cache entry
clearCacheEntry('getPlayer:1');
```

## Error Handling

All API calls include error handling:

```typescript
import { usePlayer } from '@/hooks/useSnookerApi';

function PlayerProfile({ playerId }: { playerId: number }) {
  const { data, loading, error } = usePlayer(playerId);

  if (loading) return <div>Loading player...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return <div>Player not found</div>;

  return <div>{data.Name}</div>;
}
```

## API Response Types

All responses are fully typed with TypeScript:

```typescript
import type {
  Player,
  PlayerProfile,
  Event,
  Match,
  Ranking,
  Season,
  HeadToHead,
  EventSeeding,
  RankingPoints,
} from '@/types/snooker';
```

## Rate Limiting & Performance

- The API has a limit of 500 results per request
- Responses are cached for 5 minutes to reduce API load
- Use specific queries (e.g., by season, tour) to minimize data transfer
- Consider lazy-loading non-critical data

## Common Use Cases

### Display Current Rankings

```typescript
function Rankings() {
  const { data: rankings, loading } = useRankings('MoneyRankings', 2024);

  if (loading) return <div>Loading...</div>;

  return (
    <table>
      <tbody>
        {rankings?.map((rank) => (
          <tr key={rank.Position}>
            <td>{rank.Position}</td>
            <td>{rank.Player_Name}</td>
            <td>£{rank.Money?.toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

### Display Live Matches

```typescript
function LiveMatches() {
  const { data: matches, loading } = useOngoingMatches('main');

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {matches?.map((match) => (
        <div key={match.ID}>
          <h3>{match.Player1_Name} vs {match.Player2_Name}</h3>
          <p>Score: {match.Player1_Score} - {match.Player2_Score}</p>
        </div>
      ))}
    </div>
  );
}
```

### Display Player Profile

```typescript
function PlayerProfile({ playerId }: { playerId: number }) {
  const { data: player, loading } = usePlayer(playerId);
  const { data: matches } = usePlayerMatches(playerId, 2024);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>{player?.Name}</h1>
      <p>Nationality: {player?.Nationality}</p>
      <p>Ranking: {player?.Ranking}</p>
      <p>Matches: {matches?.length}</p>
    </div>
  );
}
```

## Troubleshooting

### "VITE_X_REQUESTED_BY environment variable is not set"

Make sure your `.env` file contains:
```env
VITE_X_REQUESTED_BY=your_approved_value
```

And restart your development server after updating `.env`.

### API Returns Empty Results

- Check that the season/tour parameters are correct
- Some endpoints may not have data for all seasons
- Verify the event/player IDs are valid

### Slow Performance

- Check browser DevTools Network tab for slow requests
- Consider using more specific queries
- Verify caching is working (5-minute TTL)

## Additional Resources

- [Snooker.org API Documentation](https://api.snooker.org/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [React Hooks Documentation](https://react.dev/reference/react)
