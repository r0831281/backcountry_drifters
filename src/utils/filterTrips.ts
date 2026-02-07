// Trip filtering and sorting utilities

import type { Trip, TripFilters, TripSortOption, FilterOptions, TripDifficulty } from '../types';

/**
 * Filter trips based on provided filter criteria
 */
export function filterTrips(trips: Trip[], filters: TripFilters): Trip[] {
  return trips.filter((trip) => {
    // Search filter (case-insensitive)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesTitle = trip.title.toLowerCase().includes(searchLower);
      const matchesDescription = trip.description.toLowerCase().includes(searchLower);
      const matchesLocation = trip.location.toLowerCase().includes(searchLower);
      if (!matchesTitle && !matchesDescription && !matchesLocation) {
        return false;
      }
    }

    // Difficulty filter
    if (filters.difficulty.length > 0 && !filters.difficulty.includes(trip.difficulty)) {
      return false;
    }

    // Price range filter (convert cents to dollars for comparison)
    const tripPrice = trip.price / 100;
    if (tripPrice < filters.priceRange[0] || tripPrice > filters.priceRange[1]) {
      return false;
    }

    // Duration filter
    if (filters.duration.length > 0 && !filters.duration.includes(trip.duration)) {
      return false;
    }

    // Location filter
    if (filters.location.length > 0 && !filters.location.includes(trip.location)) {
      return false;
    }

    // Admin: Status filter
    if (filters.status && filters.status.length > 0) {
      const isActive = trip.isActive ? 'active' : 'inactive';
      if (!filters.status.includes(isActive)) {
        return false;
      }
    }

    // Admin: Created date range filter
    if (filters.createdDateRange && filters.createdDateRange[0] && filters.createdDateRange[1]) {
      const createdAt = trip.createdAt.toDate();
      const startDate = new Date(filters.createdDateRange[0]);
      const endDate = new Date(filters.createdDateRange[1]);

      // Set time to start/end of day for proper comparison
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);

      if (createdAt < startDate || createdAt > endDate) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Sort trips based on sort option
 */
export function sortTrips(trips: Trip[], sortBy?: TripSortOption): Trip[] {
  if (!sortBy) return trips;

  const sorted = [...trips];

  switch (sortBy) {
    case 'price-asc':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return sorted.sort((a, b) => b.price - a.price);
    case 'date-asc':
      return sorted.sort((a, b) => a.createdAt.toMillis() - b.createdAt.toMillis());
    case 'date-desc':
      return sorted.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
    case 'popularity-desc':
      // TODO: Implement when popularity metric is added to Trip type
      // For now, maintain original order
      return sorted;
    default:
      return sorted;
  }
}

/**
 * Compute available filter options from trips data
 */
export function computeTripFilterOptions(trips: Trip[]): FilterOptions {
  const difficulties = new Map<TripDifficulty, number>();
  const durations = new Map<string, number>();
  const locations = new Map<string, number>();
  const statuses = new Map<'active' | 'inactive', number>();
  let minPrice = Infinity;
  let maxPrice = 0;

  trips.forEach((trip) => {
    // Count difficulties
    difficulties.set(trip.difficulty, (difficulties.get(trip.difficulty) || 0) + 1);

    // Count durations
    durations.set(trip.duration, (durations.get(trip.duration) || 0) + 1);

    // Count locations
    locations.set(trip.location, (locations.get(trip.location) || 0) + 1);

    // Count statuses
    const status = trip.isActive ? 'active' : 'inactive';
    statuses.set(status, (statuses.get(status) || 0) + 1);

    // Track price range (convert cents to dollars)
    const price = trip.price / 100;
    minPrice = Math.min(minPrice, price);
    maxPrice = Math.max(maxPrice, price);
  });

  // Round price range to nearest 10
  const roundedMin = Math.floor(minPrice / 10) * 10;
  const roundedMax = Math.ceil(maxPrice / 10) * 10;

  return {
    difficulties: Array.from(difficulties.entries()).map(([value, count]) => ({ value, count })),
    durations: Array.from(durations.entries()).map(([value, count]) => ({ value, count })),
    locations: Array.from(locations.entries()).map(([value, count]) => ({ value, count })),
    priceRange: [roundedMin, roundedMax],
    statuses: Array.from(statuses.entries()).map(([value, count]) => ({ value, count })),
  };
}

/**
 * Count active filters (excluding defaults)
 */
export function countActiveFilters(filters: TripFilters, defaultFilters: TripFilters): number {
  let count = 0;

  if (filters.search) count++;
  if (filters.difficulty.length > 0) count += filters.difficulty.length;
  if (filters.duration.length > 0) count += filters.duration.length;
  if (filters.location.length > 0) count += filters.location.length;
  if (
    filters.priceRange[0] !== defaultFilters.priceRange[0] ||
    filters.priceRange[1] !== defaultFilters.priceRange[1]
  ) {
    count++;
  }
  if (filters.status && filters.status.length > 0) count += filters.status.length;
  if (filters.createdDateRange && (filters.createdDateRange[0] || filters.createdDateRange[1])) {
    count++;
  }

  return count;
}
