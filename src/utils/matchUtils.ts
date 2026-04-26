/**
 * Match utility functions for sorting and filtering
 */

import type { Match } from '../types/snooker';

/**
 * Filter criteria for matches
 */
export interface MatchFilterCriteria {
  eventId?: number;
  playerId?: number;
  startDate?: string;
  endDate?: string;
  status?: 'R' | 'U' | 'A'; // Result, Unplayed, Abandoned
  tour?: string;
}

/**
 * Date range for filtering matches
 */
export interface DateRange {
  startDate: string;
  endDate: string;
}

/**
 * Sort matches by date in descending order (most recent first)
 * @param matches Array of matches to sort
 * @returns Sorted array of matches
 */
export const sortMatchesByDateDesc = (matches: Match[]): Match[] => {
  return [...matches].sort((a, b) => {
    // Handle matches without dates - put them at the end
    if (!a.Date_Time && !b.Date_Time) {
      return 0;
    }
    if (!a.Date_Time) {
      return 1;
    }
    if (!b.Date_Time) {
      return -1;
    }
    
    try {
      const dateA = new Date(a.Date_Time);
      const dateB = new Date(b.Date_Time);
      
      // Descending order: most recent first
      return dateB.getTime() - dateA.getTime();
    } catch {
      return 0;
    }
  });
};

/**
 * Sort matches by date in ascending order (oldest first)
 * @param matches Array of matches to sort
 * @returns Sorted array of matches
 */
export const sortMatchesByDateAsc = (matches: Match[]): Match[] => {
  return [...matches].sort((a, b) => {
    // Handle matches without dates - put them at the end
    if (!a.Date_Time && !b.Date_Time) {
      return 0;
    }
    if (!a.Date_Time) {
      return 1;
    }
    if (!b.Date_Time) {
      return -1;
    }
    
    try {
      const dateA = new Date(a.Date_Time);
      const dateB = new Date(b.Date_Time);
      
      // Ascending order: oldest first
      return dateA.getTime() - dateB.getTime();
    } catch {
      return 0;
    }
  });
};

/**
 * Filter matches by event
 * @param matches Array of matches to filter
 * @param eventId Event ID to filter by
 * @returns Filtered array of matches
 */
export const filterMatchesByEvent = (matches: Match[], eventId: number): Match[] => {
  if (!eventId || eventId <= 0) {
    return matches;
  }
  
  return matches.filter(match => match.Event_ID === eventId);
};

/**
 * Filter matches by player (either player1 or player2)
 * @param matches Array of matches to filter
 * @param playerId Player ID to filter by
 * @returns Filtered array of matches
 */
export const filterMatchesByPlayer = (matches: Match[], playerId: number): Match[] => {
  if (!playerId || playerId <= 0) {
    return matches;
  }
  
  return matches.filter(match => 
    match.Player1_ID === playerId || match.Player2_ID === playerId
  );
};

/**
 * Filter matches by date range
 * @param matches Array of matches to filter
 * @param dateRange Date range to filter by
 * @returns Filtered array of matches
 */
export const filterMatchesByDateRange = (matches: Match[], dateRange: DateRange): Match[] => {
  if (!dateRange || !dateRange.startDate || !dateRange.endDate) {
    return matches;
  }
  
  const rangeStart = new Date(dateRange.startDate);
  const rangeEnd = new Date(dateRange.endDate);
  
  return matches.filter(match => {
    if (!match.Date_Time) {
      return false;
    }
    
    try {
      const matchDate = new Date(match.Date_Time);
      
      // Match date should be within the range (inclusive)
      return matchDate >= rangeStart && matchDate <= rangeEnd;
    } catch {
      return false;
    }
  });
};

/**
 * Filter matches by status
 * @param matches Array of matches to filter
 * @param status Match status to filter by ('R', 'U', 'A')
 * @returns Filtered array of matches
 */
export const filterMatchesByStatus = (matches: Match[], status: 'R' | 'U' | 'A'): Match[] => {
  if (!status) {
    return matches;
  }
  
  return matches.filter(match => match.Status === status);
};

/**
 * Combined filter function for matches
 * @param matches Array of matches to filter
 * @param criteria Filter criteria object
 * @returns Filtered array of matches
 */
export const filterMatches = (matches: Match[], criteria: MatchFilterCriteria): Match[] => {
  let filtered = [...matches];
  
  // Apply event filter
  if (criteria.eventId !== undefined) {
    filtered = filterMatchesByEvent(filtered, criteria.eventId);
  }
  
  // Apply player filter
  if (criteria.playerId !== undefined) {
    filtered = filterMatchesByPlayer(filtered, criteria.playerId);
  }
  
  // Apply date range filter
  if (criteria.startDate && criteria.endDate) {
    filtered = filterMatchesByDateRange(filtered, {
      startDate: criteria.startDate,
      endDate: criteria.endDate
    });
  }
  
  // Apply status filter
  if (criteria.status) {
    filtered = filterMatchesByStatus(filtered, criteria.status);
  }
  
  return filtered;
};

/**
 * Get completed matches (status 'R')
 * @param matches Array of matches to filter
 * @returns Array of completed matches
 */
export const getCompletedMatches = (matches: Match[]): Match[] => {
  return filterMatchesByStatus(matches, 'R');
};

/**
 * Get upcoming matches (status 'U')
 * @param matches Array of matches to filter
 * @returns Array of upcoming matches
 */
export const getUpcomingMatches = (matches: Match[]): Match[] => {
  return filterMatchesByStatus(matches, 'U');
};

/**
 * Get abandoned matches (status 'A')
 * @param matches Array of matches to filter
 * @returns Array of abandoned matches
 */
export const getAbandonedMatches = (matches: Match[]): Match[] => {
  return filterMatchesByStatus(matches, 'A');
};

/**
 * Get matches for today
 * @param matches Array of matches to filter
 * @returns Array of matches scheduled for today
 */
export const getTodaysMatches = (matches: Match[]): Match[] => {
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
  
  return filterMatchesByDateRange(matches, {
    startDate: todayStart.toISOString(),
    endDate: todayEnd.toISOString()
  });
};

/**
 * Get matches for a specific date
 * @param matches Array of matches to filter
 * @param date Date to filter by (YYYY-MM-DD format)
 * @returns Array of matches for the specified date
 */
export const getMatchesForDate = (matches: Match[], date: string): Match[] => {
  try {
    const targetDate = new Date(date);
    const dateStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    const dateEnd = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59);
    
    return filterMatchesByDateRange(matches, {
      startDate: dateStart.toISOString(),
      endDate: dateEnd.toISOString()
    });
  } catch {
    return [];
  }
};

/**
 * Get matches between two specific players
 * @param matches Array of matches to filter
 * @param player1Id First player ID
 * @param player2Id Second player ID
 * @returns Array of matches between the two players
 */
export const getMatchesBetweenPlayers = (matches: Match[], player1Id: number, player2Id: number): Match[] => {
  if (!player1Id || !player2Id || player1Id <= 0 || player2Id <= 0) {
    return [];
  }
  
  return matches.filter(match => 
    (match.Player1_ID === player1Id && match.Player2_ID === player2Id) ||
    (match.Player1_ID === player2Id && match.Player2_ID === player1Id)
  );
};

/**
 * Group matches by event
 * @param matches Array of matches to group
 * @returns Object with event IDs as keys and arrays of matches as values
 */
export const groupMatchesByEvent = (matches: Match[]): Record<number, Match[]> => {
  const grouped: Record<number, Match[]> = {};
  
  matches.forEach(match => {
    const eventId = match.Event_ID;
    if (!grouped[eventId]) {
      grouped[eventId] = [];
    }
    grouped[eventId].push(match);
  });
  
  return grouped;
};

/**
 * Group matches by date (YYYY-MM-DD)
 * @param matches Array of matches to group
 * @returns Object with date strings as keys and arrays of matches as values
 */
export const groupMatchesByDate = (matches: Match[]): Record<string, Match[]> => {
  const grouped: Record<string, Match[]> = {};
  
  matches.forEach(match => {
    if (!match.Date_Time) {
      return;
    }
    
    try {
      const matchDate = new Date(match.Date_Time);
      const dateKey = matchDate.toISOString().split('T')[0]; // YYYY-MM-DD
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(match);
    } catch {
      // Skip matches with invalid dates
    }
  });
  
  return grouped;
};

/**
 * Check if a match's date matches a target date (month and day only, ignoring year)
 * Used for "On this day" historical feature
 * @param match Match to check
 * @param targetDate Target date to match against
 * @returns True if the match's month and day match the target date
 */
export const matchesHistoricalDate = (match: Match, targetDate: Date): boolean => {
  if (!match.Date_Time) {
    return false;
  }
  
  try {
    const matchDate = new Date(match.Date_Time);
    
    // Compare month (0-11) and day (1-31)
    return matchDate.getMonth() === targetDate.getMonth() &&
           matchDate.getDate() === targetDate.getDate();
  } catch {
    return false;
  }
};

/**
 * Calculate match statistics for a player
 * @param matches Array of matches for the player
 * @param playerId Player ID to calculate stats for
 * @returns Match statistics object
 */
export interface MatchStats {
  totalMatches: number;
  wins: number;
  losses: number;
  draws: number;
  winPercentage: number;
  totalFramesWon: number;
  totalFramesLost: number;
  frameWinPercentage: number;
}

export const calculateMatchStats = (matches: Match[], playerId: number): MatchStats => {
  if (!matches || matches.length === 0 || !playerId) {
    return {
      totalMatches: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      winPercentage: 0,
      totalFramesWon: 0,
      totalFramesLost: 0,
      frameWinPercentage: 0
    };
  }
  
  let wins = 0;
  let losses = 0;
  let draws = 0;
  let totalFramesWon = 0;
  let totalFramesLost = 0;
  
  const playerMatches = filterMatchesByPlayer(matches, playerId);
  
  playerMatches.forEach(match => {
    const isPlayer1 = match.Player1_ID === playerId;
    const playerScore = isPlayer1 ? match.Player1_Score : match.Player2_Score;
    const opponentScore = isPlayer1 ? match.Player2_Score : match.Player1_Score;
    
    totalFramesWon += playerScore;
    totalFramesLost += opponentScore;
    
    if (playerScore > opponentScore) {
      wins++;
    } else if (opponentScore > playerScore) {
      losses++;
    } else {
      draws++;
    }
  });
  
  const totalMatches = playerMatches.length;
  const winPercentage = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;
  const totalFrames = totalFramesWon + totalFramesLost;
  const frameWinPercentage = totalFrames > 0 ? Math.round((totalFramesWon / totalFrames) * 100) : 0;
  
  return {
    totalMatches,
    wins,
    losses,
    draws,
    winPercentage,
    totalFramesWon,
    totalFramesLost,
    frameWinPercentage
  };
};