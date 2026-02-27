export interface IMember {
    user_id: string;
    role: "owner" | "editor" | "viewer";
}

export interface ITrip {
    id: string;
    title: string;
    description?: string;
    start_date?: string;
    end_date?: string;
    owner_id: string;
    members?: IMember[];
    cover_image?: string;
    budget_limit?: number;
    currency: string;
    created_at: string;
    updated_at: string;
}

export const tripTableName = "trips";

// Supabase table structure:
// - id: UUID (primary key)
// - title: text (not null)
// - description: text (nullable)
// - start_date: timestamp (nullable)
// - end_date: timestamp (nullable)
// - owner_id: UUID (not null, foreign key -> users.id)
// - members: jsonb (array of {user_id, role}, nullable)
// - cover_image: text (nullable)
// - budget_limit: numeric (nullable)
// - currency: text (default 'USD')
// - created_at: timestamp (auto)
// - updated_at: timestamp (auto)
