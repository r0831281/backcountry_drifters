/**
 * Input Validation Utilities
 *
 * Provides reusable, composable validation functions for all user-facing
 * forms throughout the application. Each validator returns either `null`
 * (no error) or a human-readable error string.
 *
 * Usage:
 *   const error = validateEmail(value);
 *   if (error) { setErrors(prev => ({ ...prev, email: error })); }
 *
 * Validators are intentionally pure functions with no side effects so
 * they can be used both in React components and in pre-submission checks.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A validator returns null when valid, or an error message string. */
export type ValidationResult = string | null;

/** A validator function signature. */
export type Validator = (value: unknown) => ValidationResult;

// ---------------------------------------------------------------------------
// Generic Validators
// ---------------------------------------------------------------------------

/**
 * Require a non-empty string (after trimming).
 */
export function required(value: unknown, fieldLabel = 'This field'): ValidationResult {
  if (value === null || value === undefined) return `${fieldLabel} is required.`;
  if (typeof value === 'string' && value.trim().length === 0) return `${fieldLabel} is required.`;
  if (typeof value === 'number' && isNaN(value)) return `${fieldLabel} is required.`;
  return null;
}

/**
 * Enforce a minimum string length (after trimming).
 */
export function minLength(
  value: string,
  min: number,
  fieldLabel = 'This field',
): ValidationResult {
  if (typeof value !== 'string') return `${fieldLabel} must be text.`;
  if (value.trim().length < min) {
    return `${fieldLabel} must be at least ${min} character${min !== 1 ? 's' : ''}.`;
  }
  return null;
}

/**
 * Enforce a maximum string length.
 */
export function maxLength(
  value: string,
  max: number,
  fieldLabel = 'This field',
): ValidationResult {
  if (typeof value !== 'string') return `${fieldLabel} must be text.`;
  if (value.length > max) {
    return `${fieldLabel} must be no more than ${max} character${max !== 1 ? 's' : ''}.`;
  }
  return null;
}

/**
 * Enforce both minimum and maximum length in one call.
 */
export function lengthBetween(
  value: string,
  min: number,
  max: number,
  fieldLabel = 'This field',
): ValidationResult {
  return minLength(value, min, fieldLabel) ?? maxLength(value, max, fieldLabel);
}

// ---------------------------------------------------------------------------
// Email
// ---------------------------------------------------------------------------

/**
 * Comprehensive email validation.
 * - Checks format via a robust regex (RFC 5322 simplified)
 * - Enforces max length (254 chars per RFC)
 * - Rejects obviously bogus TLDs
 */
export function validateEmail(value: string, fieldLabel = 'Email'): ValidationResult {
  const req = required(value, fieldLabel);
  if (req) return req;

  const trimmed = value.trim();

  if (trimmed.length > 254) {
    return `${fieldLabel} address is too long.`;
  }

  // RFC 5322 simplified -- covers 99.9% of real-world addresses
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  if (!emailRegex.test(trimmed)) {
    return `Please enter a valid ${fieldLabel.toLowerCase()} address.`;
  }

  // Must have at least one dot in domain part
  const domainPart = trimmed.split('@')[1];
  if (!domainPart || !domainPart.includes('.')) {
    return `Please enter a valid ${fieldLabel.toLowerCase()} address.`;
  }

  // TLD must be at least 2 chars
  const tld = domainPart.split('.').pop() || '';
  if (tld.length < 2) {
    return `Please enter a valid ${fieldLabel.toLowerCase()} address.`;
  }

  return null;
}

// ---------------------------------------------------------------------------
// Phone
// ---------------------------------------------------------------------------

/**
 * Phone number validation.
 * Accepts North American formats plus international with leading +.
 * Allows: (403) 555-1234, 403-555-1234, 4035551234, +1-403-555-1234
 */
export function validatePhone(value: string, fieldLabel = 'Phone number'): ValidationResult {
  const req = required(value, fieldLabel);
  if (req) return req;

  const trimmed = value.trim();

  // Strip everything except digits and leading +
  const digitsOnly = trimmed.replace(/[^\d+]/g, '');

  // Must have between 10 and 15 digits (E.164 allows up to 15)
  const pureDigits = digitsOnly.replace(/\+/g, '');
  if (pureDigits.length < 10 || pureDigits.length > 15) {
    return `Please enter a valid ${fieldLabel.toLowerCase()} (10-15 digits).`;
  }

  // Broader regex allowing various formats
  const phoneRegex = /^[+]?[(]?\d{1,4}[)]?[-\s.]?\d{1,4}[-\s.]?\d{1,9}$/;
  if (!phoneRegex.test(trimmed.replace(/\s+/g, ' ').trim())) {
    return `Please enter a valid ${fieldLabel.toLowerCase()}.`;
  }

  return null;
}

// ---------------------------------------------------------------------------
// URL
// ---------------------------------------------------------------------------

/**
 * URL validation.
 * - Must start with http:// or https://
 * - Must have a valid-looking domain
 * - Blocks javascript:, data:, vbscript: protocols
 */
export function validateUrl(value: string, fieldLabel = 'URL'): ValidationResult {
  if (!value || value.trim().length === 0) return null; // URLs are often optional

  const trimmed = value.trim();

  if (trimmed.length > 2048) {
    return `${fieldLabel} is too long (maximum 2048 characters).`;
  }

  // Block dangerous protocols
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:')
  ) {
    return `${fieldLabel} contains a disallowed protocol.`;
  }

  // Must start with http(s)://
  if (!/^https?:\/\//i.test(trimmed)) {
    return `${fieldLabel} must start with http:// or https://.`;
  }

  try {
    const parsed = new URL(trimmed);
    // Hostname must have a dot (e.g., example.com)
    if (!parsed.hostname.includes('.')) {
      return `Please enter a valid ${fieldLabel.toLowerCase()}.`;
    }
  } catch {
    return `Please enter a valid ${fieldLabel.toLowerCase()}.`;
  }

  return null;
}

// ---------------------------------------------------------------------------
// Numbers
// ---------------------------------------------------------------------------

/**
 * Validate that a value is a number within an optional range.
 */
export function validateNumber(
  value: unknown,
  options: {
    min?: number;
    max?: number;
    integer?: boolean;
    fieldLabel?: string;
  } = {},
): ValidationResult {
  const { min, max, integer = false, fieldLabel = 'This field' } = options;

  const num = typeof value === 'string' ? parseFloat(value) : (value as number);

  if (isNaN(num)) {
    return `${fieldLabel} must be a valid number.`;
  }

  if (integer && !Number.isInteger(num)) {
    return `${fieldLabel} must be a whole number.`;
  }

  if (min !== undefined && num < min) {
    return `${fieldLabel} must be at least ${min}.`;
  }

  if (max !== undefined && num > max) {
    return `${fieldLabel} must be no more than ${max}.`;
  }

  return null;
}

// ---------------------------------------------------------------------------
// Date
// ---------------------------------------------------------------------------

/**
 * Validate a date string.
 * - Must be a valid date
 * - Optionally enforce that it is in the future
 * - Optionally enforce a maximum date
 */
export function validateDate(
  value: string,
  options: {
    requireFuture?: boolean;
    maxDate?: Date;
    fieldLabel?: string;
  } = {},
): ValidationResult {
  const { requireFuture = false, maxDate, fieldLabel = 'Date' } = options;

  const req = required(value, fieldLabel);
  if (req) return req;

  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return `Please enter a valid ${fieldLabel.toLowerCase()}.`;
  }

  if (requireFuture) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) {
      return `${fieldLabel} must be today or in the future.`;
    }
  }

  if (maxDate && date > maxDate) {
    return `${fieldLabel} is too far in the future.`;
  }

  return null;
}

// ---------------------------------------------------------------------------
// Composite / Form-Level Validators
// ---------------------------------------------------------------------------

/**
 * Validate a full name.
 * - Required, at least 2 characters, max 100 characters
 * - Must contain only letters, spaces, hyphens, apostrophes, and periods
 */
export function validateName(value: string, fieldLabel = 'Name'): ValidationResult {
  const req = required(value, fieldLabel);
  if (req) return req;

  const trimmed = value.trim();

  const lengthCheck = lengthBetween(trimmed, 2, 100, fieldLabel);
  if (lengthCheck) return lengthCheck;

  // Allow Unicode letters, spaces, hyphens, apostrophes, periods
  if (!/^[\p{L}\s\-'.]+$/u.test(trimmed)) {
    return `${fieldLabel} contains invalid characters.`;
  }

  return null;
}

/**
 * Validate a general text field with configurable length limits.
 */
export function validateTextField(
  value: string,
  options: {
    minLen?: number;
    maxLen?: number;
    fieldLabel?: string;
    isRequired?: boolean;
  } = {},
): ValidationResult {
  const {
    minLen = 0,
    maxLen = 5000,
    fieldLabel = 'This field',
    isRequired = false,
  } = options;

  if (isRequired) {
    const req = required(value, fieldLabel);
    if (req) return req;
  } else if (!value || value.trim().length === 0) {
    return null; // optional and empty is fine
  }

  return lengthBetween(value.trim(), minLen, maxLen, fieldLabel);
}

// ---------------------------------------------------------------------------
// Booking-Specific Validators
// ---------------------------------------------------------------------------

export interface BookingValidationErrors {
  guestName?: string;
  email?: string;
  phone?: string;
  preferredDate?: string;
  guestCount?: string;
  specialRequests?: string;
}

/**
 * Validate all fields for the booking form in one call.
 */
export function validateBookingForm(data: {
  guestName: string;
  email: string;
  phone: string;
  preferredDate: string;
  guestCount: number;
  specialRequests?: string;
  maxGuests?: number;
}): BookingValidationErrors {
  const errors: BookingValidationErrors = {};

  const nameErr = validateName(data.guestName, 'Full name');
  if (nameErr) errors.guestName = nameErr;

  const emailErr = validateEmail(data.email);
  if (emailErr) errors.email = emailErr;

  const phoneErr = validatePhone(data.phone);
  if (phoneErr) errors.phone = phoneErr;

  const dateErr = validateDate(data.preferredDate, {
    requireFuture: true,
    fieldLabel: 'Preferred date',
    maxDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
  });
  if (dateErr) errors.preferredDate = dateErr;

  const guestErr = validateNumber(data.guestCount, {
    min: 1,
    max: data.maxGuests ?? 20,
    integer: true,
    fieldLabel: 'Number of guests',
  });
  if (guestErr) errors.guestCount = guestErr;

  if (data.specialRequests) {
    const reqErr = maxLength(data.specialRequests, 2000, 'Special requests');
    if (reqErr) errors.specialRequests = reqErr;
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Testimonial-Specific Validators
// ---------------------------------------------------------------------------

export interface TestimonialValidationErrors {
  customerName?: string;
  rating?: string;
  testimonialText?: string;
  tripType?: string;
  photoUrl?: string;
}

/**
 * Validate all fields for the testimonial form in one call.
 */
export function validateTestimonialForm(data: {
  customerName: string;
  rating: number;
  testimonialText: string;
  tripType: string;
  photoUrl?: string;
}): TestimonialValidationErrors {
  const errors: TestimonialValidationErrors = {};

  const nameErr = validateName(data.customerName, 'Customer name');
  if (nameErr) errors.customerName = nameErr;

  const ratingErr = validateNumber(data.rating, {
    min: 1,
    max: 5,
    integer: true,
    fieldLabel: 'Rating',
  });
  if (ratingErr) errors.rating = ratingErr;

  const textErr = validateTextField(data.testimonialText, {
    minLen: 20,
    maxLen: 2000,
    fieldLabel: 'Testimonial text',
    isRequired: true,
  });
  if (textErr) errors.testimonialText = textErr;

  const tripErr = validateTextField(data.tripType, {
    minLen: 2,
    maxLen: 100,
    fieldLabel: 'Trip type',
    isRequired: true,
  });
  if (tripErr) errors.tripType = tripErr;

  if (data.photoUrl) {
    const urlErr = validateUrl(data.photoUrl, 'Photo URL');
    if (urlErr) errors.photoUrl = urlErr;
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Trip-Specific Validators
// ---------------------------------------------------------------------------

export interface TripValidationErrors {
  title?: string;
  description?: string;
  duration?: string;
  price?: string;
  maxGuests?: string;
  difficulty?: string;
  location?: string;
  photoUrls?: string;
}

const VALID_DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];

/**
 * Validate all fields for the trip form in one call.
 */
export function validateTripForm(data: {
  title: string;
  description: string;
  duration: string;
  price: number;
  maxGuests: number;
  difficulty: string;
  location: string;
  photoUrls?: string[];
}): TripValidationErrors {
  const errors: TripValidationErrors = {};

  const titleErr = validateTextField(data.title, {
    minLen: 2,
    maxLen: 200,
    fieldLabel: 'Title',
    isRequired: true,
  });
  if (titleErr) errors.title = titleErr;

  const descErr = validateTextField(data.description, {
    minLen: 10,
    maxLen: 5000,
    fieldLabel: 'Description',
    isRequired: true,
  });
  if (descErr) errors.description = descErr;

  const durErr = validateTextField(data.duration, {
    minLen: 1,
    maxLen: 100,
    fieldLabel: 'Duration',
    isRequired: true,
  });
  if (durErr) errors.duration = durErr;

  const priceErr = validateNumber(data.price, {
    min: 1,
    max: 10000000, // $100,000 in cents
    fieldLabel: 'Price',
  });
  if (priceErr) errors.price = priceErr;

  const guestErr = validateNumber(data.maxGuests, {
    min: 1,
    max: 50,
    integer: true,
    fieldLabel: 'Max guests',
  });
  if (guestErr) errors.maxGuests = guestErr;

  if (!VALID_DIFFICULTIES.includes(data.difficulty)) {
    errors.difficulty = 'Please select a valid difficulty level.';
  }

  const locErr = validateTextField(data.location, {
    minLen: 2,
    maxLen: 200,
    fieldLabel: 'Location',
    isRequired: true,
  });
  if (locErr) errors.location = locErr;

  // Validate each photo URL if provided
  if (data.photoUrls && data.photoUrls.length > 0) {
    for (const url of data.photoUrls) {
      const urlErr = validateUrl(url, 'Photo URL');
      if (urlErr) {
        errors.photoUrls = urlErr;
        break;
      }
    }
  }

  return errors;
}
