/**
 * FormChart component - Line chart showing player's performance over last 10 matches
 */

import { useMemo } from 'react';
import type { Match } from '../../types/snooker';

interface FormChartProps {
  matches: Match[];
  playerId: number;
  playerName: string;
}

interface ChartDataPoint {
  matchNumber: number;
  result: 'win' | 'loss' | 'draw';
  score: string;
  opponent: string;
  date: string;
}

export const FormChart = ({ matches, playerId, playerName }: FormChartProps) => {
  // Process matches into chart data
  const chartData = useMemo(() => {
    // Take last 10 matches and reverse to show chronological order
    const recentMatches = matches.slice(0, 10).reverse();
    
    return recentMatches.map((match, index) => {
      const isPlayer1 = match.Player1_ID === playerId;
      const playerScore = isPlayer1 ? match.Player1_Score : match.Player2_Score;
      const opponentScore = isPlayer1 ? match.Player2_Score : match.Player1_Score;
      const opponentName = isPlayer1 ? match.Player2_Name : match.Player1_Name;
      
      let result: 'win' | 'loss' | 'draw';
      if (playerScore > opponentScore) {
        result = 'win';
      } else if (opponentScore > playerScore) {
        result = 'loss';
      } else {
        result = 'draw';
      }

      return {
        matchNumber: index + 1,
        result,
        score: `${playerScore}-${opponentScore}`,
        opponent: opponentName,
        date: match.Date_Time ? new Date(match.Date_Time).toLocaleDateString('en-GB') : 'TBD'
      };
    });
  }, [matches, playerId]);

  // Calculate running win percentage
  const runningWinPercentage = useMemo(() => {
    let wins = 0;
    return chartData.map((point, index) => {
      if (point.result === 'win') wins++;
      const totalMatches = index + 1;
      return Math.round((wins / totalMatches) * 100);
    });
  }, [chartData]);

  // SVG dimensions
  const width = 800;
  const height = 300;
  const margin = { top: 20, right: 30, bottom: 60, left: 50 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  // Scale functions
  const xScale = (matchNumber: number) => 
    ((matchNumber - 1) / Math.max(chartData.length - 1, 1)) * chartWidth;
  
  const yScale = (percentage: number) => 
    chartHeight - (percentage / 100) * chartHeight;

  // Generate path for line chart
  const linePath = useMemo(() => {
    if (chartData.length === 0) return '';
    
    const points = runningWinPercentage.map((percentage, index) => 
      `${xScale(index + 1)},${yScale(percentage)}`
    ).join(' L ');
    
    return `M ${points}`;
  }, [chartData, runningWinPercentage, xScale, yScale]);

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Form Chart</h2>
        <div className="text-center py-8 text-gray-500">
          No match data available for form chart.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Form Chart - Last {chartData.length} Matches
      </h2>
      
      <div className="mb-4">
        <p className="text-gray-600">
          Win percentage trend for {playerName} over recent matches
        </p>
      </div>

      {/* Chart Container */}
      <div className="overflow-x-auto">
        <svg width={width} height={height} className="border border-gray-200 rounded">
          {/* Chart Area */}
          <g transform={`translate(${margin.left}, ${margin.top})`}>
            {/* Grid Lines */}
            {[0, 25, 50, 75, 100].map(percentage => (
              <g key={percentage}>
                <line
                  x1={0}
                  y1={yScale(percentage)}
                  x2={chartWidth}
                  y2={yScale(percentage)}
                  stroke="#e5e7eb"
                  strokeDasharray="2,2"
                />
                <text
                  x={-10}
                  y={yScale(percentage)}
                  textAnchor="end"
                  dominantBaseline="middle"
                  className="text-xs fill-gray-500"
                >
                  {percentage}%
                </text>
              </g>
            ))}

            {/* X-axis labels */}
            {chartData.map((point, index) => (
              <text
                key={index}
                x={xScale(point.matchNumber)}
                y={chartHeight + 15}
                textAnchor="middle"
                className="text-xs fill-gray-500"
              >
                {point.matchNumber}
              </text>
            ))}

            {/* Line Chart */}
            {chartData.length > 1 && (
              <path
                d={linePath}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
                className="drop-shadow-sm"
              />
            )}

            {/* Data Points */}
            {chartData.map((point, index) => {
              const x = xScale(point.matchNumber);
              const y = yScale(runningWinPercentage[index]);
              const color = point.result === 'win' ? '#10b981' : point.result === 'loss' ? '#ef4444' : '#f59e0b';
              
              return (
                <g key={index}>
                  <circle
                    cx={x}
                    cy={y}
                    r="4"
                    fill={color}
                    stroke="white"
                    strokeWidth="2"
                    className="drop-shadow-sm"
                  />
                  
                  {/* Tooltip on hover */}
                  <circle
                    cx={x}
                    cy={y}
                    r="8"
                    fill="transparent"
                    className="cursor-pointer"
                  >
                    <title>
                      Match {point.matchNumber}: {point.result.toUpperCase()} vs {point.opponent} ({point.score})
                      {'\n'}Date: {point.date}
                      {'\n'}Win %: {runningWinPercentage[index]}%
                    </title>
                  </circle>
                </g>
              );
            })}
          </g>

          {/* Y-axis label */}
          <text
            x={20}
            y={height / 2}
            textAnchor="middle"
            transform={`rotate(-90, 20, ${height / 2})`}
            className="text-sm fill-gray-700 font-medium"
          >
            Win Percentage (%)
          </text>

          {/* X-axis label */}
          <text
            x={width / 2}
            y={height - 10}
            textAnchor="middle"
            className="text-sm fill-gray-700 font-medium"
          >
            Match Number (Most Recent)
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center justify-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span>Win</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span>Loss</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <span>Draw</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-0.5 h-4 bg-blue-500"></div>
          <span>Win % Trend</span>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {chartData.filter(p => p.result === 'win').length}
          </div>
          <div className="text-sm text-gray-600">Wins</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">
            {chartData.filter(p => p.result === 'loss').length}
          </div>
          <div className="text-sm text-gray-600">Losses</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {runningWinPercentage[runningWinPercentage.length - 1] || 0}%
          </div>
          <div className="text-sm text-gray-600">Current Win %</div>
        </div>
      </div>
    </div>
  );
};