/**
 * Utility functions for snooker API data processing and formatting
 */

import type { Match, Player, Ranking } from '../types/snooker';

/**
 * Format a date string to a readable format
 */
export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
};

/**
 * Format a date and time string
 */
export const formatDateTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
};

/**
 * Calculate frame win percentage
 */
export const calculateFrameWinPercentage = (
  framesWon: number,
  framesPlayed: number
): number => {
  if (framesPlayed === 0) return 0;
  return Math.round((framesWon / framesPlayed) * 100);
};

/**
 * Format match score as a string
 */
export const formatMatchScore = (match: Match): string => {
  return `${match.Player1_Score} - ${match.Player2_Score}`;
};

/**
 * Get match status label
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
 * Determine if a match is live
 */
export const isMatchLive = (match: Match): boolean => {
  return match.Status === 'U' && match.Date_Time !== undefined;
};

/**
 * Sort matches by date (most recent first)
 */
export const sortMatchesByDate = (matches: Match[]): Match[] => {
  return [...matches].sort((a, b) => {
    const dateA = new Date(a.Date_Time || 0).getTime();
    const dateB = new Date(b.Date_Time || 0).getTime();
    return dateB - dateA;
  });
};

/**
 * Sort players by ranking
 */
export const sortPlayersByRanking = (players: Player[]): Player[] => {
  return [...players].sort((a, b) => {
    const rankingA = (a as any).Ranking || Infinity;
    const rankingB = (b as any).Ranking || Infinity;
    return rankingA - rankingB;
  });
};

/**
 * Sort rankings by position
 */
export const sortRankingsByPosition = (rankings: Ranking[]): Ranking[] => {
  return [...rankings].sort((a, b) => a.Position - b.Position);
};

/**
 * Filter matches by player
 */
export const filterMatchesByPlayer = (
  matches: Match[],
  playerId: number
): Match[] => {
  return matches.filter(
    (match) => match.Player1_ID === playerId || match.Player2_ID === playerId
  );
};

/**
 * Filter matches by event
 */
export const filterMatchesByEvent = (
  matches: Match[],
  eventId: number
): Match[] => {
  return matches.filter((match) => match.Event_ID === eventId);
};

/**
 * Get player's opponent in a match
 */
export const getOpponent = (match: Match, playerId: number) => {
  if (match.Player1_ID === playerId) {
    return {
      id: match.Player2_ID,
      name: match.Player2_Name,
      score: match.Player2_Score,
    };
  }
  return {
    id: match.Player1_ID,
    name: match.Player1_Name,
    score: match.Player1_Score,
  };
};

/**
 * Get player's score in a match
 */
export const getPlayerScore = (match: Match, playerId: number): number => {
  if (match.Player1_ID === playerId) {
    return match.Player1_Score;
  }
  return match.Player2_Score;
};

/**
 * Determine if player won a match
 */
export const didPlayerWin = (match: Match, playerId: number): boolean => {
  const playerScore = getPlayerScore(match, playerId);
  const opponentScore = getOpponent(match, playerId).score;
  return playerScore > opponentScore;
};

/**
 * Calculate head-to-head statistics
 */
export const calculateH2HStats = (
  matches: Match[],
  player1Id: number,
  player2Id: number
) => {
  let player1Wins = 0;
  let player2Wins = 0;

  matches.forEach((match) => {
    if (match.Status === 'R') {
      // Only count completed matches
      if (didPlayerWin(match, player1Id)) {
        player1Wins++;
      } else if (didPlayerWin(match, player2Id)) {
        player2Wins++;
      }
    }
  });

  const totalMatches = player1Wins + player2Wins;
  const player1WinPercentage =
    totalMatches > 0 ? Math.round((player1Wins / totalMatches) * 100) : 0;
  const player2WinPercentage =
    totalMatches > 0 ? Math.round((player2Wins / totalMatches) * 100) : 0;

  return {
    player1Wins,
    player2Wins,
    totalMatches,
    player1WinPercentage,
    player2WinPercentage,
  };
};

/**
 * Group matches by event
 */
export const groupMatchesByEvent = (
  matches: Match[]
): Record<number, Match[]> => {
  return matches.reduce(
    (acc, match) => {
      if (!acc[match.Event_ID]) {
        acc[match.Event_ID] = [];
      }
      acc[match.Event_ID].push(match);
      return acc;
    },
    {} as Record<number, Match[]>
  );
};

/**
 * Group matches by round
 */
export const groupMatchesByRound = (
  matches: Match[]
): Record<number, Match[]> => {
  return matches.reduce(
    (acc, match) => {
      if (!acc[match.Round_ID]) {
        acc[match.Round_ID] = [];
      }
      acc[match.Round_ID].push(match);
      return acc;
    },
    {} as Record<number, Match[]>
  );
};

/**
 * Calculate player statistics from matches
 */
export const calculatePlayerStats = (matches: Match[], playerId: number) => {
  const playerMatches = filterMatchesByPlayer(matches, playerId);
  const wins = playerMatches.filter((m) => didPlayerWin(m, playerId)).length;
  const losses = playerMatches.length - wins;
  const winPercentage =
    playerMatches.length > 0
      ? Math.round((wins / playerMatches.length) * 100)
      : 0;

  let totalFramesWon = 0;
  let totalFramesPlayed = 0;

  playerMatches.forEach((match) => {
    const playerScore = getPlayerScore(match, playerId);
    const opponentScore = getOpponent(match, playerId).score;
    totalFramesWon += playerScore;
    totalFramesPlayed += playerScore + opponentScore;
  });

  const frameWinPercentage = calculateFrameWinPercentage(
    totalFramesWon,
    totalFramesPlayed
  );

  return {
    matchesPlayed: playerMatches.length,
    wins,
    losses,
    winPercentage,
    totalFramesWon,
    totalFramesPlayed,
    frameWinPercentage,
  };
};

/**
 * Format currency (for prize money)
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
  }).format(amount);
};

/**
 * Get season display name
 */
export const getSeasonDisplayName = (startYear: number, endYear: number): string => {
  return `${startYear}/${endYear}`;
};
