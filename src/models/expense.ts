/**
 * Expense model - Represents a trip expense
 */
export interface Expense {
  id: string;                                      // UUID primary key
  trip_id: string;                                 // UUID of the trip
  title: string;                                   // Expense description
  amount: number;                                  // Total expense amount
  paid_by: string;                                 // UUID of user who paid
  split_type: 'equal' | 'percentage' | 'custom'; // How to split the expense
  category: string | null;                        // Expense category
  created_at: string;                             // ISO timestamp
}

/**
 * Expense with shares included
 */
export interface ExpenseWithShares extends Expense {
  shares: ExpenseShare[];
}

/**
 * Expense create input
 */
export interface CreateExpenseInput {
  trip_id: string;
  title: string;
  amount: number;
  paid_by: string;
  split_type: 'equal' | 'percentage' | 'custom';
  category?: string;
}

/**
 * Expense update input
 */
export interface UpdateExpenseInput {
  title?: string;
  amount?: number;
  paid_by?: string;
  split_type?: 'equal' | 'percentage' | 'custom';
  category?: string;
}

/**
 * Expense share - How much a user owes for an expense
 */
export interface ExpenseShare {
  id: string;           // UUID primary key
  expense_id: string;   // UUID of the expense
  user_id: string;      // UUID of the user
  share_amount: number; // Amount this user owes
}

/**
 * Add expense share input
 */
export interface AddExpenseShareInput {
  user_id: string;
  share_amount: number;
}

/**
 * Receipt - Image of expense receipt with OCR text
 */
export interface Receipt {
  id: string;              // UUID primary key
  expense_id: string;      // UUID of the expense
  image_url: string;       // URL to receipt image (Cloudinary)
  extracted_text: string | null;  // OCR extracted text
  created_at: string;      // ISO timestamp
}

/**
 * Add receipt input
 */
export interface AddReceiptInput {
  expense_id: string;
  image_url: string;
  extracted_text?: string;
}

export const EXPENSE_TABLE = 'expenses';
export const EXPENSE_SHARES_TABLE = 'expense_shares';
export const RECEIPT_TABLE = 'receipts';
