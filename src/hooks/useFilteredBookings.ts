import { useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useBookings } from './useBookings';
import { useDebounce } from './useDebounce';
import type { BookingFilters, FilterOptions, ActiveFilter, Booking } from '../types';
import { DEFAULT_BOOKING_FILTERS } from '../types';
import { filterBookings, sortBookings, computeBookingFilterOptions, countActiveBookingFilters } from '../utils/filterBookings';
import { serializeBookingFilters, deserializeBookingFilters } from '../utils/serializeFilters';

interface UseFilteredBookingsOptions {
  enableURLState?: boolean;
  allTrips?: Array<{ id: string; title: string }>;
}

interface UseFilteredBookingsReturn {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
  filters: BookingFilters;
  filterOptions: FilterOptions;
  activeFilterCount: number;
  activeFilters: ActiveFilter[];
  setFilters: (filters: BookingFilters) => void;
  updateFilter: <K extends keyof BookingFilters>(key: K, value: BookingFilters[K]) => void;
  clearFilters: () => void;
}

/**
 * Hook for managing filtered bookings.
 *
 * When `enableURLState` is true (default), filter state is serialized to URL
 * query parameters so that filters persist across navigation.
 *
 * When `enableURLState` is false (admin dashboard), filter state is managed
 * via local React state so updates are reflected immediately without touching
 * the URL.
 */
export function useFilteredBookings(
  options: UseFilteredBookingsOptions = {}
): UseFilteredBookingsReturn {
  const { enableURLState = true, allTrips = [] } = options;

  // Get all bookings from Firestore
  const { bookings: allBookings, loading, error } = useBookings();

  // URL search params for filter state (only used when enableURLState is true)
  const [searchParams, setSearchParams] = useSearchParams();

  // Local state for filter management when URL state is disabled
  const [localFilters, setLocalFilters] = useState<BookingFilters>({
    ...DEFAULT_BOOKING_FILTERS,
  });

  // Compute filter options from all available bookings
  const filterOptions = useMemo(() => {
    return computeBookingFilterOptions(allBookings, allTrips);
  }, [allBookings, allTrips]);

  // Resolve current filters from either URL params or local state
  const filters = useMemo(() => {
    if (enableURLState) {
      return deserializeBookingFilters(searchParams);
    }
    return localFilters;
  }, [enableURLState, searchParams, localFilters]);

  // Debounce search to avoid excessive filtering
  const debouncedSearch = useDebounce(filters.search, 300);
  const debouncedFilters = useMemo(
    () => ({ ...filters, search: debouncedSearch }),
    [filters, debouncedSearch]
  );

  // Apply filters and sorting
  const filteredAndSortedBookings = useMemo(() => {
    const filtered = filterBookings(allBookings, debouncedFilters);
    return sortBookings(filtered, debouncedFilters.sortBy);
  }, [allBookings, debouncedFilters]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    return countActiveBookingFilters(debouncedFilters);
  }, [debouncedFilters]);

  // Generate active filter labels for display
  const activeFilters = useMemo(() => {
    const result: ActiveFilter[] = [];

    if (debouncedFilters.search) {
      result.push({
        id: 'search',
        type: 'search',
        label: `Search: "${debouncedFilters.search}"`,
        value: debouncedFilters.search,
      });
    }

    debouncedFilters.status.forEach((status) => {
      result.push({
        id: `status-${status}`,
        type: 'status',
        label: status.charAt(0).toUpperCase() + status.slice(1),
        value: status,
      });
    });

    debouncedFilters.tripId.forEach((tripId) => {
      const trip = allTrips.find((t) => t.id === tripId);
      result.push({
        id: `trip-${tripId}`,
        type: 'trip',
        label: trip ? trip.title : `Trip ${tripId}`,
        value: tripId,
      });
    });

    if (debouncedFilters.submissionDateRange[0] || debouncedFilters.submissionDateRange[1]) {
      const start = debouncedFilters.submissionDateRange[0]?.toLocaleDateString() || '...';
      const end = debouncedFilters.submissionDateRange[1]?.toLocaleDateString() || '...';
      result.push({
        id: 'submissionDateRange',
        type: 'submissionDateRange',
        label: `Submitted: ${start} - ${end}`,
        value: debouncedFilters.submissionDateRange,
      });
    }

    if (debouncedFilters.preferredDateRange[0] || debouncedFilters.preferredDateRange[1]) {
      const start = debouncedFilters.preferredDateRange[0]?.toLocaleDateString() || '...';
      const end = debouncedFilters.preferredDateRange[1]?.toLocaleDateString() || '...';
      result.push({
        id: 'preferredDateRange',
        type: 'preferredDateRange',
        label: `Preferred: ${start} - ${end}`,
        value: debouncedFilters.preferredDateRange,
      });
    }

    return result;
  }, [debouncedFilters, allTrips]);

  // Persist filters to either URL params or local state
  const persistFilters = useCallback(
    (newFilters: BookingFilters) => {
      if (enableURLState) {
        const serialized = serializeBookingFilters(newFilters);
        const params = new URLSearchParams(serialized);

        // Preserve pagination if it exists
        const currentPage = searchParams.get('page');
        if (currentPage) {
          params.set('page', currentPage);
        }

        setSearchParams(params, { replace: true });
      } else {
        setLocalFilters(newFilters);
      }
    },
    [enableURLState, searchParams, setSearchParams]
  );

  // Set all filters at once
  const setFilters = useCallback(
    (newFilters: BookingFilters) => {
      persistFilters(newFilters);
    },
    [persistFilters]
  );

  // Update a single filter
  const updateFilter = useCallback(
    <K extends keyof BookingFilters>(key: K, value: BookingFilters[K]) => {
      const newFilters = { ...filters, [key]: value };
      persistFilters(newFilters);
    },
    [filters, persistFilters]
  );

  // Clear all filters
  const clearFilters = useCallback(() => {
    persistFilters(DEFAULT_BOOKING_FILTERS);
  }, [persistFilters]);

  return {
    bookings: filteredAndSortedBookings,
    loading,
    error,
    filters,
    filterOptions,
    activeFilterCount,
    activeFilters,
    setFilters,
    updateFilter,
    clearFilters,
  };
}
