/**
 * Input Sanitization Utilities
 *
 * Provides comprehensive HTML/XSS sanitization for all user-facing inputs.
 * Uses DOMPurify as the core engine and exposes domain-specific helpers
 * so that every form and data-layer function can sanitize in a single call.
 *
 * IMPORTANT: Sanitization should be applied at TWO levels:
 *   1. Before data is written to Firestore  (useBookings, useTestimonials, etc.)
 *   2. Before data is rendered in components (especially if using dangerouslySetInnerHTML)
 *
 * This module is intentionally zero-config for callers -- import a function and use it.
 */

import DOMPurify from 'dompurify';

// ---------------------------------------------------------------------------
// DOMPurify Configuration
// ---------------------------------------------------------------------------

/**
 * Strict config: strips ALL HTML. Suitable for plain-text fields like names,
 * emails, phone numbers, and any field that should never contain markup.
 */
const STRICT_CONFIG = {
  ALLOWED_TAGS: [] as string[],   // No HTML tags allowed
  ALLOWED_ATTR: [] as string[],   // No attributes allowed
  KEEP_CONTENT: true,             // Retain text content after stripping tags
};

/**
 * Basic config: allows minimal safe formatting tags.
 * Suitable for fields where light formatting may be acceptable (e.g., descriptions).
 */
const BASIC_HTML_CONFIG = {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br', 'p', 'ul', 'ol', 'li'],
  ALLOWED_ATTR: [] as string[],
  KEEP_CONTENT: true,
};

// ---------------------------------------------------------------------------
// Core Sanitization Functions
// ---------------------------------------------------------------------------

/**
 * Strip ALL HTML and return plain text.
 * This is the default sanitizer for the vast majority of user inputs.
 */
export function sanitizeText(input: string): string {
  if (!input || typeof input !== 'string') return '';
  return (DOMPurify.sanitize(input, STRICT_CONFIG) as string).trim();
}

/**
 * Sanitize while allowing a small safe-list of formatting tags.
 * Use only where rich text is intentionally supported.
 */
export function sanitizeBasicHtml(input: string): string {
  if (!input || typeof input !== 'string') return '';
  return (DOMPurify.sanitize(input, BASIC_HTML_CONFIG) as string).trim();
}

/**
 * Sanitize a URL string.
 * - Strips HTML from the value
 * - Blocks javascript: / data: / vbscript: protocol URLs
 * - Returns empty string for invalid/dangerous URLs
 */
export function sanitizeUrl(input: string): string {
  if (!input || typeof input !== 'string') return '';

  const cleaned = sanitizeText(input);

  // Block dangerous protocols
  const lower = cleaned.toLowerCase().replace(/\s/g, '');
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('blob:')
  ) {
    return '';
  }

  // Must start with http:// or https:// (or be empty / relative)
  if (cleaned && !cleaned.match(/^https?:\/\//i) && !cleaned.startsWith('/')) {
    return '';
  }

  return cleaned;
}

/**
 * Sanitize an email address.
 * - Strips HTML, trims, lowercases
 * - Returns the cleaned value (validation is separate)
 */
export function sanitizeEmail(input: string): string {
  if (!input || typeof input !== 'string') return '';
  return sanitizeText(input).toLowerCase();
}

/**
 * Sanitize a phone number.
 * - Strips HTML
 * - Removes characters that are not digits, +, -, (, ), spaces, or dots
 */
export function sanitizePhone(input: string): string {
  if (!input || typeof input !== 'string') return '';
  const textOnly = sanitizeText(input);
  return textOnly.replace(/[^\d+\-().\s]/g, '');
}

/**
 * Sanitize a numeric string.
 * - Strips HTML
 * - Allows only digits, decimal point, and leading minus
 */
export function sanitizeNumeric(input: string): string {
  if (!input || typeof input !== 'string') return '';
  const textOnly = sanitizeText(input);
  return textOnly.replace(/[^\d.\-]/g, '');
}

// ---------------------------------------------------------------------------
// Batch / Object Sanitization
// ---------------------------------------------------------------------------

/**
 * Recursively sanitize all string values in a plain object.
 * Non-string primitives (number, boolean) are passed through.
 * Nested objects are recursively processed.
 * Arrays of strings are individually sanitized.
 *
 * This is the "catch-all" that should be applied to every payload before
 * it is written to Firestore, as a defense-in-depth measure.
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  options: { allowBasicHtml?: string[] } = {},
): T {
  const { allowBasicHtml = [] } = options;

  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) {
      continue;
    }
    if (value === null) {
      result[key] = value;
    } else if (typeof value === 'string') {
      result[key] = allowBasicHtml.includes(key)
        ? sanitizeBasicHtml(value)
        : sanitizeText(value);
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      result[key] = value;
    } else if (Array.isArray(value)) {
      result[key] = value
        .map((item) => {
          if (item === undefined) return undefined;
          if (typeof item === 'string') return sanitizeText(item);
          if (Array.isArray(item)) return item;
          if (item && typeof item === 'object') {
            if (item.constructor && item.constructor.name !== 'Object') {
              return item;
            }
            return sanitizeObject(item as Record<string, unknown>, options);
          }
          return item;
        })
        .filter((item) => item !== undefined);
    } else if (typeof value === 'object') {
      // Firestore Timestamp and similar objects should pass through
      if (
        value.constructor &&
        value.constructor.name !== 'Object'
      ) {
        result[key] = value;
      } else {
        result[key] = sanitizeObject(value as Record<string, unknown>, options);
      }
    } else {
      result[key] = value;
    }
  }

  return result as T;
}

// ---------------------------------------------------------------------------
// Injection Pattern Detection (Defense-in-Depth)
// ---------------------------------------------------------------------------

/**
 * Common SQL / NoSQL injection patterns.
 * Even though Firestore is not SQL, detecting these patterns provides
 * defense-in-depth and can flag malicious intent.
 */
const INJECTION_PATTERNS = [
  // SQL injection patterns
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|EXEC|EXECUTE)\b\s)/i,
  /(';\s*--)/,
  /(;\s*(DROP|DELETE|UPDATE)\s)/i,
  /(\bOR\s+1\s*=\s*1\b)/i,
  /(\bAND\s+1\s*=\s*1\b)/i,
  // Script injection patterns (beyond what DOMPurify strips)
  /(<script[\s>])/i,
  /(javascript\s*:)/i,
  /(on\w+\s*=)/i,   // onerror=, onclick=, etc.
  // Template injection
  /(\{\{.*\}\})/,
  /(\$\{.*\})/,
];

/**
 * Check whether a string contains suspicious injection patterns.
 * Returns true if the string looks suspicious.
 * This does NOT block -- it is informational, so callers can log/flag.
 */
export function containsInjectionPattern(input: string): boolean {
  if (!input || typeof input !== 'string') return false;
  return INJECTION_PATTERNS.some((pattern) => pattern.test(input));
}

/**
 * Log a warning if an injection pattern is detected.
 * This should be called in data-layer hooks so admins get visibility.
 */
export function warnIfSuspicious(fieldName: string, value: string): void {
  if (containsInjectionPattern(value)) {
    console.warn(
      `[Security] Suspicious input detected in field "${fieldName}". ` +
      `The value has been sanitized, but this may indicate a malicious attempt.`,
    );
  }
}
