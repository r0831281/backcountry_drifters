import { Timestamp } from 'firebase/firestore';

/**
 * Resource category interface - for dynamic category management
 */
export interface ResourceCategory {
  id: string;
  name: string;
  label: string;
  order: number;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

/**
 * Resource interface - represents a resource item (gear guide, hatch chart, etc.)
 */
export type ResourceContentBlock =
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'image'; imageUrl: string; alt?: string };

export interface Resource {
  id: string;
  title: string;
  text?: string;
  imageUrl?: string;
  category: string;
  contentBlocks?: ResourceContentBlock[];
  isVisible: boolean;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

/**
 * Form data for creating/editing a resource
 */
export interface ResourceFormData {
  title: string;
  text?: string;
  imageUrl?: string;
  category: string;
  contentBlocks: ResourceContentBlock[];
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

/**
 * Form data for creating/editing a resource category
 */
export interface ResourceCategoryFormData {
  name: string;
  label: string;
  order: number;
}
