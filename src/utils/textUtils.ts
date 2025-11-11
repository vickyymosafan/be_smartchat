/**
 * Text Utilities
 * Reusable text processing functions
 */

/**
 * Generate title from text
 * Takes first sentence or first 50 characters
 */
export function generateTitleFromText(text: string, maxLength: number = 50): string {
  const cleaned = text.trim().replace(/\s+/g, ' ');
  const firstSentence = cleaned.match(/^[^.!?]+[.!?]?/)?.[0] || cleaned;
  
  if (firstSentence.length <= maxLength) {
    return firstSentence;
  }
  
  return firstSentence.substring(0, maxLength - 3) + '...';
}

/**
 * Validate title
 * Returns validation result with error message if invalid
 */
export function validateTitle(title: string, maxLength: number = 100): { valid: boolean; error?: string } {
  if (!title || title.trim().length === 0) {
    return { valid: false, error: 'Title cannot be empty' };
  }
  
  if (title.length > maxLength) {
    return { valid: false, error: `Title too long (max ${maxLength} characters)` };
  }
  
  return { valid: true };
}
