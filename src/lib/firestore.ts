import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  type QueryConstraint,
  type DocumentData,
  type WithFieldValue,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

// Collection names
export const COLLECTIONS = {
  TESTIMONIALS: 'testimonials',
  TRIPS: 'trips',
  USERS: 'users',
  BOOKINGS: 'bookings',
  RESOURCES: 'resources',
  RESOURCE_CATEGORIES: 'resourceCategories',
} as const;

// Generic Firestore helper functions

/**
 * Remove undefined values from an object (Firestore doesn't accept undefined)
 */
function removeUndefinedValues<T extends Record<string, any>>(obj: T): Partial<T> {
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      result[key] = value;
    }
  }
  return result;
}

/**
 * Get a single document by ID
 */
export async function getDocument<T = DocumentData>(
  collectionName: string,
  docId: string
): Promise<T | null> {
  const docRef = doc(db, collectionName, docId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as T;
  }
  return null;
}

/**
 * Get all documents from a collection with optional query constraints
 */
export async function getDocuments<T = DocumentData>(
  collectionName: string,
  ...constraints: QueryConstraint[]
): Promise<T[]> {
  const collectionRef = collection(db, collectionName);
  const q = query(collectionRef, ...constraints);
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as T[];
}

/**
 * Create a new document
 */
export async function createDocument<T = DocumentData>(
  collectionName: string,
  data: WithFieldValue<T>
): Promise<string> {
  const collectionRef = collection(db, collectionName);
  // Remove undefined values before sending to Firestore
  const cleanData = removeUndefinedValues(data as Record<string, any>);
  const docRef = await addDoc(collectionRef, {
    ...cleanData,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Update an existing document
 */
export async function updateDocument<T = Partial<DocumentData>>(
  collectionName: string,
  docId: string,
  data: WithFieldValue<T>
): Promise<void> {
  const docRef = doc(db, collectionName, docId);
  // Remove undefined values before sending to Firestore
  const cleanData = removeUndefinedValues(data as Record<string, any>);
  await updateDoc(docRef, {
    ...cleanData,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Delete a document
 */
export async function deleteDocument(
  collectionName: string,
  docId: string
): Promise<void> {
  const docRef = doc(db, collectionName, docId);
  await deleteDoc(docRef);
}

// Testimonial-specific helpers

/**
 * Get approved testimonials for public display
 */
export async function getApprovedTestimonials(maxResults: number = 10) {
  return getDocuments(
    COLLECTIONS.TESTIMONIALS,
    where('isApproved', '==', true),
    orderBy('createdAt', 'desc'),
    limit(maxResults)
  );
}

/**
 * Get all testimonials (admin only)
 */
export async function getAllTestimonials() {
  return getDocuments(
    COLLECTIONS.TESTIMONIALS,
    orderBy('createdAt', 'desc')
  );
}

// Trip-specific helpers

/**
 * Get active trips for public display
 */
export async function getActiveTrips() {
  return getDocuments(
    COLLECTIONS.TRIPS,
    where('isActive', '==', true),
    orderBy('createdAt', 'desc')
  );
}

/**
 * Get all trips (admin only)
 */
export async function getAllTrips() {
  return getDocuments(
    COLLECTIONS.TRIPS,
    orderBy('createdAt', 'desc')
  );
}

/**
 * Get a single trip by ID
 */
export async function getTripById(tripId: string) {
  return getDocument(COLLECTIONS.TRIPS, tripId);
}

// User-specific helpers

/**
 * Get user profile by UID
 */
export async function getUserProfile(uid: string) {
  return getDocument(COLLECTIONS.USERS, uid);
}

/**
 * Create or update user profile
 */
export async function upsertUserProfile(uid: string, data: DocumentData) {
  const docRef = doc(db, COLLECTIONS.USERS, uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } else {
    await updateDoc(docRef, {
      ...data,
      createdAt: serverTimestamp(),
    });
  }
}

// Resource-specific helpers

/**
 * Get visible resources for public display
 */
export async function getVisibleResources() {
  return getDocuments(
    COLLECTIONS.RESOURCES,
    where('isVisible', '==', true),
    orderBy('createdAt', 'desc')
  );
}

/**
 * Get all resources (admin only)
 */
export async function getAllResources() {
  return getDocuments(
    COLLECTIONS.RESOURCES,
    orderBy('createdAt', 'desc')
  );
}

/**
 * Get a single resource by ID
 */
export async function getResourceById(resourceId: string) {
  return getDocument(COLLECTIONS.RESOURCES, resourceId);
}

// Resource category-specific helpers

/**
 * Get all resource categories ordered by order field
 */
export async function getResourceCategories() {
  return getDocuments(
    COLLECTIONS.RESOURCE_CATEGORIES,
    orderBy('order', 'asc')
  );
}

/**
 * Get a single resource category by ID
 */
export async function getResourceCategoryById(categoryId: string) {
  return getDocument(COLLECTIONS.RESOURCE_CATEGORIES, categoryId);
}

// Export common query builders
export { where, orderBy, limit, Timestamp, serverTimestamp };
