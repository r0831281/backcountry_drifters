import { useState, useCallback, useMemo, useEffect } from 'react';
import { PageContainer, PageHeader } from '../components/layout';
import {
  TestimonialsList,
  TestimonialForm,
  TripsList,
  TripForm,
  BookingsList,
  ConfirmDialog,
  Toast,
  type ToastData,
} from '../components/admin';
import {
  type Testimonial,
  type TestimonialFormData,
  type Trip,
  type TripFormData,
  type Booking,
} from '../types';
import { useFilteredBookings } from '../hooks/useFilteredBookings';
import { useFilteredTrips } from '../hooks/useFilteredTrips';
import { useTestimonials } from '../hooks/useTestimonials';
import { useTrips } from '../hooks/useTrips';
import { useBookings } from '../hooks/useBookings';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type AdminTab = 'testimonials' | 'trips' | 'bookings';

interface DeleteTarget {
  type: 'testimonial' | 'trip' | 'booking';
  id: string;
  label: string;
}

// ---------------------------------------------------------------------------
// ID generation utility (adequate for local-only state; Firebase will
// provide its own document IDs when the backend is enabled)
// ---------------------------------------------------------------------------

let _idCounter = 0;
function generateLocalId(prefix: string): string {
  _idCounter += 1;
  return `${prefix}-${Date.now()}-${_idCounter}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AdminDashboard() {
  // -- Tab state ---------------------------------------------------------------
  const [activeTab, setActiveTab] = useState<AdminTab>('testimonials');

  // -- Pagination state --------------------------------------------------------
  const [testimonialsPage, setTestimonialsPage] = useState(1);
  const testimonialsPerPage = 5;

  const [tripsPage, setTripsPage] = useState(1);
  const tripsPerPage = 6;

  const [bookingsPage, setBookingsPage] = useState(1);
  const bookingsPerPage = 5;

  // -- Testimonials state (using Firebase hook) -------------------------------
  const { testimonials: allTestimonials, loading: testimonialsLoading, createTestimonial, updateTestimonial, deleteTestimonial: deleteTestimonialFromDB } = useTestimonials({ includeUnapproved: true, limitCount: 100 });

  // -- Trips state (using filtered hook with admin mode) ---------------------
  const {
    trips: allTrips,
    loading: tripsLoading,
    filters: tripFilters,
    setFilters: setTripFiltersRaw,
    clearFilters: clearTripFiltersRaw,
  } = useFilteredTrips({ activeOnly: false, enableURLState: false });

  // Use the base useTrips hook for CRUD operations
  const { createTrip, updateTrip, deleteTrip: deleteTripFromDB } = useTrips({ activeOnly: false });

  // Wrap filter setters to also reset pagination to page 1
  const setTripFilters = useCallback(
    (...args: Parameters<typeof setTripFiltersRaw>) => {
      setTripsPage(1);
      setTripFiltersRaw(...args);
    },
    [setTripFiltersRaw]
  );

  const clearTripFilters = useCallback(() => {
    setTripsPage(1);
    clearTripFiltersRaw();
  }, [clearTripFiltersRaw]);

  // -- Bookings state (using filtered hook) ----------------------------------
  const allTripsForFilter = useMemo(
    () => allTrips.map((trip) => ({ id: trip.id, title: trip.title })),
    [allTrips]
  );

  // For the trip filter dropdown in bookings, we need ALL trips (not filtered ones)
  const { trips: allTripsUnfiltered } = useTrips({ activeOnly: false });
  const allTripsForBookingFilter = useMemo(
    () => allTripsUnfiltered.map((trip) => ({ id: trip.id, title: trip.title })),
    [allTripsUnfiltered]
  );

  const {
    bookings: allBookings,
    loading: bookingsLoading,
    filters: bookingFilters,
    setFilters: setBookingFiltersRaw,
    clearFilters: clearBookingFiltersRaw,
  } = useFilteredBookings({ enableURLState: false, allTrips: allTripsForBookingFilter });

  // Wrap filter setters to also reset pagination to page 1
  const setBookingFilters = useCallback(
    (...args: Parameters<typeof setBookingFiltersRaw>) => {
      setBookingsPage(1);
      setBookingFiltersRaw(...args);
    },
    [setBookingFiltersRaw]
  );

  const clearBookingFilters = useCallback(() => {
    setBookingsPage(1);
    clearBookingFiltersRaw();
  }, [clearBookingFiltersRaw]);

  // Use the base useBookings hook for CRUD operations
  const { updateBooking, deleteBooking: deleteBookingFromDB } = useBookings();

  // -- Form modal state --------------------------------------------------------
  const [testimonialFormOpen, setTestimonialFormOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);

  const [tripFormOpen, setTripFormOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);

  // -- Delete confirmation state -----------------------------------------------
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [deleting, setDeleting] = useState(false);

  // -- Toast notifications -----------------------------------------------------
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = useCallback((message: string, type: ToastData['type'] = 'success') => {
    const toast: ToastData = { id: generateLocalId('toast'), message, type };
    setToasts((prev) => [...prev, toast]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // -- Paginated data ----------------------------------------------------------
  const testimonialsTotalPages = Math.ceil(allTestimonials.length / testimonialsPerPage);
  const paginatedTestimonials = allTestimonials.slice(
    (testimonialsPage - 1) * testimonialsPerPage,
    testimonialsPage * testimonialsPerPage
  );

  const tripsTotalPages = Math.ceil(allTrips.length / tripsPerPage);
  const paginatedTrips = allTrips.slice(
    (tripsPage - 1) * tripsPerPage,
    tripsPage * tripsPerPage
  );

  const bookingsTotalPages = Math.ceil(allBookings.length / bookingsPerPage);
  const paginatedBookings = allBookings.slice(
    (bookingsPage - 1) * bookingsPerPage,
    bookingsPage * bookingsPerPage
  );

  // Reset trips page when the number of filtered results puts us past the last page
  useEffect(() => {
    if (tripsPage > tripsTotalPages && tripsTotalPages > 0) {
      setTripsPage(tripsTotalPages);
    }
  }, [tripsPage, tripsTotalPages]);

  // Reset bookings page when the number of filtered results puts us past the last page
  useEffect(() => {
    if (bookingsPage > bookingsTotalPages && bookingsTotalPages > 0) {
      setBookingsPage(bookingsTotalPages);
    }
  }, [bookingsPage, bookingsTotalPages]);

  const handleTestimonialsPageChange = useCallback((page: number) => {
    setTestimonialsPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleTripsPageChange = useCallback((page: number) => {
    setTripsPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleBookingsPageChange = useCallback((page: number) => {
    setBookingsPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // ---------------------------------------------------------------------------
  // Testimonial CRUD
  // ---------------------------------------------------------------------------

  const handleAddTestimonial = useCallback(() => {
    setEditingTestimonial(null);
    setTestimonialFormOpen(true);
  }, []);

  const handleEditTestimonial = useCallback((testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setTestimonialFormOpen(true);
  }, []);

  const handleSaveTestimonial = useCallback(async (data: TestimonialFormData) => {
    try {
      if (editingTestimonial) {
        // UPDATE existing
        await updateTestimonial(editingTestimonial.id, data);
        addToast(`Testimonial from "${data.customerName}" updated successfully.`);
      } else {
        // CREATE new (createdAt is added automatically by createDocument)
        await createTestimonial(data);
        addToast(`Testimonial from "${data.customerName}" added successfully.`);
      }
    } catch (error) {
      console.error('Error saving testimonial:', error);
      addToast('Failed to save testimonial', 'error');
    }
  }, [editingTestimonial, createTestimonial, updateTestimonial, addToast]);

  const handleToggleTestimonialApproval = useCallback(async (testimonial: Testimonial) => {
    try {
      await updateTestimonial(testimonial.id, { isApproved: !testimonial.isApproved });
      const newStatus = !testimonial.isApproved ? 'approved' : 'unapproved';
      addToast(`Testimonial from "${testimonial.customerName}" ${newStatus}.`, 'info');
    } catch (error) {
      console.error('Error toggling testimonial approval:', error);
      addToast('Failed to update testimonial approval', 'error');
    }
  }, [updateTestimonial, addToast]);

  const handleRequestDeleteTestimonial = useCallback((testimonial: Testimonial) => {
    setDeleteTarget({
      type: 'testimonial',
      id: testimonial.id,
      label: `testimonial from "${testimonial.customerName}"`,
    });
  }, []);

  // ---------------------------------------------------------------------------
  // Trip CRUD
  // ---------------------------------------------------------------------------

  const handleAddTrip = useCallback(() => {
    setEditingTrip(null);
    setTripFormOpen(true);
  }, []);

  const handleEditTrip = useCallback((trip: Trip) => {
    setEditingTrip(trip);
    setTripFormOpen(true);
  }, []);

  const handleSaveTrip = useCallback(async (data: TripFormData) => {
    try {
      if (editingTrip) {
        // UPDATE existing
        await updateTrip(editingTrip.id, data);
        addToast(`Trip "${data.title}" updated successfully.`);
      } else {
        // CREATE new
        await createTrip(data);
        addToast(`Trip "${data.title}" added successfully.`);
      }
    } catch (error) {
      console.error('Error saving trip:', error);
      addToast('Failed to save trip', 'error');
    }
  }, [editingTrip, createTrip, updateTrip, addToast]);

  const handleToggleTripActive = useCallback(async (trip: Trip) => {
    try {
      await updateTrip(trip.id, { isActive: !trip.isActive });
      const newStatus = !trip.isActive ? 'activated' : 'deactivated';
      addToast(`Trip "${trip.title}" ${newStatus}.`, 'info');
    } catch (error) {
      console.error('Error toggling trip status:', error);
      addToast('Failed to update trip status', 'error');
    }
  }, [updateTrip, addToast]);

  const handleRequestDeleteTrip = useCallback((trip: Trip) => {
    setDeleteTarget({
      type: 'trip',
      id: trip.id,
      label: `trip "${trip.title}"`,
    });
  }, []);

  // ---------------------------------------------------------------------------
  // Booking handlers
  // ---------------------------------------------------------------------------

  const handleUpdateBookingStatus = useCallback(async (booking: Booking, status: 'pending' | 'confirmed' | 'cancelled') => {
    try {
      await updateBooking(booking.id, { status });
      addToast(`Booking status updated to ${status}.`, 'info');
    } catch (error) {
      console.error('Error updating booking status:', error);
      addToast('Failed to update booking status.', 'error');
    }
  }, [updateBooking, addToast]);

  const handleRequestDeleteBooking = useCallback((booking: Booking) => {
    setDeleteTarget({
      type: 'booking',
      id: booking.id,
      label: `booking from "${booking.guestName}"`,
    });
  }, []);

  // ---------------------------------------------------------------------------
  // Shared delete confirmation handler
  // ---------------------------------------------------------------------------

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 300));

    try {
      if (deleteTarget.type === 'testimonial') {
        await deleteTestimonialFromDB(deleteTarget.id);
      } else if (deleteTarget.type === 'trip') {
        await deleteTripFromDB(deleteTarget.id);
      } else if (deleteTarget.type === 'booking') {
        await deleteBookingFromDB(deleteTarget.id);
      }

      addToast(`The ${deleteTarget.label} was deleted.`, 'success');
    } catch (error) {
      console.error('Error deleting:', error);
      addToast(`Failed to delete ${deleteTarget.label}.`, 'error');
    }

    setDeleteTarget(null);
    setDeleting(false);
  }, [deleteTarget, deleteTestimonialFromDB, deleteTripFromDB, deleteBookingFromDB, addToast]);

  // ---------------------------------------------------------------------------
  // Tab definitions
  // ---------------------------------------------------------------------------

  const tabs: { id: AdminTab; label: string; count?: number }[] = [
    { id: 'testimonials', label: 'Testimonials', count: allTestimonials.length },
    { id: 'trips', label: 'Trips', count: allTrips.length },
    { id: 'bookings', label: 'Bookings', count: allBookings.length },
  ];

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <PageContainer>
      <PageHeader
        title="Admin Dashboard"
        subtitle="Manage testimonials, trips, and bookings for Backcountry Drifters Fly Fishing"
      />

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8" role="tablist" aria-label="Admin dashboard sections">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`panel-${tab.id}`}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm transition-colors
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trout-gold focus-visible:ring-offset-2
                ${
                  activeTab === tab.id
                    ? 'border-trout-gold text-trout-gold'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`
                  ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold
                  ${activeTab === tab.id
                    ? 'bg-trout-gold/10 text-trout-gold'
                    : 'bg-gray-100 text-gray-500'
                  }
                `}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Panels */}
      <div id="panel-testimonials" role="tabpanel" hidden={activeTab !== 'testimonials'}>
        {activeTab === 'testimonials' && (
          <TestimonialsList
            testimonials={paginatedTestimonials}
            loading={testimonialsLoading}
            currentPage={testimonialsPage}
            totalPages={testimonialsTotalPages}
            itemsPerPage={testimonialsPerPage}
            totalItems={allTestimonials.length}
            onAdd={handleAddTestimonial}
            onEdit={handleEditTestimonial}
            onDelete={handleRequestDeleteTestimonial}
            onToggleApproval={handleToggleTestimonialApproval}
            onPageChange={handleTestimonialsPageChange}
          />
        )}
      </div>

      <div id="panel-trips" role="tabpanel" hidden={activeTab !== 'trips'}>
        {activeTab === 'trips' && (
          <TripsList
            trips={paginatedTrips}
            loading={tripsLoading}
            currentPage={tripsPage}
            totalPages={tripsTotalPages}
            itemsPerPage={tripsPerPage}
            totalItems={allTrips.length}
            onAdd={handleAddTrip}
            onEdit={handleEditTrip}
            onDelete={handleRequestDeleteTrip}
            onToggleActive={handleToggleTripActive}
            onPageChange={handleTripsPageChange}
            filters={tripFilters}
            onFilterChange={setTripFilters}
            onClearFilters={clearTripFilters}
          />
        )}
      </div>

      <div id="panel-bookings" role="tabpanel" hidden={activeTab !== 'bookings'}>
        {activeTab === 'bookings' && (
          <BookingsList
            bookings={paginatedBookings}
            loading={bookingsLoading}
            currentPage={bookingsPage}
            totalPages={bookingsTotalPages}
            itemsPerPage={bookingsPerPage}
            totalItems={allBookings.length}
            onDelete={handleRequestDeleteBooking}
            onUpdateStatus={handleUpdateBookingStatus}
            onPageChange={handleBookingsPageChange}
            filters={bookingFilters}
            onFilterChange={setBookingFilters}
            onClearFilters={clearBookingFilters}
            allTrips={allTripsForFilter}
          />
        )}
      </div>

      {/* Modals */}
      <TestimonialForm
        isOpen={testimonialFormOpen}
        onClose={() => {
          setTestimonialFormOpen(false);
          setEditingTestimonial(null);
        }}
        onSave={handleSaveTestimonial}
        testimonial={editingTestimonial}
      />

      <TripForm
        isOpen={tripFormOpen}
        onClose={() => {
          setTripFormOpen(false);
          setEditingTrip(null);
        }}
        onSave={handleSaveTrip}
        trip={editingTrip}
      />

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        message={
          deleteTarget
            ? `Are you sure you want to permanently delete this ${deleteTarget.label}? This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        loading={deleting}
        variant="danger"
      />

      {/* Toast Notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </PageContainer>
  );
}
