import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { COLLECTIONS, createDocument, updateDocument, deleteDocument } from '../lib/firestore';
import { type ResourceCategory } from '../types';
import { sanitizeObject } from '../lib/sanitization';

interface UseResourceCategoriesOptions {
  realtime?: boolean;
}

export function useResourceCategories(options: UseResourceCategoriesOptions = {}) {
  const { realtime = false } = options;
  const [categories, setCategories] = useState<ResourceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const collectionRef = collection(db, COLLECTIONS.RESOURCE_CATEGORIES);
    const q = query(collectionRef, orderBy('order', 'asc'));

    if (realtime) {
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!isMounted) return;
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as ResourceCategory[];
          setCategories(data);
          setLoading(false);
        },
        (err) => {
          if (!isMounted) return;
          console.error('Error fetching resource categories:', err);
          setError('Failed to load resource categories');
          setLoading(false);
        }
      );

      return () => {
        isMounted = false;
        unsubscribe();
      };
    }

    const fetchCategories = async () => {
      try {
        const snapshot = await getDocs(q);
        if (!isMounted) return;
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ResourceCategory[];
        setCategories(data);
        setLoading(false);
      } catch (err) {
        if (!isMounted) return;
        console.error('Error fetching resource categories:', err);
        setError('Failed to load resource categories');
        setLoading(false);
      }
    };

    fetchCategories();

    return () => {
      isMounted = false;
    };
  }, [realtime]);

  const createCategory = async (data: Omit<ResourceCategory, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const sanitizedData = sanitizeObject(data as unknown as Record<string, unknown>);
      const id = await createDocument(COLLECTIONS.RESOURCE_CATEGORIES, sanitizedData);
      return id;
    } catch (err) {
      console.error('Error creating resource category:', err);
      throw new Error('Failed to create resource category');
    }
  };

  const updateCategory = async (id: string, data: Partial<Omit<ResourceCategory, 'id' | 'createdAt' | 'updatedAt'>>) => {
    try {
      const sanitizedData = sanitizeObject(data as unknown as Record<string, unknown>);
      await updateDocument(COLLECTIONS.RESOURCE_CATEGORIES, id, sanitizedData);
    } catch (err) {
      console.error('Error updating resource category:', err);
      throw new Error('Failed to update resource category');
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await deleteDocument(COLLECTIONS.RESOURCE_CATEGORIES, id);
    } catch (err) {
      console.error('Error deleting resource category:', err);
      throw new Error('Failed to delete resource category');
    }
  };

  return {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}
