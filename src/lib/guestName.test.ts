import { describe, it, expect } from 'vitest';
import { formatGuestDisplayName, isDefaultGuestName, DEFAULT_GUEST_NAME } from './guestName';

describe('guestName utilities', () => {
  describe('DEFAULT_GUEST_NAME constant', () => {
    it('should be "Guest"', () => {
      expect(DEFAULT_GUEST_NAME).toBe('Guest');
    });
  });

  describe('isDefaultGuestName', () => {
    it('returns true for exact "Guest" string', () => {
      expect(isDefaultGuestName('Guest')).toBe(true);
    });

    it('returns true for "Guest" with different casing', () => {
      expect(isDefaultGuestName('guest')).toBe(true);
      expect(isDefaultGuestName('GUEST')).toBe(true);
      expect(isDefaultGuestName('GuEsT')).toBe(true);
    });

    it('returns true for "Guest" with leading/trailing whitespace', () => {
      expect(isDefaultGuestName('  Guest  ')).toBe(true);
      expect(isDefaultGuestName('\tGuest\n')).toBe(true);
    });

    it('returns false for custom names', () => {
      expect(isDefaultGuestName('John')).toBe(false);
      expect(isDefaultGuestName('Alice')).toBe(false);
      expect(isDefaultGuestName('Guest123')).toBe(false);
    });

    it('returns true for empty string (treated as default)', () => {
      expect(isDefaultGuestName('')).toBe(true);
    });

    it('returns true for whitespace-only string (treated as default)', () => {
      expect(isDefaultGuestName('   ')).toBe(true);
      expect(isDefaultGuestName('\t\n')).toBe(true);
    });

    it('returns true for null/undefined (treated as default)', () => {
      expect(isDefaultGuestName(null as unknown as string)).toBe(true);
      expect(isDefaultGuestName(undefined as unknown as string)).toBe(true);
    });
  });

  describe('formatGuestDisplayName', () => {
    describe('Case 1: Default name "Guest" used', () => {
      it('returns " (Guest)" when guestName is exactly "Guest"', () => {
        expect(formatGuestDisplayName('Guest')).toBe(' (Guest)');
      });

      it('returns " (Guest)" when guestName is "guest" (case insensitive)', () => {
        expect(formatGuestDisplayName('guest')).toBe(' (Guest)');
        expect(formatGuestDisplayName('GUEST')).toBe(' (Guest)');
      });

      it('returns " (Guest)" when guestName has extra whitespace around "Guest"', () => {
        expect(formatGuestDisplayName('  Guest  ')).toBe(' (Guest)');
      });
    });

    describe('Case 2: Custom name entered', () => {
      it('returns "{name} (Guest)" for custom name "John"', () => {
        expect(formatGuestDisplayName('John')).toBe('John (Guest)');
      });

      it('returns "{name} (Guest)" for custom name "Alice Smith"', () => {
        expect(formatGuestDisplayName('Alice Smith')).toBe('Alice Smith (Guest)');
      });

      it('trims whitespace from custom names', () => {
        expect(formatGuestDisplayName('  John  ')).toBe('John (Guest)');
      });

      it('handles single character names', () => {
        expect(formatGuestDisplayName('A')).toBe('A (Guest)');
      });

      it('handles names with special characters', () => {
        expect(formatGuestDisplayName('Jean-Pierre')).toBe('Jean-Pierre (Guest)');
        expect(formatGuestDisplayName("O'Connor")).toBe("O'Connor (Guest)");
      });

      it('handles names with unicode characters', () => {
        expect(formatGuestDisplayName('Thinh')).toBe('Thinh (Guest)');
        expect(formatGuestDisplayName('Maria')).toBe('Maria (Guest)');
      });

      it('handles names that contain "Guest" as part of larger string', () => {
        expect(formatGuestDisplayName('Guest123')).toBe('Guest123 (Guest)');
        expect(formatGuestDisplayName('TheGuest')).toBe('TheGuest (Guest)');
        expect(formatGuestDisplayName('A Guest User')).toBe('A Guest User (Guest)');
      });
    });

    describe('Edge cases: Empty/invalid inputs', () => {
      it('returns " (Guest)" for empty string', () => {
        expect(formatGuestDisplayName('')).toBe(' (Guest)');
      });

      it('returns " (Guest)" for whitespace-only string', () => {
        expect(formatGuestDisplayName('   ')).toBe(' (Guest)');
        expect(formatGuestDisplayName('\t\n')).toBe(' (Guest)');
      });

      it('returns " (Guest)" for null', () => {
        expect(formatGuestDisplayName(null as unknown as string)).toBe(' (Guest)');
      });

      it('returns " (Guest)" for undefined', () => {
        expect(formatGuestDisplayName(undefined as unknown as string)).toBe(' (Guest)');
      });
    });

    describe('Display consistency', () => {
      it('always includes "(Guest)" suffix', () => {
        const testCases = ['Guest', 'John', '', '   ', 'Alice'];
        testCases.forEach((input) => {
          const result = formatGuestDisplayName(input);
          expect(result).toContain('(Guest)');
        });
      });

      it('never has double spaces in output', () => {
        const testCases = ['Guest', 'John', '  Bob  ', ''];
        testCases.forEach((input) => {
          const result = formatGuestDisplayName(input);
          expect(result).not.toMatch(/  /);
        });
      });
    });
  });
});
