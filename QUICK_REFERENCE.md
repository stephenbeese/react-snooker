# Snooker API - Quick Reference

## 🚀 Get Started in 30 Seconds

### 1. Import the hook
```typescript
import { useRankings } from '@/hooks/useSnookerApi';
```

### 2. Use in component
```typescript
const { data, loading, error } = useRankings('MoneyRankings', 2024);
```

### 3. Display data
```typescript
{data?.map(rank => <div>{rank.Player_Name}</div>)}
```

---

## 📋 All Hooks

| Hook | Purpose |
|------|---------|
| `useCurrentSeason()` | Get current season |
| `useEvent(id)` | Get event details |
| `usePlayer(id)` | Get player profile |
| `useEventsBySeason(year, tour)` | Get events in season |
| `useMatchesByEvent(id)` | Get event matches |
| `useOngoingMatches(tour)` | Get live matches |
| `usePlayerMatches(id, season, tour)` | Get player's matches |
| `usePlayersByEvent(id)` | Get event players |
| `useAllPlayers(season, status, gender)` | Get all players |
| `useRankings(type, season)` | Get rankings |
| `useUpcomingMatches(tour)` | Get scheduled matches |
| `useRecentResults(days, tour)` | Get recent results |
| `useHeadToHead(p1, p2, season, tour)` | Get H2H record |
| `useEventRankingPoints(id)` | Get event ranking points |

---

## 🎯 Common Patterns

### Display Top 10 Players
```typescript
const { data: rankings } = useRankings('MoneyRankings', 2024);
return rankings?.slice(0, 10).map(r => (
  <div key={r.Position}>{r.Position}. {r.Player_Name}</div>
))
```

### Show Live Matches
```typescript
const { data: matches } = useOngoingMatches('main');
return matches?.map(m => (
  <div key={m.ID}>
    {m.Player1_Name} {m.Player1_Score} - {m.Player2_Score} {m.Player2_Name}
  </div>
))
```

### Get Player Info
```typescript
const { data: player } = usePlayer(1); // Mark J Williams
return <h1>{player?.Name} ({player?.Nationality})</h1>
```

### Show Player's Matches
```typescript
const { data: matches } = usePlayerMatches(1, 2024, 'main');
return matches?.map(m => (
  <div>{m.Player1_Name} vs {m.Player2_Name}</div>
))
```

### Head-to-Head
```typescript
const { data: h2h } = useHeadToHead(1, 5); // Williams vs Trump
const stats = calculateH2HStats(h2h, 1, 5);
return <div>{stats.player1Wins} - {stats.player2Wins}</div>
```

---

## 🛠️ Utility Functions

```typescript
import * as utils from '@/api/utils';

// Format data
utils.formatDate('2024-01-15')
utils.formatCurrency(100000)
utils.formatMatchScore(match)

// Match info
utils.isMatchLive(match)
utils.didPlayerWin(match, playerId)
utils.getPlayerScore(match, playerId)

// Sort data
utils.sortMatchesByDate(matches)
utils.sortPlayersByRanking(players)

// Filter data
utils.filterMatchesByPlayer(matches, playerId)
utils.filterMatchesByEvent(matches, eventId)

// Calculate stats
utils.calculateFrameWinPercentage(won, played)
utils.calculatePlayerStats(matches, playerId)
utils.calculateH2HStats(matches, p1, p2)
```

---

## 🔑 API Parameters

### Tours
- `'main'` - Main Tour
- `'q'` - Q Tour
- `'amateur'` - Amateur

### Player Status
- `'p'` - Professional
- `'a'` - Amateur

### Gender
- `'m'` - Male
- `'f'` - Female

### Ranking Types
- `'MoneyRankings'` - Prize money
- `'WorldRankings'` - World ranking
- `'OneYearMoney'` - 1-year money
- `'TwoYearMoney'` - 2-year money

### Match Status
- `'R'` - Result (completed)
- `'U'` - Unplayed
- `'A'` - Abandoned

---

## 📊 Response Types

```typescript
import type {
  Player,
  PlayerProfile,
  Event,
  Match,
  Ranking,
  Season,
} from '@/types/snooker';
```

---

## ⚡ Performance Tips

1. **Use hooks** - Automatic caching (5 min)
2. **Specific queries** - Use season/tour filters
3. **Lazy load** - Load non-critical data later
4. **Clear cache** - `clearApiCache()` when needed

---

## 🐛 Error Handling

```typescript
const { data, loading, error } = useRankings(...);

if (loading) return <div>Loading...</div>;
if (error) return <div>Error: {error.message}</div>;
if (!data) return <div>No data</div>;

return <div>{/* render data */}</div>;
```

---

## 📚 Full Documentation

See `API_SETUP.md` for complete documentation and examples.

---

## 🔗 Useful IDs

### Common Players
- `1` - Mark J Williams
- `5` - Judd Trump
- `12` - Ronnie O'Sullivan

### Common Events
- `403` - Shanghai Masters 2015
- `1460` - World Championship 2024

### Seasons
- `2024` - 2024/2025 season
- `-1` - All seasons

---

## 💡 Pro Tips

1. **Cache clearing**: `clearApiCache()` to refresh all data
2. **Specific cache**: `clearCacheEntry('getPlayer:1')` for one entry
3. **Batch requests**: Load multiple hooks in one component
4. **Error boundaries**: Wrap API calls in error handling
5. **Loading states**: Show spinners while `loading === true`

---

## 🎓 Example Component

```typescript
import { useRankings, useOngoingMatches } from '@/hooks/useSnookerApi';

export function Dashboard() {
  const { data: rankings, loading: rankLoading } = useRankings('MoneyRankings', 2024);
  const { data: matches, loading: matchLoading } = useOngoingMatches('main');

  if (rankLoading || matchLoading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Top Player: {rankings?.[0]?.Player_Name}</h2>
      <p>Live Matches: {matches?.length}</p>
    </div>
  );
}
```

---

## 🚨 Common Issues

| Issue | Solution |
|-------|----------|
| "VITE_X_REQUESTED_BY not set" | Check `.env` file, restart dev server |
| Empty results | Verify season/tour/ID parameters |
| Slow performance | Check Network tab, verify caching works |
| Type errors | Import types from `@/types/snooker` |

---

## 📞 Need Help?

1. Check `API_SETUP.md` for detailed guide
2. Review `src/components/ExampleApiUsage.tsx` for examples
3. Check inline code comments
4. Verify `.env` has `VITE_X_REQUESTED_BY`

---

**Last Updated:** April 2026
**API Version:** snooker.org v1
**Status:** ✅ Production Ready
