/**
 * Utility functions for ranking calculations and comparisons
 */

import type { Ranking, Tour } from '../types/snooker';

/**
 * Calculate ranking change between two consecutive ranking snapshots
 * @param currentRankings - Current ranking snapshot
 * @param previousRankings - Previous ranking snapshot
 * @returns Array of rankings with calculated changes
 */
export function calculateRankingChange(
  currentRankings: Ranking[],
  previousRankings: Ranking[]
): Ranking[] {
  // Create a map of previous rankings for quick lookup
  const previousRankingMap = new Map<number, number>();
  previousRankings.forEach(ranking => {
    previousRankingMap.set(ranking.Player_ID, ranking.Position);
  });

  // Calculate changes for current rankings
  return currentRankings.map(currentRanking => {
    const previousPosition = previousRankingMap.get(currentRanking.Player_ID);
    
    // Change = previous position - current position
    // Positive change means moved up (lower position number)
    // Negative change means moved down (higher position number)
    const change = previousPosition !== undefined 
      ? previousPosition - currentRanking.Position 
      : undefined;

    return {
      ...currentRanking,
      Change: change
    };
  });
}

/**
 * Filter rankings by tour type
 * @param rankings - Array of rankings to filter
 * @param tour - Tour type to filter by
 * @returns Filtered rankings array
 */
export function filterRankingsByTour(rankings: Ranking[], tour: Tour): Ranking[] {
  // Note: The Ranking interface doesn't include tour information directly
  // This function is a placeholder for when tour information is available
  // For now, return all rankings as the API doesn't provide tour-specific rankings
  return rankings;
}

/**
 * Filter rankings by season
 * @param rankings - Array of rankings to filter
 * @param season - Season to filter by
 * @returns Filtered rankings array
 */
export function filterRankingsBySeason(rankings: Ranking[], season: number): Ranking[] {
  // Note: The Ranking interface doesn't include season information directly
  // This function is a placeholder for when season information is available
  // For now, return all rankings as the API doesn't provide season-specific rankings
  return rankings;
}

/**
 * Sort rankings by position (ascending order)
 * @param rankings - Array of rankings to sort
 * @returns Sorted rankings array
 */
export function sortRankingsByPosition(rankings: Ranking[]): Ranking[] {
  return [...rankings].sort((a, b) => a.Position - b.Position);
}

/**
 * Get rankings with positive changes (moved up)
 * @param rankings - Array of rankings with changes
 * @returns Rankings that moved up
 */
export function getRankingsMovedUp(rankings: Ranking[]): Ranking[] {
  return rankings.filter(ranking => ranking.Change !== undefined && ranking.Change > 0);
}

/**
 * Get rankings with negative changes (moved down)
 * @param rankings - Array of rankings with changes
 * @returns Rankings that moved down
 */
export function getRankingsMovedDown(rankings: Ranking[]): Ranking[] {
  return rankings.filter(ranking => ranking.Change !== undefined && ranking.Change < 0);
}

/**
 * Get rankings with no change
 * @param rankings - Array of rankings with changes
 * @returns Rankings that stayed in the same position
 */
export function getRankingsNoChange(rankings: Ranking[]): Ranking[] {
  return rankings.filter(ranking => ranking.Change !== undefined && ranking.Change === 0);
}

/**
 * Get new entries in rankings (players not in previous ranking)
 * @param rankings - Array of rankings with changes
 * @returns Rankings for new entries
 */
export function getNewRankingEntries(rankings: Ranking[]): Ranking[] {
  return rankings.filter(ranking => ranking.Change === undefined);
}