export type EventCategory = 'Tech' | 'Workshop' | 'Cultural' | 'Sports';

export type TicketTierType = 'Student' | 'Standard' | 'VIP';

export interface TicketTier {
  type: TicketTierType;
  name: string;
  price: number;
  perks: string[];
  availableSeats: number;
  totalSeats: number;
}

export interface EventItem {
  id: string;
  title: string;
  category: EventCategory;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "09:30 AM - 04:30 PM"
  venue: string;
  organizer: string;
  description: string;
  imageUrl: string;
  tags: string[];
  totalCapacity: number;
  bookedCount: number;
  tiers: TicketTier[];
  isFeatured?: boolean;
}

export interface Booking {
  id: string; // e.g. "EP-2026-8942"
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventVenue: string;
  userId: string;
  userName: string;
  userEmail: string;
  userCollege: string;
  tier: TicketTierType;
  quantity: number;
  unitPrice: number;
  discountApplied: number;
  totalAmount: number;
  bookingTimestamp: string;
  qrCodeData: string;
  status: 'Confirmed' | 'Checked-In' | 'Cancelled';
}

export type UserRole = 'student' | 'faculty' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  password?: string;
  role: UserRole;
  college: string;
  department: string;
  rollNo?: string;
}

export interface PhpEndpoint {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  description: string;
  phpFile: string;
  samplePayload?: Record<string, any>;
  queryParamSchema?: string[];
  mockResponse: Record<string, any>;
}

export interface VivaQuestion {
  id: number;
  topic: 'HTML5' | 'CSS3' | 'JavaScript' | 'React.js' | 'PHP & MySQL';
  question: string;
  answer: string;
  keyConcepts: string[];
}
