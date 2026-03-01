# TripTally Expense System - Complete Implementation Guide

## Overview

This document details the complete expense management system for TripTally, including split calculations, settlement optimization, and trip member invitations.

## Architecture

### Core Components

1. **Split Calculator** (`src/utils/splitCalculator.ts`)
   - Core financial logic engine
   - Validates and calculates expense splits
   - Supports 3 split types: equal, percentage, custom

2. **Settlement Optimizer** (`src/utils/settlementOptimizer.ts`)
   - Greedy algorithm for minimizing transactions
   - Calculates optimal payment plan
   - Reduces N² complexity to minimal settlement plan

3. **Expense Service** (`src/services/expense.service.ts`)
   - Business logic layer
   - Integration with Supabase
   - Production-grade error handling

4. **API Routes**
   - `/api/expenses` - Create, read, update, delete expenses
   - `/api/trips/invite` - Send email invitations

5. **UI Components**
   - Expense page with dashboard
   - Add expense modal
   - Balance summary
   - Settlement plan visualization
   - Member invitation section

## Features

### 1. Expense Splitting

#### Equal Split
- Divides amount equally among involved members
- Formula: `share = total_amount / number_of_members`
- Handles rounding to 2 decimals

#### Percentage Split
- Each member gets a percentage of total amount
- Validation: percentages must sum to 100% (±0.01 tolerance)
- Useful for unequal contributions

#### Custom Amount Split
- Each member gets specific rupee amount
- Validation: amounts must sum to total (±0.01 tolerance)
- Maximum flexibility for complex splits

### 2. Validation

#### SplitCalculatorInput Validation
```typescript
{
  amount > 0,
  paidByUserId specified,
  involved_members includes payer,
  involved_members not empty,
  percentages: sum to 100% (if percentage split),
  customShares: sum to total (if custom split)
}
```

#### Error Handling
- Clear, actionable error messages
- Returns error array with specific validation failures
- Client receives detailed feedback for user correction

### 3. Settlement Optimization

**Problem**: Multiple expenses create complex debts
**Solution**: Greedy algorithm to minimize transactions

**Example**:
```
Initial: A owes B ₹100, B owes C ₹50, C owes A ₹30
Result: B pays A ₹20, A pays C ₹30
(2 transactions instead of 3)
```

### 4. Email Invitations

- Invites non-members via email
- Generates time-limited invitation links (7 days)
- Nodemailer SMTP integration
- Secure authentication with JWT

## Database Schema

### expenses table
```sql
CREATE TABLE expenses (
  id UUID PRIMARY KEY,
  trip_id UUID NOT NULL,
  title TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  paid_by UUID NOT NULL,
  split_type TEXT CHECK (split_type IN ('equal', 'percentage', 'custom')),
  notes TEXT,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### expense_shares table
```sql
CREATE TABLE expense_shares (
  id UUID PRIMARY KEY,
  expense_id UUID NOT NULL,
  user_id UUID NOT NULL,
  share_amount DECIMAL(10, 2) NOT NULL,
  paid_amount DECIMAL(10, 2) DEFAULT 0,
  UNIQUE(expense_id, user_id)
)
```

### trip_invites table
```sql
CREATE TABLE trip_invites (
  id UUID PRIMARY KEY,
  trip_id UUID NOT NULL,
  email TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP,
  expires_at TIMESTAMP,
  created_by UUID NOT NULL,
  UNIQUE(trip_id, email) WHERE status = 'pending'
)
```

## Setup Instructions

### 1. Database Migrations

Run the migration file in Supabase SQL Editor:
```sql
-- File: supabase_expense_invites_migration.sql
```

This creates:
- `expenses` table
- `expense_shares` table
- `trip_invites` table
- RLS policies
- Indexes for performance

### 2. Environment Variables

Add to `.env.local`:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@triptally.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Testing

#### Test Equal Split
```bash
curl -X POST http://localhost:3000/api/expenses \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "trip_id": "trip_123",
    "title": "Dinner",
    "amount": 1200,
    "paid_by": "user_1",
    "split_type": "equal",
    "involved_members": ["user_1", "user_2", "user_3"]
  }'
```

#### Test Percentage Split
```bash
curl -X POST http://localhost:3000/api/expenses \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "trip_id": "trip_123",
    "title": "Accommodation",
    "amount": 5000,
    "paid_by": "user_1",
    "split_type": "percentage",
    "involved_members": ["user_1", "user_2"],
    "percentages": {
      "user_1": 60,
      "user_2": 40
    }
  }'
```

#### Test Custom Split
```bash
curl -X POST http://localhost:3000/api/expenses \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "trip_id": "trip_123",
    "title": "Transport",
    "amount": 1500,
    "paid_by": "user_1",
    "split_type": "custom",
    "involved_members": ["user_1", "user_2", "user_3"],
    "custom_shares": {
      "user_1": 500,
      "user_2": 700,
      "user_3": 300
    }
  }'
```

## Code Examples

### Creating an Expense (Frontend)

```typescript
import { createExpenseWithSplit } from '@/services/expense.service';

const { data, error } = await createExpenseWithSplit(
  tripId,
  'Dinner',
  1200,
  paidByUserId,
  'equal',
  [user1, user2, user3]
);

if (error) {
  showToast(error, 'error');
} else {
  console.log('Breakdown:', data.breakdown);
  // breakdown[i] = { userId, share, paid, owes }
}
```

### Calculating Settlement

```typescript
import { calculateTripSettlement } from '@/services/expense.service';

const { data, error } = await calculateTripSettlement(tripId);

if (!error && data) {
  // data.settlements = [
  //   { from, to, amount },
  //   { from, to, amount }
  // ]
  // Minimal transactions needed to settle all debts
}
```

### Sending Invitation

```typescript
const response = await fetch('/api/trips/invite', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    tripId,
    email: 'friend@example.com'
  })
});
```

## Security

### Authentication
- All endpoints require JWT authentication
- Token must be in `Authorization: Bearer TOKEN` header

### Authorization
- Users can only modify trips they created
- Users can only view trip expenses if they're members
- RLS policies enforce database-level security

### Email Validation
- Email format validated on both client and server
- Invitation emails include time-limited links
- Credentials never exposed in client code

### Financial Validation
- All amounts validated before database insert
- Split calculations verified with tolerance (0.01)
- Rounding handled consistently to 2 decimals

## Performance

### Indexes
- `idx_expenses_trip_id` - Fast trip expense lookup
- `idx_expenses_paid_by` - Fast payer lookup
- `idx_expense_shares_expense_id` - Fast share lookup
- `idx_trip_invites_trip_id` - Fast invite lookup
- `idx_trip_invites_email` - Fast email lookup

### Optimization
- Settlement algorithm: O(n log n) with greedy matching
- Minimal queries per operation
- Efficient join patterns in Supabase

## Common Issues & Solutions

### Issue: Percentages not summing to 100%
**Solution**: Add more granular percentage input or implement rounding adjustment

### Issue: Floating point precision errors
**Solution**: Using 0.01 tolerance for all financial comparisons

### Issue: Settlement creating too many transactions
**Solution**: Already handled by greedy algorithm in settlementOptimizer

### Issue: Email invitations not sending
**Solution**: 
1. Check SMTP credentials in `.env.local`
2. Verify SMTP_PORT matches (587 for TLS)
3. Check firewall/network blocking SMTP
4. Look for errors in server logs

## Next Steps

1. **Email Verification**: Add email verification for new members
2. **Recurring Expenses**: Support recurring expense patterns
3. **Receipt Uploads**: Allow photo receipt uploads
4. **PDF Export**: Generate expense reports as PDF
5. **Analytics**: Spending trends by category/member
6. **Budget Tracking**: Set spending limits per category

## Files Modified/Created

### New Files
- `src/app/expenses/[tripId]/page.tsx` - Main expenses page
- `src/components/expenses/AddExpenseModal.tsx` - Add expense form
- `src/components/expenses/ExpenseCard.tsx` - Expense display
- `src/components/expenses/BalanceSummary.tsx` - Balance view
- `src/components/expenses/InviteSection.tsx` - Invite UI
- `src/app/api/trips/invite/route.ts` - Email invitation API
- `supabase_expense_invites_migration.sql` - Database setup

### Modified Files
- `src/utils/splitCalculator.ts` - Completely rewritten with validation
- `src/services/expense.service.ts` - Added split calculator integration
- `src/lib/jwt.ts` - Added client-side token management
- `src/app/api/expenses/route.ts` - Updated to use new split calculator

## Support

For issues or questions:
1. Check error messages in browser console
2. Review Supabase logs for database errors
3. Check server logs for API errors
4. Verify all environment variables are set
5. Test individual components in isolation
