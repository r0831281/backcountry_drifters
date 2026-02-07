import { useState } from 'react';
import { type Booking, type BookingFilters, type BookingSortOption } from '../../types';
import { Button, Card } from '../ui';
import { BookingDetailModal } from './BookingDetailModal';
import { SearchInput } from '../filters';

interface BookingsListProps {
  bookings: Booking[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  onDelete: (booking: Booking) => void;
  onUpdateStatus: (booking: Booking, status: 'pending' | 'confirmed' | 'cancelled') => void;
  onPageChange: (page: number) => void;
  filters?: BookingFilters;
  onFilterChange?: (filters: BookingFilters) => void;
  onClearFilters?: () => void;
  allTrips?: Array<{ id: string; title: string }>;
}

/** Color classes for status badges. */
const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-100 text-gray-700',
};

/** Format date for display */
function formatDate(date: Date | { toDate: () => Date } | string): string {
  let dateObj: Date;

  if (typeof date === 'string') {
    dateObj = new Date(date);
  } else if ('toDate' in date) {
    dateObj = date.toDate();
  } else {
    dateObj = date;
  }

  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function BookingsList({
  bookings,
  loading,
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onDelete,
  onUpdateStatus,
  onPageChange,
  filters,
  onFilterChange,
  onClearFilters,
}: BookingsListProps) {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const hasFilters = filters && onFilterChange && onClearFilters;

  // Sort options for admin
  const sortOptions: Array<{ label: string; value: BookingSortOption }> = [
    { label: 'Submission (Newest)', value: 'submission-desc' },
    { label: 'Submission (Oldest)', value: 'submission-asc' },
    { label: 'Preferred Date (Soonest)', value: 'preferred-date-asc' },
    { label: 'Preferred Date (Latest)', value: 'preferred-date-desc' },
    { label: 'Guest Count (Most)', value: 'guest-count-desc' },
    { label: 'Guest Count (Least)', value: 'guest-count-asc' },
  ];

  const handleSearchChange = (search: string) => {
    if (hasFilters) {
      onFilterChange({ ...filters, search });
    }
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (hasFilters) {
      const sortBy = e.target.value as BookingSortOption;
      onFilterChange({ ...filters, sortBy });
    }
  };


  const handleBookingClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
  };

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-forest-700">Booking Requests</h2>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-gray-100 rounded-xl h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-semibold text-forest-700">
          Booking Requests
          {totalItems > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({totalItems} total)
            </span>
          )}
        </h2>
      </div>

      {/* Search and Sort */}
      {hasFilters && (
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchInput
              value={filters.search}
              onChange={handleSearchChange}
              placeholder="Search by guest name or email..."
            />
          </div>
          <div className="sm:w-64">
            <select
              value={filters.sortBy || ''}
              onChange={handleSortChange}
              className="block w-full rounded-lg border border-gray-200 py-2.5 px-3 text-sm text-gray-900 focus:border-forest-500 focus:ring-2 focus:ring-forest-500/20 focus:outline-none transition-colors"
              aria-label="Sort bookings by"
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

      {bookings.length === 0 ? (
        <Card className="text-center py-16">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-forest-50 flex items-center justify-center">
              <svg className="w-8 h-8 text-forest-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-gray-600 font-medium">No booking requests yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Customer booking requests will appear here once they submit through the website.
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              onClick={() => handleBookingClick(booking)}
              className="bg-white rounded-xl shadow-soft overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:shadow-card-hover cursor-pointer"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleBookingClick(booking);
                }
              }}
              aria-label={`View details for ${booking.guestName}'s booking`}
            >
              <div className="p-6">
                {/* Header with status */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-forest-700 mb-1">
                      {booking.tripTitle}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Submitted {formatDate(booking.submittedAt)}
                    </p>
                  </div>

                  {/* Status badge */}
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[booking.status] || 'bg-gray-100 text-gray-700'}`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </div>

                {/* Booking details grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Customer info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4 text-slate-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="font-medium text-gray-700">{booking.guestName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4 text-slate-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <a href={`mailto:${booking.email}`} className="text-trout-gold hover:underline">
                        {booking.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4 text-slate-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <a href={`tel:${booking.phone}`} className="text-trout-gold hover:underline">
                        {booking.phone}
                      </a>
                    </div>
                  </div>

                  {/* Trip details */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4 text-slate-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-gray-600">
                        Preferred Date: <span className="font-medium text-gray-700">{booking.preferredDate}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4 text-slate-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-gray-600">
                        Guests: <span className="font-medium text-gray-700">{booking.guestCount}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Special requests */}
                {booking.specialRequests && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                      Special Requests
                    </p>
                    <p className="text-sm text-gray-700">{booking.specialRequests}</p>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex items-center justify-between gap-3 pt-4 border-t border-gray-100">
                  {/* Status change buttons */}
                  <div className="flex items-center gap-2">
                    {booking.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateStatus(booking, 'confirmed');
                          }}
                          className="text-green-600 hover:bg-green-50 border-green-200"
                        >
                          <span className="flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Confirm
                          </span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateStatus(booking, 'cancelled');
                          }}
                          className="text-gray-600 hover:bg-gray-50"
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                    {booking.status === 'confirmed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateStatus(booking, 'cancelled');
                        }}
                        className="text-gray-600 hover:bg-gray-50"
                      >
                        Cancel Booking
                      </Button>
                    )}
                    {booking.status === 'cancelled' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateStatus(booking, 'pending');
                        }}
                        className="text-amber-600 hover:bg-amber-50 border-amber-200"
                      >
                        Restore to Pending
                      </Button>
                    )}
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(booking);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
                      text-red-500 hover:bg-red-50 transition-colors duration-150"
                    aria-label={`Delete booking from ${booking.guestName}`}
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
          {/* Showing X to Y of Z bookings */}
          <p className="text-sm text-gray-600">
            Showing{' '}
            <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>
            {' '}to{' '}
            <span className="font-medium">
              {Math.min(currentPage * itemsPerPage, totalItems)}
            </span>
            {' '}of{' '}
            <span className="font-medium">{totalItems}</span>
            {' '}bookings
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

      {/* Booking Detail Modal */}
      <BookingDetailModal
        booking={selectedBooking}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onDelete={onDelete}
        onUpdateStatus={onUpdateStatus}
      />
    </div>
  );
}
