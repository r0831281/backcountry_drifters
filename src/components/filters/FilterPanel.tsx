import { useState } from 'react';
import type { TripFilters, FilterOptions, FilterMode } from '../../types';
import { SearchInput } from './SearchInput';
import { CheckboxFilter } from './CheckboxFilter';
import { PriceRangeSlider } from './PriceRangeSlider';
import { DateRangeFilter } from './DateRangeFilter';

interface FilterPanelProps {
  mode: FilterMode;
  filters: TripFilters;
  availableOptions: FilterOptions;
  onFilterChange: (filters: TripFilters) => void;
  onClearFilters: () => void;
}

interface CollapsibleSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function CollapsibleSection({ title, defaultOpen = true, children }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 text-left hover:bg-gray-50/50 transition-colors rounded-lg px-2"
        aria-expanded={isOpen}
      >
        <h3 className="text-sm font-semibold text-forest-700 uppercase tracking-wider">{title}</h3>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && <div className="pb-4 px-2">{children}</div>}
    </div>
  );
}

export function FilterPanel({
  mode,
  filters,
  availableOptions,
  onFilterChange,
  onClearFilters,
}: FilterPanelProps) {
  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'search') return value !== '';
    if (Array.isArray(value)) return value.length > 0;
    if (key === 'priceRange') {
      return value[0] !== availableOptions.priceRange[0] || value[1] !== availableOptions.priceRange[1];
    }
    if (key === 'createdDateRange') return value && (value[0] || value[1]);
    return false;
  }).length;

  const handleSearchChange = (search: string) => {
    onFilterChange({ ...filters, search });
  };

  const handleDifficultyToggle = (difficulty: string, checked: boolean) => {
    // "All levels" clears the difficulty filter entirely
    if (difficulty === 'All levels') {
      onFilterChange({ ...filters, difficulty: [] });
      return;
    }

    const newDifficulties = checked
      ? [...filters.difficulty, difficulty as TripFilters['difficulty'][number]]
      : filters.difficulty.filter((d) => d !== difficulty);
    onFilterChange({ ...filters, difficulty: newDifficulties });
  };

  const handleDurationToggle = (duration: string, checked: boolean) => {
    const newDurations = checked
      ? [...filters.duration, duration]
      : filters.duration.filter((d) => d !== duration);
    onFilterChange({ ...filters, duration: newDurations });
  };

  const handleLocationToggle = (location: string, checked: boolean) => {
    const newLocations = checked
      ? [...filters.location, location]
      : filters.location.filter((l) => l !== location);
    onFilterChange({ ...filters, location: newLocations });
  };

  const handlePriceRangeChange = (priceRange: [number, number]) => {
    onFilterChange({ ...filters, priceRange });
  };

  const handleStatusToggle = (status: 'active' | 'inactive', checked: boolean) => {
    const currentStatuses = filters.status || [];
    const newStatuses = checked
      ? [...currentStatuses, status]
      : currentStatuses.filter((s) => s !== status);
    onFilterChange({ ...filters, status: newStatuses });
  };

  const handleCreatedDateRangeChange = (start: Date | null, end: Date | null) => {
    onFilterChange({ ...filters, createdDateRange: [start, end] });
  };

  return (
    <div
      className="bg-white rounded-xl shadow-soft overflow-hidden"
      role="region"
      aria-label="Filter options"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-forest-700">Filters</h2>
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold bg-trout-gold text-white">
              {activeFilterCount}
            </span>
          )}
        </div>
        <button
          onClick={onClearFilters}
          className="text-sm font-medium text-trout-gold hover:text-trout-gold/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={activeFilterCount === 0}
          aria-label="Clear all filters"
        >
          Clear
        </button>
      </div>

      {/* Filter sections */}
      <div className="p-6 space-y-2">
        {/* Search */}
        <div className="mb-6">
          <SearchInput
            value={filters.search}
            onChange={handleSearchChange}
            placeholder="Search trips..."
          />
        </div>

        {/* Difficulty */}
        {availableOptions.difficulties.length > 0 && (
          <CollapsibleSection title="Difficulty">
            <div className="space-y-1">
              {/* "All levels" option -- selected when no specific difficulties are active */}
              <CheckboxFilter
                key="all-levels"
                label="All levels"
                checked={filters.difficulty.length === 0}
                onChange={() => handleDifficultyToggle('All levels', true)}
                id="checkbox-all-levels"
              />
              {/* Filter out "All levels" from the loop to avoid duplicates */}
              {availableOptions.difficulties
                .filter((option) => option.value.toLowerCase() !== 'all levels')
                .map((option) => (
                  <CheckboxFilter
                    key={option.value}
                    label={option.value}
                    count={option.count}
                    checked={filters.difficulty.includes(option.value)}
                    onChange={(checked) => handleDifficultyToggle(option.value, checked)}
                  />
                ))}
            </div>
          </CollapsibleSection>
        )}

        {/* Price Range */}
        {availableOptions.priceRange[0] !== availableOptions.priceRange[1] && (
          <CollapsibleSection title="Price Range">
            <PriceRangeSlider
              min={availableOptions.priceRange[0]}
              max={availableOptions.priceRange[1]}
              value={filters.priceRange}
              onChange={handlePriceRangeChange}
            />
          </CollapsibleSection>
        )}

        {/* Duration */}
        {availableOptions.durations.length > 0 && (
          <CollapsibleSection title="Duration">
            <div className="space-y-1">
              {availableOptions.durations.map((option) => (
                <CheckboxFilter
                  key={option.value}
                  label={option.value}
                  count={option.count}
                  checked={filters.duration.includes(option.value)}
                  onChange={(checked) => handleDurationToggle(option.value, checked)}
                />
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* Location */}
        {availableOptions.locations.length > 0 && (
          <CollapsibleSection title="Location">
            <div className="space-y-1">
              {availableOptions.locations.map((option) => (
                <CheckboxFilter
                  key={option.value}
                  label={option.value}
                  count={option.count}
                  checked={filters.location.includes(option.value)}
                  onChange={(checked) => handleLocationToggle(option.value, checked)}
                />
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* Admin-specific: Status */}
        {mode === 'admin' && availableOptions.statuses && availableOptions.statuses.length > 0 && (
          <CollapsibleSection title="Status">
            <div className="space-y-1">
              {availableOptions.statuses.map((option) => (
                <CheckboxFilter
                  key={option.value}
                  label={option.value === 'active' ? 'Active' : 'Inactive'}
                  count={option.count}
                  checked={filters.status?.includes(option.value) || false}
                  onChange={(checked) => handleStatusToggle(option.value, checked)}
                />
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* Admin-specific: Created Date Range */}
        {mode === 'admin' && (
          <CollapsibleSection title="Created Date" defaultOpen={false}>
            <DateRangeFilter
              startDate={filters.createdDateRange?.[0] || null}
              endDate={filters.createdDateRange?.[1] || null}
              onChange={handleCreatedDateRangeChange}
              label="Filter by creation date"
            />
          </CollapsibleSection>
        )}
      </div>
    </div>
  );
}
