/* eslint-disable react-hooks/refs */
import { useState } from 'react';
import { PageContainer, PageHeader } from '../components/layout';
import { Card, CardContent, CardFooter, CardTitle, SkeletonCard, Button } from '../components/ui';
import { BookingModal, TripDetailModal } from '../components/bookings';
import { useStaggerReveal } from '../hooks';
import { useFilteredTrips } from '../hooks/useFilteredTrips';
import { FilterPanel, ActiveFiltersDisplay, FilterButton, FilterDrawer } from '../components/filters';
import { formatPrice, type Trip } from '../types';

export function Bookings() {
  const {
    trips,
    loading,
    error,
    filters,
    filterOptions,
    activeFilterCount,
    activeFilters,
    setFilters,
    clearFilters,
  } = useFilteredTrips({ activeOnly: true, enableURLState: true });

  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [selectedTripForDetail, setSelectedTripForDetail] = useState<Trip | null>(null);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const cardsReveal = useStaggerReveal<HTMLDivElement>();

  const handleRemoveFilter = (filterId: string) => {
    const [type, value] = filterId.split('-');

    if (type === 'search') {
      setFilters({ ...filters, search: '' });
    } else if (type === 'difficulty') {
      setFilters({
        ...filters,
        difficulty: filters.difficulty.filter((d) => d !== value),
      });
    } else if (type === 'duration') {
      setFilters({
        ...filters,
        duration: filters.duration.filter((d) => d !== value),
      });
    } else if (type === 'location') {
      setFilters({
        ...filters,
        location: filters.location.filter((l) => l !== value),
      });
    } else if (type === 'priceRange') {
      setFilters({
        ...filters,
        priceRange: filterOptions.priceRange,
      });
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Book a Trip"
        subtitle="Choose from our selection of guided fly fishing adventures"
      />

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-5 py-4 rounded-xl mb-8 animate-error-shake" role="alert">
          <p className="font-medium">Something went wrong</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Main content with sidebar filters */}
      <div className="flex gap-8">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden lg:block w-80 flex-shrink-0">
          <div className="sticky top-24">
            <FilterPanel
              mode="customer"
              filters={filters}
              availableOptions={filterOptions}
              onFilterChange={setFilters}
              onClearFilters={clearFilters}
            />
          </div>
        </aside>

        {/* Main content area */}
        <div className="flex-1 min-w-0">
          {/* Mobile filter button */}
          <div className="lg:hidden mb-6 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              <span className="font-medium text-gray-900">{trips.length}</span>{' '}
              {trips.length === 1 ? 'trip' : 'trips'} found
            </p>
            <FilterButton
              activeCount={activeFilterCount}
              onClick={() => setFilterDrawerOpen(true)}
            />
          </div>

          {/* Active filters display */}
          {activeFilterCount > 0 && (
            <ActiveFiltersDisplay
              filters={activeFilters}
              onRemoveFilter={handleRemoveFilter}
              onClearAll={clearFilters}
            />
          )}

          {/* Results count (desktop) */}
          <div className="hidden lg:block mb-6">
            <p className="text-sm text-gray-600">
              <span className="font-medium text-gray-900">{trips.length}</span>{' '}
              {trips.length === 1 ? 'trip' : 'trips'} found
            </p>
          </div>

          {/* Loading state with skeleton cards */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 pb-16">
              {Array.from({ length: 6 }).map((_, index) => (
                <SkeletonCard key={index} />
              ))}
            </div>
              ) : trips.length === 0 ? (
            /* Empty state */
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-forest-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <svg className="w-8 h-8 text-forest-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p className="text-gray-600 text-lg mb-2 font-medium">
                {activeFilterCount > 0
                  ? 'No trips match your filters'
                  : 'No trips are currently available'}
              </p>
              <p className="text-gray-400 max-w-md mx-auto mb-4">
                {activeFilterCount > 0
                  ? 'Try adjusting your filter criteria to see more results.'
                  : 'Please check back soon or contact us directly for availability.'}
              </p>
              {activeFilterCount > 0 && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            /* Trip cards grid */
            <div
              ref={cardsReveal.observe}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 pb-16"
            >
          {trips.map((trip, index) => (
            <Card
              key={trip.id}
              hover
              onClick={() => setSelectedTripForDetail(trip)}
              className={`
                flex flex-col overflow-hidden
                scroll-reveal
                ${cardsReveal.isVisible ? 'is-visible' : ''}
              `}
            >
              <div style={cardsReveal.getStaggerStyle(index, 100)}>
                {/* Trip image */}
                {trip.photoUrls && trip.photoUrls.length > 0 ? (
                  <div className="-mt-6 -mx-6 mb-5 overflow-hidden">
                    <img
                      src={trip.photoUrls[0]}
                      alt={trip.title}
                      className="w-full h-48 object-cover transition-transform duration-500 hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="-mt-6 -mx-6 mb-5 h-48 bg-gradient-to-br from-forest-100 to-forest-200 flex items-center justify-center">
                    <svg className="w-12 h-12 text-forest-300" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                )}

                {/* Difficulty badge */}
                <div className="mb-3">
                  <span className={`
                    inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
                    ${trip.difficulty === 'Beginner'
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : trip.difficulty === 'Intermediate'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }
                  `}>
                    {trip.difficulty}
                  </span>
                </div>

                <CardTitle>{trip.title}</CardTitle>

                <CardContent className="flex-1">
                  <p className="text-gray-500 mb-4 line-clamp-3 leading-relaxed">
                    {trip.description}
                  </p>

                  {/* Trip details */}
                  <div className="space-y-2.5 text-sm">
                    <div className="flex items-center text-gray-600">
                      <svg className="w-4 h-4 mr-2.5 text-forest-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {trip.duration}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <svg className="w-4 h-4 mr-2.5 text-forest-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Up to {trip.maxGuests} guests
                    </div>
                  </div>
                </CardContent>

                <CardFooter>
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <span className="text-2xl font-bold text-forest-800">
                        {formatPrice(trip.price)}
                      </span>
                      <span className="text-sm text-gray-400 ml-1">/person</span>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTrip(trip);
                      }}
                    >
                      Book Now
                    </Button>
                  </div>
                </CardFooter>
              </div>
            </Card>
          ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      <FilterDrawer isOpen={filterDrawerOpen} onClose={() => setFilterDrawerOpen(false)}>
        <FilterPanel
          mode="customer"
          filters={filters}
          availableOptions={filterOptions}
          onFilterChange={setFilters}
          onClearFilters={clearFilters}
        />
      </FilterDrawer>

      {/* Trip Detail Modal */}
      {selectedTripForDetail && (
        <TripDetailModal
          trip={selectedTripForDetail}
          isOpen={!!selectedTripForDetail}
          onClose={() => setSelectedTripForDetail(null)}
          onBookNow={() => {
            setSelectedTrip(selectedTripForDetail);
            setSelectedTripForDetail(null);
          }}
        />
      )}

      {/* Booking Modal */}
      {selectedTrip && (
        <BookingModal
          trip={selectedTrip}
          isOpen={!!selectedTrip}
          onClose={() => setSelectedTrip(null)}
        />
      )}
    </PageContainer>
  );
}
