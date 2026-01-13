# Environment Variables Setup Guide

**Project:** Todo App - Phase II
**Date:** January 7, 2026
**Purpose:** Complete guide for configuring environment variables

---

## Table of Contents

1. [Overview](#overview)
2. [Quick Start (Development)](#quick-start-development)
3. [Backend Environment Variables](#backend-environment-variables)
4. [Frontend Environment Variables](#frontend-environment-variables)
5. [Production Deployment](#production-deployment)
6. [Security Best Practices](#security-best-practices)
7. [Troubleshooting](#troubleshooting)

---

## Overview

This application requires environment variables to be configured in two places:

```
├── backend/.env          # Backend (FastAPI) configuration
└── frontend/.env.local   # Frontend (Next.js) configuration
```

**Critical Requirement:** The `BETTER_AUTH_SECRET` MUST be identical in both files.

---

## Quick Start (Development)

### Step 1: Generate Shared Secret

```bash
# Generate a secure 32-byte secret
openssl rand -base64 32
```

**Example Output:**
```
DyLUT33IAuOaupFxDWSsdbqMpsGzb2XQUZVUlNnuI1Y=
```

Save this value - you'll use it in both `.env` files.

### Step 2: Backend Configuration

**File:** `backend/.env`

```bash
# Application Settings
APP_NAME="Todo App - Phase II"
DEBUG=true

# Database Configuration (SQLite for local development)
DATABASE_URL=sqlite:///./test.db

# Authentication (Better Auth JWT Verification)
# MUST match frontend BETTER_AUTH_SECRET
BETTER_AUTH_SECRET=DyLUT33IAuOaupFxDWSsdbqMpsGzb2XQUZVUlNnuI1Y=
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=1

# CORS (Frontend URLs)
CORS_ORIGINS=["http://localhost:3000"]
```

### Step 3: Frontend Configuration

**File:** `frontend/.env.local`

```bash
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# Better Auth Configuration (MUST match backend secret)
BETTER_AUTH_SECRET=DyLUT33IAuOaupFxDWSsdbqMpsGzb2XQUZVUlNnuI1Y=
BETTER_AUTH_URL=http://localhost:3000

# Database URL (Better Auth user storage - SQLite for local)
DATABASE_URL=sqlite://./auth.db
```

### Step 4: Verify Setup

```bash
# Check backend .env exists
ls backend/.env

# Check frontend .env.local exists
ls frontend/.env.local

# Verify both have same BETTER_AUTH_SECRET
grep BETTER_AUTH_SECRET backend/.env
grep BETTER_AUTH_SECRET frontend/.env.local
```

---

## Backend Environment Variables

**File:** `backend/.env`

### Required Variables

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `DATABASE_URL` | String | PostgreSQL or SQLite connection string | `sqlite:///./test.db` (dev) or `postgresql://...` (prod) |
| `BETTER_AUTH_SECRET` | String | 32-byte secret for JWT signing (MUST match frontend) | `DyLUT33IAuOaupFxDWSsdbqMpsGzb2XQUZVUlNnuI1Y=` |
| `CORS_ORIGINS` | JSON Array | Allowed frontend origins | `["http://localhost:3000"]` |

### Optional Variables

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `APP_NAME` | String | "Todo App - Phase II" | Application name (for logging) |
| `DEBUG` | Boolean | `false` | Enable debug mode (development only) |
| `JWT_ALGORITHM` | String | `HS256` | JWT signing algorithm |
| `JWT_EXPIRATION_HOURS` | Integer | `1` | JWT token expiration time |

### Database URL Formats

**Development (SQLite):**
```bash
DATABASE_URL=sqlite:///./test.db
```

**Production (Neon PostgreSQL):**
```bash
DATABASE_URL=postgresql://username:password@ep-cool-name-123456.region.aws.neon.tech/neondb?sslmode=require
```

**Environment Variables in Neon:**
- Neon provides the full connection string in your project dashboard
- Always use `?sslmode=require` for production
- Database name defaults to `neondb`

---

## Frontend Environment Variables

**File:** `frontend/.env.local`

### Required Variables

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | String | Backend API base URL | `http://localhost:8000` (dev) or `https://api.yourdomain.com` (prod) |
| `BETTER_AUTH_SECRET` | String | 32-byte secret (MUST match backend) | `DyLUT33IAuOaupFxDWSsdbqMpsGzb2XQUZVUlNnuI1Y=` |
| `BETTER_AUTH_URL` | String | Frontend app URL (for Better Auth callbacks) | `http://localhost:3000` (dev) or `https://yourdomain.vercel.app` (prod) |
| `DATABASE_URL` | String | Database URL for Better Auth user storage | `sqlite://./auth.db` (dev) or `postgresql://...` (prod) |

### Environment Variable Prefixes

**Next.js Convention:**
- `NEXT_PUBLIC_*` — Exposed to browser (public)
- No prefix — Server-side only (secret)

**Examples:**
- ✅ `NEXT_PUBLIC_API_URL` — Browser needs to know backend URL
- ✅ `BETTER_AUTH_SECRET` — Server-side only (NOT public)
- ✅ `DATABASE_URL` — Server-side only (NOT public)

---

## Production Deployment

### Deployment Platforms

This application is designed to deploy on:
- **Frontend:** Vercel (Next.js hosting)
- **Backend:** Render, Railway, or Fly.io (FastAPI hosting)
- **Database:** Neon (Serverless PostgreSQL)

### Neon Database Setup

1. **Create Neon Project:**
   - Go to [neon.tech](https://neon.tech)
   - Sign up / Login
   - Create new project
   - Copy connection string

2. **Configure Database:**
   ```sql
   -- Better Auth will create users table automatically
   -- You need to create tasks table via migration
   ```

3. **Run Migrations:**
   ```bash
   cd backend
   alembic upgrade head
   ```

### Vercel Deployment (Frontend)

**Environment Variables in Vercel:**

```bash
# Add in Vercel Dashboard → Settings → Environment Variables

NEXT_PUBLIC_API_URL=https://your-backend-api.onrender.com
BETTER_AUTH_SECRET=<your-production-secret>
BETTER_AUTH_URL=https://yourdomain.vercel.app
DATABASE_URL=postgresql://user:password@host.neon.tech/neondb?sslmode=require
```

**Important:**
- Use different `BETTER_AUTH_SECRET` for production
- `NEXT_PUBLIC_API_URL` must point to deployed backend
- `BETTER_AUTH_URL` must match your Vercel domain

### Backend Deployment (Render/Railway)

**Environment Variables in Render:**

```bash
# Add in Render Dashboard → Environment Variables

DATABASE_URL=postgresql://user:password@host.neon.tech/neondb?sslmode=require
BETTER_AUTH_SECRET=<same-as-frontend-secret>
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=1
CORS_ORIGINS=["https://yourdomain.vercel.app"]
DEBUG=false
```

**Important:**
- Use same `BETTER_AUTH_SECRET` as frontend
- Set `DEBUG=false` in production
- Update `CORS_ORIGINS` to match Vercel domain
- Use Neon PostgreSQL (not SQLite) for production

---

## Security Best Practices

### ✅ DO

1. **Generate Strong Secrets:**
   ```bash
   # Always use cryptographically secure random values
   openssl rand -base64 32
   ```

2. **Use Different Secrets Per Environment:**
   - Development: One secret
   - Staging: Different secret
   - Production: Different secret (most secure)

3. **Never Commit Secrets:**
   - `.env` and `.env.local` are in `.gitignore`
   - Use `.env.example` for documentation only

4. **Use Environment-Specific URLs:**
   - Development: `http://localhost:*`
   - Production: `https://yourdomain.com`

5. **Enable HTTPS in Production:**
   - Vercel provides HTTPS automatically
   - Ensure backend also uses HTTPS
   - Neon requires `?sslmode=require`

### ❌ DON'T

1. **Never expose secrets in frontend:**
   ```bash
   # ❌ WRONG - Secret exposed to browser
   NEXT_PUBLIC_BETTER_AUTH_SECRET=secret

   # ✅ CORRECT - Secret server-side only
   BETTER_AUTH_SECRET=secret
   ```

2. **Never hardcode secrets in code:**
   ```typescript
   // ❌ WRONG
   const secret = "my-secret-key";

   // ✅ CORRECT
   const secret = process.env.BETTER_AUTH_SECRET;
   ```

3. **Never use weak secrets:**
   ```bash
   # ❌ WRONG
   BETTER_AUTH_SECRET=password123

   # ✅ CORRECT
   BETTER_AUTH_SECRET=DyLUT33IAuOaupFxDWSsdbqMpsGzb2XQUZVUlNnuI1Y=
   ```

4. **Never share production secrets:**
   - Use separate secrets for dev/prod
   - Rotate secrets regularly
   - Use secret management tools (e.g., Vercel/Render secret stores)

---

## Troubleshooting

### Problem: "401 Unauthorized" on API requests

**Cause:** JWT verification failing

**Solutions:**
1. Verify `BETTER_AUTH_SECRET` is identical in both `.env` files
2. Check JWT is being sent in `Authorization: Bearer <token>` header
3. Verify JWT hasn't expired (default: 1 hour)

**Debug:**
```bash
# Compare secrets
echo "Backend: $(grep BETTER_AUTH_SECRET backend/.env)"
echo "Frontend: $(grep BETTER_AUTH_SECRET frontend/.env.local)"
```

### Problem: "403 Forbidden" on task operations

**Cause:** User ID mismatch between JWT and URL

**Solutions:**
1. Check JWT contains correct `sub` claim (user ID)
2. Verify frontend is using correct user ID in API calls
3. Ensure user is logged in with valid session

### Problem: Database connection errors

**Development (SQLite):**
```bash
# Check file exists
ls backend/test.db
ls frontend/auth.db

# Verify DATABASE_URL format
echo "Backend: $(grep DATABASE_URL backend/.env)"
# Should be: sqlite:///./test.db

echo "Frontend: $(grep DATABASE_URL frontend/.env.local)"
# Should be: sqlite://./auth.db
```

**Production (Neon):**
```bash
# Verify connection string format
# Should include: ?sslmode=require

# Test connection (backend)
cd backend
python -c "from app.database import engine; engine.connect()"
```

### Problem: CORS errors in browser

**Cause:** Backend not allowing frontend origin

**Solution:**
Update `backend/.env`:
```bash
# Development
CORS_ORIGINS=["http://localhost:3000"]

# Production
CORS_ORIGINS=["https://yourdomain.vercel.app"]
```

**Verify:**
- Check browser console for exact error
- Ensure frontend URL matches CORS_ORIGINS exactly
- Restart backend after changing CORS_ORIGINS

### Problem: Better Auth errors

**Symptoms:**
- "Invalid session"
- "Failed to create user"
- "Database connection failed"

**Solutions:**

1. **Check DATABASE_URL is set:**
   ```bash
   grep DATABASE_URL frontend/.env.local
   ```

2. **Verify database is accessible:**
   ```bash
   # SQLite: Check file exists and has write permissions
   ls -la frontend/auth.db

   # PostgreSQL: Test connection
   psql "postgresql://user:password@host/db"
   ```

3. **Clear Better Auth session:**
   ```bash
   # Delete SQLite database and restart
   rm frontend/auth.db
   # Better Auth will recreate on next run
   ```

### Problem: Environment variables not loading

**Next.js:**
```bash
# Restart dev server after changing .env.local
npm run dev

# Verify variable is accessible
# In code:
console.log(process.env.NEXT_PUBLIC_API_URL)
```

**FastAPI:**
```bash
# Restart server after changing .env
python -m app.main

# Verify variable is accessible
# In code:
from app.config import settings
print(settings.better_auth_secret)
```

---

## Environment Variable Checklist

### Before Starting Development

- [ ] Generate `BETTER_AUTH_SECRET` using `openssl rand -base64 32`
- [ ] Create `backend/.env` from `backend/.env.example`
- [ ] Create `frontend/.env.local` from `frontend/.env.local.example`
- [ ] Verify `BETTER_AUTH_SECRET` is identical in both files
- [ ] Set `DATABASE_URL=sqlite:///./test.db` in backend
- [ ] Set `DATABASE_URL=sqlite://./auth.db` in frontend
- [ ] Set `CORS_ORIGINS=["http://localhost:3000"]` in backend
- [ ] Set `NEXT_PUBLIC_API_URL=http://localhost:8000` in frontend

### Before Production Deployment

- [ ] Create Neon PostgreSQL database
- [ ] Generate new production `BETTER_AUTH_SECRET`
- [ ] Update both `.env` files with Neon connection string
- [ ] Update `CORS_ORIGINS` with production frontend URL
- [ ] Update `NEXT_PUBLIC_API_URL` with production backend URL
- [ ] Update `BETTER_AUTH_URL` with production frontend URL
- [ ] Set `DEBUG=false` in backend
- [ ] Run database migrations (`alembic upgrade head`)
- [ ] Test authentication flow end-to-end
- [ ] Verify CORS is working
- [ ] Verify JWT token generation and validation

---

## Quick Reference

### Generate Secret
```bash
openssl rand -base64 32
```

### Copy Example Files
```bash
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local
```

### Verify Setup
```bash
# Check files exist
ls backend/.env frontend/.env.local

# Compare secrets
diff <(grep BETTER_AUTH_SECRET backend/.env) <(grep BETTER_AUTH_SECRET frontend/.env.local)
```

### Start Services
```bash
# Terminal 1 - Backend
cd backend && python -m app.main

# Terminal 2 - Frontend
cd frontend && npm run dev
```

---

**Status:** Production-ready configuration guide
**Last Updated:** January 7, 2026
**Maintained By:** Claude Code (Spec-Kit Plus)
