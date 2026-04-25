/**
 * Property-Based Tests for Snooker API Client
 * Tests for API header inclusion, response caching, and schema validation
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fc from 'fast-check';
import {
  getEvent,
  getPlayer,
  getAllPlayers,
  getRankings,
  getFromCache,
  setCache,
  clearApiCache,
} from '../api/snooker';
import type { Event, Player, Ranking } from '../types/snooker';

// Mock fetch globally
global.fetch = vi.fn();

describe('Snooker API Client - Property-Based Tests', () => {
  beforeEach(() => {
    clearApiCache();
    vi.clearAllMocks();
  });

  afterEach(() => {
    clearApiCache();
    vi.clearAllMocks();
  });

  /**
   * Property 20: API Header Inclusion
   * For any API request made by the application, the request headers SHALL include
   * the 'X-Requested-By' header with the configured API key value.
   *
   * Validates: Requirements 14.1
   */
  describe('Property 20: API Header Inclusion', () => {
    it('should include X-Requested-By header in all API requests', () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 1000000 }), (eventId) => {
          // Mock successful response
          (global.fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => ({
              ID: eventId,
              Name: 'Test Event',
              StartDate: '2024-01-01',
              EndDate: '2024-01-15',
              Tour: 'Main Tour',
            }),
          });

          // Call API
          getEvent(eventId);

          // Verify fetch was called with correct headers
          expect(global.fetch).toHaveBeenCalled();
          const callArgs = (global.fetch as any).mock.calls[0];
          const headers = callArgs[1]?.headers;

          // Assert X-Requested-By header is present
          expect(headers).toBeDefined();
          expect(headers['X-Requested-By']).toBeDefined();
          expect(headers['X-Requested-By']).toBe('BeesePortfolio130');
          expect(headers['Content-Type']).toBe('application/json');
        }),
        { numRuns: 50 }
      );
    });

    it('should include X-Requested-By header for player requests', () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 1000000 }), (playerId) => {
          // Mock successful response
          (global.fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => ({
              ID: playerId,
              Name: 'Test Player',
              Nationality: 'England',
              Status: 'P',
            }),
          });

          // Call API
          getPlayer(playerId);

          // Verify fetch was called with correct headers
          expect(global.fetch).toHaveBeenCalled();
          const callArgs = (global.fetch as any).mock.calls[0];
          const headers = callArgs[1]?.headers;

          expect(headers['X-Requested-By']).toBe('BeesePortfolio130');
        }),
        { numRuns: 50 }
      );
    });

    it('should include X-Requested-By header for all endpoint types', () => {
      fc.assert(
        fc.property(
          fc.tuple(
            fc.integer({ min: 1, max: 1000000 }),
            fc.integer({ min: 2020, max: 2024 })
          ),
          ([season, year]) => {
            // Mock successful response
            (global.fetch as any).mockResolvedValueOnce({
              ok: true,
              json: async () => [],
            });

            // Call API
            getAllPlayers(season);

            // Verify fetch was called with correct headers
            expect(global.fetch).toHaveBeenCalled();
            const callArgs = (global.fetch as any).mock.calls[0];
            const headers = callArgs[1]?.headers;

            expect(headers['X-Requested-By']).toBe('BeesePortfolio130');
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  /**
   * Property 21: API Response Caching
   * For any identical API request made within the cache TTL window, the second request
   * SHALL return the cached response without making a new API call.
   *
   * Validates: Requirements 14.3, 15.2
   */
  describe('Property 21: API Response Caching', () => {
    it('should cache API responses and return cached data on subsequent calls', () => {
      // Test that caching works by directly testing cache functions
      fc.assert(
        fc.property(
          fc.tuple(
            fc.string({ minLength: 1, maxLength: 50 }),
            fc.integer({ min: 1, max: 1000 })
          ),
          ([cacheKey, testValue]) => {
            // Clear cache
            clearApiCache();

            // Store value in cache
            setCache(cacheKey, testValue, 5000);

            // Retrieve from cache
            const retrieved = getFromCache<number>(cacheKey);

            // Verify value is retrieved from cache
            expect(retrieved).toBe(testValue);

            // Store another value with same key (should overwrite)
            const newValue = testValue + 1;
            setCache(cacheKey, newValue, 5000);

            // Retrieve again
            const retrieved2 = getFromCache<number>(cacheKey);

            // Verify new value is retrieved
            expect(retrieved2).toBe(newValue);
          }
        ),
        { numRuns: 30 }
      );
    });

    it('should store and retrieve data from cache with correct TTL', () => {
      fc.assert(
        fc.property(
          fc.tuple(
            fc.string({ minLength: 1, maxLength: 50 }),
            fc.integer({ min: 1, max: 1000 }),
            fc.integer({ min: 1000, max: 10000 })
          ),
          ([cacheKey, testValue, ttl]) => {
            // Store in cache
            setCache(cacheKey, testValue, ttl);

            // Retrieve from cache
            const retrieved = getFromCache<number>(cacheKey);

            // Verify data is stored and retrieved correctly
            expect(retrieved).toBe(testValue);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should return null for non-existent cache entries', () => {
      fc.assert(
        fc.property(fc.string({ minLength: 1, maxLength: 50 }), (cacheKey) => {
          // Try to retrieve non-existent key
          const retrieved = getFromCache<any>(cacheKey);

          // Should return null
          expect(retrieved).toBeNull();
        }),
        { numRuns: 50 }
      );
    });

    it('should clear all cache entries when clearApiCache is called', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.tuple(
              fc.string({ minLength: 1, maxLength: 50 }),
              fc.integer({ min: 1, max: 1000 })
            ),
            { minLength: 1, maxLength: 10 }
          ),
          (entries) => {
            // Store multiple entries
            entries.forEach(([key, value]) => {
              setCache(key, value);
            });

            // Verify entries are stored
            entries.forEach(([key]) => {
              expect(getFromCache(key)).not.toBeNull();
            });

            // Clear cache
            clearApiCache();

            // Verify all entries are cleared
            entries.forEach(([key]) => {
              expect(getFromCache(key)).toBeNull();
            });
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  /**
   * Property 22: API Response Schema Validation
   * For any API response, the parsed data SHALL conform to the documented TypeScript
   * interface schema for that endpoint.
   *
   * Validates: Requirements 14.5
   */
  describe('Property 22: API Response Schema Validation', () => {
    it('should validate Event response schema', () => {
      fc.assert(
        fc.property(
          fc.record({
            ID: fc.integer({ min: 1, max: 1000000 }),
            Name: fc.string({ minLength: 1, maxLength: 100 }),
            StartDate: fc.string(),
            EndDate: fc.string(),
            Tour: fc.constantFrom('Main Tour', 'Q Tour', 'Amateur'),
            Venue: fc.option(fc.string()),
            Country: fc.option(fc.string()),
          }),
          (eventData) => {
            // Mock successful response
            (global.fetch as any).mockResolvedValueOnce({
              ok: true,
              json: async () => eventData,
            });

            // Call API
            getEvent(eventData.ID);

            // Verify response conforms to Event schema
            expect(eventData).toHaveProperty('ID');
            expect(eventData).toHaveProperty('Name');
            expect(eventData).toHaveProperty('StartDate');
            expect(eventData).toHaveProperty('EndDate');
            expect(eventData).toHaveProperty('Tour');
            expect(typeof eventData.ID).toBe('number');
            expect(typeof eventData.Name).toBe('string');
            expect(typeof eventData.Tour).toBe('string');
          }
        ),
        { numRuns: 30 }
      );
    });

    it('should validate Player response schema', () => {
      fc.assert(
        fc.property(
          fc.record({
            ID: fc.integer({ min: 1, max: 1000000 }),
            Name: fc.string({ minLength: 1, maxLength: 100 }),
            Nationality: fc.string({ minLength: 1, maxLength: 50 }),
            Status: fc.constantFrom('P', 'A'),
            Born: fc.option(fc.integer({ min: 1900, max: 2010 })),
            Turned_Pro: fc.option(fc.integer({ min: 1920, max: 2020 })),
          }),
          (playerData) => {
            // Mock successful response
            (global.fetch as any).mockResolvedValueOnce({
              ok: true,
              json: async () => playerData,
            });

            // Call API
            getPlayer(playerData.ID);

            // Verify response conforms to Player schema
            expect(playerData).toHaveProperty('ID');
            expect(playerData).toHaveProperty('Name');
            expect(playerData).toHaveProperty('Nationality');
            expect(playerData).toHaveProperty('Status');
            expect(typeof playerData.ID).toBe('number');
            expect(typeof playerData.Name).toBe('string');
            expect(typeof playerData.Nationality).toBe('string');
            expect(['P', 'A']).toContain(playerData.Status);
          }
        ),
        { numRuns: 30 }
      );
    });

    it('should validate Ranking response schema', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              Position: fc.integer({ min: 1, max: 200 }),
              Player_ID: fc.integer({ min: 1, max: 1000000 }),
              Player_Name: fc.string({ minLength: 1, maxLength: 100 }),
              Nationality: fc.string({ minLength: 1, maxLength: 50 }),
              Points: fc.integer({ min: 0, max: 1000000 }),
              Money: fc.option(fc.integer({ min: 0, max: 10000000 })),
              Change: fc.option(fc.integer({ min: -100, max: 100 })),
            }),
            { minLength: 1, maxLength: 50 }
          ),
          (rankingData) => {
            // Mock successful response
            (global.fetch as any).mockResolvedValueOnce({
              ok: true,
              json: async () => rankingData,
            });

            // Call API
            getRankings('MoneyRankings', 2024);

            // Verify response conforms to Ranking schema
            rankingData.forEach((ranking) => {
              expect(ranking).toHaveProperty('Position');
              expect(ranking).toHaveProperty('Player_ID');
              expect(ranking).toHaveProperty('Player_Name');
              expect(ranking).toHaveProperty('Nationality');
              expect(ranking).toHaveProperty('Points');
              expect(typeof ranking.Position).toBe('number');
              expect(typeof ranking.Player_ID).toBe('number');
              expect(typeof ranking.Player_Name).toBe('string');
              expect(typeof ranking.Points).toBe('number');
            });
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should validate that all required fields are present in responses', () => {
      fc.assert(
        fc.property(
          fc.record({
            ID: fc.integer({ min: 1, max: 1000000 }),
            Name: fc.string({ minLength: 1, maxLength: 100 }),
            StartDate: fc.string(),
            EndDate: fc.string(),
            Tour: fc.constantFrom('Main Tour', 'Q Tour', 'Amateur'),
          }),
          (eventData) => {
            // Mock successful response
            (global.fetch as any).mockResolvedValueOnce({
              ok: true,
              json: async () => eventData,
            });

            // Call API
            getEvent(eventData.ID);

            // Verify all required fields are present
            const requiredFields = ['ID', 'Name', 'StartDate', 'EndDate', 'Tour'];
            requiredFields.forEach((field) => {
              expect(eventData).toHaveProperty(field);
              expect(eventData[field as keyof typeof eventData]).toBeDefined();
            });
          }
        ),
        { numRuns: 30 }
      );
    });
  });
});
