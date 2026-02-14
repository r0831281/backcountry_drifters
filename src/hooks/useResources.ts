import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { COLLECTIONS, createDocument, updateDocument, deleteDocument } from '../lib/firestore';
import { type Resource, type CreateResourceData, type UpdateResourceData } from '../types';
import { sanitizeObject } from '../lib/sanitization';

interface UseResourcesOptions {
  includeHidden?: boolean;
  limitCount?: number;
  realtime?: boolean;
}

export function useResources(options: UseResourcesOptions = {}) {
  const { includeHidden = false, limitCount = 100, realtime = false } = options;
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const collectionRef = collection(db, COLLECTIONS.RESOURCES);
    const buildQuery = () => {
      // Avoid composite index requirements by filtering visibility client-side.
      return query(collectionRef, orderBy('createdAt', 'desc'), limit(limitCount));
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
          })) as Resource[];
          const filtered = includeHidden ? data : data.filter((item) => item.isVisible);
          setResources(filtered);
          setLoading(false);
        },
        (err) => {
          if (!isMounted) return;
          console.error('Error fetching resources:', err);
          setError('Failed to load resources');
          setLoading(false);
        }
      );

      return () => {
        isMounted = false;
        unsubscribe();
      };
    }

    const fetchResources = async () => {
      try {
        const snapshot = await getDocs(q);
        if (!isMounted) return;
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Resource[];
        const filtered = includeHidden ? data : data.filter((item) => item.isVisible);
        setResources(filtered);
        setLoading(false);
      } catch (err) {
        if (!isMounted) return;
        console.error('Error fetching resources:', err);
        setError('Failed to load resources');
        setLoading(false);
      }
    };

    fetchResources();

    return () => {
      isMounted = false;
    };
  }, [includeHidden, limitCount, realtime]);

  const createResource = async (data: CreateResourceData) => {
    try {
      // Defense-in-depth: sanitize all string values before writing to Firestore
      const sanitizedData = sanitizeObject(data as unknown as Record<string, unknown>);
      const id = await createDocument(COLLECTIONS.RESOURCES, sanitizedData);
      return id;
    } catch (err) {
      console.error('Error creating resource:', err);
      throw new Error('Failed to create resource');
    }
  };

  const updateResource = async (id: string, data: UpdateResourceData) => {
    try {
      // Defense-in-depth: sanitize all string values before writing to Firestore
      const sanitizedData = sanitizeObject(data as unknown as Record<string, unknown>);
      await updateDocument(COLLECTIONS.RESOURCES, id, sanitizedData);
    } catch (err) {
      console.error('Error updating resource:', err);
      throw new Error('Failed to update resource');
    }
  };

  const deleteResource = async (id: string) => {
    try {
      await deleteDocument(COLLECTIONS.RESOURCES, id);
    } catch (err) {
      console.error('Error deleting resource:', err);
      throw new Error('Failed to delete resource');
    }
  };

  return {
    resources,
    loading,
    error,
    createResource,
    updateResource,
    deleteResource,
  };
}
