export interface IExpense {
  id: string;
  trip_id: string;
  title: string;
  amount: number;
  paid_by: string;
  paid_on: string;
  split_type: "equal" | "percentage" | "custom";
  involved: string[];
  percentages?: Record<string, number>;
  custom_shares?: Record<string, number>;
  notes?: string;
  tags?: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const expenseTableName = "expenses";

// Supabase table structure:
// - id: UUID (primary key)
// - trip_id: UUID (not null, foreign key -> trips.id)
// - title: text (not null)
// - amount: numeric (not null)
// - paid_by: UUID (not null, foreign key -> users.id)
// - paid_on: timestamp (not null)
// - split_type: text (enum: 'equal', 'percentage', 'custom', default 'equal')
// - involved: uuid[] (array of user IDs, not null)
// - percentages: jsonb (object mapping user_id to percentage, nullable)
// - custom_shares: jsonb (object mapping user_id to amount, nullable)
// - notes: text (nullable)
// - tags: text[] (array, nullable)
// - created_by: UUID (not null, foreign key -> users.id)
// - created_at: timestamp (auto)
// - updated_at: timestamp (auto)
