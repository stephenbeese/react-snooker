/**
 * Mock API service for development when snooker.org API is unavailable
 * Provides the same interface as the real API but returns mock data
 */

import type {
  Player,
  PlayerProfile,
  Event,
  Match,
  Ranking,
  Season,
  RankingType,
  Tour,
  PlayerStatus,
  Gender,
} from '../types/snooker';

import {
  mockCurrentSeason,
  mockPlayers,
  mockPlayerProfile,
  mockEvents,
  mockMatches,
  mockRankings,
} from './mockData';

/**
 * Simulate API delay
 */
const delay = (ms: number = 500): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Mock API functions that match the real API interface
 */

export const getEvent = async (eventId: number): Promise<Event> => {
  await delay();
  const event = mockEvents.find(e => e.ID === eventId);
  if (!event) {
    throw new Error(`Event with ID ${eventId} not found`);
  }
  return event;
};

export const getMatch = async (
  eventId: number,
  roundId: number,
  matchNumber: number
): Promise<Match> => {
  await delay();
  const match = mockMatches.find(m => 
    m.Event_ID === eventId && m.ID === matchNumber
  );
  if (!match) {
    throw new Error(`Match not found`);
  }
  return match;
};

export const getPlayer = async (playerId: number): Promise<PlayerProfile> => {
  await delay();
  if (playerId === 1) {
    return mockPlayerProfile;
  }
  const player = mockPlayers.find(p => p.ID === playerId);
  if (!player) {
    throw new Error(`Player with ID ${playerId} not found`);
  }
  return {
    ...player,
    Bio: `Professional snooker player from ${player.Nationality}`,
  };
};

export const getEventsBySeason = async (
  season: number = -1,
  tour?: Tour
): Promise<Event[]> => {
  await delay();
  return mockEvents.filter(event => 
    !tour || event.Tour === tour || event.Tour === 'Main Tour'
  );
};

export const getMatchesByEvent = async (eventId: number): Promise<Match[]> => {
  await delay();
  return mockMatches.filter(match => match.Event_ID === eventId);
};

export const getOngoingMatches = async (tour?: Tour): Promise<Match[]> => {
  await delay();
  return mockMatches.filter(match => 
    match.Status === 'L' || match.Status === 'P'
  );
};

export const getPlayerMatches = async (
  playerId: number,
  season?: number,
  tour?: Tour
): Promise<Match[]> => {
  await delay();
  return mockMatches.filter(match => 
    match.Player1_ID === playerId || match.Player2_ID === playerId
  );
};

export const getPlayersByEvent = async (eventId: number): Promise<Player[]> => {
  await delay();
  return mockPlayers;
};

export const getAllPlayers = async (
  season: number = -1,
  status: PlayerStatus = 'p',
  gender?: Gender
): Promise<Player[]> => {
  await delay();
  return mockPlayers.filter(player => 
    player.Status.toLowerCase() === status.toLowerCase()
  );
};

export const getRankings = async (
  rankingType: RankingType = 'MoneyRankings',
  season: number = 2024
): Promise<Ranking[]> => {
  await delay();
  return mockRankings;
};

export const getRoundInfo = async (
  eventId?: number,
  season?: number
): Promise<any[]> => {
  await delay();
  return [
    { ID: 1, Name: 'Qualifying Round 1', Best_Of: 11 },
    { ID: 2, Name: 'Qualifying Round 2', Best_Of: 11 },
    { ID: 3, Name: 'Round 1', Best_Of: 19 },
    { ID: 4, Name: 'Round 2', Best_Of: 25 },
    { ID: 5, Name: 'Quarter-Final', Best_Of: 25 },
    { ID: 6, Name: 'Semi-Final', Best_Of: 33 },
    { ID: 7, Name: 'Final', Best_Of: 35 },
  ];
};

export const getEventSeeding = async (eventId: number): Promise<any> => {
  await delay();
  return {
    Event_ID: eventId,
    Seeds: mockPlayers.map((player, index) => ({
      Player_ID: player.ID,
      Player_Name: player.Name,
      Seed: index + 1,
    })),
  };
};

export const getUpcomingMatches = async (tour?: Tour): Promise<Match[]> => {
  await delay();
  return mockMatches.filter(match => match.Status === 'U');
};

export const getRecentResults = async (
  days: number = 0,
  tour?: Tour
): Promise<Match[]> => {
  await delay();
  return mockMatches.filter(match => match.Status === 'R');
};

export const getHeadToHead = async (
  player1Id: number,
  player2Id: number,
  season?: number,
  tour?: Tour
): Promise<Match[]> => {
  await delay();
  return mockMatches.filter(match => 
    (match.Player1_ID === player1Id && match.Player2_ID === player2Id) ||
    (match.Player1_ID === player2Id && match.Player2_ID === player1Id)
  );
};

export const getMatchesAroundNow = async (tour?: Tour): Promise<Match[]> => {
  await delay();
  return mockMatches.filter(match => 
    match.Status === 'L' || match.Status === 'P' || match.Status === 'U'
  );
};

export const getEventCandidates = async (eventId: number): Promise<any[]> => {
  await delay();
  return mockPlayers.map(player => ({
    Player_ID: player.ID,
    Player_Name: player.Name,
    Qualified: Math.random() > 0.5,
  }));
};

export const getEventFinals = async (eventId: number): Promise<Match[]> => {
  await delay();
  return mockMatches.filter(match => 
    match.Event_ID === eventId && match.Round === 'Final'
  );
};

export const getCurrentSeason = async (): Promise<Season> => {
  await delay();
  return mockCurrentSeason;
};

export const getEventRankingPoints = async (eventId: number): Promise<any[]> => {
  await delay();
  return mockPlayers.map((player, index) => ({
    Player_ID: player.ID,
    Player_Name: player.Name,
    Points: Math.max(0, 50000 - (index * 5000)),
    Prize_Money: Math.max(0, 100000 - (index * 10000)),
  }));
};

// Utility functions (same as real API)
export const formatMatchScore = (match: Match): string => {
  return `${match.Player1_Score} - ${match.Player2_Score}`;
};

export const getMatchStatusLabel = (status: string): string => {
  const statusMap: Record<string, string> = {
    R: 'Result',
    U: 'Unplayed',
    A: 'Abandoned',
    L: 'Live',
    P: 'In Progress',
  };
  return statusMap[status] || 'Unknown';
};

export const calculateFrameWinPercentage = (
  framesWon: number,
  framesPlayed: number
): number => {
  if (framesPlayed === 0) return 0;
  return Math.round((framesWon / framesPlayed) * 100);
};

// Cache functions (no-op for mock)
export const getFromCache = <T>(key: string): T | null => null;
export const setCache = <T>(key: string, data: T, ttl?: number): void => {};
export const clearApiCache = (): void => {};