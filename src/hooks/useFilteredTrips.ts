import { useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTrips } from './useTrips';
import { useDebounce } from './useDebounce';
import type { TripFilters, FilterOptions, ActiveFilter, Trip } from '../types';
import { DEFAULT_TRIP_FILTERS } from '../types';
import { filterTrips, sortTrips, computeTripFilterOptions, countActiveFilters } from '../utils/filterTrips';
import { serializeTripFilters, deserializeTripFilters } from '../utils/serializeFilters';

interface UseFilteredTripsOptions {
  activeOnly?: boolean;
  enableURLState?: boolean;
}

interface UseFilteredTripsReturn {
  trips: Trip[];
  loading: boolean;
  error: string | null;
  filters: TripFilters;
  filterOptions: FilterOptions;
  activeFilterCount: number;
  activeFilters: ActiveFilter[];
  setFilters: (filters: TripFilters) => void;
  updateFilter: <K extends keyof TripFilters>(key: K, value: TripFilters[K]) => void;
  clearFilters: () => void;
}

/**
 * Hook for managing filtered trips.
 *
 * When `enableURLState` is true (default), filter state is serialized to URL
 * query parameters so that filters persist across navigation.
 *
 * When `enableURLState` is false (admin dashboard), filter state is managed
 * via local React state so updates are reflected immediately without touching
 * the URL.
 */
export function useFilteredTrips(
  options: UseFilteredTripsOptions = {}
): UseFilteredTripsReturn {
  const { activeOnly = true, enableURLState = true } = options;

  // Get all trips from Firestore
  const { trips: allTrips, loading, error } = useTrips({ activeOnly });

  // URL search params for filter state (only used when enableURLState is true)
  const [searchParams, setSearchParams] = useSearchParams();

  // Local state for filter management when URL state is disabled
  const [localFilters, setLocalFilters] = useState<TripFilters>({
    ...DEFAULT_TRIP_FILTERS,
  });

  // Compute filter options from all available trips
  const filterOptions = useMemo(() => {
    return computeTripFilterOptions(allTrips);
  }, [allTrips]);

  // Resolve current filters from either URL params or local state
  const filters = useMemo(() => {
    if (enableURLState) {
      return deserializeTripFilters(searchParams, {
        ...DEFAULT_TRIP_FILTERS,
        priceRange: filterOptions.priceRange,
      });
    }
    // For local state, ensure the price range defaults are sensible once data
    // loads. We keep the user's chosen price range if they have set one;
    // otherwise fall back to the computed range from the data.
    return {
      ...localFilters,
      priceRange:
        localFilters.priceRange[0] === DEFAULT_TRIP_FILTERS.priceRange[0] &&
        localFilters.priceRange[1] === DEFAULT_TRIP_FILTERS.priceRange[1]
          ? filterOptions.priceRange
          : localFilters.priceRange,
    };
  }, [enableURLState, searchParams, localFilters, filterOptions.priceRange]);

  // Debounce search to avoid excessive filtering
  const debouncedSearch = useDebounce(filters.search, 300);
  const debouncedFilters = useMemo(
    () => ({ ...filters, search: debouncedSearch }),
    [filters, debouncedSearch]
  );

  // Apply filters and sorting
  const filteredAndSortedTrips = useMemo(() => {
    const filtered = filterTrips(allTrips, debouncedFilters);
    return sortTrips(filtered, debouncedFilters.sortBy);
  }, [allTrips, debouncedFilters]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    return countActiveFilters(debouncedFilters, {
      ...DEFAULT_TRIP_FILTERS,
      priceRange: filterOptions.priceRange,
    });
  }, [debouncedFilters, filterOptions.priceRange]);

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

    debouncedFilters.difficulty.forEach((difficulty) => {
      result.push({
        id: `difficulty-${difficulty}`,
        type: 'difficulty',
        label: difficulty,
        value: difficulty,
      });
    });

    debouncedFilters.duration.forEach((duration) => {
      result.push({
        id: `duration-${duration}`,
        type: 'duration',
        label: duration,
        value: duration,
      });
    });

    debouncedFilters.location.forEach((location) => {
      result.push({
        id: `location-${location}`,
        type: 'location',
        label: location,
        value: location,
      });
    });

    if (
      debouncedFilters.priceRange[0] !== filterOptions.priceRange[0] ||
      debouncedFilters.priceRange[1] !== filterOptions.priceRange[1]
    ) {
      result.push({
        id: 'priceRange',
        type: 'priceRange',
        label: `Price: $${debouncedFilters.priceRange[0]}-$${debouncedFilters.priceRange[1]}`,
        value: debouncedFilters.priceRange,
      });
    }

    if (debouncedFilters.status) {
      debouncedFilters.status.forEach((status) => {
        result.push({
          id: `status-${status}`,
          type: 'status',
          label: status === 'active' ? 'Active' : 'Inactive',
          value: status,
        });
      });
    }

    if (debouncedFilters.createdDateRange && (debouncedFilters.createdDateRange[0] || debouncedFilters.createdDateRange[1])) {
      const start = debouncedFilters.createdDateRange[0]?.toLocaleDateString() || '...';
      const end = debouncedFilters.createdDateRange[1]?.toLocaleDateString() || '...';
      result.push({
        id: 'createdDateRange',
        type: 'createdDateRange',
        label: `Created: ${start} - ${end}`,
        value: debouncedFilters.createdDateRange,
      });
    }

    return result;
  }, [debouncedFilters, filterOptions.priceRange]);

  // Persist filters to either URL params or local state
  const persistFilters = useCallback(
    (newFilters: TripFilters) => {
      if (enableURLState) {
        const serialized = serializeTripFilters(newFilters);
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
    (newFilters: TripFilters) => {
      persistFilters(newFilters);
    },
    [persistFilters]
  );

  // Update a single filter
  const updateFilter = useCallback(
    <K extends keyof TripFilters>(key: K, value: TripFilters[K]) => {
      const newFilters = { ...filters, [key]: value };
      persistFilters(newFilters);
    },
    [filters, persistFilters]
  );

  // Clear all filters
  const clearFilters = useCallback(() => {
    const defaultFilters = {
      ...DEFAULT_TRIP_FILTERS,
      priceRange: filterOptions.priceRange,
    };
    persistFilters(defaultFilters);
  }, [filterOptions.priceRange, persistFilters]);

  return {
    trips: filteredAndSortedTrips,
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
