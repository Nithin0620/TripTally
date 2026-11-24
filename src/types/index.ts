// ============================================
// Core Data Types
// ============================================

export interface User {
  id: string;
  name: string;
  email: string;
  profile_image?: string;
  created_at: string;
}

export interface PaginationInfo {
  limit: number;
  offset: number;
  total: number;
  hasMore: boolean;
}

export interface PlacesApiResponse {
  success: boolean;
  data: Place[];
  pagination?: PaginationInfo;
  error?: string;
}

export interface SearchApiResponse {
  success: boolean;
  data: Place[];
  source?: 'database' | 'ai';
  message?: string;
  error?: string;
}
export interface Trip {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  cover_image?: string;
  currency: string;
  budget_limit?: number;
  created_by: string;
  created_at: string;
}

export interface TripMember {
  id: string;
  trip_id: string;
  user_id: string;
  role: 'owner' | 'editor' | 'viewer';
  joined_at: string;
  user?: User; // Joined user details
}

export interface Activity {
  id: string;
  trip_id: string;
  title: string;
  activity_date: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
  order_index?: number;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  trip_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: Pick<User, "id" | "name" | "profile_image">;
}

export interface Expense {
  id: string;
  trip_id: string;
  title: string;
  amount: number;
  paid_by: string;
  split_type: 'equal' | 'percentage' | 'custom';
  category?: string;
  created_at: string;
  paidByUser?: User;
  shares?: ExpenseShare[];
}

export interface ExpenseShare {
  id: string;
  expense_id: string;
  user_id: string;
  share_amount: number;
  user?: User;
}

export interface Receipt {
  id: string;
  expense_id: string;
  image_url: string;
  extracted_text?: string;
  created_at: string;
}

export interface Template {
  id: string;
  title: string;
  location?: string;
  days?: number;
  budget_range?: string;
  is_public: boolean;
  created_by?: string;
  created_at: string;
}

export interface Settlement {
  from_user_id: string;
  to_user_id: string;
  amount: number;
  from_user?: Omit<User, 'created_at'>;
  to_user?: Omit<User, 'created_at'>;
}

// ============================================
// JWT Payload
// ============================================

export interface AppJWTPayload {
  userId: string;
  email: string;
  name?: string;
  profile_image?: string;
  iat?: number;
  exp?: number;
}

// ============================================
// API Request/Response Types
// ============================================

export interface AuthRequest {
  email: string;
  password?: string;
  name?: string;
  googleToken?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface CreateTripRequest {
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  cover_image?: string;
  currency?: string;
  budget_limit?: number;
}

export interface CreateActivityRequest {
  trip_id: string;
  title: string;
  activity_date: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
  order_index?: number;
}

export interface CreateExpenseRequest {
  trip_id: string;
  title: string;
  amount: number;
  paid_by: string;
  split_type: 'equal' | 'percentage' | 'custom';
  category?: string;
  shares: {
    user_id: string;
    amount: number;
  }[];
}

export interface TripInviteRequest {
  trip_id: string;
  email: string;
  role: 'editor' | 'viewer';
}

// ============================================
// WebSocket Event Types
// ============================================

export interface WebSocketMessage {
  type: 'expense_added' | 'activity_updated' | 'settlement_updated' | 'user_joined';
  trip_id: string;
  data: any;
  timestamp: number;
}

// ============================================
// Context Types
// ============================================

export interface UserContext {
  userId: string;
  email: string;
}

// ============================================
// EXPLORE SYSTEM TYPES
// ============================================

export interface Hotel {
  name: string;
  image: string;
  description: string;
  price_range: string;
}

export interface Restaurant {
  name: string;
  image: string;
  description: string;
  cuisine: string;
}

export interface Place {
  id: string;
  name: string;
  category: 'Beaches' | 'Mountains' | 'Cities' | 'Spiritual' | 'Luxury';
  state: string;
  description: string;
  best_time_to_visit: string;
  avg_budget: string;
  travel_duration: string;
  hero_image: string;
  gallery_images: string[];
  hotels: Hotel[];
  restaurants: Restaurant[];
  created_at: string;
  updated_at?: string;
}

export interface GeneratePlacesRequest {
  category: 'Beaches' | 'Mountains' | 'Cities' | 'Spiritual' | 'Luxury';
  limit?: number;
}

export interface GeneratePlacesResponse {
  places: Place[];
  success: boolean;
  error?: string;
}

export interface ExploreCategory {
  category: string; // Dynamically fetched from database, not hardcoded
  places: Place[];
  hasMore?: boolean;
}

// ============================================
// Notification Types
// ============================================

export interface Notification {
  id: string;
  user_id: string;
  type: 'trip_invite' | 'expense_added' | 'activity_added' | 'settlement_updated' | 'member_joined' | 'system';
  title: string;
  message: string;
  trip_id?: string;
  data?: Record<string, any>;
  read: boolean;
  created_at: string;
}
