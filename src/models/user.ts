export interface IUser {
  id: string;
  name: string;
  email: string;
  password: string;
  profile_pic?: string;
  token?: string;
  trips?: string[];
  created_at: string;
  updated_at: string;
}

export const userTableName = "users";

// Supabase table structure:
// - id: UUID (primary key)
// - name: text (not null)
// - email: text (not null, unique)
// - password: text (not null)
// - profile_pic: text (nullable)
// - token: text (nullable)
// - trips: uuid[] (array of trip IDs, nullable)
// - created_at: timestamp (auto)
// - updated_at: timestamp (auto)

