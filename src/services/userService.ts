import { supabaseAdmin } from '../config/supabase';

/**
 * Service for user-related database operations
 */

export interface CreateUserInput {
  id: string;
  name: string;
  email: string;
  profile_image?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  profile_image: string | null;
  created_at: string;
}

/**
 * Create a new user
 */
export const createUser = async (input: CreateUserInput): Promise<User> => {
  const { data, error } = await supabaseAdmin.from('users').insert([input]).select().single();

  if (error) {
    throw new Error(`Failed to create user: ${error.message}`);
  }

  return data;
};

/**
 * Get user by ID
 */
export const getUserById = async (userId: string): Promise<User | null> => {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to fetch user: ${error.message}`);
  }

  return data;
};

/**
 * Get user by email
 */
export const getUserByEmail = async (email: string): Promise<User | null> => {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to fetch user: ${error.message}`);
  }

  return data;
};

/**
 * Update user
 */
export const updateUser = async (
  userId: string,
  updates: Partial<Omit<User, 'id' | 'created_at'>>
): Promise<User> => {
  const { data, error } = await supabaseAdmin
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update user: ${error.message}`);
  }

  return data;
};

/**
 * Delete user
 */
export const deleteUser = async (userId: string): Promise<void> => {
  const { error } = await supabaseAdmin.from('users').delete().eq('id', userId);

  if (error) {
    throw new Error(`Failed to delete user: ${error.message}`);
  }
};
