# Feature Specification: User Authentication

**Version:** 1.0
**Date:** January 3, 2026
**Feature:** User Registration, Login, Logout, Session Management
**Status:** Specification

---

## Table of Contents

1. [Feature Overview](#feature-overview)
2. [User Stories](#user-stories)
3. [Authentication Architecture](#authentication-architecture)
4. [Functional Requirements](#functional-requirements)
5. [Security Requirements](#security-requirements)
6. [JWT Token Specification](#jwt-token-specification)
7. [Session Management](#session-management)
8. [Error Handling](#error-handling)
9. [Acceptance Criteria](#acceptance-criteria)

---

## Feature Overview

### Purpose

Provide secure user authentication system using **Better Auth** on the frontend and **JWT verification** on the backend to enable multi-user support with complete data isolation.

### Scope

**In Scope:**
- User registration (email + password)
- User login (email + password)
- User logout
- JWT token generation and verification
- Session management
- Password security (hashing, salting)
- Token expiration and refresh

**Out of Scope:**
- Social authentication (Google, GitHub) - Phase III
- Two-factor authentication (2FA) - Phase III
- Password reset - Phase III
- Email verification - Phase III
- OAuth 2.0 - Phase III

### Technology Stack

**Frontend (Next.js):**
- **Better Auth**: Modern authentication library for Next.js
  - Handles user registration
  - Manages login/logout
  - Generates JWT tokens
  - Manages sessions

**Backend (FastAPI):**
- **PyJWT**: JWT token verification
  - Verifies token signature
  - Validates expiration
  - Extracts user claims

**Shared:**
- **BETTER_AUTH_SECRET**: Shared secret key for JWT signing and verification
- **HS256**: HMAC SHA-256 algorithm for signing

---

## User Stories

### US-AUTH-1: User Registration

**As a** new user
**I want to** register with my email and password
**So that** I can create an account and use the application

**Acceptance Criteria:**
- User provides valid email address
- User provides password (minimum 8 characters)
- Email is unique (not already registered)
- Password is securely hashed before storage
- User account is created in database
- User is automatically logged in after registration
- JWT token is generated and returned

### US-AUTH-2: User Login

**As a** registered user
**I want to** login with my email and password
**So that** I can access my tasks

**Acceptance Criteria:**
- User provides registered email
- User provides correct password
- System verifies credentials
- JWT token is generated with user claims
- Token is returned to frontend
- User gains access to authenticated features

### US-AUTH-3: User Logout

**As a** logged-in user
**I want to** logout of my account
**So that** I can secure my session

**Acceptance Criteria:**
- User clicks logout button
- Frontend clears JWT token from storage
- Session is invalidated
- User is redirected to login page
- Protected routes become inaccessible

### US-AUTH-4: Persistent Session

**As a** logged-in user
**I want to** stay logged in across browser refreshes
**So that** I don't have to login repeatedly

**Acceptance Criteria:**
- JWT token is stored securely (httpOnly cookie or secure storage)
- Token is sent with every API request
- Session persists until token expires or user logs out
- Expired tokens trigger re-authentication

---

## Authentication Architecture

### Component Interaction Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                         │
│  ┌────────────────────────────────────────────────────────┐  │
│  │               Better Auth Client                        │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │  │
│  │  │  Signup API  │  │  Login API   │  │ Logout API  │  │  │
│  │  └──────────────┘  └──────────────┘  └─────────────┘  │  │
│  │                           ↓                             │  │
│  │              ┌─────────────────────────┐               │  │
│  │              │  JWT Token Manager      │               │  │
│  │              │  - Generate tokens      │               │  │
│  │              │  - Store in session     │               │  │
│  │              │  - Include in requests  │               │  │
│  │              └─────────────────────────┘               │  │
│  └────────────────────────────────────────────────────────┘  │
└────────────────────────────┬─────────────────────────────────┘
                             │
                             │ HTTPS
                             │ Authorization: Bearer <JWT>
                             ↓
┌──────────────────────────────────────────────────────────────┐
│                    BACKEND (FastAPI)                          │
│  ┌────────────────────────────────────────────────────────┐  │
│  │           JWT Verification Middleware                   │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │  1. Extract token from Authorization header      │  │  │
│  │  │  2. Verify signature (BETTER_AUTH_SECRET)        │  │  │
│  │  │  3. Validate expiration (exp claim)              │  │  │
│  │  │  4. Decode payload to get user_id                │  │  │
│  │  │  5. Attach user_id to request context            │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────┘  │
│                           ↓                                   │
│  ┌────────────────────────────────────────────────────────┐  │
│  │           Protected API Endpoints                      │  │
│  │  - All task operations require authenticated user_id  │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
                             ↓
┌──────────────────────────────────────────────────────────────┐
│              DATABASE (Neon PostgreSQL)                       │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  users table (managed by Better Auth)                  │  │
│  │  - id (primary key)                                    │  │
│  │  - email (unique)                                      │  │
│  │  - password_hash (bcrypt)                              │  │
│  │  - created_at, updated_at                              │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### Authentication Flow Sequence

```
Registration Flow:
1. User → Frontend: Submit email + password
2. Frontend → Better Auth: Call signup API
3. Better Auth → Database: Create user record (hashed password)
4. Database → Better Auth: Return user with ID
5. Better Auth: Generate JWT (payload: {sub: user_id, email, exp})
6. Better Auth → Frontend: Return JWT token
7. Frontend: Store JWT in session
8. User is authenticated ✓

Login Flow:
1. User → Frontend: Submit email + password
2. Frontend → Better Auth: Call login API
3. Better Auth → Database: Query user by email
4. Better Auth: Verify password hash
5. Better Auth: Generate JWT (payload: {sub: user_id, email, exp})
6. Better Auth → Frontend: Return JWT token
7. Frontend: Store JWT in session
8. User is authenticated ✓

API Request Flow:
1. Frontend: Retrieve JWT from session
2. Frontend → Backend: HTTP request with Authorization: Bearer <JWT>
3. Backend Middleware: Extract JWT from header
4. Backend Middleware: Verify signature using BETTER_AUTH_SECRET
5. Backend Middleware: Validate expiration
6. Backend Middleware: Decode user_id from payload
7. Backend Endpoint: Receive authenticated user_id
8. Backend: Process request with user_id context
9. Backend → Frontend: Return response
```

---

## Functional Requirements

### FR-AUTH-1: User Registration

**Requirement:** System SHALL allow new users to register with email and password

**Inputs:**
- `email`: string (valid email format, unique)
- `password`: string (minimum 8 characters)
- `name`: string (optional, for display)

**Process (Frontend - Better Auth):**
1. Validate email format (RFC 5322)
2. Validate password strength (min 8 chars)
3. Check email uniqueness in database
4. Hash password using bcrypt (cost factor 12)
5. Create user record in database
6. Generate JWT token with claims
7. Return token to client

**Outputs:**
- Success: JWT token + user info
- Email already exists: Error message
- Invalid input: Validation error
- Server error: 500 Internal Server Error

**Security:**
- Password MUST NOT be stored in plaintext
- Password MUST be hashed with bcrypt (cost >= 10)
- Email MUST be case-insensitive for uniqueness check

### FR-AUTH-2: User Login

**Requirement:** System SHALL authenticate users with valid credentials

**Inputs:**
- `email`: string
- `password`: string

**Process (Frontend - Better Auth):**
1. Query database for user by email
2. If user not found → Invalid credentials error
3. Verify password against stored hash
4. If password mismatch → Invalid credentials error
5. Generate JWT token with user claims
6. Return token to client

**Outputs:**
- Success: JWT token + user info
- Invalid credentials: Error message (don't specify which field is wrong)
- Account locked: Error message (after repeated failed attempts)
- Server error: 500 Internal Server Error

**Security:**
- MUST NOT reveal whether email exists
- Error message should be generic: "Invalid email or password"
- SHOULD implement rate limiting (prevent brute force)

### FR-AUTH-3: JWT Token Generation

**Requirement:** System SHALL generate secure JWT tokens for authenticated users

**Token Structure:**
```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "user-123",           // Subject: User ID
    "email": "user@example.com", // User email
    "name": "John Doe",          // User name (optional)
    "iat": 1704278400,           // Issued at (Unix timestamp)
    "exp": 1704282000            // Expiration (Unix timestamp, 1 hour)
  },
  "signature": "HMACSHA256(base64UrlEncode(header) + '.' + base64UrlEncode(payload), BETTER_AUTH_SECRET)"
}
```

**Requirements:**
- Algorithm: HS256 (HMAC SHA-256)
- Secret: `BETTER_AUTH_SECRET` environment variable
- Expiration: 1 hour from issuance
- Claims:
  - `sub` (subject): User ID (REQUIRED)
  - `email`: User email (REQUIRED)
  - `name`: User name (OPTIONAL)
  - `iat` (issued at): Timestamp (REQUIRED)
  - `exp` (expiration): Timestamp (REQUIRED)

### FR-AUTH-4: JWT Token Verification

**Requirement:** Backend SHALL verify JWT tokens on every protected request

**Process (Backend - FastAPI Middleware):**
1. Extract token from `Authorization: Bearer <token>` header
2. If missing → 401 Unauthorized
3. Verify signature using `BETTER_AUTH_SECRET`
4. If signature invalid → 401 Unauthorized
5. Check expiration (`exp` claim)
6. If expired → 401 Unauthorized (message: "Token expired")
7. Decode payload to extract `sub` (user_id)
8. Attach `user_id` to request context
9. Pass request to endpoint handler

**Implementation:**
```python
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
import os

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """
    Extract and verify JWT token, return user_id.

    Raises:
        HTTPException: 401 if token is invalid or expired
    """
    try:
        token = credentials.credentials
        payload = jwt.decode(
            token,
            os.getenv("BETTER_AUTH_SECRET"),
            algorithms=["HS256"]
        )
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token: missing subject")
        return user_id
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

**Usage in Endpoints:**
```python
@app.get("/api/{user_id}/tasks")
def get_tasks(
    user_id: str,
    authenticated_user_id: str = Depends(get_current_user)
):
    # Verify URL user_id matches token user_id
    if user_id != authenticated_user_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    # Proceed with user-scoped operation
    return task_service.get_tasks(authenticated_user_id)
```

### FR-AUTH-5: User Logout

**Requirement:** System SHALL allow users to logout and invalidate sessions

**Process (Frontend):**
1. Call Better Auth logout API
2. Clear JWT token from storage
3. Clear session data
4. Redirect to login page

**Process (Backend):**
- No backend action required (stateless JWT)
- Token becomes invalid after expiration
- Optional: Maintain token blacklist for immediate invalidation

**Security:**
- Token should be removed from client storage
- Sensitive data should be cleared from memory
- User should be redirected to public page

---

## Security Requirements

### SEC-AUTH-1: Password Security

**Requirements:**
- ✅ Passwords MUST be hashed using bcrypt
- ✅ Bcrypt cost factor MUST be >= 10 (recommended: 12)
- ✅ Passwords MUST NOT be logged or displayed
- ✅ Passwords MUST NOT be transmitted in GET requests
- ✅ Password reset tokens MUST be single-use and time-limited

**Implementation:**
```javascript
// Better Auth automatically handles password hashing
// Configuration:
{
  password: {
    minLength: 8,
    requireUppercase: false,  // Optional: enforce complexity
    requireLowercase: false,
    requireNumbers: false,
    requireSpecialChars: false
  }
}
```

### SEC-AUTH-2: JWT Security

**Requirements:**
- ✅ JWT MUST be signed with strong secret (min 32 bytes)
- ✅ JWT signature MUST be verified on backend
- ✅ JWT expiration MUST be enforced
- ✅ JWT MUST NOT contain sensitive data (passwords, PII)
- ✅ Secret key MUST be stored in environment variables
- ✅ Secret key MUST NOT be committed to version control

**Secret Key Generation:**
```bash
# Generate secure random secret
openssl rand -base64 32
# Store in .env file
BETTER_AUTH_SECRET=<generated-secret>
```

### SEC-AUTH-3: HTTPS Enforcement

**Requirements:**
- ✅ All authentication requests MUST use HTTPS in production
- ✅ JWT tokens MUST only be transmitted over HTTPS
- ✅ Cookies MUST have Secure flag in production
- ✅ HTTP requests MUST redirect to HTTPS

### SEC-AUTH-4: Rate Limiting

**Requirements:**
- ✅ Login endpoint SHOULD limit to 5 attempts per 15 minutes
- ✅ Registration SHOULD limit to 3 attempts per hour
- ✅ Failed attempts SHOULD be logged
- ✅ Account lockout after 10 failed attempts (optional)

### SEC-AUTH-5: Input Validation

**Requirements:**
- ✅ Email format MUST be validated (RFC 5322)
- ✅ Password length MUST be validated (min 8 chars)
- ✅ Input MUST be sanitized to prevent injection attacks
- ✅ SQL injection MUST be prevented (use parameterized queries)

---

## JWT Token Specification

### Token Anatomy

**Encoded Token:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsImlhdCI6MTcwNDI3ODQwMCwiZXhwIjoxNzA0MjgyMDAwfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

**Decoded Header:**
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Decoded Payload:**
```json
{
  "sub": "user-123",           // User ID (primary identifier)
  "email": "user@example.com", // User email
  "name": "John Doe",          // User display name
  "iat": 1704278400,           // Issued at: Jan 3, 2026 10:00:00 GMT
  "exp": 1704282000            // Expires at: Jan 3, 2026 11:00:00 GMT (1 hour later)
}
```

**Signature:**
```
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  BETTER_AUTH_SECRET
)
```

### Token Lifecycle

```
1. Token Generation (Login/Register)
   │
   ├─> Better Auth generates token
   ├─> Signs with BETTER_AUTH_SECRET
   ├─> Sets exp to now + 1 hour
   └─> Returns to client

2. Token Storage (Frontend)
   │
   ├─> Store in httpOnly cookie (secure) OR
   └─> Store in memory (for SPA)

3. Token Usage (API Requests)
   │
   ├─> Retrieve token from storage
   ├─> Add to Authorization header
   ├─> Send with every API request
   └─> Backend verifies on each request

4. Token Expiration
   │
   ├─> exp claim reaches current time
   ├─> Backend rejects token (401)
   ├─> Frontend detects expired token
   ├─> Redirect to login OR
   └─> Refresh token (if implemented)

5. Token Invalidation (Logout)
   │
   ├─> Frontend clears token from storage
   ├─> Token remains valid until exp
   └─> Optional: Add to blacklist
```

### Token Claims Reference

| Claim | Type | Required | Description |
|-------|------|----------|-------------|
| `sub` | string | YES | Subject (User ID) - Primary identifier |
| `email` | string | YES | User email address |
| `name` | string | NO | User display name |
| `iat` | integer | YES | Issued at timestamp (Unix epoch) |
| `exp` | integer | YES | Expiration timestamp (Unix epoch) |
| `iss` | string | NO | Issuer (e.g., "todo-app.com") |
| `aud` | string | NO | Audience (e.g., "todo-api") |

---

## Session Management

### Session Storage (Frontend)

**Option 1: httpOnly Cookies (Recommended)**
```javascript
// Better Auth configuration
{
  session: {
    strategy: "jwt",
    cookieOptions: {
      httpOnly: true,      // Prevent XSS access
      secure: true,        // HTTPS only
      sameSite: "lax",     // CSRF protection
      maxAge: 3600         // 1 hour
    }
  }
}
```

**Option 2: Memory Storage (SPA)**
```javascript
// Store in React state or context
const [session, setSession] = useState(null);

// After login
setSession({ token: jwt, user: userData });

// On logout
setSession(null);
```

### Session Validation

**Client-Side:**
```javascript
// Check if token exists
if (!session?.token) {
  redirect("/login");
}

// Check if token is expired (decode without verification)
const decoded = jwtDecode(session.token);
if (decoded.exp * 1000 < Date.now()) {
  // Token expired
  redirect("/login");
}
```

**Server-Side:**
```python
# Every protected endpoint calls get_current_user
@app.get("/api/{user_id}/tasks")
def get_tasks(user_id: str, auth_user: str = Depends(get_current_user)):
    # Token is verified by dependency
    # If we reach here, token is valid
    if user_id != auth_user:
        raise HTTPException(403)
    return task_service.get_tasks(auth_user)
```

### Session Expiration Handling

**Frontend:**
```javascript
// Intercept 401 responses
async function apiRequest(url, options) {
  const response = await fetch(url, options);

  if (response.status === 401) {
    // Token expired or invalid
    clearSession();
    redirect("/login");
    throw new Error("Authentication required");
  }

  return response.json();
}
```

**Backend:**
```python
# JWT middleware automatically returns 401 for expired tokens
try:
    payload = jwt.decode(token, secret, algorithms=["HS256"])
except jwt.ExpiredSignatureError:
    raise HTTPException(401, "Token expired")
```

---

## Error Handling

### Authentication Errors

#### E-AUTH-1: Invalid Credentials (Login)

**Status Code:** 401 Unauthorized

**Response:**
```json
{
  "error": "Authentication Failed",
  "message": "Invalid email or password"
}
```

**Security Note:** Do not specify which field is incorrect

#### E-AUTH-2: Email Already Exists (Registration)

**Status Code:** 400 Bad Request

**Response:**
```json
{
  "error": "Registration Failed",
  "message": "Email already registered"
}
```

#### E-AUTH-3: Invalid Email Format

**Status Code:** 400 Bad Request

**Response:**
```json
{
  "error": "Validation Error",
  "details": {
    "email": "Invalid email format"
  }
}
```

#### E-AUTH-4: Weak Password

**Status Code:** 400 Bad Request

**Response:**
```json
{
  "error": "Validation Error",
  "details": {
    "password": "Password must be at least 8 characters"
  }
}
```

#### E-AUTH-5: Missing Token

**Status Code:** 401 Unauthorized

**Response:**
```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

#### E-AUTH-6: Invalid Token

**Status Code:** 401 Unauthorized

**Response:**
```json
{
  "error": "Unauthorized",
  "message": "Invalid token"
}
```

#### E-AUTH-7: Expired Token

**Status Code:** 401 Unauthorized

**Response:**
```json
{
  "error": "Unauthorized",
  "message": "Token expired"
}
```

---

## Acceptance Criteria

### AC-AUTH-1: User Registration

**Given:** I am a new user
**When:** I register with email "user@example.com" and password "securepass123"
**Then:**
- Account is created in database
- Password is hashed (not stored in plaintext)
- JWT token is returned
- Token contains user_id in `sub` claim
- I am automatically logged in
- I can access protected routes

### AC-AUTH-2: User Login

**Given:** I am a registered user
**When:** I login with correct email and password
**Then:**
- Credentials are verified
- JWT token is generated and returned
- Token is valid for 1 hour
- I can access my tasks
- Other users' tasks are not accessible

### AC-AUTH-3: User Logout

**Given:** I am logged in
**When:** I click logout
**Then:**
- JWT token is cleared from storage
- I am redirected to login page
- Protected routes redirect to login
- API requests without token return 401

### AC-AUTH-4: Invalid Login

**Given:** I am a registered user
**When:** I enter incorrect password
**Then:**
- Login fails with "Invalid email or password"
- No information about which field is wrong
- Account is not locked (until threshold)
- I can try again

### AC-AUTH-5: Token Verification

**Given:** I have a valid JWT token
**When:** I make an API request with the token
**Then:**
- Backend verifies token signature
- Backend extracts user_id from token
- Request proceeds with authenticated context
- Response includes my data only

### AC-AUTH-6: Expired Token Handling

**Given:** My JWT token has expired
**When:** I make an API request
**Then:**
- Backend rejects token with 401
- Error message indicates token expired
- Frontend redirects to login
- I must login again to continue

### AC-AUTH-7: Authorization Enforcement

**Given:** I am logged in as User A
**When:** I try to access User B's resources
**Then:**
- Request is rejected with 403 Forbidden
- No data is returned
- Token remains valid
- My own resources are still accessible

---

## Appendix: Better Auth Configuration

### Frontend Setup (Next.js)

**Installation:**
```bash
npm install better-auth
```

**Configuration:**
```typescript
// lib/auth.ts
import { createAuthClient } from "better-auth/client";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  session: {
    strategy: "jwt",
    expiresIn: 3600, // 1 hour
  },
  jwt: {
    secret: process.env.BETTER_AUTH_SECRET,
    algorithm: "HS256",
  },
});
```

**Usage:**
```typescript
// Register
const { data, error } = await authClient.signUp({
  email: "user@example.com",
  password: "securepass123",
  name: "John Doe",
});

// Login
const { data, error } = await authClient.signIn({
  email: "user@example.com",
  password: "securepass123",
});

// Logout
await authClient.signOut();

// Get session
const session = await authClient.getSession();
```

### Backend Setup (FastAPI)

**Installation:**
```bash
pip install PyJWT
```

**JWT Verification:**
```python
# app/auth/jwt.py
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
import os

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    try:
        token = credentials.credentials
        payload = jwt.decode(
            token,
            os.getenv("BETTER_AUTH_SECRET"),
            algorithms=["HS256"]
        )
        return payload.get("sub")
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Invalid token")
```

### Environment Variables

```bash
# .env.local (Frontend)
NEXT_PUBLIC_API_URL=http://localhost:8000
BETTER_AUTH_SECRET=<32-byte-random-secret>

# .env (Backend)
BETTER_AUTH_SECRET=<same-32-byte-random-secret>
DATABASE_URL=postgresql://user:pass@neon.tech/db
```

**⚠️ CRITICAL:** The `BETTER_AUTH_SECRET` MUST be identical on frontend and backend!

---

**Document Status:** Complete
**Dependencies:** overview.md
**Related Specs:** task-crud.md, task-ownership.md, api/rest-endpoints.md
**Implementation:** Not started (spec-only phase)
