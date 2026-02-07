import { type Booking } from '../../types';
import { Button, Modal, ModalFooter } from '../ui';

interface BookingDetailModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (booking: Booking) => void;
  onUpdateStatus: (booking: Booking, status: 'pending' | 'confirmed' | 'cancelled') => void;
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
    month: 'long',
    day: 'numeric',
  });
}

/** Format date and time for display */
function formatDateTime(date: Date | { toDate: () => Date } | string): string {
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
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function BookingDetailModal({
  booking,
  isOpen,
  onClose,
  onDelete,
  onUpdateStatus,
}: BookingDetailModalProps) {
  if (!booking) return null;

  const handleDelete = () => {
    onDelete(booking);
    onClose();
  };

  const handleStatusUpdate = (status: 'pending' | 'confirmed' | 'cancelled') => {
    onUpdateStatus(booking, status);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="xl">
      {/* Header with Trip Title and Status */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex-1">
          <h2 className="text-2xl font-semibold text-forest-700 mb-2">
            {booking.tripTitle}
          </h2>
          <p className="text-sm text-gray-500">
            Submitted on {formatDateTime(booking.submittedAt)}
          </p>
        </div>
        <span
          className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${
            STATUS_STYLES[booking.status] || 'bg-gray-100 text-gray-700'
          }`}
        >
          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
        </span>
      </div>

      {/* Main Content Grid */}
      <div className="space-y-6">
        {/* Customer Information */}
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
          <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-4">
            Customer Information
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-blue-100 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-slate-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">{booking.guestName}</p>
                <p className="text-xs text-gray-500">Guest Name</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-blue-100 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-slate-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <a
                  href={`mailto:${booking.email}`}
                  className="text-sm font-medium text-trout-gold hover:underline"
                >
                  {booking.email}
                </a>
                <p className="text-xs text-gray-500">Email Address</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-blue-100 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-slate-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </div>
              <div>
                <a
                  href={`tel:${booking.phone}`}
                  className="text-sm font-medium text-trout-gold hover:underline"
                >
                  {booking.phone}
                </a>
                <p className="text-xs text-gray-500">Phone Number</p>
              </div>
            </div>
          </div>
        </div>

        {/* Trip Details */}
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
          <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-4">
            Trip Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-forest-100 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-forest-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  {formatDate(booking.preferredDate)}
                </p>
                <p className="text-xs text-gray-500">Preferred Date</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-forest-100 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-forest-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  {booking.guestCount} {booking.guestCount === 1 ? 'Guest' : 'Guests'}
                </p>
                <p className="text-xs text-gray-500">Party Size</p>
              </div>
            </div>
          </div>
        </div>

        {/* Special Requests */}
        {booking.specialRequests && (
          <div className="bg-amber-50 rounded-xl p-5 border border-amber-100">
            <h3 className="text-xs font-semibold text-amber-800 uppercase tracking-wider mb-3">
              Special Requests
            </h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {booking.specialRequests}
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons Footer */}
      <ModalFooter className="!flex-col sm:!flex-row sm:!justify-between !gap-3">
        {/* Status-change actions -- grouped on the left */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {booking.status === 'pending' && (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleStatusUpdate('confirmed')}
                className="w-full sm:w-auto sm:min-w-[160px]"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Confirm Booking
                </span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusUpdate('cancelled')}
                className="w-full sm:w-auto sm:min-w-[160px] text-gray-600 !border-gray-300 hover:bg-gray-50 hover:!border-gray-400"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="w-4 h-4"
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
                  Cancel Booking
                </span>
              </Button>
            </>
          )}
          {booking.status === 'confirmed' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStatusUpdate('cancelled')}
              className="w-full sm:w-auto sm:min-w-[160px] text-gray-600 !border-gray-300 hover:bg-gray-50 hover:!border-gray-400"
            >
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="w-4 h-4"
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
                Cancel Booking
              </span>
            </Button>
          )}
          {booking.status === 'cancelled' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStatusUpdate('pending')}
              className="w-full sm:w-auto sm:min-w-[160px] text-amber-600 !border-amber-300 hover:bg-amber-50 hover:!border-amber-400"
            >
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Restore to Pending
              </span>
            </Button>
          )}
        </div>

        {/* Destructive action -- pushed to the right on desktop, full-width on mobile */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleDelete}
          className="w-full sm:w-auto sm:min-w-[160px] text-red-600 !border-red-300 hover:bg-red-50 hover:!border-red-400"
        >
          <span className="flex items-center justify-center gap-2">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Delete Booking
          </span>
        </Button>
      </ModalFooter>
    </Modal>
  );
}
