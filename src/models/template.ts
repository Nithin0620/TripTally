/**
 * Template model - Represents a trip template
 */
export interface Template {
  id: string;               // UUID primary key
  title: string;            // Template name
  location: string | null;  // Destination
  days: number | null;      // Number of days
  budget_range: string | null;  // Budget range (e.g., "1000-2000")
  is_public: boolean;       // Public or private template
  created_by: string | null;  // UUID of creator (null if system template)
  created_at: string;       // ISO timestamp
}

/**
 * Template create input
 */
export interface CreateTemplateInput {
  title: string;
  location?: string;
  days?: number;
  budget_range?: string;
  is_public?: boolean;
  created_by?: string;
}

/**
 * Template update input
 */
export interface UpdateTemplateInput {
  title?: string;
  location?: string;
  days?: number;
  budget_range?: string;
  is_public?: boolean;
}

export const TEMPLATE_TABLE = 'templates';
