import { Timestamp } from 'firebase/firestore';

export type UserRole = 'customer' | 'guide' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  role: UserRole;
  photoUrl?: string;
  authMethod?: 'email' | 'oauth';
  createdAt: Timestamp;
}

export interface CreateUserData {
  uid: string;
  email: string;
  displayName?: string;
  role: UserRole;
  photoUrl?: string;
}

export type UpdateUserData = Partial<Omit<CreateUserData, 'uid'>>;

// Type guard to check if user has specific role
export const hasRole = (user: UserProfile | null, role: UserRole): boolean => {
  return user?.role === role;
};

export const isAdmin = (user: UserProfile | null): boolean => {
  return hasRole(user, 'admin');
};

export const isGuide = (user: UserProfile | null): boolean => {
  return hasRole(user, 'guide') || hasRole(user, 'admin');
};
