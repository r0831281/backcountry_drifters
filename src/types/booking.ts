import { Timestamp } from 'firebase/firestore';

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';

export interface BookingRequest {
  tripId: string;
  tripTitle: string;
  guestName: string;
  email: string;
  phone: string;
  preferredDate: string; // ISO date string
  guestCount: number;
  specialRequests?: string;
}

// Tracking data structure
export interface BookingTrackingData {
  fingerprint: string;
  userAgent: string;
  ipAddress?: string;
  country?: string;
  city?: string;
  region?: string;
  latitude?: number;
  longitude?: number;
  timezone: string;
  language: string;
  screenWidth: number;
  screenHeight: number;
  platform: string;
}

export interface Booking extends BookingRequest {
  id: string;
  status: BookingStatus;
  submittedAt: Timestamp;
  assignedGuide?: string; // User UID
  tracking?: BookingTrackingData; // Analytics and fingerprinting data
}

export interface BookingFormData {
  tripId: string;
  tripTitle: string;
  guestName: string;
  email: string;
  phone: string;
  preferredDate: string;
  guestCount: number;
  specialRequests?: string;
}

export type CreateBookingData = Omit<Booking, 'id' | 'submittedAt'>;
export type UpdateBookingData = Partial<CreateBookingData>;
