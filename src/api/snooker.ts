/**
 * Snooker.org API Client
 * Handles all API requests to the snooker.org API with proper headers and error handling
 * Falls back to mock API when real API is unavailable (403 errors)
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

// Import mock API functions
import * as mockApi from './mockApi';

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
 * Transform raw API player data to our expected format
 */
const transformPlayerData = (rawPlayer: any): Player => {
  // Construct full name
  const nameParts = [rawPlayer.FirstName, rawPlayer.MiddleName, rawPlayer.LastName].filter(Boolean);
  const fullName = nameParts.join(' ');
  
  // Parse birth year from date string
  let birthYear: number | undefined;
  if (rawPlayer.Born) {
    const birthDate = new Date(rawPlayer.Born);
    birthYear = birthDate.getFullYear();
  }
  
  // Determine status from Type (1 = Professional)
  const status: 'P' | 'A' = rawPlayer.Type === 1 ? 'P' : 'A';
  
  return {
    ...rawPlayer,
    Name: rawPlayer.ShortName || fullName,
    Image_Url: rawPlayer.Photo,
    Turned_Pro: rawPlayer.FirstSeasonAsPro,
    Born: birthYear,
    Status: status,
  };
};

/**
 * Transform array of raw API player data
 */
const transformPlayersData = (rawPlayers: any[]): Player[] => {
  if (!Array.isArray(rawPlayers)) {
    console.warn('Expected array of players, got:', typeof rawPlayers);
    return [];
  }
  
  return rawPlayers.map(transformPlayerData);
};

/**
 * Generic fetch wrapper with error handling, header injection, and caching
 * Falls back to mock API on 403 errors
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

    console.log('📡 API Response status:', response.status, response.statusText);

    if (!response.ok) {
      // If we get a 403 or 401 error, the API key is likely invalid
      // Fall back to mock API for development
      if (response.status === 403 || response.status === 401) {
        console.warn(`⚠️ Snooker API returned ${response.status} - API key may be invalid. Using mock data for development.`);
        console.warn('📧 To fix this, request a new API key by emailing webmaster@snooker.org');
        throw new Error('API_KEY_INVALID');
      }
      
      const error: ApiError = {
        message: `API request failed: ${response.statusText}`,
        status: response.status,
      };
      throw error;
    }

    // Check content type
    const contentType = response.headers.get('content-type');
    
    if (!contentType || !contentType.includes('application/json')) {
      console.warn('⚠️ Response is not JSON, likely HTML error page - API key may be invalid');
      const text = await response.text();
      console.log('📄 Response text (first 200 chars):', text.substring(0, 200));
      throw new Error('API_KEY_INVALID');
    }

    const data = await response.json();
    
    // Store in cache
    setCache<T>(cacheKey, data, ttl);
    
    return data as T;
  } catch (error) {
    // If API key is invalid, fall back to mock API
    if (error instanceof Error && error.message === 'API_KEY_INVALID') {
      throw error; // Re-throw to be caught by individual functions
    }
    
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
export const getEvent = async (eventId: number): Promise<Event> => {
  try {
    const params = new URLSearchParams({ e: String(eventId) });
    return await fetchFromApi<Event>(params, 'getEvent', CACHE_TTL_STANDARD);
  } catch (error) {
    if (error instanceof Error && error.message === 'API_KEY_INVALID') {
      return await mockApi.getEvent(eventId);
    }
    throw error;
  }
};

/**
 * Get information about a specific match
 * @param eventId - The ID of the event
 * @param roundId - The ID of the round
 * @param matchNumber - The match number
 */
export const getMatch = async (
  eventId: number,
  roundId: number,
  matchNumber: number
): Promise<Match> => {
  try {
    const params = new URLSearchParams({
      e: String(eventId),
      r: String(roundId),
      n: String(matchNumber),
    });
    return await fetchFromApi<Match>(params, 'getMatch', CACHE_TTL_STANDARD);
  } catch (error) {
    if (error instanceof Error && error.message === 'API_KEY_INVALID') {
      return await mockApi.getMatch(eventId, roundId, matchNumber);
    }
    throw error;
  }
};

/**
 * Get information about a specific player
 * @param playerId - The ID of the player
 */
export const getPlayer = async (playerId: number): Promise<PlayerProfile> => {
  try {
    const params = new URLSearchParams({ p: String(playerId) });
    const rawResult = await fetchFromApi<any>(params, 'getPlayer', CACHE_TTL_STANDARD);
    return transformPlayerData(rawResult) as PlayerProfile;
  } catch (error) {
    if (error instanceof Error && error.message === 'API_KEY_INVALID') {
      return await mockApi.getPlayer(playerId);
    }
    throw error;
  }
};

/**
 * Get all events in a specific season
 * @param season - The season year (e.g., 2024 for 2024/2025 season), or -1 for all seasons
 * @param tour - Optional tour filter ('main', 'q', 'amateur')
 */
export const getEventsBySeason = async (
  season: number = -1,
  tour?: Tour
): Promise<Event[]> => {
  try {
    const params = new URLSearchParams({
      t: '5',
      s: String(season),
    });
    if (tour) {
      params.append('tr', tour);
    }
    return await fetchFromApi<Event[]>(params, 'getEventsBySeason', CACHE_TTL_STANDARD);
  } catch (error) {
    if (error instanceof Error && error.message === 'API_KEY_INVALID') {
      return await mockApi.getEventsBySeason(season, tour);
    }
    throw error;
  }
};

/**
 * Get all matches in a specific event
 * @param eventId - The ID of the event
 */
export const getMatchesByEvent = async (eventId: number): Promise<Match[]> => {
  try {
    const params = new URLSearchParams({
      t: '6',
      e: String(eventId),
    });
    return await fetchFromApi<Match[]>(params, 'getMatchesByEvent', CACHE_TTL_STANDARD);
  } catch (error) {
    if (error instanceof Error && error.message === 'API_KEY_INVALID') {
      return await mockApi.getMatchesByEvent(eventId);
    }
    throw error;
  }
};

/**
 * Get ongoing matches (including those between sessions)
 * @param tour - Optional tour filter ('main', 'q', 'amateur')
 */
export const getOngoingMatches = async (tour?: Tour): Promise<Match[]> => {
  try {
    const params = new URLSearchParams({ t: '7' });
    if (tour) {
      params.append('tr', tour);
    }
    return await fetchFromApi<Match[]>(params, 'getOngoingMatches', CACHE_TTL_LIVE);
  } catch (error) {
    if (error instanceof Error && error.message === 'API_KEY_INVALID') {
      return await mockApi.getOngoingMatches(tour);
    }
    throw error;
  }
};

/**
 * Get matches for a specific player in a season
 * @param playerId - The ID of the player
 * @param season - Optional season year, or -1 for all seasons
 * @param tour - Optional tour filter ('main', 'q', 'amateur')
 */
export const getPlayerMatches = async (
  playerId: number,
  season?: number,
  tour?: Tour
): Promise<Match[]> => {
  try {
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
    return await fetchFromApi<Match[]>(params, 'getPlayerMatches', CACHE_TTL_STANDARD);
  } catch (error) {
    if (error instanceof Error && error.message === 'API_KEY_INVALID') {
      return await mockApi.getPlayerMatches(playerId, season, tour);
    }
    throw error;
  }
};

/**
 * Get all players in a specific event
 * @param eventId - The ID of the event
 */
export const getPlayersByEvent = async (eventId: number): Promise<Player[]> => {
  try {
    const params = new URLSearchParams({
      t: '9',
      e: String(eventId),
    });
    const rawResult = await fetchFromApi<any[]>(params, 'getPlayersByEvent', CACHE_TTL_STANDARD);
    return transformPlayersData(rawResult);
  } catch (error) {
    if (error instanceof Error && error.message === 'API_KEY_INVALID') {
      return await mockApi.getPlayersByEvent(eventId);
    }
    throw error;
  }
};

/**
 * Get all players (pro or amateur) for a season
 * @param season - The season year, or -1 for all seasons
 * @param status - Player status: 'p' for professional, 'a' for amateur
 * @param gender - Optional gender filter: 'm' for male, 'f' for female
 */
export const getAllPlayers = async (
  season: number = -1,
  status: PlayerStatus = 'p',
  gender?: Gender
): Promise<Player[]> => {
  try {
    const params = new URLSearchParams({
      t: '10',
      st: status,
      s: String(season),
    });
    if (gender) {
      params.append('se', gender);
    }
    
    console.log('🔍 getAllPlayers API call:', {
      url: `${API_BASE}/?${params.toString()}`,
      params: params.toString(),
      season,
      status,
      gender
    });
    
    const rawResult = await fetchFromApi<any[]>(params, 'getAllPlayers', CACHE_TTL_STANDARD);
    console.log('✅ getAllPlayers raw result sample:', rawResult?.slice(0, 2));
    
    const transformedResult = transformPlayersData(rawResult);
    console.log('✅ getAllPlayers transformed result sample:', transformedResult?.slice(0, 2));
    
    return transformedResult;
  } catch (error) {
    console.log('❌ getAllPlayers error, falling back to mock:', error);
    if (error instanceof Error && error.message === 'API_KEY_INVALID') {
      return await mockApi.getAllPlayers(season, status, gender);
    }
    throw error;
  }
};

/**
 * Get rankings for a specific ranking type and season
 * @param rankingType - Type of ranking (MoneyRankings, WorldRankings, etc.)
 * @param season - The season year
 */
export const getRankings = async (
  rankingType: RankingType = 'MoneyRankings',
  season: number = 2024
): Promise<Ranking[]> => {
  try {
    const params = new URLSearchParams({
      rt: rankingType,
      s: String(season),
    });
    return await fetchFromApi<Ranking[]>(params, 'getRankings', CACHE_TTL_STANDARD);
  } catch (error) {
    if (error instanceof Error && error.message === 'API_KEY_INVALID') {
      return await mockApi.getRankings(rankingType, season);
    }
    throw error;
  }
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
export const getUpcomingMatches = async (tour?: Tour): Promise<Match[]> => {
  try {
    const params = new URLSearchParams({ t: '14' });
    if (tour) {
      params.append('tr', tour);
    }
    return await fetchFromApi<Match[]>(params, 'getUpcomingMatches', CACHE_TTL_STANDARD);
  } catch (error) {
    if (error instanceof Error && error.message === 'API_KEY_INVALID') {
      return await mockApi.getUpcomingMatches(tour);
    }
    throw error;
  }
};

/**
 * Get recent results from the last N days
 * @param days - Number of days to look back (default: 0 for today only)
 * @param tour - Optional tour filter ('main', 'q', 'amateur')
 */
export const getRecentResults = async (
  days: number = 0,
  tour?: Tour
): Promise<Match[]> => {
  try {
    const params = new URLSearchParams({
      t: '15',
      ds: String(days),
    });
    if (tour) {
      params.append('tr', tour);
    }
    return await fetchFromApi<Match[]>(params, 'getRecentResults', CACHE_TTL_STANDARD);
  } catch (error) {
    if (error instanceof Error && error.message === 'API_KEY_INVALID') {
      return await mockApi.getRecentResults(days, tour);
    }
    throw error;
  }
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
export const getCurrentSeason = async (): Promise<Season> => {
  try {
    const params = new URLSearchParams({ t: '20' });
    return await fetchFromApi<Season>(params, 'getCurrentSeason', CACHE_TTL_STANDARD);
  } catch (error) {
    if (error instanceof Error && error.message === 'API_KEY_INVALID') {
      return await mockApi.getCurrentSeason();
    }
    throw error;
  }
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
