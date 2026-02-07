import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { COLLECTIONS, createDocument, updateDocument, deleteDocument } from '../lib/firestore';
import { type Testimonial, type CreateTestimonialData, type UpdateTestimonialData } from '../types';
import { sanitizeObject } from '../lib/sanitization';

interface UseTestimonialsOptions {
  includeUnapproved?: boolean;
  limitCount?: number;
}

export function useTestimonials(options: UseTestimonialsOptions = {}) {
  const { includeUnapproved = false, limitCount = 10 } = options;
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Build query
    const collectionRef = collection(db, COLLECTIONS.TESTIMONIALS);
    let q = query(collectionRef, orderBy('createdAt', 'desc'), limit(limitCount));

    // Filter by approval status for public views
    if (!includeUnapproved) {
      q = query(
        collectionRef,
        where('isApproved', '==', true),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
    }

    // Subscribe to real-time updates
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Testimonial[];
        setTestimonials(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching testimonials:', err);
        setError('Failed to load testimonials');
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [includeUnapproved, limitCount]);

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
