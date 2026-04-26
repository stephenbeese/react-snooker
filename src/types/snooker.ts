/**
 * Type definitions for snooker.org API responses
 */

/**
 * Type definitions for snooker.org API responses
 */

export interface Player {
  ID: number;
  FirstName: string;
  MiddleName?: string;
  LastName: string;
  ShortName?: string;
  Nationality: string;
  Born?: string; // API returns date string like "1975-03-21"
  FirstSeasonAsPro?: number;
  LastSeasonAsPro?: number;
  Status?: 'P' | 'A'; // Professional or Amateur - derived from Type
  Type?: number; // 1 = Professional, other = Amateur
  Photo?: string; // Image URL
  Sex?: 'M' | 'F';
  Twitter?: string;
  BioPage?: string;
  URL?: string;
  NumRankingTitles?: number;
  NumMaximums?: number;
  
  // Computed fields for compatibility
  Name?: string; // Will be computed from FirstName + LastName
  Image_Url?: string; // Will be mapped from Photo
  Turned_Pro?: number; // Will be mapped from FirstSeasonAsPro
}

export interface PlayerProfile extends Player {
  Ranking?: number;
  Ranking_Points?: number;
  Money_Ranking?: number;
  Money_Ranking_Points?: number;
  Frame_Win_Percentage?: number;
  Bio?: string;
  Nickname?: string;
}

export interface Event {
  ID: number;
  Name: string;
  StartDate: string;
  EndDate: string;
  Venue?: string;
  Country?: string;
  Tour: 'Main Tour' | 'Q Tour' | 'Amateur' | string;
  Sponsor?: string;
  Prize_Fund?: number;
  Defending_Champion?: string;
  Defending_Champion_ID?: number;
}

export interface Round {
  ID: number;
  Name: string;
  Event_ID: number;
  Round_Number: number;
  Match_Count: number;
}

export interface Match {
  ID: number;
  Event_ID: number;
  Round_ID: number;
  Match_Number: number;
  Player1_ID: number;
  Player1_Name: string;
  Player2_ID: number;
  Player2_Name: string;
  Player1_Score: number;
  Player2_Score: number;
  Status: 'R' | 'U' | 'A'; // Result, Unplayed, Abandoned
  Date_Time?: string;
  Session?: number;
  Table?: string;
  Frames?: Frame[];
  Duration?: string;
}

export interface Frame {
  Frame_Number: number;
  Player1_Score: number;
  Player2_Score: number;
  Winner_ID?: number;
  Break?: number;
}

export interface Ranking {
  Position: number;
  Player_ID: number;
  Player_Name: string;
  Nationality: string;
  Points: number;
  Money?: number;
  Change?: number; // Position change from previous ranking
}

export interface Season {
  ID: number;
  Name: string;
  Start_Year: number;
  End_Year: number;
}

export interface HeadToHead {
  Player1_ID: number;
  Player1_Name: string;
  Player1_Wins: number;
  Player2_ID: number;
  Player2_Name: string;
  Player2_Wins: number;
  Matches: Match[];
}

export interface EventSeeding {
  Event_ID: number;
  Event_Name: string;
  Seeds: PlayerSeeding[];
}

export interface PlayerSeeding {
  Seed_Number: number;
  Player_ID: number;
  Player_Name: string;
}

export interface RankingPoints {
  Event_ID: number;
  Event_Name: string;
  Player_ID: number;
  Player_Name: string;
  Points: number;
}

export interface ApiError {
  message: string;
  status: number;
}

export type RankingType = 
  | 'MoneyRankings'
  | 'WorldRankings'
  | 'OneYearMoney'
  | 'TwoYearMoney';

export type Tour = 'main' | 'q' | 'amateur';
export type PlayerStatus = 'p' | 'a'; // professional or amateur
export type Gender = 'm' | 'f'; // male or female
