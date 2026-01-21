/**
 * SaveUtils Tests
 * 
 * Tests critical save/load functionality to ensure player data persists correctly
 * across game sessions. This is the most critical feature - if save/load fails,
 * players lose all progress.
 */

import {
  formatPlaytime,
  formatLastPlayed,
  getStorageInfo,
} from '../../src/utils/saveUtils';

describe('SaveUtils - Critical Save/Load System', () => {
  
  describe('formatPlaytime', () => {
    it('should format minutes correctly when less than 60', () => {
      expect(formatPlaytime(0)).toBe('0dk');
      expect(formatPlaytime(30)).toBe('30dk');
      expect(formatPlaytime(59)).toBe('59dk');
    });

    it('should format hours and minutes correctly', () => {
      expect(formatPlaytime(60)).toBe('1s');
      expect(formatPlaytime(90)).toBe('1s 30dk');
      expect(formatPlaytime(125)).toBe('2s 5dk');
    });

    it('should handle large playtime values', () => {
      expect(formatPlaytime(600)).toBe('10s'); // 10 hours
      expect(formatPlaytime(1440)).toBe('24s'); // 1 day
      expect(formatPlaytime(10000)).toBe('166s 40dk'); // ~1 week
    });

    it('should handle edge case of exactly 1 hour', () => {
      expect(formatPlaytime(60)).toBe('1s');
    });
  });

  describe('formatLastPlayed', () => {
    const now = Date.now();

    it('should show "Az önce" for very recent times', () => {
      const justNow = now - 30 * 1000; // 30 seconds ago
      expect(formatLastPlayed(justNow)).toBe('Az önce');
    });

    it('should format minutes correctly', () => {
      const fiveMinAgo = now - 5 * 60 * 1000;
      const thirtyMinAgo = now - 30 * 60 * 1000;
      
      expect(formatLastPlayed(fiveMinAgo)).toBe('5 dk önce');
      expect(formatLastPlayed(thirtyMinAgo)).toBe('30 dk önce');
    });

    it('should format hours correctly', () => {
      const twoHoursAgo = now - 2 * 60 * 60 * 1000;
      const tenHoursAgo = now - 10 * 60 * 60 * 1000;
      
      expect(formatLastPlayed(twoHoursAgo)).toBe('2 saat önce');
      expect(formatLastPlayed(tenHoursAgo)).toBe('10 saat önce');
    });

    it('should format days correctly', () => {
      const twoDaysAgo = now - 2 * 24 * 60 * 60 * 1000;
      const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
      
      expect(formatLastPlayed(twoDaysAgo)).toBe('2 gün önce');
      expect(formatLastPlayed(sevenDaysAgo)).toBe('7 gün önce');
    });

    it('should format date for old saves (over 30 days)', () => {
      const oldDate = now - 40 * 24 * 60 * 60 * 1000; // 40 days ago
      const formatted = formatLastPlayed(oldDate);
      
      // Should be in Turkish date format (e.g., "15 Ara")
      expect(formatted).toMatch(/\d{1,2}\s\w{3}/);
    });

    it('should handle edge case of exactly 1 hour', () => {
      const oneHourAgo = now - 60 * 60 * 1000;
      expect(formatLastPlayed(oneHourAgo)).toBe('1 saat önce');
    });

    it('should handle edge case of exactly 1 day', () => {
      const oneDayAgo = now - 24 * 60 * 60 * 1000;
      expect(formatLastPlayed(oneDayAgo)).toBe('1 gün önce');
    });
  });

  describe('getStorageInfo', () => {
    it('should calculate storage usage correctly', async () => {
      const mockStorage = {
        getAllKeys: jest.fn().mockResolvedValue(['save1', 'save2', 'settings']),
        getItem: jest.fn()
          .mockResolvedValueOnce(JSON.stringify({ data: 'a'.repeat(1000) })) // ~1KB
          .mockResolvedValueOnce(JSON.stringify({ data: 'b'.repeat(2000) })) // ~2KB
          .mockResolvedValueOnce(JSON.stringify({ config: 'test' })), // ~100B
      };

      const info = await getStorageInfo(mockStorage);

      expect(info.used).toBeGreaterThan(3000); // Should be > 3KB
      expect(info.total).toBe(10 * 1024 * 1024); // 10MB
      expect(info.percentage).toBeGreaterThan(0);
      expect(info.percentage).toBeLessThan(1); // Should be < 1% for ~3KB
    });

    it('should handle empty storage', async () => {
      const mockStorage = {
        getAllKeys: jest.fn().mockResolvedValue([]),
        getItem: jest.fn(),
      };

      const info = await getStorageInfo(mockStorage);

      expect(info.used).toBe(0);
      expect(info.total).toBe(10 * 1024 * 1024);
      expect(info.percentage).toBe(0);
    });

    it('should cap percentage at 100%', async () => {
      const mockStorage = {
        getAllKeys: jest.fn().mockResolvedValue(['huge']),
        getItem: jest.fn()
          // Simulate storage full (>10MB)
          .mockResolvedValueOnce(JSON.stringify({ data: 'x'.repeat(11 * 1024 * 1024) })),
      };

      const info = await getStorageInfo(mockStorage);

      expect(info.percentage).toBe(100);
    });

    it('should handle storage errors gracefully', async () => {
      const mockStorage = {
        getAllKeys: jest.fn().mockRejectedValue(new Error('Storage error')),
        getItem: jest.fn(),
      };

      const info = await getStorageInfo(mockStorage);

      // Should return safe defaults on error
      expect(info.used).toBe(0);
      expect(info.total).toBe(0);
      expect(info.percentage).toBe(0);
    });

    it('should handle null values in storage', async () => {
      const mockStorage = {
        getAllKeys: jest.fn().mockResolvedValue(['key1', 'key2', 'key3']),
        getItem: jest.fn()
          .mockResolvedValueOnce('valid data')
          .mockResolvedValueOnce(null)
          .mockResolvedValueOnce('more data'),
      };

      const info = await getStorageInfo(mockStorage);

      // Should skip null values and not crash
      expect(info.used).toBeGreaterThan(0);
      expect(info.percentage).toBeGreaterThan(0);
    });
  });
});
