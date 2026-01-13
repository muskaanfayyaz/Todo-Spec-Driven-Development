# Frontend Development Guide (Claude Code)

**Project:** Todo App - Phase II Frontend
**Framework:** Next.js 14+ with App Router
**UI Library:** Tailwind CSS
**Authentication:** Better Auth
**Status:** Scaffolding Complete

---

## Project Context

You are working on the **Frontend** of a full-stack Todo application following **Spec-Kit Plus** methodology.

**Relationship to Backend:**
- Frontend and backend are **separate services**
- Communication via REST API only
- Backend API: `http://localhost:8000` (configured in `.env.local`)
- All API calls require JWT authentication

---

## Directory Structure

```
frontend/
├── app/             # Next.js App Router pages
│   ├── layout.tsx   # Root layout
│   ├── page.tsx     # Home page
│   └── globals.css  # Global styles
├── components/      # Reusable React components
├── lib/            # Utilities and API clients
├── public/         # Static assets
└── package.json    # Dependencies
```

---

## Development Rules

### 1. Spec-Driven Development

**RULE:** All code MUST be generated from specifications in `/specs/ui/`

**Process:**
1. Read relevant spec from `/specs/ui/pages.md` or `/specs/ui/components.md`
2. Generate component/page code
3. Verify against spec
4. NEVER manually edit generated code

### 2. Next.js App Router Conventions

**File-based Routing:**
- `app/page.tsx` → `/`
- `app/tasks/page.tsx` → `/tasks`
- `app/login/page.tsx` → `/login`

**Layouts:**
- `app/layout.tsx` → Root layout for entire app
- `app/(auth)/layout.tsx` → Layout for auth pages

**Server vs Client Components:**
- Default: Server Components (no "use client")
- Add `"use client"` only when needed (forms, hooks, events)

### 3. Authentication Integration

**Better Auth Setup:**
```typescript
// lib/auth.ts
import { createAuthClient } from "better-auth/client";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});
```

**Protected Routes:**
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  // Check JWT token
  // Redirect to /login if not authenticated
}
```

### 4. API Communication

**API Client Pattern:**
```typescript
// lib/api-client.ts
async function apiRequest(endpoint: string, options: RequestInit) {
  const token = getToken(); // From Better Auth session

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (response.status === 401) {
    // Token expired, redirect to login
  }

  return response.json();
}
```

### 5. Styling with Tailwind

**Utility-First Approach:**
```tsx
<div className="min-h-screen flex items-center justify-center bg-gray-50">
  <h1 className="text-4xl font-bold text-gray-900">Title</h1>
</div>
```

**Component-Level Styles:**
- Use Tailwind utilities
- Extract repeated patterns into components
- Avoid custom CSS unless absolutely necessary

---

## Security Requirements

### 1. JWT Token Handling

**NEVER expose tokens in:**
- URL parameters
- Console logs
- Client-side storage (use httpOnly cookies)

**Storage:**
- Better Auth handles token storage
- Token included automatically in API requests

### 2. Input Validation

**Client-Side Validation:**
- Validate all form inputs before submission
- Use Zod schemas for type-safe validation
- Display user-friendly error messages

**Trust Backend:**
- Client validation is UX, not security
- Backend performs authoritative validation

### 3. CORS and API Calls

**Configuration:**
- API URL in environment variable: `NEXT_PUBLIC_API_URL`
- Backend must allow frontend origin in CORS

---

## Common Tasks

### Create a New Page

1. Read spec: `/specs/ui/pages.md#page-name`
2. Create file: `app/page-name/page.tsx`
3. Implement according to spec
4. Add to navigation if needed

### Create a Component

1. Read spec: `/specs/ui/components.md#component-name`
2. Create file: `components/ComponentName.tsx`
3. Implement according to spec
4. Export from `components/index.ts`

### Add API Integration

1. Read spec: `/specs/api/rest-endpoints.md#endpoint-name`
2. Create API client function in `lib/api.ts`
3. Use in component with proper error handling
4. Display loading and error states

---

## Environment Variables

**Required in `.env.local`:**
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
BETTER_AUTH_SECRET=<same-as-backend>
```

**Access in Code:**
```typescript
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
```

---

## Testing Checklist

Before considering a feature complete:

- [ ] Matches specification exactly
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Proper error handling (network errors, validation errors)
- [ ] Loading states shown
- [ ] Accessible (keyboard navigation, ARIA labels)
- [ ] Authentication enforced
- [ ] No console errors

---

## References

- **Root Constitution:** `/CONSTITUTION_PHASE2.md`
- **UI Specifications:** `/specs/ui/`
- **API Specifications:** `/specs/api/rest-endpoints.md`
- **Next.js Docs:** https://nextjs.org/docs
- **Better Auth Docs:** https://better-auth.com

---

**Remember:** NEVER manually code. Generate from specs. Trust the process.
