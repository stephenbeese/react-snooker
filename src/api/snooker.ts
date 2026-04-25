/**
 * Snooker.org API Client
 * Handles all API requests to the snooker.org API with proper headers and error handling
 */

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
  ApiError,
  RankingType,
  Tour,
  PlayerStatus,
  Gender,
} from '../types/snooker';

const API_BASE = import.meta.env.DEV ? '/api/snooker' : 'https://api.snooker.org';

// Cache configuration
const CACHE_TTL_STANDARD = 5 * 60 * 1000; // 5 minutes for standard endpoints
const CACHE_TTL_LIVE = 1 * 60 * 1000; // 1 minute for live data

/**
 * Cache entry structure
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

/**
 * In-memory cache storage
 */
const apiCache = new Map<string, CacheEntry<any>>();

/**
 * Get the API key from environment variables
 */
const getApiKey = (): string => {
  const key = import.meta.env.VITE_X_REQUESTED_BY;
  if (!key) {
    throw new Error('VITE_X_REQUESTED_BY environment variable is not set');
  }
  return key;
};

/**
 * Generate a cache key from function name and parameters
 */
const generateCacheKey = (functionName: string, params: URLSearchParams): string => {
  return `${functionName}:${params.toString()}`;
};

/**
 * Check if a cache entry is still valid
 */
const isCacheValid = (entry: CacheEntry<any>): boolean => {
  const now = Date.now();
  return now - entry.timestamp < entry.ttl;
};

/**
 * Get data from cache if available and valid
 */
export const getFromCache = <T>(key: string): T | null => {
  const entry = apiCache.get(key);
  if (!entry) {
    return null;
  }
  if (!isCacheValid(entry)) {
    apiCache.delete(key);
    return null;
  }
  return entry.data as T;
};

/**
 * Store data in cache with TTL
 */
export const setCache = <T>(key: string, data: T, ttl: number = CACHE_TTL_STANDARD): void => {
  apiCache.set(key, {
    data,
    timestamp: Date.now(),
    ttl,
  });
};

/**
 * Clear all API cache
 */
export const clearApiCache = (): void => {
  apiCache.clear();
};

/**
 * Generic fetch wrapper with error handling, header injection, and caching
 */
const fetchFromApi = async <T>(
  params: URLSearchParams,
  functionName: string,
  ttl: number = CACHE_TTL_STANDARD
): Promise<T> => {
  const cacheKey = generateCacheKey(functionName, params);

  // Check cache first
  const cachedData = getFromCache<T>(cacheKey);
  if (cachedData !== null) {
    return cachedData;
  }

  try {
    const url = `${API_BASE}/?${params.toString()}`;
    
    // In development, the proxy handles the X-Requested-By header
    // In production, we need to include it (but this will likely fail due to CORS)
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (!import.meta.env.DEV) {
      headers['X-Requested-By'] = getApiKey();
    }
    
    const response = await fetch(url, { headers });

    if (!response.ok) {
      const error: ApiError = {
        message: `API request failed: ${response.statusText}`,
        status: response.status,
      };
      throw error;
    }

    const data = await response.json();
    
    // Store in cache
    setCache<T>(cacheKey, data, ttl);
    
    return data as T;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Snooker API Error: ${error.message}`);
    }
    throw error;
  }
};

/**
 * Get information about a specific event
 * @param eventId - The ID of the event
 */
export const getEvent = (eventId: number): Promise<Event> => {
  const params = new URLSearchParams({ e: String(eventId) });
  return fetchFromApi<Event>(params, 'getEvent', CACHE_TTL_STANDARD);
};

/**
 * Get information about a specific match
 * @param eventId - The ID of the event
 * @param roundId - The ID of the round
 * @param matchNumber - The match number
 */
export const getMatch = (
  eventId: number,
  roundId: number,
  matchNumber: number
): Promise<Match> => {
  const params = new URLSearchParams({
    e: String(eventId),
    r: String(roundId),
    n: String(matchNumber),
  });
  return fetchFromApi<Match>(params, 'getMatch', CACHE_TTL_STANDARD);
};

/**
 * Get information about a specific player
 * @param playerId - The ID of the player
 */
export const getPlayer = (playerId: number): Promise<PlayerProfile> => {
  const params = new URLSearchParams({ p: String(playerId) });
  return fetchFromApi<PlayerProfile>(params, 'getPlayer', CACHE_TTL_STANDARD);
};

/**
 * Get all events in a specific season
 * @param season - The season year (e.g., 2024 for 2024/2025 season), or -1 for all seasons
 * @param tour - Optional tour filter ('main', 'q', 'amateur')
 */
export const getEventsBySeason = (
  season: number = -1,
  tour?: Tour
): Promise<Event[]> => {
  const params = new URLSearchParams({
    t: '5',
    s: String(season),
  });
  if (tour) {
    params.append('tr', tour);
  }
  return fetchFromApi<Event[]>(params, 'getEventsBySeason', CACHE_TTL_STANDARD);
};

/**
 * Get all matches in a specific event
 * @param eventId - The ID of the event
 */
export const getMatchesByEvent = (eventId: number): Promise<Match[]> => {
  const params = new URLSearchParams({
    t: '6',
    e: String(eventId),
  });
  return fetchFromApi<Match[]>(params, 'getMatchesByEvent', CACHE_TTL_STANDARD);
};

/**
 * Get ongoing matches (including those between sessions)
 * @param tour - Optional tour filter ('main', 'q', 'amateur')
 */
export const getOngoingMatches = (tour?: Tour): Promise<Match[]> => {
  const params = new URLSearchParams({ t: '7' });
  if (tour) {
    params.append('tr', tour);
  }
  return fetchFromApi<Match[]>(params, 'getOngoingMatches', CACHE_TTL_LIVE);
};

/**
 * Get matches for a specific player in a season
 * @param playerId - The ID of the player
 * @param season - Optional season year, or -1 for all seasons
 * @param tour - Optional tour filter ('main', 'q', 'amateur')
 */
export const getPlayerMatches = (
  playerId: number,
  season?: number,
  tour?: Tour
): Promise<Match[]> => {
  const params = new URLSearchParams({
    t: '8',
    p: String(playerId),
  });
  if (season !== undefined) {
    params.append('s', String(season));
  }
  if (tour) {
    params.append('tr', tour);
  }
  return fetchFromApi<Match[]>(params, 'getPlayerMatches', CACHE_TTL_STANDARD);
};

/**
 * Get all players in a specific event
 * @param eventId - The ID of the event
 */
export const getPlayersByEvent = (eventId: number): Promise<Player[]> => {
  const params = new URLSearchParams({
    t: '9',
    e: String(eventId),
  });
  return fetchFromApi<Player[]>(params, 'getPlayersByEvent', CACHE_TTL_STANDARD);
};

/**
 * Get all players (pro or amateur) for a season
 * @param season - The season year, or -1 for all seasons
 * @param status - Player status: 'p' for professional, 'a' for amateur
 * @param gender - Optional gender filter: 'm' for male, 'f' for female
 */
export const getAllPlayers = (
  season: number = -1,
  status: PlayerStatus = 'p',
  gender?: Gender
): Promise<Player[]> => {
  const params = new URLSearchParams({
    t: '10',
    st: status,
    s: String(season),
  });
  if (gender) {
    params.append('se', gender);
  }
  return fetchFromApi<Player[]>(params, 'getAllPlayers', CACHE_TTL_STANDARD);
};

/**
 * Get rankings for a specific ranking type and season
 * @param rankingType - Type of ranking (MoneyRankings, WorldRankings, etc.)
 * @param season - The season year
 */
export const getRankings = (
  rankingType: RankingType = 'MoneyRankings',
  season: number = 2024
): Promise<Ranking[]> => {
  const params = new URLSearchParams({
    rt: rankingType,
    s: String(season),
  });
  return fetchFromApi<Ranking[]>(params, 'getRankings', CACHE_TTL_STANDARD);
};

/**
 * Get round information for a season or event
 * @param eventId - Optional event ID (if provided, season is ignored)
 * @param season - Optional season year (used if eventId is not provided)
 */
export const getRoundInfo = (
  eventId?: number,
  season?: number
): Promise<any[]> => {
  const params = new URLSearchParams({ t: '12' });
  if (eventId) {
    params.append('e', String(eventId));
  } else if (season) {
    params.append('s', String(season));
  }
  return fetchFromApi<any[]>(params, 'getRoundInfo', CACHE_TTL_STANDARD);
};

/**
 * Get seeding information for an event
 * @param eventId - The ID of the event
 */
export const getEventSeeding = (eventId: number): Promise<EventSeeding> => {
  const params = new URLSearchParams({
    t: '13',
    e: String(eventId),
  });
  return fetchFromApi<EventSeeding>(params, 'getEventSeeding', CACHE_TTL_STANDARD);
};

/**
 * Get upcoming matches
 * @param tour - Optional tour filter ('main', 'q', 'amateur')
 */
export const getUpcomingMatches = (tour?: Tour): Promise<Match[]> => {
  const params = new URLSearchParams({ t: '14' });
  if (tour) {
    params.append('tr', tour);
  }
  return fetchFromApi<Match[]>(params, 'getUpcomingMatches', CACHE_TTL_STANDARD);
};

/**
 * Get recent results from the last N days
 * @param days - Number of days to look back (default: 0 for today only)
 * @param tour - Optional tour filter ('main', 'q', 'amateur')
 */
export const getRecentResults = (
  days: number = 0,
  tour?: Tour
): Promise<Match[]> => {
  const params = new URLSearchParams({
    t: '15',
    ds: String(days),
  });
  if (tour) {
    params.append('tr', tour);
  }
  return fetchFromApi<Match[]>(params, 'getRecentResults', CACHE_TTL_STANDARD);
};

/**
 * Get head-to-head record between two players
 * @param player1Id - ID of the first player
 * @param player2Id - ID of the second player
 * @param season - Optional season year, or -1 for all seasons
 * @param tour - Optional tour filter ('main', 'q', 'amateur')
 */
export const getHeadToHead = (
  player1Id: number,
  player2Id: number,
  season?: number,
  tour?: Tour
): Promise<Match[]> => {
  const params = new URLSearchParams({
    p1: String(player1Id),
    p2: String(player2Id),
  });
  if (season !== undefined) {
    params.append('s', String(season));
  }
  if (tour) {
    params.append('tr', tour);
  }
  return fetchFromApi<Match[]>(params, 'getHeadToHead', CACHE_TTL_STANDARD);
};

/**
 * Get ongoing matches plus upcoming or finished matches 60 minutes each way
 * @param tour - Optional tour filter ('main', 'q', 'amateur')
 */
export const getMatchesAroundNow = (tour?: Tour): Promise<Match[]> => {
  const params = new URLSearchParams({ t: '17' });
  if (tour) {
    params.append('tr', tour);
  }
  return fetchFromApi<Match[]>(params, 'getMatchesAroundNow', CACHE_TTL_LIVE);
};

/**
 * Get candidates for upcoming matches of an event
 * @param eventId - The ID of the event
 */
export const getEventCandidates = (eventId: number): Promise<any[]> => {
  const params = new URLSearchParams({
    t: '18',
    e: String(eventId),
  });
  return fetchFromApi<any[]>(params, 'getEventCandidates', CACHE_TTL_STANDARD);
};

/**
 * Get finals for an event (all available seasons)
 * @param eventId - The ID of the event
 */
export const getEventFinals = (eventId: number): Promise<Match[]> => {
  const params = new URLSearchParams({
    t: '19',
    e: String(eventId),
  });
  return fetchFromApi<Match[]>(params, 'getEventFinals', CACHE_TTL_STANDARD);
};

/**
 * Get the current season
 */
export const getCurrentSeason = (): Promise<Season> => {
  const params = new URLSearchParams({ t: '20' });
  return fetchFromApi<Season>(params, 'getCurrentSeason', CACHE_TTL_STANDARD);
};

/**
 * Get ranking points for each player in a Main Tour or Q Tour event (current season)
 * @param eventId - The ID of the event
 */
export const getEventRankingPoints = (eventId: number): Promise<RankingPoints[]> => {
  const params = new URLSearchParams({
    t: '21',
    e: String(eventId),
  });
  return fetchFromApi<RankingPoints[]>(params, 'getEventRankingPoints', CACHE_TTL_STANDARD);
};

/**
 * Utility function to format match score
 */
export const formatMatchScore = (match: Match): string => {
  return `${match.Player1_Score} - ${match.Player2_Score}`;
};

/**
 * Utility function to get match status label
 */
export const getMatchStatusLabel = (status: string): string => {
  const statusMap: Record<string, string> = {
    R: 'Result',
    U: 'Unplayed',
    A: 'Abandoned',
  };
  return statusMap[status] || 'Unknown';
};

/**
 * Utility function to calculate frame win percentage
 */
export const calculateFrameWinPercentage = (
  framesWon: number,
  framesPlayed: number
): number => {
  if (framesPlayed === 0) return 0;
  return Math.round((framesWon / framesPlayed) * 100);
};
