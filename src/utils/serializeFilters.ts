// URL query parameter serialization utilities

import type { TripFilters, BookingFilters } from '../types';

/**
 * Serialize trip filters to URL query parameters
 */
export function serializeTripFilters(filters: TripFilters): Record<string, string> {
  const params: Record<string, string> = {};

  if (filters.search) {
    params.search = filters.search;
  }

  if (filters.difficulty.length > 0) {
    params.difficulty = filters.difficulty.join('|');
  }

  if (filters.priceRange && (filters.priceRange[0] > 0 || filters.priceRange[1] < 10000)) {
    params.price = `${filters.priceRange[0]}-${filters.priceRange[1]}`;
  }

  if (filters.duration.length > 0) {
    params.duration = filters.duration.join('|');
  }

  if (filters.location.length > 0) {
    params.location = filters.location.join('|');
  }

  if (filters.status && filters.status.length > 0) {
    params.status = filters.status.join('|');
  }

  if (filters.createdDateRange && filters.createdDateRange[0] && filters.createdDateRange[1]) {
    const startDate = filters.createdDateRange[0].toISOString().split('T')[0];
    const endDate = filters.createdDateRange[1].toISOString().split('T')[0];
    params.created = `${startDate},${endDate}`;
  }

  if (filters.sortBy) {
    params.sort = filters.sortBy;
  }

  return params;
}

/**
 * Deserialize trip filters from URL query parameters
 */
export function deserializeTripFilters(
  params: URLSearchParams,
  defaultFilters: TripFilters
): TripFilters {
  const search = params.get('search') || '';
  const difficulty = params.get('difficulty')?.split('|').filter(Boolean) || [];
  const duration = params.get('duration')?.split('|').filter(Boolean) || [];
  const location = params.get('location')?.split('|').filter(Boolean) || [];
  const status = params.get('status')?.split('|').filter(Boolean) || [];
  const sortBy = params.get('sort') || undefined;

  // Parse price range
  let priceRange = defaultFilters.priceRange;
  const priceParam = params.get('price');
  if (priceParam) {
    const [min, max] = priceParam.split('-').map(Number);
    if (!isNaN(min) && !isNaN(max)) {
      priceRange = [min, max];
    }
  }

  // Parse created date range
  let createdDateRange: [Date | null, Date | null] = [null, null];
  const createdParam = params.get('created');
  if (createdParam) {
    const [start, end] = createdParam.split(',');
    if (start && end) {
      createdDateRange = [new Date(start), new Date(end)];
    }
  }

  return {
    search,
    difficulty: difficulty as TripFilters['difficulty'],
    priceRange,
    duration,
    location,
    status: status as TripFilters['status'],
    createdDateRange,
    sortBy: sortBy as TripFilters['sortBy'],
  };
}

/**
 * Serialize booking filters to URL query parameters
 */
export function serializeBookingFilters(filters: BookingFilters): Record<string, string> {
  const params: Record<string, string> = {};

  if (filters.search) {
    params.search = filters.search;
  }

  if (filters.status.length > 0) {
    params.status = filters.status.join('|');
  }

  if (filters.tripId.length > 0) {
    params.trip = filters.tripId.join('|');
  }

  if (filters.submissionDateRange[0] && filters.submissionDateRange[1]) {
    const startDate = filters.submissionDateRange[0].toISOString().split('T')[0];
    const endDate = filters.submissionDateRange[1].toISOString().split('T')[0];
    params.submitted = `${startDate},${endDate}`;
  }

  if (filters.preferredDateRange[0] && filters.preferredDateRange[1]) {
    const startDate = filters.preferredDateRange[0].toISOString().split('T')[0];
    const endDate = filters.preferredDateRange[1].toISOString().split('T')[0];
    params.preferred = `${startDate},${endDate}`;
  }

  if (filters.sortBy) {
    params.sort = filters.sortBy;
  }

  return params;
}

/**
 * Deserialize booking filters from URL query parameters
 */
export function deserializeBookingFilters(
  params: URLSearchParams
): BookingFilters {
  const search = params.get('search') || '';
  const status = params.get('status')?.split('|').filter(Boolean) || [];
  const tripId = params.get('trip')?.split('|').filter(Boolean) || [];
  const sortBy = params.get('sort') || undefined;

  // Parse submission date range
  let submissionDateRange: [Date | null, Date | null] = [null, null];
  const submittedParam = params.get('submitted');
  if (submittedParam) {
    const [start, end] = submittedParam.split(',');
    if (start && end) {
      submissionDateRange = [new Date(start), new Date(end)];
    }
  }

  // Parse preferred date range
  let preferredDateRange: [Date | null, Date | null] = [null, null];
  const preferredParam = params.get('preferred');
  if (preferredParam) {
    const [start, end] = preferredParam.split(',');
    if (start && end) {
      preferredDateRange = [new Date(start), new Date(end)];
    }
  }

  return {
    search,
    status: status as BookingFilters['status'],
    tripId,
    submissionDateRange,
    preferredDateRange,
    sortBy: sortBy as BookingFilters['sortBy'],
  };
}
