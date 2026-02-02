/**
 * Reorder photos array by inserting an item at a new position
 *
 * @param items - Array of items to reorder
 * @param fromIndex - Original index of the item being moved
 * @param toIndex - Target index where the item should be inserted
 * @returns New array with the item inserted at the target position
 *
 * @example
 * // Moving item from index 0 to index 3
 * // [A, B, C, D, E] -> [B, C, D, A, E]
 * // A is removed from 0, others shift left, then A is inserted at 3
 *
 * // Moving item from index 4 to index 1
 * // [A, B, C, D, E] -> [A, E, B, C, D]
 * // E is removed from 4, then inserted at 1, others shift right
 */
export function reorderByInsert<T>(
  items: T[],
  fromIndex: number,
  toIndex: number
): T[] {
  if (fromIndex === toIndex) return items;
  if (fromIndex < 0 || fromIndex >= items.length) return items;
  if (toIndex < 0 || toIndex >= items.length) return items;

  // INSERT behavior: remove item and insert at new position
  const result = [...items];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  return result;
}
