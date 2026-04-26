/**
 * Unit tests for rankings display components
 * Tests correct display and sorting
 * **Validates: Requirements 6.1, 6.2**
 */

import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { RankingsList } from '../components/pages/RankingsList';
import { RankingFilters } from '../components/pages/RankingFilters';
import type { Ranking } from '../types';

// Mock ranking data
const mockRankings: Ranking[] = [
  {
    Position: 1,
    Player_ID: 100,
    Player_Name: 'Ronnie O\'Sullivan',
    Nationality: 'England',
    Points: 1000000,
    Money: 500000,
    Change: 0
  },
  {
    Position: 2,
    Player_ID: 200,
    Player_Name: 'Judd Trump',
    Nationality: 'England',
    Points: 950000,
    Money: 475000,
    Change: 1
  },
  {
    Position: 3,
    Player_ID: 300,
    Player_Name: 'Mark Selby',
    Nationality: 'England',
    Points: 900000,
    Money: 450000,
    Change: -1
  },
  {
    Position: 4,
    Player_ID: 400,
    Player_Name: 'Neil Robertson',
    Nationality: 'Australia',
    Points: 850000,
    Money: 425000,
    Change: 0
  },
  {
    Position: 5,
    Player_ID: 500,
    Player_Name: 'John Higgins',
    Nationality: 'Scotland',
    Points: 800000,
    Money: 400000,
    Change: 2
  }
];

describe('RankingsList Component', () => {
  test('displays rankings in correct order by position', () => {
    const handleClick = vi.fn();
    render(
      <RankingsList
        rankings={mockRankings}
        loading={false}
        error={null}
        onRankingClick={handleClick}
      />
    );

    // Get all ranking rows
    const rows = screen.getAllByRole('button');
    
    // Verify rankings are displayed in position order
    expect(rows[0]).toHaveTextContent('Ronnie O\'Sullivan');
    expect(rows[1]).toHaveTextContent('Judd Trump');
    expect(rows[2]).toHaveTextContent('Mark Selby');
    expect(rows[3]).toHaveTextContent('Neil Robertson');
    expect(rows[4]).toHaveTextContent('John Higgins');
  });

  test('displays position numbers correctly', () => {
    const handleClick = vi.fn();
    render(
      <RankingsList
        rankings={mockRankings}
        loading={false}
        error={null}
        onRankingClick={handleClick}
      />
    );

    // Check that positions are displayed in table cells
    const rows = screen.getAllByRole('button');
    expect(rows[0]).toHaveTextContent(/^1/); // Position 1
    expect(rows[1]).toHaveTextContent(/^2/); // Position 2
    expect(rows[2]).toHaveTextContent(/^3/); // Position 3
    expect(rows[3]).toHaveTextContent(/^4/); // Position 4
    expect(rows[4]).toHaveTextContent(/^5/); // Position 5
  });

  test('displays player names correctly', () => {
    render(
      <RankingsList
        rankings={mockRankings}
        loading={false}
        error={null}
      />
    );

    expect(screen.getByText('Ronnie O\'Sullivan')).toBeInTheDocument();
    expect(screen.getByText('Judd Trump')).toBeInTheDocument();
    expect(screen.getByText('Mark Selby')).toBeInTheDocument();
    expect(screen.getByText('Neil Robertson')).toBeInTheDocument();
    expect(screen.getByText('John Higgins')).toBeInTheDocument();
  });

  test('displays nationality correctly', () => {
    render(
      <RankingsList
        rankings={mockRankings}
        loading={false}
        error={null}
      />
    );

    // Check for nationalities (England appears multiple times)
    const englandElements = screen.getAllByText('England');
    expect(englandElements.length).toBe(3);
    expect(screen.getByText('Australia')).toBeInTheDocument();
    expect(screen.getByText('Scotland')).toBeInTheDocument();
  });

  test('displays points correctly formatted', () => {
    render(
      <RankingsList
        rankings={mockRankings}
        loading={false}
        error={null}
      />
    );

    // Points should be formatted with commas
    expect(screen.getByText('1,000,000')).toBeInTheDocument();
    expect(screen.getByText('950,000')).toBeInTheDocument();
    expect(screen.getByText('900,000')).toBeInTheDocument();
  });

  test('displays ranking change indicators correctly', () => {
    const handleClick = vi.fn();
    render(
      <RankingsList
        rankings={mockRankings}
        loading={false}
        error={null}
        onRankingClick={handleClick}
      />
    );

    // Check for change indicators (arrows)
    const rows = screen.getAllByRole('button');
    
    // Position 1: No change (→)
    expect(rows[0]).toHaveTextContent('→');
    
    // Position 2: Moved up 1 (↑)
    expect(rows[1]).toHaveTextContent('↑');
    expect(rows[1]).toHaveTextContent('1');
    
    // Position 3: Moved down 1 (↓)
    expect(rows[2]).toHaveTextContent('↓');
    expect(rows[2]).toHaveTextContent('1');
    
    // Position 4: No change (→)
    expect(rows[3]).toHaveTextContent('→');
    
    // Position 5: Moved up 2 (↑)
    expect(rows[4]).toHaveTextContent('↑');
    expect(rows[4]).toHaveTextContent('2');
  });

  test('displays loading state', () => {
    render(
      <RankingsList
        rankings={[]}
        loading={true}
        error={null}
      />
    );

    expect(screen.getByText('Loading rankings...')).toBeInTheDocument();
  });

  test('displays error state', () => {
    const error = new Error('Failed to load rankings');
    render(
      <RankingsList
        rankings={[]}
        loading={false}
        error={error}
      />
    );

    expect(screen.getByText('Failed to load rankings')).toBeInTheDocument();
  });

  test('displays empty state when no rankings', () => {
    render(
      <RankingsList
        rankings={[]}
        loading={false}
        error={null}
      />
    );

    expect(screen.getByText('No rankings found.')).toBeInTheDocument();
  });

  test('calls onRankingClick when ranking is clicked', () => {
    const handleClick = vi.fn();
    render(
      <RankingsList
        rankings={mockRankings}
        loading={false}
        error={null}
        onRankingClick={handleClick}
      />
    );

    const firstRanking = screen.getAllByRole('button')[0];
    fireEvent.click(firstRanking);

    expect(handleClick).toHaveBeenCalledWith(mockRankings[0]);
  });

  test('displays pagination when rankings exceed page size', () => {
    // Create 60 rankings to trigger pagination (page size is 50)
    const manyRankings: Ranking[] = Array.from({ length: 60 }, (_, i) => ({
      Position: i + 1,
      Player_ID: i + 1,
      Player_Name: `Player ${i + 1}`,
      Nationality: 'England',
      Points: 1000000 - (i * 10000),
      Money: 500000 - (i * 5000),
      Change: 0
    }));

    render(
      <RankingsList
        rankings={manyRankings}
        loading={false}
        error={null}
      />
    );

    // Check for pagination controls
    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
    // Check for page info in the summary text
    expect(screen.getByText(/Page 1 of 2/)).toBeInTheDocument();
  });

  test('displays money column when showMoney is true', () => {
    render(
      <RankingsList
        rankings={mockRankings}
        loading={false}
        error={null}
        showMoney={true}
      />
    );

    // Check for money column header
    expect(screen.getByText('Prize Money')).toBeInTheDocument();
    
    // Check for formatted money values
    expect(screen.getByText('£500,000')).toBeInTheDocument();
    expect(screen.getByText('£475,000')).toBeInTheDocument();
  });

  test('does not display money column when showMoney is false', () => {
    render(
      <RankingsList
        rankings={mockRankings}
        loading={false}
        error={null}
        showMoney={false}
      />
    );

    // Money column header should not be present
    expect(screen.queryByText('Prize Money')).not.toBeInTheDocument();
  });

  test('displays correct results summary', () => {
    render(
      <RankingsList
        rankings={mockRankings}
        loading={false}
        error={null}
      />
    );

    expect(screen.getByText('Showing 1-5 of 5 rankings')).toBeInTheDocument();
  });
});

describe('RankingFilters Component', () => {
  test('displays ranking type filter with correct options', () => {
    const handleFiltersChange = vi.fn();
    render(<RankingFilters onFiltersChange={handleFiltersChange} />);

    const rankingTypeSelect = screen.getByLabelText('Ranking Type');
    expect(rankingTypeSelect).toBeInTheDocument();

    // Check for all ranking type options within the select element
    const options = within(rankingTypeSelect as HTMLElement).getAllByRole('option');
    expect(options).toHaveLength(4);
    expect(options[0]).toHaveTextContent('World Rankings');
    expect(options[1]).toHaveTextContent('Prize Money (Current Season)');
    expect(options[2]).toHaveTextContent('Prize Money (One Year)');
    expect(options[3]).toHaveTextContent('Prize Money (Two Year Rolling)');
  });

  test('displays season filter with correct options', () => {
    const handleFiltersChange = vi.fn();
    render(<RankingFilters onFiltersChange={handleFiltersChange} />);

    const seasonSelect = screen.getByLabelText('Season');
    expect(seasonSelect).toBeInTheDocument();

    // Check for season options
    expect(screen.getByText('2024/2025')).toBeInTheDocument();
    expect(screen.getByText('2023/2024')).toBeInTheDocument();
    expect(screen.getByText('2022/2023')).toBeInTheDocument();
  });

  test('calls onFiltersChange when ranking type changes', async () => {
    const handleFiltersChange = vi.fn();
    render(<RankingFilters onFiltersChange={handleFiltersChange} />);

    const rankingTypeSelect = screen.getByLabelText('Ranking Type') as HTMLSelectElement;
    
    fireEvent.change(rankingTypeSelect, { target: { value: 'MoneyRankings' } });

    await waitFor(() => {
      expect(handleFiltersChange).toHaveBeenCalledWith('MoneyRankings', 2024);
    });
  });

  test('calls onFiltersChange when season changes', async () => {
    const handleFiltersChange = vi.fn();
    render(<RankingFilters onFiltersChange={handleFiltersChange} />);

    const seasonSelect = screen.getByLabelText('Season') as HTMLSelectElement;
    
    fireEvent.change(seasonSelect, { target: { value: '2023' } });

    await waitFor(() => {
      expect(handleFiltersChange).toHaveBeenCalledWith('WorldRankings', 2023);
    });
  });

  test('displays current view summary', () => {
    const handleFiltersChange = vi.fn();
    render(<RankingFilters onFiltersChange={handleFiltersChange} />);

    expect(screen.getByText('Current View:')).toBeInTheDocument();
    // Check within the summary section for the ranking type
    const summarySection = screen.getByText('Current View:').closest('div');
    expect(summarySection).toHaveTextContent('World Rankings');
    expect(summarySection).toHaveTextContent('Season: 2024/2025');
  });

  test('updates current view summary when filters change', async () => {
    const handleFiltersChange = vi.fn();
    render(<RankingFilters onFiltersChange={handleFiltersChange} />);

    const rankingTypeSelect = screen.getByLabelText('Ranking Type') as HTMLSelectElement;
    fireEvent.change(rankingTypeSelect, { target: { value: 'TwoYearMoney' } });

    await waitFor(() => {
      // Check that the filter was called with the new value
      expect(handleFiltersChange).toHaveBeenCalledWith('TwoYearMoney', 2024);
    });
    
    // The summary should update to show the new ranking type
    const summarySection = screen.getByText('Current View:').closest('div');
    expect(summarySection).toHaveTextContent('Prize Money (Two Year Rolling)');
  });

  test('disables filters when loading', () => {
    const handleFiltersChange = vi.fn();
    render(<RankingFilters onFiltersChange={handleFiltersChange} loading={true} />);

    const rankingTypeSelect = screen.getByLabelText('Ranking Type') as HTMLSelectElement;
    const seasonSelect = screen.getByLabelText('Season') as HTMLSelectElement;

    expect(rankingTypeSelect).toBeDisabled();
    expect(seasonSelect).toBeDisabled();
  });
});

describe('Rankings Display Integration', () => {
  test('rankings are sorted by position in ascending order', () => {
    // Create unsorted rankings
    const unsortedRankings: Ranking[] = [
      {
        Position: 3,
        Player_ID: 300,
        Player_Name: 'Player C',
        Nationality: 'England',
        Points: 800000,
        Money: 400000,
        Change: 0
      },
      {
        Position: 1,
        Player_ID: 100,
        Player_Name: 'Player A',
        Nationality: 'England',
        Points: 1000000,
        Money: 500000,
        Change: 0
      },
      {
        Position: 2,
        Player_ID: 200,
        Player_Name: 'Player B',
        Nationality: 'England',
        Points: 900000,
        Money: 450000,
        Change: 0
      }
    ];

    const handleClick = vi.fn();
    render(
      <RankingsList
        rankings={unsortedRankings}
        loading={false}
        error={null}
        onRankingClick={handleClick}
      />
    );

    const rows = screen.getAllByRole('button');
    
    // Verify rankings are displayed in sorted order (by position)
    expect(rows[0]).toHaveTextContent('Player A');
    expect(rows[1]).toHaveTextContent('Player B');
    expect(rows[2]).toHaveTextContent('Player C');
  });

  test('ranking change indicators match the change values', () => {
    const rankingsWithChanges: Ranking[] = [
      {
        Position: 1,
        Player_ID: 100,
        Player_Name: 'Player A',
        Nationality: 'England',
        Points: 1000000,
        Money: 500000,
        Change: 5 // Moved up 5 positions
      },
      {
        Position: 2,
        Player_ID: 200,
        Player_Name: 'Player B',
        Nationality: 'England',
        Points: 900000,
        Money: 450000,
        Change: -3 // Moved down 3 positions
      },
      {
        Position: 3,
        Player_ID: 300,
        Player_Name: 'Player C',
        Nationality: 'England',
        Points: 800000,
        Money: 400000,
        Change: 0 // No change
      }
    ];

    const handleClick = vi.fn();
    render(
      <RankingsList
        rankings={rankingsWithChanges}
        loading={false}
        error={null}
        onRankingClick={handleClick}
      />
    );

    const rows = screen.getAllByRole('button');
    
    // Player A: moved up 5
    expect(rows[0]).toHaveTextContent('↑');
    expect(rows[0]).toHaveTextContent('5');
    
    // Player B: moved down 3
    expect(rows[1]).toHaveTextContent('↓');
    expect(rows[1]).toHaveTextContent('3');
    
    // Player C: no change
    expect(rows[2]).toHaveTextContent('→');
    expect(rows[2]).toHaveTextContent('0');
  });
});
