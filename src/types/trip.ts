import { Timestamp } from 'firebase/firestore';

export type TripDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';
export type TripDuration = 'Half Day' | 'Full Day' | 'Multi-Day';

export interface Trip {
  id: string;
  title: string;
  description: string;
  duration: string; // "4 Hours" | "8 Hours" | "2 Days"
  price: number; // Stored in cents (e.g., $350 = 35000)
  maxGuests: number;
  difficulty: TripDifficulty;
  photoUrls: string[];
  includedEquipment: string[];
  location: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isActive: boolean;
}

export interface TripFormData {
  title: string;
  description: string;
  duration: string;
  price: number;
  maxGuests: number;
  difficulty: TripDifficulty;
  photoUrls: string[];
  includedEquipment: string[];
  location: string;
  isActive: boolean;
}

export type CreateTripData = Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateTripData = Partial<CreateTripData>;

// Helper function to format price
export const formatPrice = (cents: number): string => {
  return `$${(cents / 100).toFixed(2)}`;
};

// Helper function to parse price to cents
export const parsePrice = (dollars: string | number): number => {
  const amount = typeof dollars === 'string' ? parseFloat(dollars) : dollars;
  return Math.round(amount * 100);
};
