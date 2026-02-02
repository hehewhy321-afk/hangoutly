export interface Profile {
  id: string;
  firstName: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  city: string;
  area: string;
  profession: string;
  bio: string;
  hourlyRate: number;
  activities: string[];
  images: string[];
  isOnline: boolean;
  isVerified: boolean;
  createdAt?: string;
}

export interface Booking {
  id: string;
  companionId: string;
  userId: string;
  date: string;
  startTime: string;
  duration: number; // in hours
  activity: string;
  totalCost: number;
  status: 'pending' | 'accepted' | 'rejected' | 'active' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'requested' | 'paid' | 'confirmed';
}

export interface FilterOptions {
  city: string;
  gender: string;
  priceRange: [number, number];
  activities: string[];
  ageRange: [number, number];
  onlineOnly: boolean;
}

export const ACTIVITIES = [
  'Movies',
  'Walking',
  'Hiking',
  'Events',
  'Conversations',
  'Coffee',
  'Dining',
  'Shopping',
  'Gaming',
  'Music',
  'Art Gallery',
  'Photography',
] as const;

export const CITIES = [
  'Kathmandu',
  'Pokhara',
  'Lalitpur',
  'Bhaktapur',
] as const;
