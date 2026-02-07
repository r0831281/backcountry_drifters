import { type BookingRequest } from '../types';

/**
 * Submit booking request via Cloudflare Worker email endpoint
 *
 * TODO: Replace with actual Cloudflare Worker endpoint URL
 * This is a placeholder implementation for the MVP phase
 */
export async function submitBookingRequest(booking: BookingRequest): Promise<void> {
  // Placeholder for Cloudflare Worker endpoint
  const WORKER_ENDPOINT = import.meta.env.VITE_BOOKING_EMAIL_ENDPOINT || '/api/booking';

  try {
    const response = await fetch(WORKER_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(booking),
    });

    if (!response.ok) {
      throw new Error(`Failed to submit booking: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error submitting booking request:', error);
    throw new Error('Failed to submit booking request. Please try again or contact us directly.');
  }
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format
 * Accepts various US phone number formats
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
}
