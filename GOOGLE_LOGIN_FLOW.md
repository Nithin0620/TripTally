# Complete Google Login Data Flow - TripTally

This document explains exactly how Google login works in TripTally, step by step.

---

## Overview Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       GOOGLE LOGIN COMPLETE FLOW                            │
└─────────────────────────────────────────────────────────────────────────────┘

Frontend (Browser)          Google OAuth               Backend (Next.js)        Database
     │                          │                             │                  │
     │─ Load Page ─────────────>│                             │                  │
     │                          │                             │                  │
     │<─ Return Token ──────────│                             │                  │
     │                          │                             │                  │
     │─ Send Token ──────────────────────────────────────────>│                  │
     │                          │                             │                  │
     │                          │      Verify Token with Google API              │
     │                          │─────────────────────────────>│                  │
     │                          │<─ Return User Info ─────────│                  │
     │                          │                             │                  │
     │                          │          Check/Create User  │                  │
     │                          │─────────────────────────────────────────────────>│
     │                          │                             │<─ Query ────────│
     │                          │                             │                  │
     │                          │         Create JWT Token    │                  │
     │                          │                             │                  │
     │<─ Return User + Token ────────────────────────────────│                  │
     │   (with Cookie Header)   │                             │                  │
     │                          │                             │                  │
     │ Store Token in Cookie    │                             │                  │
     │ (HTTP-only)              │                             │                  │
     │                          │                             │                  │
     │─ Fetch /api/auth/session ───────────────────────────────>│                  │
     │ (with Cookie)            │                             │                  │
     │                          │      Verify Token           │                  │
     │                          │      Get Fresh User Data    │                  │
     │                          │─────────────────────────────────────────────────>│
     │                          │                             │<─ Query ────────│
     │                          │                             │                  │
     │<─ Return User Data ────────────────────────────────────│                  │
     │                          │                             │                  │
     └──────────────────────────────────────────────────────────────────────────────
```

---

## Detailed Step-by-Step Flow

### STEP 1: PAGE LOADS (Frontend)

**File**: `src/app/login/page.tsx`

```typescript
// 1. Google script is already loaded in layout.tsx
<script async src="https://accounts.google.com/gsi/client"></script>

// 2. When login page mounts, this runs:
useEffect(() => {
  const initializeGoogleSignIn = () => {
    // Wait for Google script to load
    if (window.google && window.google.accounts && window.google.accounts.id) {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,  // Your Google Client ID
        callback: handleGoogleLogin,  // Callback function
        auto_select: false,
      });
    }
  };
  
  // Ensure initialization happens after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGoogleSignIn);
  } else {
    initializeGoogleSignIn();
  }
}, [handleGoogleLogin]);
```

**What Happens**:
- Google's OAuth library is loaded from CDN
- Initialize it with your Google Client ID
- Register the callback function that will be called when user authenticates

---

### STEP 2: USER CLICKS "CONTINUE WITH GOOGLE"

**File**: `src/app/login/page.tsx`

```typescript
<Button onClick={() => {
  if (window.google?.accounts?.id) {
    // Show Google's sign-in prompt
    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed()) {
        showToast('Please enable popups', 'error');
      }
    });
  }
}}>
  Continue with Google
</Button>
```

**What Happens**:
- Google shows a popup for user to select their Google account
- User enters credentials and authorizes your app
- Google creates a signed JWT credential token
- This token is passed to your callback function

---

### STEP 3: GOOGLE RETURNS CREDENTIAL TOKEN

**File**: `src/app/login/page.tsx`

```typescript
// This callback is called by Google with the credential
const handleGoogleLogin = useCallback(async (response: any) => {
  // response.credential = JWT Token from Google
  // Example: "eyJhbGciOiJSUzI1NiIsImtpZCI6IjEifQ.eyJpc3MiOiAiaHR0cHM6Ly9hY2NvdW50cy5nb29nbGUuY29tIiwgInd..."
  
  if (!response.credential) {
    showToast('Google sign-in failed', 'error');
    return;
  }

  setLoading(true);
  
  // Send this Google token to your backend
  const result = await loginWithGoogle(response.credential);
  
  if (result.error) {
    showToast(result.error, 'error');
  } else {
    showToast('Login successful!', 'success');
    router.push('/dashboard');
  }
  setLoading(false);
}, [loginWithGoogle, router, showToast]);
```

**Credentials Payload** (decoded, for reference):
```json
{
  "iss": "https://accounts.google.com",
  "azp": "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com",
  "aud": "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com",
  "sub": "1234567890",  // Google's unique user ID
  "email": "user@gmail.com",
  "email_verified": true,
  "name": "John Doe",
  "picture": "https://lh3.googleusercontent.com/...",
  "given_name": "John",
  "family_name": "Doe",
  "iat": 1234567890,
  "exp": 1234571490
}
```

---

### STEP 4: FRONTEND CALLS BACKEND WITH GOOGLE TOKEN

**File**: `src/contexts/AuthContext.tsx`

```typescript
const loginWithGoogle = async (googleToken: string) => {
  // Call your backend API
  const response = await authApi.googleLogin(googleToken);
  
  if (response.error) {
    return { error: response.error };
  }

  // Token is stored in HTTP-only cookie by the server
  await refreshSession();
  return {};
};
```

**What API Call Looks Like**:
```
POST /api/auth/google HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "googleToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjEifQ.eyJpc3MiOiAiaHR0cHM6Ly9hY2NvdW50cy5nb29nbGUuY29tIi..."
}
```

---

### STEP 5: BACKEND VERIFIES GOOGLE TOKEN

**File**: `src/app/api/auth/google/route.ts`

```typescript
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { googleToken } = body;  // Google's JWT token

    if (!googleToken) {
      return badRequestResponse('Missing googleToken');
    }

    // Step 5A: Verify token with Google's servers
    let payload;
    try {
      const googleResponse = await fetch(
        'https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=' + googleToken
      );
      
      if (!googleResponse.ok) {
        return unauthorizedResponse('Invalid Google token');
      }
      
      // payload now contains Google's verified user data
      payload = await googleResponse.json();
      // {
      //   email: "user@gmail.com",
      //   name: "John Doe",
      //   picture: "https://...",
      //   sub: "1234567890",
      //   ...
      // }
    } catch (error) {
      return unauthorizedResponse('Invalid Google token');
    }

    // Extract user info from Google's verified payload
    const email = payload.email;
    const name = payload.name || email.split('@')[0];
    const picture = payload.picture;

    // Step 5B: Check if user exists in YOUR database
    let user;
    try {
      const { data: existingUser, error } = await dbClient
        .from('users')
        .select('id, name, email, profile_image')
        .eq('email', email)
        .single();  // Expects exactly one result

      if (error && error.code === 'PGRST116') {
        // User doesn't exist - create new user
        const { data: newUser, error: createError } = await dbClient
          .from('users')
          .insert({
            email,
            name: name || email.split('@')[0],
            profile_image: picture,
          })
          .select()
          .single();

        if (createError || !newUser) {
          return serverErrorResponse('Failed to create user');
        }
        
        user = newUser;
      } else if (error) {
        return serverErrorResponse('Failed to fetch user');
      } else {
        // User exists
        user = existingUser;
      }
    } catch (error) {
      return serverErrorResponse('Database error');
    }

    // User now exists in database:
    // {
    //   id: "550e8400-e29b-41d4-a716-446655440000",
    //   email: "user@gmail.com",
    //   name: "John Doe",
    //   profile_image: "https://..."
    // }

    // Step 5C: Create YOUR OWN JWT token for this user
    const jwtToken = await signToken({
      userId: user.id,
      email: user.email,
    });
    // Creates: eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJ...

    // Step 5D: Create response with token in HTTP-only cookie
    const response = NextResponse.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          profile_image: user.profile_image,
        },
        token: jwtToken,
      },
      { status: 200 }
    );

    // Set auth cookie (HTTP-only, cannot be accessed by JavaScript)
    response.headers.set(
      'Set-Cookie',
      `auth_token=${encodeURIComponent(jwtToken)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=604800`
    );

    return response;
  } catch (error) {
    return serverErrorResponse('Google OAuth failed');
  }
}
```

---

### STEP 6: BACKEND RESPONSE TO FRONTEND

**Response Headers**:
```
HTTP/1.1 200 OK
Set-Cookie: auth_token=eyJhbGciOiJIUzI1NiJ9...; Path=/; HttpOnly; SameSite=Strict; Max-Age=604800
Content-Type: application/json

{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "user@gmail.com",
    "profile_image": "https://lh3.googleusercontent.com/..."
  },
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJ..."
}
```

**What Happens**:
- Browser automatically stores the `auth_token` cookie
- Cookie is **HttpOnly** = JavaScript **cannot** access it (XSS protection)
- Cookie will be sent with every request to your domain automatically

---

### STEP 7: FRONTEND UPDATES AUTH CONTEXT

**File**: `src/contexts/AuthContext.tsx`

```typescript
const loginWithGoogle = async (googleToken: string) => {
  const response = await authApi.googleLogin(googleToken);
  
  if (response.error) {
    return { error: response.error };
  }

  // Token is now stored in HTTP-only cookie by the server
  // Refresh session to get user data
  await refreshSession();

  return {};
};

// refreshSession does:
const refreshSession = async () => {
  try {
    // Call /api/auth/session
    const response = await fetch('/api/auth/session', {
      method: 'GET',
      credentials: 'include', // Send cookies with request
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    setUser(data.user || null);  // Update React state
  } catch (error) {
    console.error('Session refresh failed:', error);
  }
};
```

---

### STEP 8: VERIFY SESSION AND GET USER DATA

**Request**:
```
GET /api/auth/session HTTP/1.1
Host: localhost:3000
Cookie: auth_token=eyJhbGciOiJIUzI1NiJ9...
```

**File**: `src/app/api/auth/session/route.ts`

```typescript
export async function GET(request: NextRequest) {
  try {
    // Extract token from cookie
    const cookieHeader = request.headers.get('cookie');
    const token = extractTokenFromCookie(cookieHeader || '');

    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // Verify JWT token (your own JWT, not Google's)
    const payload = await verifyToken(token);
    
    if (!payload || !payload.userId) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // Get fresh user data from database
    const { data: user } = await dbClient
      .from('users')
      .select('id, name, email, profile_image, created_at')
      .eq('id', payload.userId)
      .single();

    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json({ user, authenticated: true });
  } catch (error) {
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
```

**Response**:
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "user@gmail.com",
    "profile_image": "https://lh3.googleusercontent.com/...",
    "created_at": "2026-03-03T12:00:00Z"
  },
  "authenticated": true
}
```

---

### STEP 9: FRONTEND STORES USER IN STATE

**File**: `src/contexts/AuthContext.tsx`

```typescript
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const sessionUser = await checkSession();
        setUser(sessionUser);  // ← User stored here
      } catch (error) {
        setUser(null);
      }
    };
    restoreSession();
  }, []);

  return (
    <AuthContext.Provider value={{ user, ... }}>
      {children}
    </AuthContext.Provider>
  );
};
```

**Now** `useAuth()` returns:
```typescript
{
  user: {
    id: "550e8400-e29b-41d4-a716-446655440000",
    name: "John Doe",
    email: "user@gmail.com",
    profile_image: "https://lh3.googleusercontent.com/...",
    created_at: "2026-03-03T12:00:00Z"
  },
  loading: false
}
```

---

## Data Flow Summary

### Google's Token → Your Backend → Your JWT → Cookie

```
┌─────────────────────┐
│  Google JWT Token   │  (Proves user is authenticated with Google)
│  From OAuth 2.0     │
└──────────┬──────────┘
           │
           ↓ POST /api/auth/google
┌─────────────────────────────────────┐
│  Backend Verification               │
│  1. Verify with Google API          │
│  2. Extract user email              │
│  3. Check if user exists in DB      │
│  4. Create user if new              │
└──────────┬──────────────────────────┘
           │
           ↓ Create YOUR JWT
┌──────────────────────────────────────────┐
│  Your JWT Token                          │
│  (app-specific, encrypted cookie)        │
│  Contains: userId, email                 │
│  Expires: 7 days                         │
└──────────┬───────────────────────────────┘
           │
           ↓ Set HttpOnly Cookie
┌────────────────────────────────────────────────┐
│  Browser Cookie Storage                        │
│  Name: auth_token                              │
│  Value: Your JWT (encrypted)                   │
│  HttpOnly: true (JS cannot access)             │
│  SameSite: Strict (CSRF protection)            │
│  Max-Age: 604800 (7 days)                      │
└────────────────────────────────────────────────┘
           │
           ↓ Auto-sent with every request
┌──────────────────────────────────────────────────────┐
│  Subsequent API Requests                             │
│  GET /api/auth/session                               │
│  Cookie: auth_token=YOUR_JWT                         │
│  Backend verifies JWT and returns user data          │
└──────────────────────────────────────────────────────┘
```

---

## Key Security Features

### 1. **Google Token Verification**
```typescript
// We verify the token with Google's API, not just trust it
const response = await fetch('https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=' + googleToken);
```
✅ Ensures the token is real and not forged

### 2. **HTTP-Only Cookies**
```typescript
`auth_token=...; HttpOnly; SameSite=Strict`
```
✅ JavaScript cannot access the cookie (XSS protection)
✅ Only sent over HTTPS in production
✅ SameSite prevents CSRF attacks

### 3. **Short-Lived JWT Tokens**
```typescript
const JWT_EXPIRY = '7d';  // Token expires in 7 days
```
✅ Even if stolen, only valid for 7 days
✅ Frequent token rotation on refresh

### 4. **Database User Verification**
```typescript
// Every request requires verification of JWT
const payload = await verifyToken(token);
const user = await db.from('users').select(...).eq('id', payload.userId);
```
✅ User data is fresh from DB
✅ Token alone is not enough - user must exist

---

## What Data is Stored Where?

### Browser Cookie
```
auth_token = eyJhbGciOiJIUzI1NiJ9...  (encrypted JWT)
```

### React State (AuthContext)
```typescript
user: {
  id: string,
  email: string,
  name: string,
  profile_image: string,
  created_at: string
}
```

### Database (Supabase)
```sql
users table:
├── id (UUID)
├── email (unique)
├── name
├── profile_image
├── created_at
└── updated_at
```

---

## Request/Response Example

### User Click → Google → Your Backend → Database → Your Frontend

**1. Click Google Button**
```
User clicks "Continue with Google"
```

**2. Google OAuth**
```
Google dialog appears
User logs in with Google account
Google returns credential token
```

**3. Frontend Sends Token**
```
POST /api/auth/google
{
  "googleToken": "eyJhbGciOiJSUzI1NiIs..."
}
```

**4. Backend Verifies & Creates User**
```
Call: https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=...
Response: { email: "user@gmail.com", name: "John", picture: "..." }

Database Query: SELECT * FROM users WHERE email = 'user@gmail.com'
Not Found → INSERT INTO users (email, name, profile_image) VALUES (...)
```

**5. Backend Creates Your JWT**
```
signToken({ userId: "550e8400...", email: "user@gmail.com" })
Returns: "eyJhbGciOiJIUzI1NiJ9..."
```

**6. Backend Returns Response**
```
HTTP 200 OK
Set-Cookie: auth_token=eyJhbGciOiJIUzI1NiJ9...; HttpOnly
{
  "user": { id: "...", email: "...", name: "...", profile_image: "..." },
  "token": "eyJhbGciOiJIUzI1NiJ9..."
}
```

**7. Browser Stores Cookie**
```
Cookie automatically stored (HttpOnly, cannot access via JS)
```

**8. Frontend Fetches Session**
```
GET /api/auth/session
Cookie: auth_token=eyJhbGciOiJIUzI1NiJ9...

Response: { user: {...}, authenticated: true }
```

**9. React Updates State**
```
setUser({ id: "...", email: "...", name: "...", profile_image: "..." })
```

**10. User Logged In!**
```
Navbar shows user name/picture
Redirect to /dashboard
All API requests include auth_token cookie
```

---

## Common Questions Answered

### Q: Why do we need Google's token AND your JWT?
**A**: 
- **Google's Token** = Proof the user is authenticated with Google (one-time use)
- **Your JWT** = Persistent session token stored in cookie (used for all requests)

### Q: Is the JWT token accessible to JavaScript?
**A**: No, it's in an HttpOnly cookie. JavaScript can't read it.
```typescript
// This will NOT work:
console.log(document.cookie);  // Won't include auth_token

// But this WILL work (cookie auto-sent):
fetch('/api/protected', {
  credentials: 'include'  // Browser sends cookie automatically
})
```

### Q: What happens when JWT expires?
**A**: 
```typescript
// After 7 days + Max-Age=604800 seconds, cookie is deleted
// User will need to login again
// GET /api/auth/session will return { user: null }
// Frontend redirects to login page
```

### Q: What if someone steals the cookie?
**A**:
1. **HttpOnly** = Attacker can't steal via JavaScript
2. **SameSite** = Attacker can't use it from other sites
3. **7-day expiry** = Even if stolen, only valid for 7 days
4. **HTTPS only** (production) = Encrypted in transit

### Q: How does the backend know which user made a request?
**A**:
```typescript
// Every request includes:
GET /api/trips
Cookie: auth_token=eyJhbGciOiJIUzI1NiJ9...

// Backend does:
const token = extractTokenFromCookie(request.headers.get('cookie'));
const payload = await verifyToken(token);  // { userId: "...", email: "..." }
// Now we know who made the request!
```

---

## Token Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                    TOKEN LIFECYCLE                               │
└─────────────────────────────────────────────────────────────────┘

1. User clicks "Google Login"
   └─> Google returns credential (one-time, ~5 min expiry)

2. Frontend sends credential to /api/auth/google
   └─> Backend verifies with Google, creates user if needed

3. Backend creates YOUR JWT
   └─> Expires in 7 days
   └─> Stored in HttpOnly cookie

4. Browser automatically sends cookie with requests
   └─> Cookie valid for 7 days (Max-Age=604800)

5. After 7 days
   └─> Cookie expires
   └─> GET /api/auth/session returns { user: null }
   └─> Frontend redirects to login

6. User logs in again
   └─> Cycle repeats
```

---

This is the complete, secure flow of Google authentication in TripTally! 🔐
