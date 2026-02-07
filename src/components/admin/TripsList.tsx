import { type Trip, formatPrice, type TripFilters, type TripSortOption } from '../../types';
import { Button, Card } from '../ui';
import { SearchInput } from '../filters';

interface TripsListProps {
  trips: Trip[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  onAdd: () => void;
  onEdit: (trip: Trip) => void;
  onDelete: (trip: Trip) => void;
  onToggleActive: (trip: Trip) => void;
  onPageChange: (page: number) => void;
  filters?: TripFilters;
  onFilterChange?: (filters: TripFilters) => void;
  onClearFilters?: () => void;
}

/** Color classes for difficulty badges. */
const DIFFICULTY_STYLES: Record<string, string> = {
  Beginner: 'bg-green-100 text-green-700',
  Intermediate: 'bg-amber-100 text-amber-700',
  Advanced: 'bg-red-100 text-red-700',
};

/** Placeholder thumbnail when no photo URLs are available. */
function TripThumbnail({ trip }: { trip: Trip }) {
  const photoUrl = trip.photoUrls?.[0];

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={trip.title}
        className="w-full h-40 object-cover rounded-t-xl"
      />
    );
  }

  return (
    <div className="w-full h-40 bg-gradient-to-br from-forest-100 to-forest-200 rounded-t-xl flex items-center justify-center">
      <svg className="w-12 h-12 text-forest-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <polyline strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} points="9 22 9 12 15 12 15 22" />
      </svg>
    </div>
  );
}

export function TripsList({
  trips,
  loading,
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onAdd,
  onEdit,
  onDelete,
  onToggleActive,
  onPageChange,
  filters,
  onFilterChange,
  onClearFilters,
}: TripsListProps) {
  const hasFilters = filters && onFilterChange && onClearFilters;

  // Sort options for admin
  const sortOptions: Array<{ label: string; value: TripSortOption }> = [
    { label: 'Price (Low to High)', value: 'price-asc' },
    { label: 'Price (High to Low)', value: 'price-desc' },
    { label: 'Newest First', value: 'date-desc' },
    { label: 'Oldest First', value: 'date-asc' },
  ];

  const handleSearchChange = (search: string) => {
    if (hasFilters) {
      onFilterChange({ ...filters, search });
    }
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (hasFilters) {
      const sortBy = e.target.value as TripSortOption;
      onFilterChange({ ...filters, sortBy });
    }
  };

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-forest-700">Manage Trips</h2>
          <Button variant="primary" disabled>Add Trip</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-gray-100 rounded-xl h-72" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-semibold text-forest-700">
          Manage Trips
          {totalItems > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({totalItems} total)
            </span>
          )}
        </h2>
        <Button variant="primary" onClick={onAdd} aria-label="Add new trip">
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Trip
          </span>
        </Button>
      </div>

      {/* Search and Sort */}
      {hasFilters && (
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchInput
              value={filters.search}
              onChange={handleSearchChange}
              placeholder="Search trips by title, description, or location..."
            />
          </div>
          <div className="sm:w-56">
            <select
              value={filters.sortBy || ''}
              onChange={handleSortChange}
              className="block w-full rounded-lg border border-gray-200 py-2.5 px-3 text-sm text-gray-900 focus:border-forest-500 focus:ring-2 focus:ring-forest-500/20 focus:outline-none transition-colors"
              aria-label="Sort trips by"
            >
              <option value="">Sort by...</option>
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {trips.length === 0 ? (
        <Card className="text-center py-16">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-forest-50 flex items-center justify-center">
              <svg className="w-8 h-8 text-forest-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="text-gray-600 font-medium">No trips configured yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Add your first trip offering to get started.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={onAdd}>
              Add First Trip
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <div
              key={trip.id}
              className={`
                bg-white rounded-xl shadow-soft overflow-hidden
                transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
                hover:shadow-card-hover hover:-translate-y-0.5
                ${!trip.isActive ? 'opacity-75' : ''}
              `}
            >
              <div className="relative">
                <TripThumbnail trip={trip} />

                {/* Active/Inactive badge overlay */}
                <div className="absolute top-3 left-3">
                  <button
                    onClick={() => onToggleActive(trip)}
                    className={`
                      inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold
                      backdrop-blur-sm transition-all duration-200 cursor-pointer border-0 shadow-sm
                      ${trip.isActive
                        ? 'bg-green-500/90 text-white hover:bg-green-600'
                        : 'bg-gray-500/90 text-white hover:bg-gray-600'
                      }
                    `}
                    aria-label={trip.isActive ? 'Click to deactivate' : 'Click to activate'}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${trip.isActive ? 'bg-green-200' : 'bg-gray-300'}`} />
                    {trip.isActive ? 'Active' : 'Inactive'}
                  </button>
                </div>

                {/* Difficulty badge overlay */}
                <div className="absolute top-3 right-3">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm ${DIFFICULTY_STYLES[trip.difficulty] || 'bg-gray-100 text-gray-700'}`}>
                    {trip.difficulty}
                  </span>
                </div>
              </div>

              <div className="p-5">
                <h3 className="text-lg font-semibold text-forest-700 mb-1 truncate" title={trip.title}>
                  {trip.title}
                </h3>

                <p className="text-sm text-gray-500 mb-3 line-clamp-2" title={trip.description}>
                  {trip.description}
                </p>

                {/* Trip metadata grid */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-trout-gold flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    <span className="font-semibold text-forest-700">{formatPrice(trip.price)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-slate-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{trip.duration}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-slate-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Max {trip.maxGuests} guest{trip.maxGuests !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-slate-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="truncate" title={trip.location}>{trip.location}</span>
                  </div>
                </div>

                {/* Equipment tags */}
                {trip.includedEquipment.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {trip.includedEquipment.slice(0, 3).map((item) => (
                      <span
                        key={item}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-forest-50 text-forest-600"
                      >
                        {item}
                      </span>
                    ))}
                    {trip.includedEquipment.length > 3 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-500">
                        +{trip.includedEquipment.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => onEdit(trip)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
                      text-slate-blue-600 hover:bg-slate-blue-50 transition-colors duration-150"
                    aria-label={`Edit ${trip.title}`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(trip)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
                      text-red-500 hover:bg-red-50 transition-colors duration-150"
                    aria-label={`Delete ${trip.title}`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 mb-4 flex items-center justify-between border-t border-gray-200 pt-6">
          {/* Showing X to Y of Z trips */}
          <p className="text-sm text-gray-600">
            Showing{' '}
            <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>
            {' '}to{' '}
            <span className="font-medium">
              {Math.min(currentPage * itemsPerPage, totalItems)}
            </span>
            {' '}of{' '}
            <span className="font-medium">{totalItems}</span>
            {' '}trips
          </p>

          {/* Pagination controls - Desktop */}
          <div className="hidden sm:flex items-center gap-1">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous page"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === page
                    ? 'bg-trout-gold text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                aria-label={`Go to page ${page}`}
                aria-current={currentPage === page ? 'page' : undefined}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Next page"
            >
              Next
            </button>
          </div>

          {/* Pagination controls - Mobile */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous page"
            >
              Previous
            </button>

            <span className="px-3 py-2 text-sm font-medium text-gray-700">
              {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Next page"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
