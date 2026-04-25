/**
 * Example component demonstrating snooker.org API usage
 * This file shows common patterns for using the API client and hooks
 */

import { useCurrentSeason, useRankings, useOngoingMatches, usePlayer } from '../hooks/useSnookerApi';
import { formatMatchScore, formatCurrency } from '../api/utils';

/**
 * Example 1: Display current season and top rankings
 */
export function RankingsExample() {
  const { data: season, loading: seasonLoading } = useCurrentSeason();
  const { data: rankings, loading: rankingsLoading } = useRankings('MoneyRankings', 2024);

  if (seasonLoading || rankingsLoading) {
    return <div className="loading">Loading rankings...</div>;
  }

  if (!rankings) {
    return <div className="error">Failed to load rankings</div>;
  }

  return (
    <div className="rankings-container">
      <h2>Money Rankings - {season?.Name}</h2>
      <table className="rankings-table">
        <thead>
          <tr>
            <th>Position</th>
            <th>Player</th>
            <th>Nationality</th>
            <th>Prize Money</th>
          </tr>
        </thead>
        <tbody>
          {rankings.slice(0, 10).map((rank) => (
            <tr key={rank.Position}>
              <td>{rank.Position}</td>
              <td>{rank.Player_Name}</td>
              <td>{rank.Nationality}</td>
              <td>{formatCurrency(rank.Money || 0)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Example 2: Display live matches
 */
export function LiveMatchesExample() {
  const { data: matches, loading, error } = useOngoingMatches('main');

  if (loading) {
    return <div className="loading">Loading live matches...</div>;
  }

  if (error) {
    return <div className="error">Error: {error.message}</div>;
  }

  if (!matches || matches.length === 0) {
    return <div className="info">No live matches at the moment</div>;
  }

  return (
    <div className="live-matches-container">
      <h2>Live Matches</h2>
      <div className="matches-grid">
        {matches.map((match) => (
          <div key={match.ID} className="match-card">
            <div className="match-header">
              <span className="live-indicator">● LIVE</span>
            </div>
            <div className="match-players">
              <div className="player">
                <span className="player-name">{match.Player1_Name}</span>
                <span className="player-score">{match.Player1_Score}</span>
              </div>
              <div className="vs">vs</div>
              <div className="player">
                <span className="player-name">{match.Player2_Name}</span>
                <span className="player-score">{match.Player2_Score}</span>
              </div>
            </div>
            {match.Table && <div className="match-table">Table: {match.Table}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Example 3: Display player profile
 */
export function PlayerProfileExample({ playerId }: { playerId: number }) {
  const { data: player, loading, error } = usePlayer(playerId);

  if (loading) {
    return <div className="loading">Loading player profile...</div>;
  }

  if (error) {
    return <div className="error">Error: {error.message}</div>;
  }

  if (!player) {
    return <div className="error">Player not found</div>;
  }

  return (
    <div className="player-profile-container">
      <div className="player-header">
        {player.Image_Url && (
          <img src={player.Image_Url} alt={player.Name} className="player-image" />
        )}
        <div className="player-info">
          <h1>{player.Name}</h1>
          <p className="nationality">{player.Nationality}</p>
        </div>
      </div>

      <div className="player-stats">
        <div className="stat">
          <label>Ranking</label>
          <value>{player.Ranking || 'N/A'}</value>
        </div>
        <div className="stat">
          <label>Money Ranking</label>
          <value>{player.Money_Ranking || 'N/A'}</value>
        </div>
        <div className="stat">
          <label>Frame Win %</label>
          <value>{player.Frame_Win_Percentage || 'N/A'}%</value>
        </div>
        <div className="stat">
          <label>Status</label>
          <value>{player.Status === 'P' ? 'Professional' : 'Amateur'}</value>
        </div>
      </div>

      {player.Born && (
        <div className="player-details">
          <p>Born: {player.Born}</p>
          {player.Turned_Pro && <p>Turned Pro: {player.Turned_Pro}</p>}
        </div>
      )}
    </div>
  );
}

/**
 * Example 4: Complete dashboard combining multiple endpoints
 */
export function SnookerDashboard() {
  const { data: season } = useCurrentSeason();
  const { data: rankings } = useRankings('MoneyRankings', 2024);
  const { data: liveMatches } = useOngoingMatches('main');

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Snooker Dashboard</h1>
        {season && <p className="season-info">Season: {season.Name}</p>}
      </header>

      <div className="dashboard-grid">
        <section className="dashboard-section">
          <h2>Top 5 Players</h2>
          {rankings && (
            <ul className="top-players-list">
              {rankings.slice(0, 5).map((rank) => (
                <li key={rank.Position}>
                  <span className="rank-position">{rank.Position}</span>
                  <span className="rank-name">{rank.Player_Name}</span>
                  <span className="rank-money">{formatCurrency(rank.Money || 0)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="dashboard-section">
          <h2>Live Matches</h2>
          {liveMatches && liveMatches.length > 0 ? (
            <div className="live-matches-list">
              {liveMatches.slice(0, 3).map((match) => (
                <div key={match.ID} className="live-match-item">
                  <div className="match-score">
                    <span>{match.Player1_Name}</span>
                    <span className="score">{formatMatchScore(match)}</span>
                    <span>{match.Player2_Name}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-matches">No live matches</p>
          )}
        </section>
      </div>
    </div>
  );
}

/**
 * Example 5: Error boundary wrapper for API calls
 */
export function ApiCallWithErrorBoundary({ playerId }: { playerId: number }) {
  const { data, loading, error } = usePlayer(playerId);

  return (
    <div className="api-call-wrapper">
      {loading && <div className="spinner">Loading...</div>}
      {error && (
        <div className="error-message">
          <h3>Something went wrong</h3>
          <p>{error.message}</p>
          <p className="error-hint">Please try again later or contact support</p>
        </div>
      )}
      {data && (
        <div className="success-content">
          <h2>{data.Name}</h2>
          <p>Successfully loaded player data</p>
        </div>
      )}
    </div>
  );
}
