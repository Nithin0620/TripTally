# TripTally Backend Infrastructure

Complete production-ready backend for the TripTally travel app using Next.js API routes with full role-based access control and cloud integrations.

## 📁 Folder Structure

```
src/
├── app/api/           # Next.js API routes
│   └── trips/         # Trip endpoints
│       ├── route.ts                    POST/GET /api/trips
│       ├── my-trips/route.ts           GET /api/trips/my-trips
│       ├── [tripId]/
│       │   ├── route.ts               GET/PATCH/DELETE /api/trips/[tripId]
│       │   ├── members/
│       │   │   ├── route.ts           POST/GET /api/trips/[tripId]/members
│       │   │   └── [memberId]/route.ts  PATCH/DELETE member
│       │   ├── activities/
│       │   │   ├── route.ts           POST/GET activities
│       │   │   └── [activityId]/route.ts  GET/PATCH/DELETE activity
│       │   └── expenses/
│       │       ├── route.ts           POST/GET expenses
│       │       ├── [expenseId]/
│       │       │   ├── route.ts       GET/PATCH/DELETE expense
│       │       │   └── shares/route.ts  POST/GET shares
│       │       └── settlements/summary/route.ts  GET settlements
│
├── config/           # Configuration files
│   ├── supabase.ts   # Supabase client setup
│   ├── cloudinary.ts # Cloudinary file upload config
│   └── nodemailer.ts # Email transporter + templates
│
├── services/         # Database operations
│   ├── userService.ts      # User queries
│   ├── tripService.ts      # Trip queries
│   ├── activityService.ts  # Activity queries
│   └── expenseService.ts   # Expense queries
│
├── lib/              # Utilities
│   ├── api-helpers.ts   # Auth helpers, response formatters
│   ├── database.ts      # Database utilities
│   └── supabase.ts      # Supabase client
│
└── utils/            # Helper functions
    └── responses.ts   # Response formatting, validation
```

## 🔧 Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase project
- Cloudinary account
- Gmail account (for email)

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup

Execute the SQL schema in [schema.sql](./schema.sql) in your Supabase SQL editor:

```sql
-- Run all tables setup (copy entire schema.sql content)
```

### 3. Environment Variables

Create `.env.local`:

```bash
cp .env.example .env.local
```

Configure values:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
SUPABASE_JWT_SECRET=your_secret_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=xxxxx
CLOUDINARY_API_KEY=xxxxx
CLOUDINARY_API_SECRET=xxxxx

# Email (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your_app_password  # Use Gmail app password, not account password

# Server
PORT=3000
NODE_ENV=development
```

### 4. Run Development Server

```bash
npm run dev
```

- Frontend: `http://localhost:3000`
- API Routes: `http://localhost:3000/api/...`

## 🔐 Authentication & Authorization

### JWT Authentication

All protected routes require an `Authorization` header with Supabase JWT:

```bash
Authorization: Bearer <JWT_TOKEN_FROM_SUPABASE>
```

Implementation: `src/lib/api-helpers.ts`

### Role-Based Access Control (RBAC)

Three roles per trip:

| Role   | Permissions                        |
|--------|-----------------------------------|
| owner  | Full access (edit, delete, manage members) |
| editor | Modify activities & expenses      |
| viewer | Read-only access                  |

Usage in route handlers:

```typescript
// Check user's trip role
const userRole = await getUserTripRole(params.tripId, user.id);

if (!['owner', 'editor'].includes(userRole || '')) {
  return forbiddenResponse('Insufficient permissions');
}
```

## 📡 API Endpoints

All endpoints use `/api/` prefix and require `Authorization: Bearer <JWT>` header.

### Trips

```
POST   /api/trips                    Create trip
GET    /api/trips                    Get trips
GET    /api/trips/my-trips           Get user's trips
GET    /api/trips/:tripId            Get trip details
PATCH  /api/trips/:tripId            Update trip (owner)
DELETE /api/trips/:tripId            Delete trip (owner)

POST   /api/trips/:tripId/members    Add member (owner)
GET    /api/trips/:tripId/members    Get members
PATCH  /api/trips/:tripId/members/:memberId    Update member role (owner)
DELETE /api/trips/:tripId/members/:memberId    Remove member (owner)
```

### Activities

```
POST   /api/trips/:tripId/activities/:activityId          Create activity (editor)
GET    /api/trips/:tripId/activities                       Get trip activities
GET    /api/trips/:tripId/activities/:activityId           Get activity details
PATCH  /api/trips/:tripId/activities/:activityId           Update activity (editor)
DELETE /api/trips/:tripId/activities/:activityId           Delete activity (editor)
```

### Expenses

```
POST   /api/trips/:tripId/expenses                         Create expense (editor)
GET    /api/trips/:tripId/expenses                         Get trip expenses
GET    /api/trips/:tripId/expenses/:expenseId              Get expense details
PATCH  /api/trips/:tripId/expenses/:expenseId              Update expense (editor)
DELETE /api/trips/:tripId/expenses/:expenseId              Delete expense (editor)

POST   /api/trips/:tripId/expenses/:expenseId/shares       Add share
GET    /api/trips/:tripId/expenses/:expenseId/shares       Get shares

GET    /api/trips/:tripId/expenses/settlements/summary     Get settlements
```

## 📧 Email Integration

Automatic emails sent via Nodemailer (Gmail SMTP):

- **Trip Invitations**: When adding members
- **Expense Notifications**: When expenses are created

Configure in `src/config/nodemailer.ts`

## 📦 Cloudinary Integration

Upload and optimize images:

```typescript
import { uploadFile, getOptimizedImageUrl } from '@/config/cloudinary';

const result = await uploadFile('/path/to/image.jpg', 'triptally/trips');
const optimized = getOptimizedImageUrl(result.publicId, { 
  width: 800, 
  height: 600 
});
```

## 🎨 Service Functions

All services in `src/services/` provide database abstraction. Use in route handlers:

### User Service

```typescript
import * as userService from '@/services/userService';

const user = await userService.getUserById(userId);
await userService.updateUser(userId, { profile_image: 'url' });
```

### Trip Service

```typescript
import * as tripService from '@/services/tripService';

const trip = await tripService.createTrip({
  title: 'Paris Trip',
  start_date: '2024-06-10',
  end_date: '2024-06-20',
  created_by: userId
});

await tripService.addTripMember(tripId, newUserId, 'editor');
const members = await tripService.getTripMembers(tripId);
```

### Activity Service

```typescript
import * as activityService from '@/services/activityService';

const activities = await activityService.getTripActivities(tripId);
await activityService.updateActivity(activityId, { title: 'Updated' });
```

### Expense Service

```typescript
import * as expenseService from '@/services/expenseService';

const expense = await expenseService.createExpense({
  trip_id: tripId,
  title: 'Dinner',
  amount: 150,
  paid_by: userId,
  split_type: 'equal'
});

const settlements = await expenseService.getExpenseSettlements(tripId);
```

## 📋 Database Tables

| Table | Purpose |
|-------|---------|
| users | User accounts |
| trips | Trip metadata |
| trip_members | User-trip relationships + roles |
| activities | Trip activities/itinerary |
| expenses | Trip expenses |
| expense_shares | Expense split records |
| receipts | Expense receipts (for OCR) |
| templates | Trip templates |

All tables have proper foreign keys with cascading deletes to maintain data integrity.

## 🔒 Security Best Practices

- ✅ JWT validation on all protected routes via `authenticateRequest()`
- ✅ Role-based access control per trip in route handlers
- ✅ Cascading deletes prevent orphaned records
- ✅ Input validation & sanitization in utilities
- ✅ CORS enabled for Next.js frontend
- ✅ Sensitive error messages in development only
- ✅ Environment variables for secrets
- ✅ Service role key kept server-side only

## 🧪 Testing Endpoints

### Health Check

```bash
curl http://localhost:3000/api/health
```

### Create Trip (with JWT)

```bash
curl -X POST http://localhost:3000/api/trips \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Summer Vacation",
    "start_date": "2024-07-01",
    "end_date": "2024-07-15"
  }'
```

### Get User's Trips

```bash
curl http://localhost:3000/api/trips/my-trips \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

## 📝 Response Format

### Success Response

```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation successful"
}
```

### Error Response

```json
{
  "error": "Descriptive error message"
}
```

## 🚀 Deployment

### Build

```bash
npm run build
```

### Start Production

```bash
npm start
```

Environment setup for production:

```env
NODE_ENV=production
SUPABASE_SERVICE_ROLE_KEY=<prod_key>
CLOUDINARY_API_SECRET=<prod_secret>
EMAIL_PASSWORD=<app_password>
```

## 🔄 Frontend Integration

Use `fetch` with auth token from Supabase:

```typescript
const response = await fetch('/api/trips', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'Trip Name',
    start_date: '2024-07-01',
    end_date: '2024-07-15'
  })
});

const { data } = await response.json();
```

## 📚 Next Steps

1. ✅ Set up Supabase database with schema
2. ✅ Configure environment variables in `.env.local`
3. ✅ Install dependencies (`npm install`)
4. ✅ Run development server (`npm run dev`)
5. ✅ Test API endpoints with JWT tokens
6. 📍 Integrate with React components in `src/app/`
7. 📍 Add real-time updates via SWR or TanStack Query
8. 📍 Implement file uploads to Cloudinary

---

Built with Next.js 14, TypeScript, Supabase, Cloudinary, and Nodemailer for modern travel app backend.
