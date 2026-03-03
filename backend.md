# TripTally Backend API Documentation

## Table of Contents
- [Overview](#overview)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
  - [System](#system)
  - [Authentication](#authentication-endpoints)
  - [Trips](#trips)
  - [Expenses](#expenses)
  - [Activities](#activities)
  - [Settlement](#settlement)
  - [Receipts](#receipts)
  - [Templates](#templates)
  - [Explore](#explore)

---

## Overview

**Base URL**: `/api`  
**Technology Stack**: Next.js 13+ App Router, Supabase, TypeScript  
**Authentication**: JWT tokens stored in HTTP-only cookies  
**Database**: PostgreSQL (via Supabase)

---

## Authentication

Most endpoints require authentication via JWT token. The token can be provided in two ways:
1. **HTTP-only Cookie** (preferred): `auth_token` cookie
2. **Authorization Header** (fallback): `Authorization: Bearer <token>`

### Authentication Response Codes
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Valid token but insufficient permissions
- `503 Service Unavailable`: Database connection issues

---

## API Endpoints

### System

#### Health Check
```
GET /api
```

**Description**: Check API health and database connection status

**Authentication**: None

**Response**:
```json
{
  "message": "TripTally API is running",
  "version": "1.0.0",
  "db": "connected"
}
```

---

## Authentication Endpoints

### Register User

```
POST /api/auth/register
```

**Description**: Create a new user account with email and password

**Authentication**: None

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Validations**:
- All fields are required
- Password must be at least 6 characters
- Email must be unique

**Success Response** (201):
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "profile_image": null,
    "created_at": "2026-03-03T00:00:00Z"
  },
  "token": "jwt_token_string"
}
```

**Error Responses**:
- `400 Bad Request`: Missing fields or password too short
- `409 Conflict`: Email already registered
- `500 Internal Server Error`: Database error
- `503 Service Unavailable`: Upstream SSL failure

**Cookie Set**: Sets `auth_token` HTTP-only cookie

---

### Login

```
POST /api/auth/login
```

**Description**: Authenticate user with email and password

**Authentication**: None

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response** (200):
```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "user@example.com",
    "profile_image": "url_or_null"
  },
  "token": "jwt_token_string"
}
```

**Error Responses**:
- `400 Bad Request`: Missing email or password
- `401 Unauthorized`: Invalid credentials
- `503 Service Unavailable`: Database connection issues

**Cookie Set**: Sets `auth_token` HTTP-only cookie

---

### Google OAuth Login

```
POST /api/auth/google
```

**Description**: Authenticate user using Google OAuth token. Creates user if doesn't exist.

**Authentication**: None

**Request Body**:
```json
{
  "googleToken": "google_id_token_string"
}
```

**Success Response** (200):
```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "user@gmail.com",
    "profile_image": "google_profile_url"
  },
  "token": "jwt_token_string"
}
```

**Error Responses**:
- `400 Bad Request`: Missing googleToken
- `401 Unauthorized`: Invalid Google token
- `500 Internal Server Error`: Failed to create/fetch user
- `503 Service Unavailable`: Database issues

**Cookie Set**: Sets `auth_token` HTTP-only cookie

---

### Logout

```
POST /api/auth/logout
```

**Description**: Clear authentication session

**Authentication**: None (but clears cookie)

**Success Response** (200):
```json
{
  "message": "Logged out successfully"
}
```

**Cookie Set**: Clears `auth_token` cookie

---

### Get Session

```
GET /api/auth/session
```

**Description**: Retrieve current user session from cookie

**Authentication**: Optional (returns null if not authenticated)

**Success Response** (200):
```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "user@example.com",
    "profile_image": "url_or_null",
    "created_at": "2026-03-03T00:00:00Z"
  },
  "authenticated": true
}
```

**Not Authenticated Response** (200):
```json
{
  "user": null
}
```

---

### Verify Token

```
POST /api/auth/verify
```

**Description**: Verify JWT token validity and extract user information

**Authentication**: Required (from cookie or Authorization header)

**Success Response** (200):
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "profile_image": "url_or_null",
    "created_at": "2026-03-03T00:00:00Z"
  }
}
```

**Error Responses**:
- `401 Unauthorized`: No token provided or invalid token

---

## Trips

### List User Trips

```
GET /api/trips
```

**Description**: Get all trips the authenticated user owns or is a member of

**Authentication**: Required

**Success Response** (200):
```json
{
  "trips": [
    {
      "id": "uuid",
      "title": "Goa Trip 2026",
      "description": "Beach vacation with friends",
      "start_date": "2026-06-01",
      "end_date": "2026-06-10",
      "cover_image": "url_or_null",
      "created_by": "user_uuid",
      "created_at": "2026-03-03T00:00:00Z",
      "role": "owner"
    }
  ]
}
```

**Error Responses**:
- `401 Unauthorized`: Not authenticated
- `500 Internal Server Error`: Database error

---

### Create Trip

```
POST /api/trips
```

**Description**: Create a new trip

**Authentication**: Required

**Request Body**:
```json
{
  "title": "Goa Trip 2026",
  "description": "Beach vacation with friends",
  "start_date": "2026-06-01",
  "end_date": "2026-06-10",
  "cover_image": "https://example.com/image.jpg"
}
```

**Required Fields**: `title`, `start_date`, `end_date`

**Success Response** (201):
```json
{
  "trip": {
    "id": "uuid",
    "title": "Goa Trip 2026",
    "description": "Beach vacation with friends",
    "start_date": "2026-06-01",
    "end_date": "2026-06-10",
    "cover_image": "https://example.com/image.jpg",
    "created_by": "user_uuid",
    "created_at": "2026-03-03T00:00:00Z"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Missing required fields
- `401 Unauthorized`: Not authenticated
- `500 Internal Server Error`: Failed to create trip

---

### Get Trip Details

```
GET /api/trips/[tripId]
```

**Description**: Get detailed information about a specific trip including members

**Authentication**: Required

**URL Parameters**:
- `tripId`: UUID of the trip

**Access Control**: User must be trip owner or member

**Success Response** (200):
```json
{
  "trip": {
    "id": "uuid",
    "title": "Goa Trip 2026",
    "description": "Beach vacation",
    "start_date": "2026-06-01",
    "end_date": "2026-06-10",
    "cover_image": "url",
    "created_by": "user_uuid",
    "created_at": "2026-03-03T00:00:00Z"
  },
  "members": [
    {
      "user_id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "profile_image": "url",
      "role": "owner"
    }
  ]
}
```

**Error Responses**:
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: No access to this trip
- `500 Internal Server Error`: Database error

---

### Update Trip

```
PUT /api/trips/[tripId]
```

**Description**: Update trip details

**Authentication**: Required

**URL Parameters**:
- `tripId`: UUID of the trip

**Access Control**: Only trip owner can update

**Request Body** (all fields optional):
```json
{
  "title": "Updated Trip Title",
  "description": "Updated description",
  "start_date": "2026-06-05",
  "end_date": "2026-06-15",
  "cover_image": "https://example.com/new-image.jpg"
}
```

**Success Response** (200):
```json
{
  "trip": {
    "id": "uuid",
    "title": "Updated Trip Title",
    "description": "Updated description",
    "start_date": "2026-06-05",
    "end_date": "2026-06-15",
    "cover_image": "https://example.com/new-image.jpg",
    "created_by": "user_uuid",
    "updated_at": "2026-03-03T00:00:00Z"
  }
}
```

**Error Responses**:
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Only owner can update trip
- `500 Internal Server Error`: Update failed

---

### Delete Trip

```
DELETE /api/trips/[tripId]
```

**Description**: Delete a trip permanently

**Authentication**: Required

**URL Parameters**:
- `tripId`: UUID of the trip

**Access Control**: Only trip owner can delete

**Success Response** (200):
```json
{
  "message": "Trip deleted successfully"
}
```

**Error Responses**:
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Only owner can delete trip
- `500 Internal Server Error`: Deletion failed

---

### Invite User to Trip

```
POST /api/trips/invite
```

**Description**: Send email invitation to join a trip

**Authentication**: Required

**Request Body**:
```json
{
  "tripId": "uuid",
  "email": "friend@example.com"
}
```

**Access Control**: Only trip owner can send invites

**Success Response** (200):
```json
{
  "message": "Invitation sent successfully",
  "invite": {
    "id": "uuid",
    "trip_id": "uuid",
    "email": "friend@example.com",
    "status": "pending",
    "created_at": "2026-03-03T00:00:00Z"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Missing tripId or email, invalid email format
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not trip owner
- `409 Conflict`: User already invited or is member
- `500 Internal Server Error`: Failed to send invitation

**Email Requirement**: Requires SMTP configuration (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS)

---

## Expenses

### Create Expense

```
POST /api/expenses
```

**Description**: Create a new expense with automatic split calculation

**Authentication**: Required

**Request Body**:
```json
{
  "trip_id": "uuid",
  "title": "Hotel Booking",
  "amount": 5000.00,
  "paid_by": "user_uuid",
  "split_type": "equal",
  "involved_members": ["user_uuid_1", "user_uuid_2"],
  "percentages": {},
  "custom_shares": {},
  "notes": "3 nights at beach resort",
  "category": "accommodation"
}
```

**Required Fields**: `trip_id`, `title`, `amount`, `paid_by`, `split_type`, `involved_members`

**Split Types**:
- `equal`: Split equally among all involved members
- `percentage`: Split by custom percentages (provide `percentages` object)
- `custom`: Split by custom amounts (provide `custom_shares` object)

**Categories**: `food`, `accommodation`, `transport`, `activities`, `shopping`, `general`

**Access Control**: User must have edit access to trip

**Success Response** (201):
```json
{
  "data": {
    "expense": {
      "id": "uuid",
      "trip_id": "uuid",
      "title": "Hotel Booking",
      "amount": 5000.00,
      "paid_by": "user_uuid",
      "split_type": "equal",
      "category": "accommodation",
      "notes": "3 nights at beach resort",
      "created_at": "2026-03-03T00:00:00Z"
    },
    "shares": [
      {
        "user_id": "user_uuid_1",
        "share_amount": 2500.00
      },
      {
        "user_id": "user_uuid_2",
        "share_amount": 2500.00
      }
    ]
  }
}
```

**Error Responses**:
- `400 Bad Request`: Missing fields, invalid split_type, or split validation errors
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: No edit access to trip
- `500 Internal Server Error`: Failed to create expense

---

### List Trip Expenses

```
GET /api/expenses?tripId=[tripId]
```

**Description**: Get all expenses for a specific trip

**Authentication**: Required

**Query Parameters**:
- `tripId` (required): UUID of the trip

**Access Control**: User must have view access to trip

**Success Response** (200):
```json
{
  "expenses": [
    {
      "id": "uuid",
      "trip_id": "uuid",
      "title": "Hotel Booking",
      "amount": 5000.00,
      "paid_by": "user_uuid",
      "split_type": "equal",
      "category": "accommodation",
      "notes": "3 nights",
      "created_at": "2026-03-03T00:00:00Z",
      "shares": [
        {
          "user_id": "user_uuid_1",
          "share_amount": 2500.00
        }
      ]
    }
  ]
}
```

**Error Responses**:
- `400 Bad Request`: Missing tripId parameter
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: No view access to trip
- `500 Internal Server Error`: Failed to fetch expenses

---

### Update Expense

```
PUT /api/expenses
```

**Description**: Update an existing expense

**Authentication**: Required

**Request Body**:
```json
{
  "id": "expense_uuid",
  "trip_id": "trip_uuid",
  "title": "Updated Title",
  "amount": 6000.00,
  "paid_by": "user_uuid",
  "split_type": "equal",
  "category": "accommodation",
  "shares": []
}
```

**Required Fields**: `id`, `trip_id`

**Access Control**: User must have edit access to trip

**Success Response** (200):
```json
{
  "expense": {
    "id": "uuid",
    "title": "Updated Title",
    "amount": 6000.00,
    "updated_at": "2026-03-03T00:00:00Z"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Missing required fields
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: No edit access
- `500 Internal Server Error`: Update failed

---

### Delete Expense

```
DELETE /api/expenses
```

**Description**: Delete an expense

**Authentication**: Required

**Request Body**:
```json
{
  "id": "expense_uuid",
  "trip_id": "trip_uuid"
}
```

**Access Control**: User must have edit access to trip

**Success Response** (200):
```json
{
  "message": "Expense deleted successfully"
}
```

**Error Responses**:
- `400 Bad Request`: Missing fields
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: No edit access
- `500 Internal Server Error`: Deletion failed

---

## Activities

### Create Activity

```
POST /api/activities
```

**Description**: Create a new activity/itinerary item for a trip

**Authentication**: Required

**Request Body**:
```json
{
  "trip_id": "uuid",
  "title": "Beach Visit",
  "activity_date": "2026-06-02",
  "location": "Baga Beach, Goa",
  "latitude": 15.5567,
  "longitude": 73.7516,
  "notes": "Morning beach activities",
  "order_index": 1
}
```

**Required Fields**: `trip_id`, `title`, `activity_date`

**Access Control**: User must have edit access to trip

**Success Response** (201):
```json
{
  "activity": {
    "id": "uuid",
    "trip_id": "uuid",
    "title": "Beach Visit",
    "activity_date": "2026-06-02",
    "location": "Baga Beach, Goa",
    "latitude": 15.5567,
    "longitude": 73.7516,
    "notes": "Morning beach activities",
    "order_index": 1,
    "created_at": "2026-03-03T00:00:00Z"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Missing required fields
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: No edit access
- `500 Internal Server Error`: Failed to create activity

---

### Update Activity

```
PUT /api/activities
```

**Description**: Update an existing activity

**Authentication**: Required

**Request Body** (id and trip_id required, others optional):
```json
{
  "id": "activity_uuid",
  "trip_id": "trip_uuid",
  "title": "Updated Activity",
  "activity_date": "2026-06-03",
  "location": "New Location",
  "latitude": 15.5567,
  "longitude": 73.7516,
  "notes": "Updated notes",
  "order_index": 2
}
```

**Access Control**: User must have edit access to trip

**Success Response** (200):
```json
{
  "activity": {
    "id": "uuid",
    "title": "Updated Activity",
    "updated_at": "2026-03-03T00:00:00Z"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Missing id or trip_id
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: No edit access
- `500 Internal Server Error`: Update failed

---

### Delete Activity

```
DELETE /api/activities
```

**Description**: Delete an activity

**Authentication**: Required

**Request Body**:
```json
{
  "id": "activity_uuid",
  "trip_id": "trip_uuid"
}
```

**Access Control**: User must have edit access to trip

**Success Response** (200):
```json
{
  "message": "Activity deleted successfully"
}
```

**Error Responses**:
- `400 Bad Request`: Missing fields
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: No edit access
- `500 Internal Server Error`: Deletion failed

---

## Settlement

### Calculate Trip Settlements

```
GET /api/settlement/[tripId]
```

**Description**: Calculate optimized debt settlements for a trip based on all expenses

**Authentication**: Required

**URL Parameters**:
- `tripId`: UUID of the trip

**Access Control**: User must have view access to trip

**Success Response** (200):
```json
{
  "settlements": [
    {
      "from": "user_uuid_1",
      "to": "user_uuid_2",
      "amount": 1500.00,
      "fromName": "John Doe",
      "toName": "Jane Smith"
    }
  ],
  "balances": {
    "user_uuid_1": -1500.00,
    "user_uuid_2": 1500.00
  },
  "summary": {
    "totalSettlements": 1,
    "totalAmount": 1500.00
  }
}
```

**Balance Interpretation**:
- Negative balance: User owes money
- Positive balance: User is owed money
- Zero balance: User is settled up

**Error Responses**:
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: No view access to trip
- `500 Internal Server Error`: Calculation failed

---

## Receipts

### Upload Receipt

```
POST /api/receipts
```

**Description**: Upload receipt image for an expense (uses Cloudinary)

**Authentication**: Required

**Content-Type**: `multipart/form-data`

**Form Data**:
- `file`: Image file (required)
- `expenseId`: UUID of the expense (required)
- `tripId`: UUID of the trip (required)

**Access Control**: User must have edit access to trip

**Success Response** (201):
```json
{
  "receipt": {
    "id": "uuid",
    "expense_id": "uuid",
    "image_url": "https://res.cloudinary.com/...",
    "extracted_text": null,
    "created_at": "2026-03-03T00:00:00Z"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Missing file, expenseId, or tripId
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: No edit access to trip
- `500 Internal Server Error`: Upload failed

**External Services**: Requires Cloudinary configuration

---

### Delete Receipt

```
DELETE /api/receipts
```

**Description**: Delete a receipt image

**Authentication**: Required

**Request Body**:
```json
{
  "receiptId": "uuid",
  "tripId": "uuid"
}
```

**Access Control**: User must have edit access to trip

**Success Response** (200):
```json
{
  "message": "Receipt deleted successfully"
}
```

**Error Responses**:
- `400 Bad Request`: Missing receiptId or tripId
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: No edit access to trip
- `500 Internal Server Error`: Deletion failed

---

## Templates

### Create Template

```
POST /api/templates
```

**Description**: Create a trip template for reuse

**Authentication**: Required

**Request Body**:
```json
{
  "title": "Goa Beach Trip Template",
  "location": "Goa, India",
  "days": 7,
  "budget_range": "₹15,000 - ₹25,000",
  "is_public": true
}
```

**Required Fields**: `title`

**Success Response** (201):
```json
{
  "template": {
    "id": "uuid",
    "title": "Goa Beach Trip Template",
    "location": "Goa, India",
    "days": 7,
    "budget_range": "₹15,000 - ₹25,000",
    "is_public": true,
    "created_by": "user_uuid",
    "created_at": "2026-03-03T00:00:00Z"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Missing title
- `401 Unauthorized`: Not authenticated
- `500 Internal Server Error`: Failed to create template

---

### List Templates

```
GET /api/templates?includePrivate=[true|false]
```

**Description**: Get list of trip templates

**Authentication**: None (public templates) / Optional (include private)

**Query Parameters**:
- `includePrivate` (optional): Set to "true" to include private templates (default: false)

**Success Response** (200):
```json
{
  "templates": [
    {
      "id": "uuid",
      "title": "Goa Beach Trip Template",
      "location": "Goa, India",
      "days": 7,
      "budget_range": "₹15,000 - ₹25,000",
      "is_public": true,
      "created_by": "user_uuid",
      "created_at": "2026-03-03T00:00:00Z",
      "users": {
        "id": "user_uuid",
        "name": "John Doe",
        "email": "john@example.com",
        "profile_image": "url"
      }
    }
  ]
}
```

**Error Responses**:
- `500 Internal Server Error`: Failed to fetch templates

---

## Explore

### Generate AI Destinations by Category

```
POST /api/explore/generate
```

**Description**: Generate AI-powered travel destination recommendations for a category

**Authentication**: None

**Request Body**:
```json
{
  "category": "Beaches"
}
```

**Valid Categories**: `Beaches`, `Mountains`, `Cities`, `Spiritual`, `Luxury`

**Success Response** (200):
```json
{
  "places": [
    {
      "id": "ai-1234567890-0",
      "name": "Goa",
      "category": "Beaches",
      "state": "Goa",
      "description": "Detailed 200+ word description...",
      "best_time_to_visit": "November to February",
      "avg_budget": "₹1,500 - ₹3,000 per day",
      "travel_duration": "3-4 days",
      "hero_image": "https://images.unsplash.com/...",
      "gallery_images": ["url1", "url2", ...]
    }
  ],
  "success": true
}
```

**Error Response** (400):
```json
{
  "places": [],
  "success": false,
  "error": "Invalid category. Must be one of: Beaches, Mountains, Cities, Spiritual, Luxury"
}
```

**External Services**: Uses Groq API (requires GROQ_API_KEY)

---

### Generate AI Place Details

```
POST /api/explore/generate-place
```

**Description**: Generate detailed travel guide for a specific place using AI. Results are cached in database.

**Authentication**: None

**Request Body**:
```json
{
  "placeName": "Jaipur"
}
```

**Success Response** (200):
```json
{
  "place": {
    "id": "uuid",
    "name": "Jaipur",
    "category": "Cities",
    "state": "Rajasthan",
    "description": "Detailed description...",
    "best_time_to_visit": "October to March",
    "avg_budget": "₹2,000 - ₹4,000 per day",
    "travel_duration": "3-5 days",
    "hero_image": "https://images.unsplash.com/...",
    "gallery_images": ["url1", "url2", ...],
    "created_at": "2026-03-03T00:00:00Z"
  },
  "cached": false,
  "success": true
}
```

**Cached Response**: If place already exists in database, returns immediately with `"cached": true`

**Error Responses**:
- `400 Bad Request`: Missing or invalid placeName
- `500 Internal Server Error`: AI generation failed or missing images

**External Services**: 
- Groq API (AI content generation)
- Unsplash API (images)

---

### Get Place by Name

```
GET /api/explore/place/[name]
```

**Description**: Fetch place details from database by name (slug format)

**Authentication**: None

**URL Parameters**:
- `name`: Place name in slug format (e.g., "goa", "jaipur", "new-delhi")

**Success Response** (200):
```json
{
  "id": "uuid",
  "name": "Goa",
  "category": "Beaches",
  "state": "Goa",
  "description": "Description...",
  "best_time_to_visit": "November to February",
  "avg_budget": "₹1,500 - ₹3,000 per day",
  "travel_duration": "3-4 days",
  "hero_image": "url",
  "gallery_images": ["url1", "url2"],
  "created_at": "2026-03-03T00:00:00Z"
}
```

**Error Responses**:
- `400 Bad Request`: Missing place name
- `404 Not Found`: Place not found in database
- `500 Internal Server Error`: Database error
- `503 Service Unavailable`: Database connection issues

---

### Get Places by Category

```
GET /api/explore/places?category=[category]&offset=[offset]&limit=[limit]
```

**Description**: Fetch places by category with pagination (database only, no AI calls)

**Authentication**: None

**Query Parameters**:
- `category` (required): Category name (any category in database)
- `offset` (optional, default: 0): Number of places to skip
- `limit` (optional, default: 4): Number of places per page (max: 100)

**Success Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Goa",
      "category": "Beaches",
      "state": "Goa",
      "description": "Description...",
      "hero_image": "url",
      "created_at": "2026-03-03T00:00:00Z"
    }
  ],
  "pagination": {
    "limit": 4,
    "offset": 0,
    "total": 15,
    "hasMore": true
  }
}
```

**Error Responses**:
- `400 Bad Request`: Missing category or invalid offset/limit
- `500 Internal Server Error`: Database error

---

### Search Places

```
GET /api/explore/search?q=[query]&category=[category]
```

**Description**: Search for places with database-first, AI-fallback strategy. If not found, generates new place with AI and saves to database.

**Authentication**: None

**Rate Limiting**: 20 requests per minute per IP

**Query Parameters**:
- `q` (required): Search query (2-200 characters)
- `category` (optional): Category hint for AI generation if needed

**Success Response - Found in Database** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Goa",
      "category": "Beaches",
      "description": "Description...",
      "hero_image": "url"
    }
  ],
  "source": "database",
  "message": "Found 1 place(s) matching your search."
}
```

**Success Response - AI Generated** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Generated Place",
      "category": "Mountains",
      "description": "AI-generated description...",
      "hero_image": "url"
    }
  ],
  "source": "ai",
  "message": "Generated new place for your search."
}
```

**Error Responses**:
- `400 Bad Request`: Missing query, query too short/long
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Search failed

**External Services**: Groq API, Unsplash API (for AI fallback)

---

### Get All Categories

```
GET /api/explore/categories
```

**Description**: Fetch all unique categories with preview places

**Authentication**: None

**Success Response** (200):
```json
[
  {
    "category": "Beaches",
    "places": [
      {
        "id": "uuid",
        "name": "Goa",
        "state": "Goa",
        "hero_image": "url"
      }
    ],
    "hasMore": true
  },
  {
    "category": "Mountains",
    "places": [...],
    "hasMore": false
  }
]
```

**Response Details**:
- Returns up to 2 places per category as preview
- `hasMore`: true if category has more than 2 places

**Error Responses**:
- `500 Internal Server Error`: Failed to fetch categories

---

### Get Famous Places for Map

```
GET /api/explore/famous-places
```

**Description**: Fetch famous places with coordinates for map visualization

**Authentication**: None

**Success Response** (200):
```json
{
  "places": [
    {
      "id": "uuid",
      "name": "Taj Mahal",
      "state": "Uttar Pradesh",
      "latitude": 27.1751,
      "longitude": 78.0421,
      "hero_image": "url"
    }
  ]
}
```

**Error Response** (200):
```json
{
  "places": []
}
```

---

## Error Response Format

All error responses follow this general format:

```json
{
  "error": "Error message describing what went wrong"
}
```

Some endpoints may include additional fields:
```json
{
  "error": "Detailed error message",
  "hint": "Suggestion for fixing the issue",
  "errorType": "ERROR_CATEGORY"
}
```

## Common HTTP Status Codes

- **200 OK**: Request succeeded
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid request parameters
- **401 Unauthorized**: Authentication required or invalid
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **409 Conflict**: Resource already exists
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server-side error
- **503 Service Unavailable**: External service unavailable

---

## Environment Variables Required

### Database
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key (server-side only)

### Authentication
- `JWT_SECRET`: Secret key for JWT token signing

### External Services
- `GROQ_API_KEY`: Groq API key for AI content generation
- `GROQ_MODEL`: Groq model name (default: llama-3.3-70b-versatile)
- `UNSPLASH_ACCESS_KEY`: Unsplash API key for images
- `CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name
- `CLOUDINARY_API_KEY`: Cloudinary API key
- `CLOUDINARY_API_SECRET`: Cloudinary API secret

### Email (for invitations)
- `SMTP_HOST`: SMTP server hostname
- `SMTP_PORT`: SMTP server port
- `SMTP_SECURE`: Use SSL/TLS (true/false)
- `SMTP_USER`: SMTP username
- `SMTP_PASS`: SMTP password

---

## Database Schema Overview

### Core Tables
- **users**: User accounts
- **auth_passwords**: Password hashes (separate from users for security)
- **trips**: Trip information
- **trip_members**: Trip membership and roles
- **trip_invites**: Pending trip invitations
- **expenses**: Expense records
- **expense_shares**: Individual expense splits
- **activities**: Trip activities/itinerary
- **receipts**: Receipt images for expenses
- **templates**: Trip templates
- **places**: Travel destinations (cached AI-generated content)

### Key Relationships
- Users can create multiple trips
- Trips have multiple members with roles (owner/editor/viewer)
- Expenses belong to trips and have multiple shares
- Activities belong to trips
- Receipts belong to expenses
- Templates are created by users

---

**API Version**: 1.0.0  
**Last Updated**: March 3, 2026  
**Framework**: Next.js 13+ with App Router
