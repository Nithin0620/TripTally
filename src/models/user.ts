/**
 * User model - Represents a TripTally user account
 */
export interface User {
  id: string;          // UUID primary key
  name: string;        // User's full name
  email: string;       // User's email (unique)
  profile_image: string | null;  // Profile image URL from Cloudinary
  created_at: string;  // ISO timestamp
}

/**
 * User create/update input
 */
export interface CreateUserInput {
  id: string;
  name: string;
  email: string;
  profile_image?: string;
}

export interface UpdateUserInput {
  name?: string;
  profile_image?: string;
}

export const USER_TABLE = 'users';

