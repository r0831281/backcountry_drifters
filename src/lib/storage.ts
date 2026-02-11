import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  type UploadMetadata,
} from 'firebase/storage';
import { storage } from './firebase';

// Storage folder paths
export const STORAGE_PATHS = {
  TESTIMONIALS: 'testimonials',
  TRIPS: 'trips',
  GUIDES: 'guides',
  RESOURCES: 'resources',
} as const;

// Allowed image types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Validate image file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.',
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: 'File size exceeds 5MB limit.',
    };
  }

  return { valid: true };
}

/**
 * Upload an image to Firebase Storage
 */
export async function uploadImage(
  file: File,
  path: string,
  fileName: string
): Promise<string> {
  // Validate file
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Create storage reference
  const storageRef = ref(storage, `${path}/${fileName}`);

  // Upload metadata
  const metadata: UploadMetadata = {
    contentType: file.type,
    customMetadata: {
      uploadedAt: new Date().toISOString(),
    },
  };

  try {
    // Upload file
    const snapshot = await uploadBytes(storageRef, file, metadata);

    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image. Please try again.');
  }
}

/**
 * Delete an image from Firebase Storage
 */
export async function deleteImage(fileUrl: string): Promise<void> {
  try {
    const storageRef = ref(storage, fileUrl);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting image:', error);
    throw new Error('Failed to delete image.');
  }
}

/**
 * Upload testimonial image
 */
export async function uploadTestimonialImage(
  testimonialId: string,
  file: File
): Promise<string> {
  const fileName = `${Date.now()}_${file.name}`;
  return uploadImage(
    file,
    `${STORAGE_PATHS.TESTIMONIALS}/${testimonialId}`,
    fileName
  );
}

/**
 * Upload trip image
 */
export async function uploadTripImage(
  tripId: string,
  file: File
): Promise<string> {
  const fileName = `${Date.now()}_${file.name}`;
  return uploadImage(
    file,
    `${STORAGE_PATHS.TRIPS}/${tripId}`,
    fileName
  );
}

/**
 * Upload multiple trip images
 */
export async function uploadTripImages(
  tripId: string,
  files: File[]
): Promise<string[]> {
  const uploadPromises = files.map((file) => uploadTripImage(tripId, file));
  return Promise.all(uploadPromises);
}

/**
 * Upload guide profile image
 */
export async function uploadGuideImage(
  guideId: string,
  file: File
): Promise<string> {
  const fileName = 'profile.jpg';
  return uploadImage(
    file,
    `${STORAGE_PATHS.GUIDES}/${guideId}`,
    fileName
  );
}

/**
 * Generate a unique file name
 */
export function generateFileName(originalName: string): string {
  const timestamp = Date.now();
  const extension = originalName.split('.').pop();
  const nameWithoutExtension = originalName.split('.').slice(0, -1).join('.');
  const sanitizedName = nameWithoutExtension
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_');
  return `${sanitizedName}_${timestamp}.${extension}`;
}

/**
 * Upload resource image
 */
export async function uploadResourceImage(
  file: File
): Promise<string> {
  const fileName = generateFileName(file.name);
  return uploadImage(file, STORAGE_PATHS.RESOURCES, fileName);
}
