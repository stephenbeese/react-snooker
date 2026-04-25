/**
 * Performance utility functions for calculating pressure situation statistics
 * Handles deciding frames and comeback scenarios
 */

import type { Match, Frame } from '../types/snooker';

export interface PressureSituation {
  type: 'deciding_frame' | 'comeback_match';
  matchId: number;
  frameNumber?: number;
  playerWon: boolean;
  description: string;
}

export interface PressurePerformance {
  playerId: number;
  totalPressureSituations: number;
  pressureSituationsWon: number;
  pressureWinPercentage: number;
  decidingFrames: {
    total: number;
    won: number;
    winPercentage: number;
  };
  comebackMatches: {
    total: number;
    won: number;
    winPercentage: number;
  };
  situations: PressureSituation[];
}

/**
 * Identifies if a frame is a deciding frame (final frame that determines match winner)
 * A deciding frame is one where:
 * - The match is completed (Status: 'R')
 * - The frame determines the overall match winner
 * - It's the last frame played in the match
 */
export function isDecidingFrame(match: Match, frameNumber: number): boolean {
  if (match.Status !== 'R' || !match.Frames || match.Frames.length === 0) {
    return false;
  }

  // Get the final frame number
  const maxFrameNumber = Math.max(...match.Frames.map(f => f.Frame_Number));
  
  // Check if this is the final frame
  if (frameNumber !== maxFrameNumber) {
    return false;
  }

  // Check if the match was close enough that this frame decided it
  // A deciding frame means the match could have gone either way before this frame
  const player1Score = match.Player1_Score;
  const player2Score = match.Player2_Score;
  
  // If the scores are equal or differ by 1, the last frame was deciding
  return Math.abs(player1Score - player2Score) <= 1;
}

/**
 * Identifies if a match represents a comeback scenario
 * A comeback match is one where:
 * - The player was behind at some point during the match
 * - The player ultimately won the match
 * - There's frame-by-frame data to track the progression
 */
export function isComebackMatch(match: Match, playerId: number): boolean {
  if (match.Status !== 'R' || !match.Frames || match.Frames.length === 0) {
    return false;
  }

  const isPlayer1 = match.Player1_ID === playerId;
  const isPlayer2 = match.Player2_ID === playerId;
  
  if (!isPlayer1 && !isPlayer2) {
    return false;
  }

  // Check if player won the match
  const playerFinalScore = isPlayer1 ? match.Player1_Score : match.Player2_Score;
  const opponentFinalScore = isPlayer1 ? match.Player2_Score : match.Player1_Score;
  
  if (playerFinalScore <= opponentFinalScore) {
    return false; // Player didn't win
  }

  // Track running scores to see if player was ever behind
  let playerRunningScore = 0;
  let opponentRunningScore = 0;
  let wasBehind = false;

  // Sort frames by frame number to ensure correct order
  const sortedFrames = [...match.Frames].sort((a, b) => a.Frame_Number - b.Frame_Number);

  for (const frame of sortedFrames) {
    // Update running scores based on frame winner
    if (frame.Winner_ID === playerId) {
      playerRunningScore++;
    } else if (frame.Winner_ID && frame.Winner_ID !== playerId) {
      opponentRunningScore++;
    }

    // Check if player was behind after this frame
    if (opponentRunningScore > playerRunningScore) {
      wasBehind = true;
    }
  }

  return wasBehind;
}

/**
 * Calculates comprehensive pressure situation performance for a player
 * Analyzes all matches to identify deciding frames and comeback scenarios
 */
export function calculatePressurePerformance(matches: Match[], playerId: number): PressurePerformance {
  const situations: PressureSituation[] = [];
  let decidingFramesTotal = 0;
  let decidingFramesWon = 0;
  let comebackMatchesTotal = 0;
  let comebackMatchesWon = 0;

  for (const match of matches) {
    const isPlayer1 = match.Player1_ID === playerId;
    const isPlayer2 = match.Player2_ID === playerId;
    
    if (!isPlayer1 && !isPlayer2) {
      continue; // Player not in this match
    }

    // Check for comeback matches
    if (isComebackMatch(match, playerId)) {
      comebackMatchesTotal++;
      comebackMatchesWon++; // If it's a comeback match, player won by definition
      
      situations.push({
        type: 'comeback_match',
        matchId: match.ID,
        playerWon: true,
        description: `Comeback victory against ${isPlayer1 ? match.Player2_Name : match.Player1_Name}`
      });
    }

    // Check for deciding frames
    if (match.Frames && match.Frames.length > 0) {
      for (const frame of match.Frames) {
        if (isDecidingFrame(match, frame.Frame_Number)) {
          decidingFramesTotal++;
          const playerWonFrame = frame.Winner_ID === playerId;
          
          if (playerWonFrame) {
            decidingFramesWon++;
          }

          situations.push({
            type: 'deciding_frame',
            matchId: match.ID,
            frameNumber: frame.Frame_Number,
            playerWon: playerWonFrame,
            description: `Deciding frame ${frame.Frame_Number} vs ${isPlayer1 ? match.Player2_Name : match.Player1_Name}`
          });
        }
      }
    }
  }

  const totalPressureSituations = decidingFramesTotal + comebackMatchesTotal;
  const pressureSituationsWon = decidingFramesWon + comebackMatchesWon;

  return {
    playerId,
    totalPressureSituations,
    pressureSituationsWon,
    pressureWinPercentage: totalPressureSituations > 0 
      ? Math.round((pressureSituationsWon / totalPressureSituations) * 100) 
      : 0,
    decidingFrames: {
      total: decidingFramesTotal,
      won: decidingFramesWon,
      winPercentage: decidingFramesTotal > 0 
        ? Math.round((decidingFramesWon / decidingFramesTotal) * 100) 
        : 0
    },
    comebackMatches: {
      total: comebackMatchesTotal,
      won: comebackMatchesWon,
      winPercentage: comebackMatchesTotal > 0 
        ? Math.round((comebackMatchesWon / comebackMatchesTotal) * 100) 
        : 0
    },
    situations
  };
}

/**
 * Helper function to get pressure situations for a specific type
 */
export function getPressureSituationsByType(
  performance: PressurePerformance, 
  type: 'deciding_frame' | 'comeback_match'
): PressureSituation[] {
  return performance.situations.filter(situation => situation.type === type);
}

/**
 * Helper function to calculate pressure performance summary
 */
export function getPressurePerformanceSummary(performance: PressurePerformance): string {
  const { totalPressureSituations, pressureWinPercentage, decidingFrames, comebackMatches } = performance;
  
  if (totalPressureSituations === 0) {
    return 'No pressure situations recorded';
  }

  const parts: string[] = [];
  
  if (decidingFrames.total > 0) {
    parts.push(`${decidingFrames.won}/${decidingFrames.total} deciding frames (${decidingFrames.winPercentage}%)`);
  }
  
  if (comebackMatches.total > 0) {
    parts.push(`${comebackMatches.won}/${comebackMatches.total} comeback matches (${comebackMatches.winPercentage}%)`);
  }

  return `Overall pressure performance: ${pressureWinPercentage}% (${parts.join(', ')})`;
}