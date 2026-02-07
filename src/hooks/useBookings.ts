import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { COLLECTIONS, createDocument, updateDocument, deleteDocument } from '../lib/firestore';
import { type Booking, type CreateBookingData, type UpdateBookingData } from '../types';
import { sanitizeObject } from '../lib/sanitization';

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if Firebase is properly configured
    const isFirebaseConfigured = import.meta.env.VITE_FIREBASE_PROJECT_ID &&
                                  import.meta.env.VITE_FIREBASE_API_KEY;

    if (!isFirebaseConfigured) {
      console.warn('Firebase not configured, bookings will not persist');
      setBookings([]);
      setLoading(false);
      return;
    }

    try {
      // Build query
      const collectionRef = collection(db, COLLECTIONS.BOOKINGS);
      const q = query(collectionRef, orderBy('submittedAt', 'desc'));

      // Subscribe to real-time updates
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Booking[];
          setBookings(data);
          setLoading(false);
          setError(null);
        },
        (err) => {
          console.error('Error fetching bookings:', err);
          setError('Failed to load bookings');
          setLoading(false);
        }
      );

      return unsubscribe;
    } catch (err) {
      console.error('Error setting up bookings listener:', err);
      setError('Failed to set up bookings listener');
      setLoading(false);
      return;
    }
  }, []);

  const createBooking = async (data: CreateBookingData) => {
    try {
      // Defense-in-depth: sanitize all string values before writing to Firestore
      const sanitizedData = sanitizeObject(data as unknown as Record<string, unknown>);
      const bookingData = {
        ...sanitizedData,
        submittedAt: Timestamp.now(),
      };
      const id = await createDocument(COLLECTIONS.BOOKINGS, bookingData);
      return id;
    } catch (err) {
      console.error('Error creating booking:', err);
      throw new Error('Failed to create booking');
    }
  };

  const updateBooking = async (id: string, data: UpdateBookingData) => {
    try {
      // Defense-in-depth: sanitize all string values before writing to Firestore
      const sanitizedData = sanitizeObject(data as unknown as Record<string, unknown>);
      await updateDocument(COLLECTIONS.BOOKINGS, id, sanitizedData);
    } catch (err) {
      console.error('Error updating booking:', err);
      throw new Error('Failed to update booking');
    }
  };

  const deleteBooking = async (id: string) => {
    try {
      await deleteDocument(COLLECTIONS.BOOKINGS, id);
    } catch (err) {
      console.error('Error deleting booking:', err);
      throw new Error('Failed to delete booking');
    }
  };

  return {
    bookings,
    loading,
    error,
    createBooking,
    updateBooking,
    deleteBooking,
  };
}
