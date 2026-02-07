import { Timestamp } from 'firebase/firestore';

export interface Testimonial {
  id: string;
  customerName: string;
  testimonialText: string;
  rating: number; // 1-5 stars
  photoUrl?: string;
  tripType: string;
  createdAt: Timestamp;
  isApproved: boolean;
}

export interface TestimonialFormData {
  customerName: string;
  testimonialText: string;
  rating: number;
  photoUrl?: string;
  tripType: string;
  isApproved: boolean;
}

export type CreateTestimonialData = Omit<Testimonial, 'id' | 'createdAt'>;
export type UpdateTestimonialData = Partial<CreateTestimonialData>;
