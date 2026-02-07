// Booking filtering and sorting utilities

import type { Booking, BookingFilters, BookingSortOption, FilterOptions } from '../types';

/**
 * Filter bookings based on provided filter criteria
 */
export function filterBookings(bookings: Booking[], filters: BookingFilters): Booking[] {
  return bookings.filter((booking) => {
    // Search filter (guest name or email, case-insensitive)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesName = booking.guestName.toLowerCase().includes(searchLower);
      const matchesEmail = booking.email.toLowerCase().includes(searchLower);
      if (!matchesName && !matchesEmail) {
        return false;
      }
    }

    // Status filter
    if (filters.status.length > 0 && !filters.status.includes(booking.status)) {
      return false;
    }

    // Trip filter
    if (filters.tripId.length > 0 && !filters.tripId.includes(booking.tripId)) {
      return false;
    }

    // Submission date range filter
    if (filters.submissionDateRange[0] && filters.submissionDateRange[1]) {
      const submittedAt = booking.submittedAt.toDate();
      const startDate = new Date(filters.submissionDateRange[0]);
      const endDate = new Date(filters.submissionDateRange[1]);

      // Set time to start/end of day for proper comparison
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);

      if (submittedAt < startDate || submittedAt > endDate) {
        return false;
      }
    }

    // Preferred date range filter
    if (filters.preferredDateRange[0] && filters.preferredDateRange[1]) {
      const preferredDate = new Date(booking.preferredDate);
      const startDate = new Date(filters.preferredDateRange[0]);
      const endDate = new Date(filters.preferredDateRange[1]);

      // Set time to start/end of day for proper comparison
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);

      if (preferredDate < startDate || preferredDate > endDate) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Sort bookings based on sort option
 */
export function sortBookings(bookings: Booking[], sortBy?: BookingSortOption): Booking[] {
  if (!sortBy) return bookings;

  const sorted = [...bookings];

  switch (sortBy) {
    case 'submission-asc':
      return sorted.sort((a, b) => a.submittedAt.toMillis() - b.submittedAt.toMillis());
    case 'submission-desc':
      return sorted.sort((a, b) => b.submittedAt.toMillis() - a.submittedAt.toMillis());
    case 'preferred-date-asc':
      return sorted.sort(
        (a, b) => new Date(a.preferredDate).getTime() - new Date(b.preferredDate).getTime()
      );
    case 'preferred-date-desc':
      return sorted.sort(
        (a, b) => new Date(b.preferredDate).getTime() - new Date(a.preferredDate).getTime()
      );
    case 'guest-count-asc':
      return sorted.sort((a, b) => a.guestCount - b.guestCount);
    case 'guest-count-desc':
      return sorted.sort((a, b) => b.guestCount - a.guestCount);
    default:
      return sorted;
  }
}

/**
 * Compute available filter options from bookings data
 */
export function computeBookingFilterOptions(
  bookings: Booking[],
  allTrips: Array<{ id: string; title: string }>
): FilterOptions {
  const statuses = new Map<'pending' | 'confirmed' | 'cancelled', number>();
  const tripCounts = new Map<string, number>();

  bookings.forEach((booking) => {
    // Count statuses
    statuses.set(booking.status, (statuses.get(booking.status) || 0) + 1);

    // Count trips
    tripCounts.set(booking.tripId, (tripCounts.get(booking.tripId) || 0) + 1);
  });

  // Map trip IDs to titles with counts
  const trips = allTrips.map((trip) => ({
    id: trip.id,
    title: trip.title,
    count: tripCounts.get(trip.id) || 0,
  }));

  return {
    difficulties: [], // Not applicable for bookings
    durations: [], // Not applicable for bookings
    locations: [], // Not applicable for bookings
    priceRange: [0, 0], // Not applicable for bookings
    trips,
  };
}

/**
 * Count active filters (excluding defaults)
 */
export function countActiveBookingFilters(filters: BookingFilters): number {
  let count = 0;

  if (filters.search) count++;
  if (filters.status.length > 0) count += filters.status.length;
  if (filters.tripId.length > 0) count += filters.tripId.length;
  if (filters.submissionDateRange[0] || filters.submissionDateRange[1]) count++;
  if (filters.preferredDateRange[0] || filters.preferredDateRange[1]) count++;

  return count;
}
