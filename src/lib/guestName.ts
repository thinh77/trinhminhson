/**
 * Guest name display formatting utilities.
 *
 * Display Logic (Naming Convention):
 * - Case 1 (Default name used): If the user keeps "Guest", display " (Guest)"
 * - Case 2 (Custom name entered): If custom name, display "{name} (Guest)"
 */

/**
 * The default guest name used when no custom name is provided.
 */
export const DEFAULT_GUEST_NAME = 'Guest';

/**
 * The suffix appended to all guest display names.
 */
const GUEST_SUFFIX = '(Guest)';

/**
 * Checks if the provided name is the default "Guest" name.
 * Returns true for:
 * - Exact match "Guest" (case insensitive)
 * - Empty string
 * - Whitespace-only string
 * - null/undefined
 *
 * @param name - The guest name to check
 * @returns true if this is considered the default guest name
 */
export function isDefaultGuestName(name: string): boolean {
  // Handle null/undefined
  if (name == null) {
    return true;
  }

  // Trim and normalize
  const trimmed = name.trim();

  // Empty or whitespace-only is treated as default
  if (trimmed === '') {
    return true;
  }

  // Case-insensitive comparison with "Guest"
  return trimmed.toLowerCase() === DEFAULT_GUEST_NAME.toLowerCase();
}

/**
 * Formats a guest name for display according to the naming convention.
 *
 * Display Logic:
 * - Case 1 (Default name): Returns " (Guest)" (with leading space, no name shown)
 * - Case 2 (Custom name): Returns "{name} (Guest)"
 *
 * @param guestName - The guest name entered by the user
 * @returns The formatted display string
 *
 * @example
 * formatGuestDisplayName('Guest')      // " (Guest)"
 * formatGuestDisplayName('John')       // "John (Guest)"
 * formatGuestDisplayName('')           // " (Guest)"
 * formatGuestDisplayName('  Alice  ')  // "Alice (Guest)"
 */
export function formatGuestDisplayName(guestName: string): string {
  // Check if this is the default guest name
  if (isDefaultGuestName(guestName)) {
    // Case 1: Default name - return " (Guest)" with leading space
    return ` ${GUEST_SUFFIX}`;
  }

  // Case 2: Custom name - trim and format as "{name} (Guest)"
  const trimmedName = guestName.trim();
  return `${trimmedName} ${GUEST_SUFFIX}`;
}
