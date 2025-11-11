/**
 * Text Utilities
 * Common text processing functions
 */

/**
 * Generate a title from text
 * Takes first 50 characters or first sentence
 * 
 * @param text - Input text
 * @param maxLength - Maximum length (default: 50)
 * @returns Truncated title
 */
export function generateTitle(text: string, maxLength: number = 50): string {
  // Remove extra whitespace
  const cleaned = text.trim().replace(/\s+/g, ' ');
  
  // Try to get first sentence (up to first period, question mark, or exclamation)
  const firstSentence = cleaned.match(/^[^.!?]+[.!?]?/)?.[0] || cleaned;
  
  // Limit to maxLength characters
  if (firstSentence.length > maxLength) {
    return firstSentence.substring(0, maxLength - 3) + '...';
  }
  
  return firstSentence;
}

/**
 * Validate title format
 * 
 * @param title - Title to validate
 * @param maxLength - Maximum length (default: 100)
 * @returns Validation result with error message if invalid
 */
export function validateTitle(
  title: string,
  maxLength: number = 100
): { valid: boolean; error?: string } {
  if (!title || title.trim().length === 0) {
    return { valid: false, error: 'Title cannot be empty' };
  }

  if (title.length > maxLength) {
    return { valid: false, error: `Title too long (max ${maxLength} characters)` };
  }

  return { valid: true };
}
