# Head-to-Head Comparison Feature

## Overview

The Head-to-Head (H2H) comparison feature allows users to compare the historical match records between any two professional snooker players. This feature implements Requirements 7.1-7.5 from the Snooker Results App specification.

## Components Created

### 1. HeadToHeadPage (`src/pages/HeadToHeadPage.tsx`)
Main page component that orchestrates the H2H comparison workflow.

**Features:**
- Player selection interface
- Loading and error states
- Displays H2H statistics, charts, and match history
- Reset functionality to select different players

### 2. PlayerSelector (`src/components/pages/PlayerSelector.tsx`)
Component for selecting two players to compare.

**Features:**
- Search functionality for both player selections
- Dropdown with player list (limited to 100 for performance)
- Visual preview of selected players
- Validation to prevent comparing a player with themselves
- Compare button that triggers the comparison

**Validates:** Requirement 7.1

### 3. H2HStats (`src/components/pages/H2HStats.tsx`)
Displays head-to-head statistics between two players.

**Features:**
- Total matches played
- Wins for each player
- Win percentage (calculated as wins/total × 100, rounded to nearest integer)
- Visual win distribution bar
- Draws count (if any)

**Validates:** Requirement 7.2

### 4. H2HChart (`src/components/pages/H2HChart.tsx`)
Bar chart comparing head-to-head performance by event type.

**Features:**
- Horizontal bar chart for each event type
- Shows wins for each player per event type
- Win rate percentages
- Legend for player identification
- Responsive design

**Validates:** Requirements 7.4, 7.5

### 5. H2HMatchHistory (`src/components/pages/H2HMatchHistory.tsx`)
Lists all previous matches between two players.

**Features:**
- Chronologically sorted (most recent first)
- Match date, score, and winner
- Event information
- Round and duration details
- Winner badges
- Responsive layout

**Validates:** Requirement 7.3

## Usage

### Importing the Page

```typescript
import { HeadToHeadPage } from './pages';
```

### Using in Router

```typescript
<Route path="/head-to-head" element={<HeadToHeadPage />} />
```

### Standalone Component Usage

```typescript
import { PlayerSelector, H2HStats, H2HChart, H2HMatchHistory } from './components';

// Use individual components as needed
<PlayerSelector 
  players={players} 
  onPlayersSelected={(p1, p2) => handleSelection(p1, p2)}
  loading={false}
/>
```

## API Integration

The feature uses the following hooks from `useSnookerApi`:

- `useAllPlayers(2024, 'p')` - Fetches all professional players for selection
- `useHeadToHead(player1Id, player2Id, -1)` - Fetches H2H matches (all seasons)
- `useEventsBySeason(-1)` - Fetches events for event type breakdown

## Utility Functions

The feature leverages utility functions from `src/utils/h2hUtils.ts`:

- `calculateH2HWinPercentage()` - Calculates win statistics
- `groupH2HByEventType()` - Groups matches by event type
- `calculateH2HStats()` - Comprehensive statistics including frame data

## Testing

Integration tests are available in `src/__tests__/HeadToHeadIntegration.test.tsx`:

- H2H statistics calculation
- Event type breakdown
- Win percentage rounding
- Match history sorting
- Player selection validation

Run tests with:
```bash
npx vitest run HeadToHeadIntegration
```

## Styling

All components use Tailwind CSS for styling with:
- Responsive design (mobile, tablet, desktop)
- Modern gradient backgrounds
- Smooth transitions and hover effects
- Accessible color contrasts
- Loading and error states

## Requirements Coverage

✅ **Requirement 7.1:** Player selection interface implemented  
✅ **Requirement 7.2:** Total matches, wins, and win percentages displayed  
✅ **Requirement 7.3:** Match history with dates and events listed  
✅ **Requirement 7.4:** Event type breakdown implemented  
✅ **Requirement 7.5:** Visual comparison chart provided  

## Future Enhancements

Potential improvements for future iterations:

1. **Performance Over Time Chart:** Line chart showing cumulative win percentage
2. **Venue Breakdown:** H2H statistics by venue
3. **Recent Form:** Last 5-10 matches highlighted
4. **Frame Statistics:** Detailed frame-by-frame analysis
5. **Export Functionality:** Export H2H data as PDF/CSV
6. **Share Feature:** Share H2H comparison via URL
7. **Favorite Comparisons:** Save frequently compared player pairs

## Notes

- The feature currently fetches data for all seasons (-1 parameter)
- Player search is limited to 100 results for performance
- Win percentages are rounded to the nearest integer as per design spec
- The feature gracefully handles cases where players have never faced each other
