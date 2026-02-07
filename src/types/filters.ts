// Filter types and interfaces

import type { TripDifficulty, BookingStatus } from './index';

export type FilterMode = 'customer' | 'admin';

// Trip Filters
export interface TripFilters {
  search: string;
  difficulty: TripDifficulty[];
  priceRange: [number, number];
  duration: string[]; // e.g., "4 Hours", "8 Hours", "2 Days"
  location: string[];
  // Admin-specific
  status?: ('active' | 'inactive')[];
  createdDateRange?: [Date | null, Date | null];
  sortBy?: TripSortOption;
}

export type TripSortOption =
  | 'price-asc'
  | 'price-desc'
  | 'date-asc'
  | 'date-desc'
  | 'popularity-desc';

// Booking Filters
export interface BookingFilters {
  search: string; // Guest name or email
  status: BookingStatus[];
  tripId: string[];
  submissionDateRange: [Date | null, Date | null];
  preferredDateRange: [Date | null, Date | null];
  sortBy?: BookingSortOption;
}

export type BookingSortOption =
  | 'submission-asc'
  | 'submission-desc'
  | 'preferred-date-asc'
  | 'preferred-date-desc'
  | 'guest-count-asc'
  | 'guest-count-desc';

// Filter Options (dynamically computed)
export interface FilterOptions {
  difficulties: Array<{ value: TripDifficulty; count: number }>;
  durations: Array<{ value: string; count: number }>;
  locations: Array<{ value: string; count: number }>;
  priceRange: [number, number];
  statuses?: Array<{ value: 'active' | 'inactive'; count: number }>;
  trips?: Array<{ id: string; title: string; count: number }>; // For booking filters
}

// Active Filter Display
export interface ActiveFilter {
  id: string;
  type: string;
  label: string;
  value: unknown;
}

// Default filters
export const DEFAULT_TRIP_FILTERS: TripFilters = {
  search: '',
  difficulty: [],
  priceRange: [0, 1000],
  duration: [],
  location: [],
  status: [],
  createdDateRange: [null, null],
  sortBy: undefined,
};

export const DEFAULT_BOOKING_FILTERS: BookingFilters = {
  search: '',
  status: [],
  tripId: [],
  submissionDateRange: [null, null],
  preferredDateRange: [null, null],
  sortBy: undefined,
};
