/**
 * Custom React hooks for snooker.org API calls with caching and error handling
 */

import { useState, useEffect, useRef } from 'react';
import type {
  Player,
  PlayerProfile,
  Event,
  Match,
  Ranking,
  Season,
  Tour,
  PlayerStatus,
  Gender,
  RankingType,
} from '../types/snooker';
import * as snookerApi from '../api/snooker';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Simple in-memory cache for API responses
 */
const apiCache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCacheKey = (fn: string, args: unknown[]): string => {
  return `${fn}:${JSON.stringify(args)}`;
};

const getFromCache = <T = unknown>(key: string): T | null => {
  const cached = apiCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data as T;
  }
  apiCache.delete(key);
  return null;
};

const setCache = (key: string, data: unknown): void => {
  apiCache.set(key, { data, timestamp: Date.now() });
};

/**
 * Generic hook for API calls with caching
 */
const useApiCall = <T,>(
  apiFunction: (...args: any[]) => Promise<T>,
  args: any[],
  cacheKey: string
): UseApiState<T> => {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    const fetchData = async () => {
      // Check cache first
      const cached = getFromCache<T>(cacheKey);
      if (cached) {
        if (isMountedRef.current) {
          setState({ data: cached, loading: false, error: null });
        }
        return;
      }

      try {
        const result = await apiFunction(...args);
        if (isMountedRef.current) {
          setCache(cacheKey, result);
          setState({ data: result, loading: false, error: null });
        }
      } catch (err) {
        if (isMountedRef.current) {
          setState({
            data: null,
            loading: false,
            error: err instanceof Error ? err : new Error('Unknown error'),
          });
        }
      }
    };

    fetchData();

    return () => {
      isMountedRef.current = false;
    };
  }, [cacheKey, apiFunction, args]);

  return state;
};

/**
 * Hook to fetch a specific event
 */
export const useEvent = (eventId: number) => {
  const cacheKey = getCacheKey('getEvent', [eventId]);
  return useApiCall<Event>(snookerApi.getEvent, [eventId], cacheKey);
};

/**
 * Hook to fetch a specific player
 */
export const usePlayer = (playerId: number) => {
  const cacheKey = getCacheKey('getPlayer', [playerId]);
  return useApiCall<PlayerProfile>(snookerApi.getPlayer, [playerId], cacheKey);
};

/**
 * Hook to fetch events by season
 */
export const useEventsBySeason = (season: number = -1, tour?: Tour) => {
  const cacheKey = getCacheKey('getEventsBySeason', [season, tour]);
  return useApiCall<Event[]>(
    snookerApi.getEventsBySeason,
    [season, tour],
    cacheKey
  );
};

/**
 * Hook to fetch matches by event
 */
export const useMatchesByEvent = (eventId: number) => {
  const cacheKey = getCacheKey('getMatchesByEvent', [eventId]);
  return useApiCall<Match[]>(
    snookerApi.getMatchesByEvent,
    [eventId],
    cacheKey
  );
};

/**
 * Hook to fetch ongoing matches
 */
export const useOngoingMatches = (tour?: Tour) => {
  const cacheKey = getCacheKey('getOngoingMatches', [tour]);
  return useApiCall<Match[]>(
    snookerApi.getOngoingMatches,
    [tour],
    cacheKey
  );
};

/**
 * Hook to fetch player matches
 */
export const usePlayerMatches = (
  playerId: number,
  season?: number,
  tour?: Tour
) => {
  const cacheKey = getCacheKey('getPlayerMatches', [playerId, season, tour]);
  return useApiCall<Match[]>(
    snookerApi.getPlayerMatches,
    [playerId, season, tour],
    cacheKey
  );
};

/**
 * Hook to fetch players by event
 */
export const usePlayersByEvent = (eventId: number) => {
  const cacheKey = getCacheKey('getPlayersByEvent', [eventId]);
  return useApiCall<Player[]>(
    snookerApi.getPlayersByEvent,
    [eventId],
    cacheKey
  );
};

/**
 * Hook to fetch all players
 */
export const useAllPlayers = (
  season: number = -1,
  status: PlayerStatus = 'p',
  gender?: Gender
) => {
  const cacheKey = getCacheKey('getAllPlayers', [season, status, gender]);
  return useApiCall<Player[]>(
    snookerApi.getAllPlayers,
    [season, status, gender],
    cacheKey
  );
};

/**
 * Hook to fetch rankings
 */
export const useRankings = (
  rankingType: RankingType = 'MoneyRankings',
  season: number = 2024
) => {
  const cacheKey = getCacheKey('getRankings', [rankingType, season]);
  return useApiCall<Ranking[]>(
    snookerApi.getRankings,
    [rankingType, season],
    cacheKey
  );
};

/**
 * Hook to fetch upcoming matches
 */
export const useUpcomingMatches = (tour?: Tour) => {
  const cacheKey = getCacheKey('getUpcomingMatches', [tour]);
  return useApiCall<Match[]>(
    snookerApi.getUpcomingMatches,
    [tour],
    cacheKey
  );
};

/**
 * Hook to fetch recent results
 */
export const useRecentResults = (days: number = 0, tour?: Tour) => {
  const cacheKey = getCacheKey('getRecentResults', [days, tour]);
  return useApiCall<Match[]>(
    snookerApi.getRecentResults,
    [days, tour],
    cacheKey
  );
};

/**
 * Hook to fetch head-to-head record
 */
export const useHeadToHead = (
  player1Id: number,
  player2Id: number,
  season?: number,
  tour?: Tour
) => {
  const cacheKey = getCacheKey('getHeadToHead', [
    player1Id,
    player2Id,
    season,
    tour,
  ]);
  return useApiCall<Match[]>(
    snookerApi.getHeadToHead,
    [player1Id, player2Id, season, tour],
    cacheKey
  );
};

/**
 * Hook to fetch current season
 */
export const useCurrentSeason = () => {
  const cacheKey = getCacheKey('getCurrentSeason', []);
  return useApiCall<Season>(snookerApi.getCurrentSeason, [], cacheKey);
};

/**
 * Hook to fetch event ranking points
 */
export const useEventRankingPoints = (eventId: number) => {
  const cacheKey = getCacheKey('getEventRankingPoints', [eventId]);
  return useApiCall(snookerApi.getEventRankingPoints, [eventId], cacheKey);
};

/**
 * Hook to fetch a specific match
 */
export const useMatch = (
  eventId: number,
  roundId: number,
  matchNumber: number
) => {
  const cacheKey = getCacheKey('getMatch', [eventId, roundId, matchNumber]);
  return useApiCall<Match>(
    snookerApi.getMatch,
    [eventId, roundId, matchNumber],
    cacheKey
  );
};

/**
 * Clear all cached data
 */
export const clearApiCache = (): void => {
  apiCache.clear();
};

/**
 * Clear specific cache entry
 */
export const clearCacheEntry = (cacheKey: string): void => {
  apiCache.delete(cacheKey);
};
