import { Timestamp } from 'firebase/firestore';

/**
 * Resource category types
 */
export type ResourceCategory = 'gear' | 'hatch-charts' | 'techniques' | 'locations' | 'other';

/**
 * Resource interface - represents a resource item (gear guide, hatch chart, etc.)
 */
export interface Resource {
  id: string;
  title: string;
  text: string;
  imageUrl: string;
  category: ResourceCategory;
  isVisible: boolean;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

/**
 * Form data for creating/editing a resource
 */
export interface ResourceFormData {
  title: string;
  text: string;
  imageUrl: string;
  category: ResourceCategory;
  isVisible: boolean;
}

/**
 * Data required to create a new resource
 */
export interface CreateResourceData extends Omit<Resource, 'id' | 'createdAt' | 'updatedAt'> {}

/**
 * Data that can be updated on an existing resource
 */
export interface UpdateResourceData extends Partial<Omit<Resource, 'id' | 'createdAt' | 'updatedAt'>> {}
