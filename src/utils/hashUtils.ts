import crypto from 'crypto';

/**
 * Generate SHA256 hash from a question string
 * Normalizes the question before hashing to ensure consistent cache hits
 * 
 * @param question - The question string to hash
 * @returns SHA256 hash of the normalized question
 */
export function generateQuestionHash(question: string): string {
  // Normalize: lowercase, trim, and remove extra spaces
  const normalized = question
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
  
  // Generate SHA256 hash
  return crypto
    .createHash('sha256')
    .update(normalized, 'utf8')
    .digest('hex');
}
