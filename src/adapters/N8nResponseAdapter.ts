/**
 * N8N Response Adapter
 * Handles extraction and normalization of N8N webhook responses
 */

/**
 * Extract assistant message from N8N response
 * Handles various response formats from N8N
 */
export function extractAssistantMessage(responseData: any): string {
  if (!responseData) {
    return 'No response from N8N';
  }

  // Try different response formats
  if (responseData.output) {
    return responseData.output;
  }
  
  if (responseData.message) {
    return responseData.message;
  }
  
  if (responseData.response) {
    return responseData.response;
  }
  
  // Fallback to stringified response
  return JSON.stringify(responseData);
}
