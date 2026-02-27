/**
 * TripTally Database Models
 * Central export file for all database models and types
 */

// User models
export type { User, CreateUserInput, UpdateUserInput } from './user';
export { USER_TABLE } from './user';

// Trip models
export type {
  Trip,
  TripWithMembers,
  CreateTripInput,
  UpdateTripInput,
  TripMember,
  AddTripMemberInput,
} from './trip';
export { TRIP_TABLE, TRIP_MEMBERS_TABLE } from './trip';

// Activity models
export type {
  Activity,
  CreateActivityInput,
  UpdateActivityInput,
} from './activity';
export { ACTIVITY_TABLE } from './activity';

// Expense models
export type {
  Expense,
  ExpenseWithShares,
  CreateExpenseInput,
  UpdateExpenseInput,
  ExpenseShare,
  AddExpenseShareInput,
  Receipt,
  AddReceiptInput,
} from './expense';
export { EXPENSE_TABLE, EXPENSE_SHARES_TABLE, RECEIPT_TABLE } from './expense';

// Template models
export type {
  Template,
  CreateTemplateInput,
  UpdateTemplateInput,
} from './template';
export { TEMPLATE_TABLE } from './template';
