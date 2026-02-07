import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { COLLECTIONS, createDocument, updateDocument, deleteDocument } from '../lib/firestore';
import { type Trip, type CreateTripData, type UpdateTripData } from '../types';
import { sanitizeObject } from '../lib/sanitization';

interface UseTripsOptions {
  activeOnly?: boolean;
}

export function useTrips(options: UseTripsOptions = {}) {
  const { activeOnly = true } = options;
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if Firebase is properly configured by checking env vars
    const isFirebaseConfigured = import.meta.env.VITE_FIREBASE_PROJECT_ID &&
                                  import.meta.env.VITE_FIREBASE_API_KEY;

    if (!isFirebaseConfigured) {
      console.error('Firebase not configured. Please check your .env.local file');
      setError('Firebase not configured');
      setLoading(false);
      return;
    }

    try {
      // Build query
      const collectionRef = collection(db, COLLECTIONS.TRIPS);
      let q = query(collectionRef, orderBy('createdAt', 'desc'));

      // Filter by active status for public views
      if (activeOnly) {
        q = query(
          collectionRef,
          where('isActive', '==', true),
          orderBy('createdAt', 'desc')
        );
      }

      // Subscribe to real-time updates
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Trip[];

          setTrips(data);
          setLoading(false);
          setError(null);
        },
        (err) => {
          console.error('Error fetching trips:', err);
          setError('Failed to load trips');
          setLoading(false);
        }
      );

      return unsubscribe;
    } catch (err) {
      console.error('Error setting up trips listener:', err);
      setError('Failed to set up trips listener');
      setLoading(false);
      return;
    }
  }, [activeOnly]);

  const createTrip = async (data: CreateTripData) => {
    try {
      // Defense-in-depth: sanitize all string values before writing to Firestore
      const sanitizedData = sanitizeObject(data as unknown as Record<string, unknown>);
      const id = await createDocument(COLLECTIONS.TRIPS, sanitizedData);
      return id;
    } catch (err) {
      console.error('Error creating trip:', err);
      throw new Error('Failed to create trip');
    }
  };

  const updateTrip = async (id: string, data: UpdateTripData) => {
    try {
      // Defense-in-depth: sanitize all string values before writing to Firestore
      const sanitizedData = sanitizeObject(data as unknown as Record<string, unknown>);
      await updateDocument(COLLECTIONS.TRIPS, id, sanitizedData);
    } catch (err) {
      console.error('Error updating trip:', err);
      throw new Error('Failed to update trip');
    }
  };

  const deleteTrip = async (id: string) => {
    try {
      await deleteDocument(COLLECTIONS.TRIPS, id);
    } catch (err) {
      console.error('Error deleting trip:', err);
      throw new Error('Failed to delete trip');
    }
  };

  return {
    trips,
    loading,
    error,
    createTrip,
    updateTrip,
    deleteTrip,
  };
}

export function useTrip(tripId: string) {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const isFirebaseConfigured = import.meta.env.VITE_FIREBASE_PROJECT_ID &&
                                  import.meta.env.VITE_FIREBASE_API_KEY;

    if (!isFirebaseConfigured) {
      console.error('Firebase not configured');
      setError('Firebase not configured');
      setLoading(false);
      return;
    }

    const fetchTrip = async () => {
      try {
        const docRef = doc(db, COLLECTIONS.TRIPS, tripId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setTrip({ id: docSnap.id, ...docSnap.data() } as Trip);
        } else {
          setTrip(null);
          setError('Trip not found');
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching trip:', err);
        setError('Failed to load trip');
        setLoading(false);
      }
    };

    fetchTrip();
  }, [tripId]);

  return { trip, loading, error };
}
