export interface IActivity {
  id: string;
  trip_id: string;
  title: string;
  description?: string;
  date?: string;
  time?: string;
  location?: string;
  tags?: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const activityTableName = "activities";

// Supabase table structure:
// - id: UUID (primary key)
// - trip_id: UUID (not null, foreign key -> trips.id)
// - title: text (not null)
// - description: text (nullable)
// - date: timestamp (nullable)
// - time: text (nullable)
// - location: text (nullable)
// - tags: text[] (array, nullable)
// - created_by: UUID (not null, foreign key -> users.id)
// - created_at: timestamp (auto)
// - updated_at: timestamp (auto)
