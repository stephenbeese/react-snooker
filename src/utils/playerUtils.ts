/**
 * Player utility functions for filtering and statistics calculations
 */

import type { Player, PlayerProfile, Match, Frame } from '../types/snooker';

/**
 * Filter criteria for players
 */
export interface PlayerFilterCriteria {
  nationality?: string;
  minRanking?: number;
  maxRanking?: number;
  season?: number;
  status?: 'P' | 'A'; // Professional or Amateur
}

/**
 * Player form data for last N matches
 */
export interface PlayerForm {
  playerId: number;
  playerName: string;
  lastMatches: Match[];
  wins: number;
  losses: number;
  winPercentage: number;
  formTrend: 'improving' | 'declining' | 'stable';
}

/**
 * Filter players by nationality
 * @param players Array of players to filter
 * @param nationality Nationality to filter by
 * @returns Filtered array of players
 */
export const filterPlayersByNationality = (players: Player[], nationality: string): Player[] => {
  if (!nationality || nationality.trim() === '') {
    return players;
  }
  
  return players.filter(player => 
    player.Nationality && 
    player.Nationality.toLowerCase() === nationality.toLowerCase()
  );
};

/**
 * Filter players by ranking range
 * @param players Array of players to filter
 * @param minRanking Minimum ranking (inclusive)
 * @param maxRanking Maximum ranking (inclusive)
 * @returns Filtered array of players
 */
export const filterPlayersByRanking = (players: PlayerProfile[], minRanking?: number, maxRanking?: number): PlayerProfile[] => {
  return players.filter(player => {
    // Skip players without ranking
    if (!player.Ranking || player.Ranking <= 0) {
      return false;
    }
    
    // Check minimum ranking
    if (minRanking !== undefined && player.Ranking < minRanking) {
      return false;
    }
    
    // Check maximum ranking
    if (maxRanking !== undefined && player.Ranking > maxRanking) {
      return false;
    }
    
    return true;
  });
};

/**
 * Filter players by season (placeholder - would need season-specific player data)
 * @param players Array of players to filter
 * @param _season Season to filter by (unused in current implementation)
 * @returns Filtered array of players
 */
export const filterPlayersBySeason = (players: Player[], _season: number): Player[] => {
  // Note: This is a placeholder implementation since the Player interface
  // doesn't include season-specific data. In a real implementation,
  // this would filter based on player activity in the specified season.
  return players;
};

/**
 * Calculate frame win percentage from match data
 * @param matches Array of matches for a player
 * @param playerId ID of the player to calculate percentage for
 * @returns Frame win percentage (0-100)
 */
export const calculateFrameWinPercentage = (matches: Match[], playerId: number): number => {
  if (!matches || matches.length === 0) {
    return 0;
  }
  
  let totalFrames = 0;
  let framesWon = 0;
  
  matches.forEach(match => {
    // Determine if this player is player1 or player2
    const isPlayer1 = match.Player1_ID === playerId;
    const isPlayer2 = match.Player2_ID === playerId;
    
    if (!isPlayer1 && !isPlayer2) {
      return; // Player not in this match
    }
    
    // If we have frame-by-frame data, use it
    if (match.Frames && match.Frames.length > 0) {
      match.Frames.forEach(frame => {
        totalFrames++;
        if (frame.Winner_ID === playerId) {
          framesWon++;
        }
      });
    } else {
      // Fall back to match scores
      const playerScore = isPlayer1 ? match.Player1_Score : match.Player2_Score;
      const opponentScore = isPlayer1 ? match.Player2_Score : match.Player1_Score;
      
      totalFrames += playerScore + opponentScore;
      framesWon += playerScore;
    }
  });
  
  if (totalFrames === 0) {
    return 0;
  }
  
  return Math.round((framesWon / totalFrames) * 100);
};

/**
 * Calculate player form from last N matches
 * @param matches Array of matches for a player (should be sorted by date, most recent first)
 * @param playerId ID of the player
 * @param matchCount Number of recent matches to consider (default: 10)
 * @returns Player form data
 */
export const calculatePlayerForm = (matches: Match[], playerId: number, matchCount: number = 10): PlayerForm => {
  if (!matches || matches.length === 0) {
    return {
      playerId,
      playerName: '',
      lastMatches: [],
      wins: 0,
      losses: 0,
      winPercentage: 0,
      formTrend: 'stable'
    };
  }
  
  // Take the last N matches
  const recentMatches = matches.slice(0, matchCount);
  const playerName = recentMatches[0]?.Player1_ID === playerId 
    ? recentMatches[0]?.Player1_Name 
    : recentMatches[0]?.Player2_Name || '';
  
  let wins = 0;
  let losses = 0;
  
  recentMatches.forEach(match => {
    const isPlayer1 = match.Player1_ID === playerId;
    const isPlayer2 = match.Player2_ID === playerId;
    
    if (!isPlayer1 && !isPlayer2) {
      return; // Player not in this match
    }
    
    const playerScore = isPlayer1 ? match.Player1_Score : match.Player2_Score;
    const opponentScore = isPlayer1 ? match.Player2_Score : match.Player1_Score;
    
    if (playerScore > opponentScore) {
      wins++;
    } else if (opponentScore > playerScore) {
      losses++;
    }
    // Draws are ignored in win/loss calculation
  });
  
  const totalMatches = wins + losses;
  const winPercentage = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;
  
  // Calculate form trend (simple implementation)
  let formTrend: 'improving' | 'declining' | 'stable' = 'stable';
  
  if (recentMatches.length >= 6) {
    // Compare first half vs second half of recent matches
    const firstHalf = recentMatches.slice(0, Math.floor(recentMatches.length / 2));
    const secondHalf = recentMatches.slice(Math.floor(recentMatches.length / 2));
    
    const firstHalfWins = firstHalf.filter(match => {
      const isPlayer1 = match.Player1_ID === playerId;
      const playerScore = isPlayer1 ? match.Player1_Score : match.Player2_Score;
      const opponentScore = isPlayer1 ? match.Player2_Score : match.Player1_Score;
      return playerScore > opponentScore;
    }).length;
    
    const secondHalfWins = secondHalf.filter(match => {
      const isPlayer1 = match.Player1_ID === playerId;
      const playerScore = isPlayer1 ? match.Player1_Score : match.Player2_Score;
      const opponentScore = isPlayer1 ? match.Player2_Score : match.Player1_Score;
      return playerScore > opponentScore;
    }).length;
    
    const firstHalfWinRate = firstHalf.length > 0 ? firstHalfWins / firstHalf.length : 0;
    const secondHalfWinRate = secondHalf.length > 0 ? secondHalfWins / secondHalf.length : 0;
    
    if (secondHalfWinRate > firstHalfWinRate + 0.2) {
      formTrend = 'improving';
    } else if (firstHalfWinRate > secondHalfWinRate + 0.2) {
      formTrend = 'declining';
    }
  }
  
  return {
    playerId,
    playerName,
    lastMatches: recentMatches,
    wins,
    losses,
    winPercentage,
    formTrend
  };
};

/**
 * Combined filter function for players
 * @param players Array of players to filter
 * @param criteria Filter criteria object
 * @returns Filtered array of players
 */
export const filterPlayers = (players: Player[], criteria: PlayerFilterCriteria): Player[] => {
  let filtered = [...players];
  
  // Apply nationality filter
  if (criteria.nationality) {
    filtered = filterPlayersByNationality(filtered, criteria.nationality);
  }
  
  // Apply ranking filter (only for PlayerProfile objects)
  if ((criteria.minRanking !== undefined || criteria.maxRanking !== undefined)) {
    // Cast to PlayerProfile for ranking filter
    const profilePlayers = filtered as PlayerProfile[];
    filtered = filterPlayersByRanking(profilePlayers, criteria.minRanking, criteria.maxRanking);
  }
  
  // Apply season filter
  if (criteria.season !== undefined) {
    filtered = filterPlayersBySeason(filtered, criteria.season);
  }
  
  // Apply status filter
  if (criteria.status) {
    filtered = filtered.filter(player => player.Status === criteria.status);
  }
  
  return filtered;
};