import type { ActiveFilter } from '../../types';

interface ActiveFiltersDisplayProps {
  filters: ActiveFilter[];
  onRemoveFilter: (filterId: string) => void;
  onClearAll: () => void;
}

export function ActiveFiltersDisplay({
  filters,
  onRemoveFilter,
  onClearAll,
}: ActiveFiltersDisplayProps) {
  if (filters.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6 p-4 bg-forest-50 rounded-lg">
      <span className="text-sm font-medium text-forest-700">Applied Filters:</span>

      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onRemoveFilter(filter.id)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-white text-forest-700 border border-forest-200 hover:bg-forest-100 transition-colors group"
          aria-label={`Remove ${filter.label} filter`}
        >
          <span>{filter.label}</span>
          <svg
            className="w-4 h-4 text-forest-500 group-hover:text-forest-700 transition-colors"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      ))}

      <button
        onClick={onClearAll}
        className="text-sm font-medium text-trout-gold hover:text-trout-gold/80 hover:underline transition-colors ml-2"
        aria-label="Clear all filters"
      >
        Clear All
      </button>
    </div>
  );
}
