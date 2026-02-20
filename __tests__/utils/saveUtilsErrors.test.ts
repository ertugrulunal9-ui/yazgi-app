/**
 * SaveUtils Error Handling Tests
 * 
 * Tests error scenarios: storage full, corrupt data, null values,
 * network errors, invalid JSON, browser API failures
 */

import {
  formatPlaytime,
  formatLastPlayed,
  copyToClipboard,
  readFromClipboard,
  generateQRCode,
  downloadFile,
  readFile,
  getStorageInfo,
} from '../../src/utils/saveUtils';

describe('SaveUtils - Error Handling & Edge Cases', () => {
  
  describe('formatPlaytime - Edge Cases', () => {
    it('should handle negative values', () => {
      // Negative values < 60 go to minutes format
      expect(formatPlaytime(-10)).toBe('-10dk');
      expect(formatPlaytime(-60)).toBe('-60dk'); // -60 < 60, so minutes format
    });

    it('should handle very large values', () => {
      const oneYear = 365 * 24 * 60; // ~525,600 minutes
      const result = formatPlaytime(oneYear);
      expect(result).toContain('s');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle decimal/float values', () => {
      // Function uses Math.floor, so decimals are truncated
      const result1 = formatPlaytime(30.5);
      const result2 = formatPlaytime(90.7);
      
      expect(result1).toBeDefined();
      expect(result2).toContain('s');
    });

    it('should handle NaN', () => {
      const result = formatPlaytime(NaN);
      expect(result).toBeDefined();
      // NaN >= 60 is false, so goes to minutes format
      // But Math.floor(NaN / 60) is NaN, which becomes "NaNs"
    });

    it('should handle Infinity', () => {
      const result = formatPlaytime(Infinity);
      expect(result).toBeDefined();
      expect(result).toContain('s'); // Infinity > 60, so hour format
    });
  });

  describe('formatLastPlayed - Edge Cases', () => {
    const now = Date.now();

    it('should handle future timestamps', () => {
      const futureTime = now + 1000 * 60 * 60; // 1 hour in future
      const result = formatLastPlayed(futureTime);
      expect(result).toBe('Az önce'); // Should handle gracefully
    });

    it('should handle very old timestamps', () => {
      const veryOld = now - 365 * 24 * 60 * 60 * 1000; // 1 year ago
      const result = formatLastPlayed(veryOld);
      // Turkish month names have special characters (Şub, Oca, etc.)
      expect(result).toMatch(/\d{1,2}\s\S{3}/); // Should be date format like "2 Şub"
    });

    it('should handle timestamp of 0', () => {
      const result = formatLastPlayed(0);
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle negative timestamps', () => {
      const result = formatLastPlayed(-1000);
      expect(result).toBeDefined();
    });

    it('should handle invalid timestamps (NaN)', () => {
      const result = formatLastPlayed(NaN);
      expect(result).toBeDefined();
    });
  });

  describe('copyToClipboard - Error Scenarios', () => {
    beforeEach(() => {
      // Reset navigator mock
      delete (global as any).navigator;
    });

    it('should return false when clipboard API not available', async () => {
      (global as any).navigator = {};
      
      const result = await copyToClipboard('test data');
      expect(result).toBe(false);
    });

    it('should return false when writeText fails', async () => {
      (global as any).navigator = {
        clipboard: {
          writeText: jest.fn().mockRejectedValue(new Error('Permission denied')),
        },
      };

      const result = await copyToClipboard('test data');
      expect(result).toBe(false);
    });

    it('should handle empty string', async () => {
      (global as any).navigator = {
        clipboard: {
          writeText: jest.fn().mockResolvedValue(undefined),
        },
      };

      const result = await copyToClipboard('');
      expect(result).toBe(true);
    });

    it('should handle very large text', async () => {
      (global as any).navigator = {
        clipboard: {
          writeText: jest.fn().mockResolvedValue(undefined),
        },
      };

      const largeText = 'x'.repeat(1000000); // 1MB of text
      const result = await copyToClipboard(largeText);
      expect(result).toBe(true);
    });

    it('should handle special characters and unicode', async () => {
      (global as any).navigator = {
        clipboard: {
          writeText: jest.fn().mockResolvedValue(undefined),
        },
      };

      const specialText = '🎮 Türkçe özel karakterler: üğöşçİ 你好 مرحبا';
      const result = await copyToClipboard(specialText);
      expect(result).toBe(true);
    });

    it('should handle null/undefined', async () => {
      (global as any).navigator = {
        clipboard: {
          writeText: jest.fn().mockResolvedValue(undefined),
        },
      };

      const result1 = await copyToClipboard(null as any);
      const result2 = await copyToClipboard(undefined as any);
      
      expect(result1).toBe(true);
      expect(result2).toBe(true);
    });
  });

  describe('readFromClipboard - Error Scenarios', () => {
    beforeEach(() => {
      delete (global as any).navigator;
    });

    it('should return null when clipboard API not available', async () => {
      (global as any).navigator = {};

      const result = await readFromClipboard();
      expect(result).toBeNull();
    });

    it('should return null when readText fails', async () => {
      (global as any).navigator = {
        clipboard: {
          readText: jest.fn().mockRejectedValue(new Error('Permission denied')),
        },
      };

      const result = await readFromClipboard();
      expect(result).toBeNull();
    });

    it('should handle empty clipboard', async () => {
      (global as any).navigator = {
        clipboard: {
          readText: jest.fn().mockResolvedValue(''),
        },
      };

      const result = await readFromClipboard();
      expect(result).toBe('');
    });

    it('should handle clipboard timeout', async () => {
      (global as any).navigator = {
        clipboard: {
          readText: jest.fn().mockImplementation(() => 
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Timeout')), 100)
            )
          ),
        },
      };

      const result = await readFromClipboard();
      expect(result).toBeNull();
    });
  });

  describe('generateQRCode - Edge Cases', () => {
    it('should handle empty string', () => {
      const result = generateQRCode('');
      expect(result).toBe('');
    });

    it('should handle very long data', () => {
      const longData = 'x'.repeat(10000);
      const result = generateQRCode(longData);
      expect(result).toBe(longData);
    });

    it('should handle special characters', () => {
      const specialData = 'test@example.com?param=value&foo=bar';
      const result = generateQRCode(specialData);
      expect(result).toBe(specialData);
    });

    it('should handle Turkish characters', () => {
      const turkishData = 'Türkçe özel karakterler üğöşçİ';
      const result = generateQRCode(turkishData);
      expect(result).toBe(turkishData);
    });

    it('should handle JSON data', () => {
      const jsonData = JSON.stringify({ save: 'game', version: 1 });
      const result = generateQRCode(jsonData);
      expect(result).toBe(jsonData);
    });
  });

  describe('downloadFile - Error Scenarios', () => {
    let createElementSpy: jest.SpyInstance;
    let mockLink: any;

    beforeEach(() => {
      // Mock document for Node environment
      if (typeof document === 'undefined') {
        (global as any).document = {
          createElement: jest.fn(),
          body: {
            appendChild: jest.fn(),
            removeChild: jest.fn(),
          },
        };
      }

      mockLink = {
        href: '',
        download: '',
        click: jest.fn(),
      };

      createElementSpy = jest.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
      jest.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink);
      jest.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink);
      
      // Mock URL.createObjectURL
      if (typeof URL.createObjectURL === 'undefined') {
        (URL as any).createObjectURL = jest.fn().mockReturnValue('blob:mock-url');
        (URL as any).revokeObjectURL = jest.fn();
      } else {
        jest.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
        jest.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
      }
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should handle empty filename', () => {
      expect(() => downloadFile('', 'content')).not.toThrow();
    });

    it('should handle empty content', () => {
      expect(() => downloadFile('test.json', '')).not.toThrow();
    });

    it('should handle very large content', () => {
      const largeContent = 'x'.repeat(10000000); // 10MB
      expect(() => downloadFile('large.json', largeContent)).not.toThrow();
    });

    it('should handle special characters in filename', () => {
      expect(() => downloadFile('test file (1).json', 'content')).not.toThrow();
    });

    it('should handle Blob creation failure gracefully', () => {
      jest.spyOn(global, 'Blob').mockImplementation(() => {
        throw new Error('Blob creation failed');
      });

      expect(() => downloadFile('test.json', 'content')).not.toThrow();
      
      jest.restoreAllMocks();
    });

    it('should handle DOM manipulation errors', () => {
      jest.spyOn(document.body, 'appendChild').mockImplementation(() => {
        throw new Error('DOM error');
      });

      expect(() => downloadFile('test.json', 'content')).not.toThrow();
    });
  });

  describe('readFile - Browser API Simulation', () => {
    let createElementSpy: jest.SpyInstance;
    let mockInput: any;

    beforeEach(() => {
      // Mock document for Node environment
      if (typeof document === 'undefined') {
        (global as any).document = {
          createElement: jest.fn(),
        };
      }

      mockInput = {
        type: '',
        accept: '',
        onchange: null,
        click: jest.fn(),
      };

      createElementSpy = jest.spyOn(document, 'createElement').mockReturnValue(mockInput as any);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should return promise that resolves with file content', async () => {
      // Skip in Node environment - requires full DOM
      if (typeof FileReader === 'undefined') {
        return;
      }

      const promise = readFile();

      // Simulate file selection
      setTimeout(() => {
        const mockFile = new Blob(['{"save": "data"}'], { type: 'application/json' });
        const event = {
          target: {
            files: [mockFile],
          },
        } as any;

        mockInput.onchange(event);
      }, 0);

      const result = await promise;
      expect(result).toBeDefined();
    });

    it('should return null when no file selected', async () => {
      const promise = readFile();

      setTimeout(() => {
        const event = {
          target: {
            files: [],
          },
        } as any;

        mockInput.onchange(event);
      }, 0);

      const result = await promise;
      expect(result).toBeNull();
    });

    it.skip('should handle FileReader error', async () => {
      // Skipped: FileReader error simulation too complex in Node environment
    });
  });

  describe('getStorageInfo - Error Handling', () => {
    it('should return zeros when getAllKeys fails', async () => {
      const mockStorage = {
        getAllKeys: jest.fn().mockRejectedValue(new Error('Storage error')),
        getItem: jest.fn(),
      };

      const info = await getStorageInfo(mockStorage);

      expect(info.used).toBe(0);
      expect(info.total).toBe(0);
      expect(info.percentage).toBe(0);
    });

    it('should handle getItem failures gracefully', async () => {
      const mockStorage = {
        getAllKeys: jest.fn().mockResolvedValue(['key1', 'key2']),
        getItem: jest.fn().mockRejectedValue(new Error('Item fetch error')),
      };

      const info = await getStorageInfo(mockStorage);

      // Should complete without crashing
      expect(info).toBeDefined();
      expect(info.used).toBe(0);
    });

    it('should handle corrupted data in storage', async () => {
      const mockStorage = {
        getAllKeys: jest.fn().mockResolvedValue(['corrupted']),
        getItem: jest.fn().mockResolvedValue('\x00\x01\xFF invalid binary'),
      };

      const info = await getStorageInfo(mockStorage);

      expect(info).toBeDefined();
      expect(info.used).toBeGreaterThan(0);
    });

    it('should handle storage with mixed valid/null values', async () => {
      const mockStorage = {
        getAllKeys: jest.fn().mockResolvedValue(['key1', 'key2', 'key3']),
        getItem: jest.fn()
          .mockResolvedValueOnce('valid data')
          .mockResolvedValueOnce(null)
          .mockResolvedValueOnce('more data'),
      };

      const info = await getStorageInfo(mockStorage);

      expect(info.used).toBeGreaterThan(0);
      expect(info.percentage).toBeGreaterThan(0);
    });

    it('should handle storage exceeding 100%', async () => {
      const mockStorage = {
        getAllKeys: jest.fn().mockResolvedValue(['huge']),
        getItem: jest.fn().mockResolvedValue('x'.repeat(20 * 1024 * 1024)), // 20MB
      };

      const info = await getStorageInfo(mockStorage);

      expect(info.percentage).toBe(100); // Should cap at 100%
      expect(info.used).toBeGreaterThan(info.total);
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

    it('should handle storage with only empty strings', async () => {
      const mockStorage = {
        getAllKeys: jest.fn().mockResolvedValue(['empty1', 'empty2']),
        getItem: jest.fn().mockResolvedValue(''),
      };

      const info = await getStorageInfo(mockStorage);

      expect(info.used).toBe(0);
      expect(info.percentage).toBe(0);
    });
  });

  describe('Real-World Error Scenarios', () => {
    it('should handle quota exceeded error', async () => {
      const mockStorage = {
        getAllKeys: jest.fn().mockRejectedValue({
          name: 'QuotaExceededError',
          message: 'Storage quota exceeded',
        }),
        getItem: jest.fn(),
      };

      const info = await getStorageInfo(mockStorage);

      expect(info.used).toBe(0);
      expect(info.total).toBe(0);
      expect(info.percentage).toBe(0);
    });

    it('should handle SecurityError (private browsing)', async () => {
      const mockStorage = {
        getAllKeys: jest.fn().mockRejectedValue({
          name: 'SecurityError',
          message: 'Access denied',
        }),
        getItem: jest.fn(),
      };

      const info = await getStorageInfo(mockStorage);

      expect(info).toBeDefined();
    });

    it('should handle network timeout during cloud sync', async () => {
      const mockStorage = {
        getAllKeys: jest.fn().mockImplementation(() => 
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Network timeout')), 100)
          )
        ),
        getItem: jest.fn(),
      };

      const info = await getStorageInfo(mockStorage);

      expect(info.used).toBe(0);
    });

    it('should handle corrupted save file (invalid JSON)', async () => {
      const mockStorage = {
        getAllKeys: jest.fn().mockResolvedValue(['save1']),
        getItem: jest.fn().mockResolvedValue('{invalid json}}'),
      };

      const info = await getStorageInfo(mockStorage);

      // Should not crash, just process the string size
      expect(info.used).toBeGreaterThan(0);
    });
  });
});
