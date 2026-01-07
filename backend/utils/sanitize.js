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
 * 
 * IMPORTANT: This performs multiple passes to handle nested/repeated patterns.
 * The text is sanitized recursively until no more dangerous patterns are found.
 * 
 * @param {string} text - Text to sanitize
 * @returns {string} Sanitized text
 */
export function sanitizeText(text) {
  if (typeof text !== 'string') return '';
  
  let sanitized = text;
  let previousLength;
  
  // Keep sanitizing until no more patterns are found (handles nested/repeated patterns)
  do {
    previousLength = sanitized.length;
    
    // Remove script tags (case-insensitive, handles spaces in end tags)
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\s*\/\s*script\s*>)<[^<]*)*<\s*\/\s*script\s*>/gi, '');
    
    // Remove iframe tags (case-insensitive, handles spaces in end tags)
    sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\s*\/\s*iframe\s*>)<[^<]*)*<\s*\/\s*iframe\s*>/gi, '');
    
    // Remove inline event handlers (onclick, onload, etc.) - case-insensitive
    sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
    
    // Remove common XSS patterns
    sanitized = sanitized.replace(/<img\b[^>]*>/gi, ''); // Remove img tags
    
  } while (sanitized.length !== previousLength); // Repeat if content changed
  
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
