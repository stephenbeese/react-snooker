/**
 * Mock data for development when API is unavailable
 * This provides sample data that matches the snooker.org API structure
 */

import type {
  Player,
  PlayerProfile,
  Event,
  Match,
  Ranking,
  Season,
} from '../types/snooker';

export const mockCurrentSeason: Season = {
  ID: 2025,
  Name: '2025/2026',
  StartDate: '2025-05-01',
  EndDate: '2026-04-30',
};

export const mockPlayers: Player[] = [
  {
    ID: 1,
    Name: 'Ronnie O\'Sullivan',
    Nationality: 'England',
    Status: 'P',
    Born: 1975,
    Turned_Pro: 1992,
  },
  {
    ID: 2,
    Name: 'Judd Trump',
    Nationality: 'England',
    Status: 'P',
    Born: 1989,
    Turned_Pro: 2005,
  },
  {
    ID: 3,
    Name: 'Mark Selby',
    Nationality: 'England',
    Status: 'P',
    Born: 1983,
    Turned_Pro: 1999,
  },
  {
    ID: 4,
    Name: 'Neil Robertson',
    Nationality: 'Australia',
    Status: 'P',
    Born: 1982,
    Turned_Pro: 1998,
  },
  {
    ID: 5,
    Name: 'John Higgins',
    Nationality: 'Scotland',
    Status: 'P',
    Born: 1975,
    Turned_Pro: 1992,
  },
];

export const mockPlayerProfile: PlayerProfile = {
  ID: 1,
  Name: 'Ronnie O\'Sullivan',
  Nationality: 'England',
  Status: 'P',
  Born: 1975,
  Turned_Pro: 1992,
  Bio: 'Widely regarded as one of the greatest snooker players of all time.',
  Nickname: 'The Rocket',
  Twitter: '@ronnieo147',
  Website: 'https://ronnieosullivan.com',
};

export const mockEvents: Event[] = [
  {
    ID: 1,
    Name: 'World Championship',
    StartDate: '2026-04-15',
    EndDate: '2026-05-01',
    Tour: 'Main Tour',
    Venue: 'Crucible Theatre',
    Country: 'England',
    City: 'Sheffield',
    Prize_Money: 2500000,
    Status: 'Upcoming',
  },
  {
    ID: 2,
    Name: 'UK Championship',
    StartDate: '2025-11-23',
    EndDate: '2025-12-08',
    Tour: 'Main Tour',
    Venue: 'Barbican Centre',
    Country: 'England',
    City: 'York',
    Prize_Money: 1200000,
    Status: 'Completed',
  },
];

export const mockMatches: Match[] = [
  {
    ID: 1,
    Event_ID: 2,
    Round: 'Final',
    Player1_ID: 1,
    Player1_Name: 'Ronnie O\'Sullivan',
    Player1_Score: 10,
    Player2_ID: 2,
    Player2_Name: 'Judd Trump',
    Player2_Score: 6,
    Status: 'R',
    Start_Date: '2025-12-08',
    Start_Time: '19:00',
    Venue: 'Barbican Centre',
    Table: 1,
    Session: 'Evening',
    Best_Of: 19,
    Frames_Won_P1: 10,
    Frames_Won_P2: 6,
    Frames_Played: 16,
  },
  {
    ID: 2,
    Event_ID: 1,
    Round: 'Qualifying Round 1',
    Player1_ID: 3,
    Player1_Name: 'Mark Selby',
    Player1_Score: 0,
    Player2_ID: 4,
    Player2_Name: 'Neil Robertson',
    Player2_Score: 0,
    Status: 'U',
    Start_Date: '2026-04-15',
    Start_Time: '10:00',
    Venue: 'Crucible Theatre',
    Table: 1,
    Session: 'Morning',
    Best_Of: 19,
    Frames_Won_P1: 0,
    Frames_Won_P2: 0,
    Frames_Played: 0,
  },
];

export const mockRankings: Ranking[] = [
  {
    Position: 1,
    Player_ID: 1,
    Player_Name: 'Ronnie O\'Sullivan',
    Nationality: 'England',
    Points: 1250000,
    Money: 1250000,
    Change: 0,
  },
  {
    Position: 2,
    Player_ID: 2,
    Player_Name: 'Judd Trump',
    Nationality: 'England',
    Points: 1100000,
    Money: 1100000,
    Change: 1,
  },
  {
    Position: 3,
    Player_ID: 3,
    Player_Name: 'Mark Selby',
    Nationality: 'England',
    Points: 950000,
    Money: 950000,
    Change: -1,
  },
  {
    Position: 4,
    Player_ID: 4,
    Player_Name: 'Neil Robertson',
    Nationality: 'Australia',
    Points: 850000,
    Money: 850000,
    Change: 0,
  },
  {
    Position: 5,
    Player_ID: 5,
    Player_Name: 'John Higgins',
    Nationality: 'Scotland',
    Points: 800000,
    Money: 800000,
    Change: 0,
  },
];