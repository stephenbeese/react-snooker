/**
 * Head-to-head utility functions for calculating H2H statistics and grouping
 */

import type { Match, Event } from '../types/snooker';

/**
 * Head-to-head statistics between two players
 */
export interface H2HStats {
  player1Id: number;
  player1Name: string;
  player1Wins: number;
  player1WinPercentage: number;
  player2Id: number;
  player2Name: string;
  player2Wins: number;
  player2WinPercentage: number;
  totalMatches: number;
  draws: number;
}

/**
 * Head-to-head record grouped by event type
 */
export interface H2HByEventType {
  eventType: string;
  matches: Match[];
  player1Wins: number;
  player2Wins: number;
  draws: number;
  totalMatches: number;
}

/**
 * Calculate head-to-head win percentage for each player
 * @param matches Array of matches between two players
 * @param player1Id First player ID
 * @param player2Id Second player ID
 * @returns H2H statistics with win percentages
 */
export const calculateH2HWinPercentage = (
  matches: Match[],
  player1Id: number,
  player2Id: number
): H2HStats => {
  if (!matches || matches.length === 0 || !player1Id || !player2Id) {
    return {
      player1Id,
      player1Name: '',
      player1Wins: 0,
      player1WinPercentage: 0,
      player2Id,
      player2Name: '',
      player2Wins: 0,
      player2WinPercentage: 0,
      totalMatches: 0,
      draws: 0
    };
  }

  // Filter matches to only include those between the two specified players
  const h2hMatches = matches.filter(match => 
    (match.Player1_ID === player1Id && match.Player2_ID === player2Id) ||
    (match.Player1_ID === player2Id && match.Player2_ID === player1Id)
  );

  if (h2hMatches.length === 0) {
    return {
      player1Id,
      player1Name: '',
      player1Wins: 0,
      player1WinPercentage: 0,
      player2Id,
      player2Name: '',
      player2Wins: 0,
      player2WinPercentage: 0,
      totalMatches: 0,
      draws: 0
    };
  }

  let player1Wins = 0;
  let player2Wins = 0;
  let draws = 0;
  let player1Name = '';
  let player2Name = '';

  h2hMatches.forEach(match => {
    // Get player names from the first match
    if (!player1Name || !player2Name) {
      if (match.Player1_ID === player1Id) {
        player1Name = match.Player1_Name;
        player2Name = match.Player2_Name;
      } else {
        player1Name = match.Player2_Name;
        player2Name = match.Player1_Name;
      }
    }

    // Determine winner
    const isPlayer1AsPlayer1 = match.Player1_ID === player1Id;
    const player1Score = isPlayer1AsPlayer1 ? match.Player1_Score : match.Player2_Score;
    const player2Score = isPlayer1AsPlayer1 ? match.Player2_Score : match.Player1_Score;

    if (player1Score > player2Score) {
      player1Wins++;
    } else if (player2Score > player1Score) {
      player2Wins++;
    } else {
      draws++;
    }
  });

  const totalMatches = h2hMatches.length;
  
  // Calculate win percentages (wins / total matches) × 100, rounded to nearest integer
  const player1WinPercentage = totalMatches > 0 ? Math.round((player1Wins / totalMatches) * 100) : 0;
  const player2WinPercentage = totalMatches > 0 ? Math.round((player2Wins / totalMatches) * 100) : 0;

  return {
    player1Id,
    player1Name,
    player1Wins,
    player1WinPercentage,
    player2Id,
    player2Name,
    player2Wins,
    player2WinPercentage,
    totalMatches,
    draws
  };
};

/**
 * Calculate comprehensive H2H statistics including frame data
 * @param matches Array of matches between two players
 * @param player1Id First player ID
 * @param player2Id Second player ID
 * @returns Comprehensive H2H statistics
 */
export const calculateH2HStats = (
  matches: Match[],
  player1Id: number,
  player2Id: number
): H2HStats & {
  player1FramesWon: number;
  player2FramesWon: number;
  totalFrames: number;
  player1FrameWinPercentage: number;
  player2FrameWinPercentage: number;
} => {
  const basicStats = calculateH2HWinPercentage(matches, player1Id, player2Id);
  
  // Filter matches to only include those between the two specified players
  const h2hMatches = matches.filter(match => 
    (match.Player1_ID === player1Id && match.Player2_ID === player2Id) ||
    (match.Player1_ID === player2Id && match.Player2_ID === player1Id)
  );

  let player1FramesWon = 0;
  let player2FramesWon = 0;

  h2hMatches.forEach(match => {
    const isPlayer1AsPlayer1 = match.Player1_ID === player1Id;
    const player1Score = isPlayer1AsPlayer1 ? match.Player1_Score : match.Player2_Score;
    const player2Score = isPlayer1AsPlayer1 ? match.Player2_Score : match.Player1_Score;

    player1FramesWon += player1Score;
    player2FramesWon += player2Score;
  });

  const totalFrames = player1FramesWon + player2FramesWon;
  const player1FrameWinPercentage = totalFrames > 0 ? Math.round((player1FramesWon / totalFrames) * 100) : 0;
  const player2FrameWinPercentage = totalFrames > 0 ? Math.round((player2FramesWon / totalFrames) * 100) : 0;

  return {
    ...basicStats,
    player1FramesWon,
    player2FramesWon,
    totalFrames,
    player1FrameWinPercentage,
    player2FrameWinPercentage
  };
};

/**
 * Group head-to-head matches by event type
 * @param matches Array of H2H matches
 * @param events Array of events to get event type information
 * @param player1Id First player ID
 * @param player2Id Second player ID
 * @returns H2H matches grouped by event type
 */
export const groupH2HByEventType = (
  matches: Match[],
  events: Event[],
  player1Id: number,
  player2Id: number
): H2HByEventType[] => {
  if (!matches || matches.length === 0 || !events || events.length === 0) {
    return [];
  }

  // Filter matches to only include those between the two specified players
  const h2hMatches = matches.filter(match => 
    (match.Player1_ID === player1Id && match.Player2_ID === player2Id) ||
    (match.Player1_ID === player2Id && match.Player2_ID === player1Id)
  );

  // Create a map of event ID to event type for quick lookup
  const eventTypeMap = new Map<number, string>();
  events.forEach(event => {
    eventTypeMap.set(event.ID, event.Tour || 'Unknown');
  });

  // Group matches by event type
  const groupedByType = new Map<string, Match[]>();
  
  h2hMatches.forEach(match => {
    const eventType = eventTypeMap.get(match.Event_ID) || 'Unknown';
    
    if (!groupedByType.has(eventType)) {
      groupedByType.set(eventType, []);
    }
    groupedByType.get(eventType)!.push(match);
  });

  // Calculate statistics for each event type group
  const result: H2HByEventType[] = [];
  
  groupedByType.forEach((typeMatches, eventType) => {
    let player1Wins = 0;
    let player2Wins = 0;
    let draws = 0;

    typeMatches.forEach(match => {
      const isPlayer1AsPlayer1 = match.Player1_ID === player1Id;
      const player1Score = isPlayer1AsPlayer1 ? match.Player1_Score : match.Player2_Score;
      const player2Score = isPlayer1AsPlayer1 ? match.Player2_Score : match.Player1_Score;

      if (player1Score > player2Score) {
        player1Wins++;
      } else if (player2Score > player1Score) {
        player2Wins++;
      } else {
        draws++;
      }
    });

    result.push({
      eventType,
      matches: typeMatches,
      player1Wins,
      player2Wins,
      draws,
      totalMatches: typeMatches.length
    });
  });

  // Sort by event type name for consistent ordering
  return result.sort((a, b) => a.eventType.localeCompare(b.eventType));
};

/**
 * Get head-to-head record aggregated by different criteria
 * @param matches Array of H2H matches
 * @param player1Id First player ID
 * @param player2Id Second player ID
 * @returns Aggregated H2H record with various breakdowns
 */
export const aggregateH2HRecord = (
  matches: Match[],
  player1Id: number,
  player2Id: number
): {
  overall: H2HStats;
  byYear: Record<number, H2HStats>;
  recentForm: H2HStats; // Last 10 matches
} => {
  // Filter matches to only include those between the two specified players
  const h2hMatches = matches.filter(match => 
    (match.Player1_ID === player1Id && match.Player2_ID === player2Id) ||
    (match.Player1_ID === player2Id && match.Player2_ID === player1Id)
  );

  // Overall statistics
  const overall = calculateH2HWinPercentage(h2hMatches, player1Id, player2Id);

  // Group by year
  const byYear: Record<number, H2HStats> = {};
  const matchesByYear = new Map<number, Match[]>();

  h2hMatches.forEach(match => {
    if (match.Date_Time) {
      try {
        const year = new Date(match.Date_Time).getFullYear();
        if (!matchesByYear.has(year)) {
          matchesByYear.set(year, []);
        }
        matchesByYear.get(year)!.push(match);
      } catch {
        // Skip matches with invalid dates
      }
    }
  });

  matchesByYear.forEach((yearMatches, year) => {
    byYear[year] = calculateH2HWinPercentage(yearMatches, player1Id, player2Id);
  });

  // Recent form (last 10 matches)
  const sortedMatches = [...h2hMatches].sort((a, b) => {
    if (!a.Date_Time && !b.Date_Time) return 0;
    if (!a.Date_Time) return 1;
    if (!b.Date_Time) return -1;
    
    try {
      return new Date(b.Date_Time).getTime() - new Date(a.Date_Time).getTime();
    } catch {
      return 0;
    }
  });

  const recentMatches = sortedMatches.slice(0, 10);
  const recentForm = calculateH2HWinPercentage(recentMatches, player1Id, player2Id);

  return {
    overall,
    byYear,
    recentForm
  };
};

/**
 * Find the most common venue for H2H matches
 * @param matches Array of H2H matches
 * @param events Array of events to get venue information
 * @returns Most common venue name or null if no venue data
 */
export const getMostCommonH2HVenue = (
  matches: Match[],
  events: Event[]
): string | null => {
  if (!matches || matches.length === 0 || !events || events.length === 0) {
    return null;
  }

  // Create a map of event ID to venue for quick lookup
  const eventVenueMap = new Map<number, string>();
  events.forEach(event => {
    if (event.Venue) {
      eventVenueMap.set(event.ID, event.Venue);
    }
  });

  // Count venues
  const venueCounts = new Map<string, number>();
  
  matches.forEach(match => {
    const venue = eventVenueMap.get(match.Event_ID);
    if (venue) {
      venueCounts.set(venue, (venueCounts.get(venue) || 0) + 1);
    }
  });

  if (venueCounts.size === 0) {
    return null;
  }

  // Find the venue with the highest count
  let mostCommonVenue = '';
  let maxCount = 0;

  venueCounts.forEach((count, venue) => {
    if (count > maxCount) {
      maxCount = count;
      mostCommonVenue = venue;
    }
  });

  return mostCommonVenue || null;
};

/**
 * Calculate head-to-head performance trends over time
 * @param matches Array of H2H matches
 * @param player1Id First player ID
 * @param player2Id Second player ID
 * @returns Array of performance data points over time
 */
export const calculateH2HTrends = (
  matches: Match[],
  player1Id: number,
  player2Id: number
): Array<{
  date: string;
  player1CumulativeWins: number;
  player2CumulativeWins: number;
  player1WinPercentage: number;
  player2WinPercentage: number;
}> => {
  // Filter and sort matches chronologically
  const h2hMatches = matches
    .filter(match => 
      (match.Player1_ID === player1Id && match.Player2_ID === player2Id) ||
      (match.Player1_ID === player2Id && match.Player2_ID === player1Id)
    )
    .filter(match => match.Date_Time) // Only matches with dates
    .sort((a, b) => {
      try {
        return new Date(a.Date_Time!).getTime() - new Date(b.Date_Time!).getTime();
      } catch {
        return 0;
      }
    });

  const trends: Array<{
    date: string;
    player1CumulativeWins: number;
    player2CumulativeWins: number;
    player1WinPercentage: number;
    player2WinPercentage: number;
  }> = [];

  let player1CumulativeWins = 0;
  let player2CumulativeWins = 0;

  h2hMatches.forEach(match => {
    const isPlayer1AsPlayer1 = match.Player1_ID === player1Id;
    const player1Score = isPlayer1AsPlayer1 ? match.Player1_Score : match.Player2_Score;
    const player2Score = isPlayer1AsPlayer1 ? match.Player2_Score : match.Player1_Score;

    if (player1Score > player2Score) {
      player1CumulativeWins++;
    } else if (player2Score > player1Score) {
      player2CumulativeWins++;
    }

    const totalMatches = player1CumulativeWins + player2CumulativeWins;
    const player1WinPercentage = totalMatches > 0 ? Math.round((player1CumulativeWins / totalMatches) * 100) : 0;
    const player2WinPercentage = totalMatches > 0 ? Math.round((player2CumulativeWins / totalMatches) * 100) : 0;

    trends.push({
      date: match.Date_Time!,
      player1CumulativeWins,
      player2CumulativeWins,
      player1WinPercentage,
      player2WinPercentage
    });
  });

  return trends;
};