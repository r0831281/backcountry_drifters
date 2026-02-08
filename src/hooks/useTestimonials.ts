import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { COLLECTIONS, createDocument, updateDocument, deleteDocument } from '../lib/firestore';
import { type Testimonial, type CreateTestimonialData, type UpdateTestimonialData } from '../types';
import { sanitizeObject } from '../lib/sanitization';

interface UseTestimonialsOptions {
  includeUnapproved?: boolean;
  limitCount?: number;
  realtime?: boolean;
}

export function useTestimonials(options: UseTestimonialsOptions = {}) {
  const { includeUnapproved = false, limitCount = 10, realtime = false } = options;
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const collectionRef = collection(db, COLLECTIONS.TESTIMONIALS);
    const buildQuery = () => {
      if (includeUnapproved) {
        return query(collectionRef, orderBy('createdAt', 'desc'), limit(limitCount));
      }
      return query(
        collectionRef,
        where('isApproved', '==', true),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
    };

    const q = buildQuery();

    if (realtime) {
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!isMounted) return;
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Testimonial[];
          setTestimonials(data);
          setLoading(false);
        },
        (err) => {
          if (!isMounted) return;
          console.error('Error fetching testimonials:', err);
          setError('Failed to load testimonials');
          setLoading(false);
        }
      );

      return () => {
        isMounted = false;
        unsubscribe();
      };
    }

    const fetchTestimonials = async () => {
      try {
        const snapshot = await getDocs(q);
        if (!isMounted) return;
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Testimonial[];
        setTestimonials(data);
        setLoading(false);
      } catch (err) {
        if (!isMounted) return;
        console.error('Error fetching testimonials:', err);
        setError('Failed to load testimonials');
        setLoading(false);
      }
    };

    fetchTestimonials();

    return () => {
      isMounted = false;
    };
  }, [includeUnapproved, limitCount, realtime]);

  const createTestimonial = async (data: CreateTestimonialData) => {
    try {
      // Defense-in-depth: sanitize all string values before writing to Firestore
      const sanitizedData = sanitizeObject(data as unknown as Record<string, unknown>);
      const id = await createDocument(COLLECTIONS.TESTIMONIALS, sanitizedData);
      return id;
    } catch (err) {
      console.error('Error creating testimonial:', err);
      throw new Error('Failed to create testimonial');
    }
  };

  const updateTestimonial = async (id: string, data: UpdateTestimonialData) => {
    try {
      // Defense-in-depth: sanitize all string values before writing to Firestore
      const sanitizedData = sanitizeObject(data as unknown as Record<string, unknown>);
      await updateDocument(COLLECTIONS.TESTIMONIALS, id, sanitizedData);
    } catch (err) {
      console.error('Error updating testimonial:', err);
      throw new Error('Failed to update testimonial');
    }
  };

  const deleteTestimonial = async (id: string) => {
    try {
      await deleteDocument(COLLECTIONS.TESTIMONIALS, id);
    } catch (err) {
      console.error('Error deleting testimonial:', err);
      throw new Error('Failed to delete testimonial');
    }
  };

  return {
    testimonials,
    loading,
    error,
    createTestimonial,
    updateTestimonial,
    deleteTestimonial,
  };
}
