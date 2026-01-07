/**
 * Security utilities for sanitizing user input
 * 
 * NOTE: This is a basic sanitization implementation suitable for this use case
 * where input is processed server-side and not directly rendered in HTML.
 * For production systems with direct HTML rendering, consider using a
 * well-tested library like DOMPurify.
 */

/**
 * Sanitize text to prevent XSS attacks
 * Removes potentially dangerous HTML/script tags and event handlers
 * @param {string} text - Text to sanitize
 * @returns {string} Sanitized text
 */
export function sanitizeText(text) {
  if (typeof text !== 'string') return '';
  
  // Remove script tags (case-insensitive)
  let sanitized = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove iframe tags (case-insensitive)
  sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  
  // Remove inline event handlers (onclick, onload, etc.) - case-insensitive
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  
  // Remove common XSS patterns
  sanitized = sanitized.replace(/<img[^>]+src[^>]*>/gi, ''); // Remove img tags
  
  return sanitized;
}

/**
 * Common date patterns for extraction from text
 * 
 * NOTE: This regex is used on sanitized and length-limited text (max 10M chars by default).
 * The validateTextInput middleware prevents ReDoS attacks by limiting input size.
 * 
 * Matches:
 * - MM/DD/YYYY or DD/MM/YYYY formats
 * - YYYY-MM-DD (ISO format)
 * - Month DD, YYYY format
 * - Day of week
 * - Relative dates (today, tomorrow, yesterday)
 */
export const DATE_PATTERNS = /\b(?:\d{1,2}[-/]\d{1,2}[-/]\d{2,4}|\d{4}[-/]\d{1,2}[-/]\d{1,2}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4}|(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)|today|tomorrow|yesterday)\b/gi;
