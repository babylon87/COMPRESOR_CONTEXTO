/**
 * Security utilities for sanitizing user input
 */

/**
 * Sanitize text to prevent XSS attacks
 * Removes potentially dangerous HTML/script tags and event handlers
 * @param {string} text - Text to sanitize
 * @returns {string} Sanitized text
 */
export function sanitizeText(text) {
  if (typeof text !== 'string') return '';
  
  // Remove script tags
  let sanitized = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove iframe tags
  sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  
  // Remove inline event handlers (onclick, onload, etc.)
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  
  return sanitized;
}

/**
 * Common date patterns for extraction from text
 * Matches:
 * - MM/DD/YYYY or DD/MM/YYYY formats
 * - YYYY-MM-DD (ISO format)
 * - Month DD, YYYY format
 * - Day of week
 * - Relative dates (today, tomorrow, yesterday)
 */
export const DATE_PATTERNS = /\b(?:\d{1,2}[-/]\d{1,2}[-/]\d{2,4}|\d{4}[-/]\d{1,2}[-/]\d{1,2}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4}|(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)|today|tomorrow|yesterday)\b/gi;
