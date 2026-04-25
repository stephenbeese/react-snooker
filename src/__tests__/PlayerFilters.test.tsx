/**
 * Unit tests for PlayerFilters component
 * Tests UI integration and filter state management for Requirements 1.3
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PlayerFilters } from '../components/pages/PlayerFilters';
import type { Player } from '../types/snooker';
import type { PlayerFilterCriteria } from '../utils/playerUtils';

// Mock data
const mockPlayers: Player[] = [
  {
    ID: 1,
    Name: 'Ronnie O\'Sullivan',
    Nationality: 'England',
    Born: 1975,
    Turned_Pro: 1992,
    Status: 'P',
    Image_Url: 'https://example.com/ronnie.jpg'
  },
  {
    ID: 2,
    Name: 'Judd Trump',
    Nationality: 'England',
    Born: 1989,
    Turned_Pro: 2005,
    Status: 'P',
    Image_Url: 'https://example.com/judd.jpg'
  },
  {
    ID: 3,
    Name: 'John Higgins',
    Nationality: 'Scotland',
    Born: 1975,
    Turned_Pro: 1992,
    Status: 'P',
    Image_Url: 'https://example.com/john.jpg'
  },
  {
    ID: 4,
    Name: 'Ding Junhui',
    Nationality: 'China',
    Born: 1987,
    Turned_Pro: 2003,
    Status: 'P',
    Image_Url: 'https://example.com/ding.jpg'
  },
  {
    ID: 5,
    Name: 'Amateur Player',
    Nationality: 'England',
    Born: 1990,
    Turned_Pro: undefined,
    Status: 'A',
    Image_Url: undefined
  }
];

describe('PlayerFilters Component', () => {
  let mockOnFiltersChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnFiltersChange = vi.fn();
  });

  describe('Component Rendering', () => {
    test('should render all filter controls', () => {
      render(
        <PlayerFilters 
          players={mockPlayers} 
          onFiltersChange={mockOnFiltersChange}
        />
      );

      // Check for filter title
      expect(screen.getByText('Filter Players')).toBeInTheDocument();

      // Check for nationality filter
      expect(screen.getByLabelText('Nationality')).toBeInTheDocument();
      expect(screen.getByDisplayValue('All Nationalities')).toBeInTheDocument();

      // Check for ranking filters
      expect(screen.getByLabelText('Min Ranking')).toBeInTheDocument();
      expect(screen.getByLabelText('Max Ranking')).toBeInTheDocument();

      // Check for status filter
      expect(screen.getByLabelText('Status')).toBeInTheDocument();
      expect(screen.getByDisplayValue('All Players')).toBeInTheDocument();

      // Check for season filter
      expect(screen.getByLabelText('Season')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Current Season')).toBeInTheDocument();
    });

    test('should populate nationality dropdown with unique nationalities', () => {
      render(
        <PlayerFilters 
          players={mockPlayers} 
          onFiltersChange={mockOnFiltersChange}
        />
      );

      const nationalitySelect = screen.getByLabelText('Nationality');
      
      // Check that all unique nationalities are present
      expect(screen.getByRole('option', { name: 'All Nationalities' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'China' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'England' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Scotland' })).toBeInTheDocument();
    });

    test('should handle empty players array', () => {
      render(
        <PlayerFilters 
          players={[]} 
          onFiltersChange={mockOnFiltersChange}
        />
      );

      const nationalitySelect = screen.getByLabelText('Nationality');
      
      // Should only have the default option
      expect(screen.getByRole('option', { name: 'All Nationalities' })).toBeInTheDocument();
      expect(screen.queryByRole('option', { name: 'England' })).not.toBeInTheDocument();
    });

    test('should disable controls when loading', () => {
      render(
        <PlayerFilters 
          players={mockPlayers} 
          onFiltersChange={mockOnFiltersChange}
          loading={true}
        />
      );

      expect(screen.getByLabelText('Nationality')).toBeDisabled();
      expect(screen.getByLabelText('Min Ranking')).toBeDisabled();
      expect(screen.getByLabelText('Max Ranking')).toBeDisabled();
      expect(screen.getByLabelText('Status')).toBeDisabled();
      expect(screen.getByLabelText('Season')).toBeDisabled();
    });
  });

  describe('Filter Interactions', () => {
    test('should call onFiltersChange when nationality is selected', async () => {
      render(
        <PlayerFilters 
          players={mockPlayers} 
          onFiltersChange={mockOnFiltersChange}
        />
      );

      const nationalitySelect = screen.getByLabelText('Nationality');
      
      fireEvent.change(nationalitySelect, { target: { value: 'England' } });

      await waitFor(() => {
        expect(mockOnFiltersChange).toHaveBeenCalledWith({
          nationality: 'England'
        });
      });
    });

    test('should call onFiltersChange when ranking filters are set', async () => {
      render(
        <PlayerFilters 
          players={mockPlayers} 
          onFiltersChange={mockOnFiltersChange}
        />
      );

      const minRankingInput = screen.getByLabelText('Min Ranking');
      const maxRankingInput = screen.getByLabelText('Max Ranking');
      
      fireEvent.change(minRankingInput, { target: { value: '1' } });
      fireEvent.change(maxRankingInput, { target: { value: '10' } });

      await waitFor(() => {
        expect(mockOnFiltersChange).toHaveBeenCalledWith({
          minRanking: 1,
          maxRanking: 10
        });
      });
    });

    test('should call onFiltersChange when status is selected', async () => {
      render(
        <PlayerFilters 
          players={mockPlayers} 
          onFiltersChange={mockOnFiltersChange}
        />
      );

      const statusSelect = screen.getByLabelText('Status');
      
      fireEvent.change(statusSelect, { target: { value: 'P' } });

      await waitFor(() => {
        expect(mockOnFiltersChange).toHaveBeenCalledWith({
          status: 'P'
        });
      });
    });

    test('should call onFiltersChange when season is selected', async () => {
      render(
        <PlayerFilters 
          players={mockPlayers} 
          onFiltersChange={mockOnFiltersChange}
        />
      );

      const seasonSelect = screen.getByLabelText('Season');
      
      fireEvent.change(seasonSelect, { target: { value: '2024' } });

      await waitFor(() => {
        expect(mockOnFiltersChange).toHaveBeenCalledWith({
          season: 2024
        });
      });
    });

    test('should handle empty values correctly', async () => {
      render(
        <PlayerFilters 
          players={mockPlayers} 
          onFiltersChange={mockOnFiltersChange}
        />
      );

      // Set a value first
      const nationalitySelect = screen.getByLabelText('Nationality');
      fireEvent.change(nationalitySelect, { target: { value: 'England' } });

      // Clear the value
      fireEvent.change(nationalitySelect, { target: { value: '' } });

      await waitFor(() => {
        expect(mockOnFiltersChange).toHaveBeenLastCalledWith({
          nationality: undefined
        });
      });
    });
  });

  describe('Active Filters Display', () => {
    test('should show active filters summary when filters are applied', async () => {
      render(
        <PlayerFilters 
          players={mockPlayers} 
          onFiltersChange={mockOnFiltersChange}
        />
      );

      // Apply some filters
      fireEvent.change(screen.getByLabelText('Nationality'), { target: { value: 'England' } });
      fireEvent.change(screen.getByLabelText('Min Ranking'), { target: { value: '1' } });
      fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'P' } });

      await waitFor(() => {
        expect(screen.getByText('Active Filters:')).toBeInTheDocument();
        expect(screen.getByText('Nationality: England')).toBeInTheDocument();
        expect(screen.getByText('Min Rank: 1')).toBeInTheDocument();
        expect(screen.getByText('Status: Professional')).toBeInTheDocument();
      });
    });

    test('should not show active filters summary when no filters are applied', () => {
      render(
        <PlayerFilters 
          players={mockPlayers} 
          onFiltersChange={mockOnFiltersChange}
        />
      );

      expect(screen.queryByText('Active Filters:')).not.toBeInTheDocument();
    });

    test('should show Clear All button when filters are active', async () => {
      render(
        <PlayerFilters 
          players={mockPlayers} 
          onFiltersChange={mockOnFiltersChange}
        />
      );

      // Apply a filter
      fireEvent.change(screen.getByLabelText('Nationality'), { target: { value: 'England' } });

      await waitFor(() => {
        expect(screen.getByText('Clear All')).toBeInTheDocument();
      });
    });

    test('should clear all filters when Clear All is clicked', async () => {
      render(
        <PlayerFilters 
          players={mockPlayers} 
          onFiltersChange={mockOnFiltersChange}
        />
      );

      // Apply some filters
      fireEvent.change(screen.getByLabelText('Nationality'), { target: { value: 'England' } });
      fireEvent.change(screen.getByLabelText('Min Ranking'), { target: { value: '1' } });

      // Click Clear All
      const clearButton = await screen.findByText('Clear All');
      fireEvent.click(clearButton);

      await waitFor(() => {
        expect(mockOnFiltersChange).toHaveBeenLastCalledWith({});
      });

      // Check that form values are reset
      expect(screen.getByDisplayValue('All Nationalities')).toBeInTheDocument();
      expect((screen.getByLabelText('Min Ranking') as HTMLInputElement).value).toBe('');
    });

    test('should remove individual filters when X button is clicked', async () => {
      render(
        <PlayerFilters 
          players={mockPlayers} 
          onFiltersChange={mockOnFiltersChange}
        />
      );

      // Apply nationality filter
      fireEvent.change(screen.getByLabelText('Nationality'), { target: { value: 'England' } });

      // Find and click the remove button for nationality filter
      const removeButton = await screen.findByLabelText('Remove nationality filter: England');
      fireEvent.click(removeButton);

      await waitFor(() => {
        expect(mockOnFiltersChange).toHaveBeenLastCalledWith({
          nationality: undefined
        });
      });
    });
  });

  describe('Responsive Behavior', () => {
    test('should show/hide filters on mobile when toggle is clicked', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(
        <PlayerFilters 
          players={mockPlayers} 
          onFiltersChange={mockOnFiltersChange}
        />
      );

      // Initially filters should be hidden on mobile (using CSS classes)
      const filterContent = screen.getByRole('group', { hidden: true }) || 
                           document.querySelector('#filter-content');
      
      // Find the show/hide toggle button
      const toggleButton = screen.getByLabelText('Show filters');
      expect(toggleButton).toBeInTheDocument();

      // Click to show filters
      fireEvent.click(toggleButton);
      
      // Button text should change
      expect(screen.getByLabelText('Hide filters')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('should have proper ARIA labels and roles', () => {
      render(
        <PlayerFilters 
          players={mockPlayers} 
          onFiltersChange={mockOnFiltersChange}
        />
      );

      // Check for proper labels
      expect(screen.getByLabelText('Nationality')).toBeInTheDocument();
      expect(screen.getByLabelText('Min Ranking')).toBeInTheDocument();
      expect(screen.getByLabelText('Max Ranking')).toBeInTheDocument();
      expect(screen.getByLabelText('Status')).toBeInTheDocument();
      expect(screen.getByLabelText('Season')).toBeInTheDocument();

      // Check for proper ARIA attributes on toggle button
      const toggleButton = screen.getByLabelText(/filters/);
      expect(toggleButton).toHaveAttribute('aria-expanded');
      expect(toggleButton).toHaveAttribute('aria-controls', 'filter-content');
    });

    test('should have proper focus management', () => {
      render(
        <PlayerFilters 
          players={mockPlayers} 
          onFiltersChange={mockOnFiltersChange}
        />
      );

      // All interactive elements should be focusable
      const nationalitySelect = screen.getByLabelText('Nationality');
      const minRankingInput = screen.getByLabelText('Min Ranking');
      const maxRankingInput = screen.getByLabelText('Max Ranking');
      const statusSelect = screen.getByLabelText('Status');
      const seasonSelect = screen.getByLabelText('Season');

      expect(nationalitySelect).not.toHaveAttribute('tabindex', '-1');
      expect(minRankingInput).not.toHaveAttribute('tabindex', '-1');
      expect(maxRankingInput).not.toHaveAttribute('tabindex', '-1');
      expect(statusSelect).not.toHaveAttribute('tabindex', '-1');
      expect(seasonSelect).not.toHaveAttribute('tabindex', '-1');
    });
  });

  describe('Input Validation', () => {
    test('should handle invalid ranking input gracefully', async () => {
      render(
        <PlayerFilters 
          players={mockPlayers} 
          onFiltersChange={mockOnFiltersChange}
        />
      );

      const minRankingInput = screen.getByLabelText('Min Ranking');
      
      // Try to enter invalid values
      fireEvent.change(minRankingInput, { target: { value: 'abc' } });

      await waitFor(() => {
        // Should call with undefined for invalid input
        expect(mockOnFiltersChange).toHaveBeenCalledWith({
          minRanking: undefined
        });
      });
    });

    test('should handle negative ranking values', async () => {
      render(
        <PlayerFilters 
          players={mockPlayers} 
          onFiltersChange={mockOnFiltersChange}
        />
      );

      const minRankingInput = screen.getByLabelText('Min Ranking');
      
      fireEvent.change(minRankingInput, { target: { value: '-5' } });

      await waitFor(() => {
        expect(mockOnFiltersChange).toHaveBeenCalledWith({
          minRanking: -5
        });
      });
    });

    test('should handle very large ranking values', async () => {
      render(
        <PlayerFilters 
          players={mockPlayers} 
          onFiltersChange={mockOnFiltersChange}
        />
      );

      const maxRankingInput = screen.getByLabelText('Max Ranking');
      
      fireEvent.change(maxRankingInput, { target: { value: '999999' } });

      await waitFor(() => {
        expect(mockOnFiltersChange).toHaveBeenCalledWith({
          maxRanking: 999999
        });
      });
    });
  });

  describe('Edge Cases', () => {
    test('should handle players with missing nationality', () => {
      const playersWithMissingData: Player[] = [
        ...mockPlayers,
        {
          ID: 999,
          Name: 'No Nationality Player',
          Nationality: '',
          Born: 1990,
          Turned_Pro: 2010,
          Status: 'P',
          Image_Url: undefined
        }
      ];

      render(
        <PlayerFilters 
          players={playersWithMissingData} 
          onFiltersChange={mockOnFiltersChange}
        />
      );

      // Should not include empty nationality in dropdown
      const nationalitySelect = screen.getByLabelText('Nationality');
      expect(screen.queryByRole('option', { name: '' })).not.toBeInTheDocument();
    });

    test('should handle duplicate nationalities', () => {
      const playersWithDuplicates: Player[] = [
        ...mockPlayers,
        {
          ID: 999,
          Name: 'Another English Player',
          Nationality: 'England',
          Born: 1990,
          Turned_Pro: 2010,
          Status: 'P',
          Image_Url: undefined
        }
      ];

      render(
        <PlayerFilters 
          players={playersWithDuplicates} 
          onFiltersChange={mockOnFiltersChange}
        />
      );

      // Should only show England once in dropdown
      const englandOptions = screen.getAllByRole('option', { name: 'England' });
      expect(englandOptions).toHaveLength(1);
    });

    test('should handle rapid filter changes', async () => {
      render(
        <PlayerFilters 
          players={mockPlayers} 
          onFiltersChange={mockOnFiltersChange}
        />
      );

      const nationalitySelect = screen.getByLabelText('Nationality');
      
      // Rapidly change values
      fireEvent.change(nationalitySelect, { target: { value: 'England' } });
      fireEvent.change(nationalitySelect, { target: { value: 'Scotland' } });
      fireEvent.change(nationalitySelect, { target: { value: 'China' } });

      await waitFor(() => {
        expect(mockOnFiltersChange).toHaveBeenLastCalledWith({
          nationality: 'China'
        });
      });
    });
  });
});