import { useEffect, useRef, useState } from 'react';
import { Modal, Button, Input, Textarea } from '../ui';
import { type Trip, formatPrice, type BookingTrackingData } from '../../types';
import { useBookings } from '../../hooks/useBookings';
import {
  collectTrackingData,
  trackBookingModalViewed,
  trackBookingFormStarted,
  trackBookingValidationFailed,
  trackBookingSubmissionAttempt,
  trackBookingSubmissionSuccess,
  trackBookingSubmissionError,
} from '../../lib/analytics';
import {
  validateBookingForm,
  type BookingValidationErrors,
} from '../../lib/validation';
import {
  sanitizeText,
  sanitizeEmail,
  sanitizePhone,
  warnIfSuspicious,
} from '../../lib/sanitization';

interface BookingModalProps {
  trip: Trip;
  isOpen: boolean;
  onClose: () => void;
}

export function BookingModal({ trip, isOpen, onClose }: BookingModalProps) {
  const { createBooking } = useBookings();
  const [formData, setFormData] = useState({
    guestName: '',
    email: '',
    phone: '',
    preferredDate: '',
    guestCount: 1,
    specialRequests: '',
  });
  const [errors, setErrors] = useState<BookingValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [hasTrackedFormStart, setHasTrackedFormStart] = useState(false);
  const modalOpenTimeRef = useRef<number | null>(null);
  const formStartTimeRef = useRef<number | null>(null);

  const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

  useEffect(() => {
    if (isOpen) {
      modalOpenTimeRef.current = now();
      formStartTimeRef.current = null;
      setHasTrackedFormStart(false);
      trackBookingModalViewed({
        tripId: trip.id,
        tripTitle: trip.title,
        source: 'booking_modal',
      });
    } else {
      modalOpenTimeRef.current = null;
      formStartTimeRef.current = null;
      setHasTrackedFormStart(false);
    }
  }, [isOpen, trip.id, trip.title]);

  const markFormStarted = () => {
    if (hasTrackedFormStart) return;
    const interactionTime = now();
    const timeToFirstInputMs = modalOpenTimeRef.current
      ? Math.round(interactionTime - modalOpenTimeRef.current)
      : undefined;
    formStartTimeRef.current = interactionTime;
    setHasTrackedFormStart(true);
    trackBookingFormStarted({
      tripId: trip.id,
      tripTitle: trip.title,
      source: 'booking_modal',
      timeToFirstInputMs,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSubmitStatus('idle');

    // --- Validation ---
    const validationErrors = validateBookingForm({
      ...formData,
      maxGuests: trip.maxGuests,
    });

    const invalidFields = Object.keys(validationErrors);

    if (invalidFields.length > 0) {
      trackBookingValidationFailed({
        tripId: trip.id,
        tripTitle: trip.title,
        source: 'booking_modal',
        fields: invalidFields,
      });
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    const formDurationMs = (() => {
      const start = formStartTimeRef.current ?? modalOpenTimeRef.current;
      return start ? Math.round(now() - start) : undefined;
    })();

    trackBookingSubmissionAttempt({
      tripId: trip.id,
      tripTitle: trip.title,
      source: 'booking_modal',
      guestCount: formData.guestCount,
      preferredDate: formData.preferredDate || undefined,
      formDurationMs,
    });

    // --- Sanitization ---
    const sanitizedData = {
      guestName: sanitizeText(formData.guestName),
      email: sanitizeEmail(formData.email),
      phone: sanitizePhone(formData.phone),
      preferredDate: sanitizeText(formData.preferredDate),
      guestCount: formData.guestCount,
      specialRequests: sanitizeText(formData.specialRequests),
    };

    // Log a warning for any suspicious input patterns (defense-in-depth)
    warnIfSuspicious('guestName', formData.guestName);
    warnIfSuspicious('email', formData.email);
    warnIfSuspicious('specialRequests', formData.specialRequests);

    const submissionStart = now();

    try {
      // Collect tracking data (fingerprint, IP, location, etc.)
      // This is optional - booking will still work if tracking fails
      let trackingData = null;
      try {
        trackingData = await collectTrackingData(false);
      } catch (trackingError) {
        console.warn('Tracking data collection failed:', trackingError);
        // Continue with booking submission even if tracking fails
      }

      // Prepare booking data with sanitized values
      const bookingData: {
        tripId: string;
        tripTitle: string;
        guestName: string;
        email: string;
        phone: string;
        preferredDate: string;
        guestCount: number;
        specialRequests: string;
        status: 'pending';
        tracking?: BookingTrackingData;
      } = {
        tripId: trip.id,
        tripTitle: sanitizeText(trip.title),
        ...sanitizedData,
        status: 'pending',
      };

      // Add tracking data if available
      if (trackingData) {
        // Only include fields that have values (filter out undefined)
        const tracking: any = {};

        if (trackingData.fingerprint) tracking.fingerprint = trackingData.fingerprint;
        if (trackingData.userAgent) tracking.userAgent = trackingData.userAgent;
        if (trackingData.ipAddress) tracking.ipAddress = trackingData.ipAddress;
        if (trackingData.country) tracking.country = trackingData.country;
        if (trackingData.city) tracking.city = trackingData.city;
        if (trackingData.region) tracking.region = trackingData.region;
        if (trackingData.latitude !== undefined) tracking.latitude = trackingData.latitude;
        if (trackingData.longitude !== undefined) tracking.longitude = trackingData.longitude;
        if (trackingData.timezone) tracking.timezone = trackingData.timezone;
        if (trackingData.language) tracking.language = trackingData.language;
        if (trackingData.screenWidth) tracking.screenWidth = trackingData.screenWidth;
        if (trackingData.screenHeight) tracking.screenHeight = trackingData.screenHeight;
        if (trackingData.platform) tracking.platform = trackingData.platform;

        // Only add tracking if we have at least some data
        if (Object.keys(tracking).length > 0) {
          bookingData.tracking = tracking;
        }
      }

      // Save booking to Firestore
      await createBooking(bookingData);

      const submissionLatencyMs = Math.round(now() - submissionStart);

      try {
        trackBookingSubmissionSuccess({
          tripId: trip.id,
          tripTitle: trip.title,
          source: 'booking_modal',
          guestCount: formData.guestCount,
          preferredDate: formData.preferredDate || undefined,
          formDurationMs,
          submissionLatencyMs,
        });
      } catch (analyticsError) {
        console.warn('Analytics tracking failed:', analyticsError);
      }

      setSubmitStatus('success');

      setTimeout(() => {
        setFormData({
          guestName: '',
          email: '',
          phone: '',
          preferredDate: '',
          guestCount: 1,
          specialRequests: '',
        });
        setErrors({});
        setSubmitStatus('idle');
        onClose();
      }, 2500);
    } catch (error) {
      console.error('Booking submission error:', error);
      const submissionLatencyMs = Math.round(now() - submissionStart);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorCode = (error as { code?: string })?.code;

      try {
        trackBookingSubmissionError({
          tripId: trip.id,
          tripTitle: trip.title,
          source: 'booking_modal',
          guestCount: formData.guestCount,
          preferredDate: formData.preferredDate || undefined,
          formDurationMs,
          submissionLatencyMs,
          errorMessage,
          errorCode,
        });
      } catch (analyticsError) {
        console.warn('Analytics tracking failed:', analyticsError);
      }

      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    markFormStarted();
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'guestCount' ? parseInt(value) || 1 : value,
    }));
    // Clear field-level error when user types
    if (errors[name as keyof BookingValidationErrors]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name as keyof BookingValidationErrors];
        return next;
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Book This Trip" maxWidth="lg">
      <div className="space-y-6">
        {/* Trip Summary Card */}
        <div className="bg-gradient-to-r from-forest-50 to-forest-100/50 rounded-xl p-5 border border-forest-200/50">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-forest-700 text-lg mb-2">
                {trip.title}
              </h3>
              <div className="space-y-1.5 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-forest-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {trip.duration}
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-forest-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {trip.location}
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-forest-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Up to {trip.maxGuests} guests
                </div>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-2xl font-bold text-forest-700">
                {formatPrice(trip.price)}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">per person</div>
            </div>
          </div>
        </div>

        {/* Success state */}
        {submitStatus === 'success' && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center animate-fade-in">
            <div className="animate-success-check inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-3">
              <svg className="w-6 h-6 text-green-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="font-semibold text-green-800 text-lg">
              Booking request submitted!
            </p>
            <p className="text-sm text-green-700 mt-1">
              We'll contact you shortly to confirm your booking.
            </p>
          </div>
        )}

        {/* Error state */}
        {submitStatus === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-5 animate-error-shake" role="alert">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-red-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-red-800">
                  Failed to submit booking
                </p>
                <p className="text-sm text-red-700 mt-0.5">
                  Please try again or contact us directly at (403) 555-FISH
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Booking Form */}
        {submitStatus !== 'success' && (
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Two-column layout for name and email on desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                name="guestName"
                value={formData.guestName}
                onChange={handleChange}
                required
                placeholder="John Smith"
                error={errors.guestName}
                maxLength={100}
                autoComplete="name"
              />
              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="john@example.com"
                error={errors.email}
                maxLength={254}
                autoComplete="email"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Phone Number"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="(403) 555-1234"
                error={errors.phone}
                maxLength={20}
                autoComplete="tel"
              />
              <Input
                label="Preferred Date"
                name="preferredDate"
                type="date"
                value={formData.preferredDate}
                onChange={handleChange}
                required
                min={new Date().toISOString().split('T')[0]}
                error={errors.preferredDate}
              />
            </div>

            <Input
              label="Number of Guests"
              name="guestCount"
              type="number"
              value={formData.guestCount}
              onChange={handleChange}
              required
              min={1}
              max={trip.maxGuests}
              helperText={`Maximum ${trip.maxGuests} guests per trip`}
              error={errors.guestCount}
            />

            <Textarea
              label="Special Requests"
              name="specialRequests"
              value={formData.specialRequests}
              onChange={handleChange}
              placeholder="Any special requirements, experience level, or questions..."
              rows={3}
              helperText={
                formData.specialRequests.length > 0
                  ? `${formData.specialRequests.length}/2000 characters`
                  : 'Optional: Let us know about your experience level or any special needs'
              }
              error={errors.specialRequests}
              maxLength={2000}
            />

            {/* Action buttons */}
            <div className="flex gap-3 pt-3">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
                disabled={isSubmitting}
                loading={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Booking Request'}
              </Button>
            </div>
          </form>
        )}

        {/* Privacy note */}
        <p className="text-xs text-gray-400 text-center leading-relaxed">
          By submitting this request, you agree to be contacted about your booking.
          Final pricing and availability will be confirmed by email.
        </p>
      </div>
    </Modal>
  );
}
