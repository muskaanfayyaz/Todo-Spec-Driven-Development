# UI Specification: Pages and User Flows

**Version:** 1.0
**Date:** January 3, 2026
**Framework:** Next.js 16+ (App Router)
**Status:** Specification

---

## Table of Contents

1. [UI Overview](#ui-overview)
2. [Page Structure](#page-structure)
3. [Page Specifications](#page-specifications)
4. [User Flows](#user-flows)
5. [Navigation](#navigation)
6. [Responsive Design](#responsive-design)
7. [Loading and Error States](#loading-and-error-states)

---

## UI Overview

### Design Principles

**1. Simplicity**
- Clean, minimal interface
- Focus on task management (no distractions)
- Clear visual hierarchy

**2. Responsiveness**
- Mobile-first design
- Works on all screen sizes (320px - 2560px)
- Touch-friendly on mobile

**3. Accessibility**
- Keyboard navigation
- ARIA labels
- Semantic HTML
- High contrast ratios

**4. Performance**
- Fast initial load (< 2s)
- Instant feedback for actions
- Optimistic UI updates

### Technology Stack

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Framework** | Next.js 16+ (App Router) | React framework with SSR/SSG |
| **Language** | TypeScript | Type-safe development |
| **Styling** | Tailwind CSS | Utility-first CSS |
| **Components** | React 19+ | Component library |
| **Authentication** | Better Auth | User session management |
| **State** | React Server Components + Client State | Hybrid rendering |
| **Forms** | React Hook Form (optional) | Form handling |
| **HTTP Client** | fetch (native) | API requests |

---

## Page Structure

### App Router Structure

```
app/
├── (auth)/                          # Auth route group
│   ├── login/
│   │   └── page.tsx                # Login page
│   └── signup/
│       └── page.tsx                # Signup page
├── (protected)/                     # Protected route group
│   └── tasks/
│       └── page.tsx                # Task list page (main app)
├── layout.tsx                       # Root layout
├── page.tsx                         # Landing page (redirects)
└── global.css                       # Global styles
```

### Layout Hierarchy

```
Root Layout (app/layout.tsx)
├─> Auth Layout (app/(auth)/layout.tsx)
│   ├─> Login Page
│   └─> Signup Page
└─> Protected Layout (app/(protected)/layout.tsx)
    └─> Tasks Page (main app)
```

---

## Page Specifications

### 1. Landing Page (`/`)

**Purpose:** Entry point that redirects to appropriate page

**Route:** `/`

**Access:** Public

**Behavior:**
- If user is logged in → Redirect to `/tasks`
- If user is NOT logged in → Redirect to `/login`

**Implementation:**
```typescript
// app/page.tsx
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';

export default async function HomePage() {
  const session = await getSession();

  if (session) {
    redirect('/tasks');
  } else {
    redirect('/login');
  }
}
```

**No UI needed** (instant redirect)

---

### 2. Login Page (`/login`)

**Purpose:** Allow users to authenticate with email/password

**Route:** `/login`

**Access:** Public (redirects if already logged in)

**Layout:**
```
┌─────────────────────────────────────────┐
│                                         │
│           ┌───────────────────┐         │
│           │                   │         │
│           │   Todo App Logo   │         │
│           │                   │         │
│           └───────────────────┘         │
│                                         │
│           Login to your account         │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │ Email                           │   │
│   │ [                             ] │   │
│   └─────────────────────────────────┘   │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │ Password                        │   │
│   │ [                             ] │   │
│   └─────────────────────────────────┘   │
│                                         │
│   [  Login Button (Primary)        ]    │
│                                         │
│   Don't have an account? Sign up        │
│                                         │
└─────────────────────────────────────────┘
```

**Form Fields:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `email` | email | Yes | Valid email format |
| `password` | password | Yes | Minimum 8 characters |

**Actions:**
- **Login Button**: Submit credentials → Better Auth → Get JWT → Redirect to `/tasks`
- **Sign up Link**: Navigate to `/signup`

**States:**
| State | Trigger | UI |
|-------|---------|-----|
| **Idle** | Initial | Show form |
| **Loading** | After submit | Disable button, show spinner |
| **Error** | Invalid credentials | Show error message below form |
| **Success** | Valid login | Redirect to `/tasks` |

**Error Messages:**
- "Invalid email or password" (don't specify which field)
- "Please enter a valid email address"
- "Password must be at least 8 characters"

**Implementation Example:**
```typescript
// app/(auth)/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await authClient.signIn({ email, password });

      if (error) {
        setError('Invalid email or password');
        return;
      }

      // Success - redirect to tasks
      router.push('/tasks');
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        <h1>Login to your account</h1>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />

        {error && <p className="text-red-500">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <p>
          Don't have an account? <a href="/signup">Sign up</a>
        </p>
      </form>
    </div>
  );
}
```

---

### 3. Signup Page (`/signup`)

**Purpose:** Allow new users to create an account

**Route:** `/signup`

**Access:** Public (redirects if already logged in)

**Layout:**
```
┌─────────────────────────────────────────┐
│                                         │
│           ┌───────────────────┐         │
│           │                   │         │
│           │   Todo App Logo   │         │
│           │                   │         │
│           └───────────────────┘         │
│                                         │
│           Create your account           │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │ Name                            │   │
│   │ [                             ] │   │
│   └─────────────────────────────────┘   │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │ Email                           │   │
│   │ [                             ] │   │
│   └─────────────────────────────────┘   │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │ Password                        │   │
│   │ [                             ] │   │
│   └─────────────────────────────────┘   │
│                                         │
│   [  Sign Up Button (Primary)      ]    │
│                                         │
│   Already have an account? Login        │
│                                         │
└─────────────────────────────────────────┘
```

**Form Fields:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | text | No | Max 100 characters |
| `email` | email | Yes | Valid email format, unique |
| `password` | password | Yes | Minimum 8 characters |

**Actions:**
- **Sign Up Button**: Submit → Better Auth creates account → Get JWT → Redirect to `/tasks`
- **Login Link**: Navigate to `/login`

**States:**
| State | Trigger | UI |
|-------|---------|-----|
| **Idle** | Initial | Show form |
| **Loading** | After submit | Disable button, show spinner |
| **Error** | Email exists / Validation error | Show error message |
| **Success** | Account created | Redirect to `/tasks` |

**Error Messages:**
- "Email already registered"
- "Please enter a valid email address"
- "Password must be at least 8 characters"

---

### 4. Tasks Page (`/tasks`) - Main Application

**Purpose:** View and manage personal task list

**Route:** `/tasks`

**Access:** Protected (requires authentication)

**Layout:**
```
┌───────────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────────┐   │
│ │ Header                                               │   │
│ │ ┌──────────────────┐                  ┌──────────┐  │   │
│ │ │ Todo App         │                  │ Logout   │  │   │
│ │ └──────────────────┘                  └──────────┘  │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                           │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ Add New Task                                         │   │
│ │ ┌─────────────────────────────────────────────┐     │   │
│ │ │ Title [                                   ] │     │   │
│ │ └─────────────────────────────────────────────┘     │   │
│ │ ┌─────────────────────────────────────────────┐     │   │
│ │ │ Description (optional)                      │     │   │
│ │ │ [                                         ] │     │   │
│ │ └─────────────────────────────────────────────┘     │   │
│ │ [ Add Task ]                                        │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                           │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ My Tasks (5)                          [All ▼]       │   │
│ ├─────────────────────────────────────────────────────┤   │
│ │ ☐ Buy groceries                      [Edit][Delete] │   │
│ │   Milk, eggs, bread                                 │   │
│ ├─────────────────────────────────────────────────────┤   │
│ │ ☑ Finish project                     [Edit][Delete] │   │
│ │   Complete Phase II                                 │   │
│ ├─────────────────────────────────────────────────────┤   │
│ │ ☐ Call dentist                       [Edit][Delete] │   │
│ │                                                      │   │
│ ├─────────────────────────────────────────────────────┤   │
│ │ ... (more tasks)                                    │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

**Sections:**

#### Header
- **App Title**: "Todo App" (left)
- **User Info**: Display user name (optional)
- **Logout Button**: Sign out (right)

#### Add Task Form
- **Title Input**: Required, 1-200 characters
- **Description Textarea**: Optional, 0-1000 characters
- **Add Task Button**: Submit form

#### Task List
- **Filter Dropdown**: All / Pending / Completed
- **Task Count**: Total tasks shown
- **Task Items**: List of tasks (see Component spec)

**User Interactions:**

| Action | Trigger | Result |
|--------|---------|--------|
| **Add Task** | Click "Add Task" | Create task → Append to list |
| **Toggle Complete** | Click checkbox | Mark complete/incomplete → Update UI |
| **Edit Task** | Click "Edit" | Inline edit or modal → Update task |
| **Delete Task** | Click "Delete" | Confirm → Delete → Remove from list |
| **Filter Tasks** | Select from dropdown | Show filtered tasks |
| **Logout** | Click "Logout" | Clear session → Redirect to `/login` |

**Data Fetching:**
```typescript
// app/(protected)/tasks/page.tsx
import { getSession } from '@/lib/auth';
import { TaskList } from '@/components/TaskList';

export default async function TasksPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  // Fetch tasks server-side
  const response = await fetch(
    `${process.env.API_URL}/api/${session.user.id}/tasks`,
    {
      headers: {
        Authorization: `Bearer ${session.token}`,
      },
    }
  );

  const tasks = await response.json();

  return (
    <div>
      <Header user={session.user} />
      <AddTaskForm userId={session.user.id} token={session.token} />
      <TaskList initialTasks={tasks} userId={session.user.id} token={session.token} />
    </div>
  );
}
```

---

## User Flows

### Flow 1: New User Registration and First Task

```
1. User visits app (/)
   ↓
2. Redirected to /login
   ↓
3. User clicks "Sign up"
   ↓
4. Navigates to /signup
   ↓
5. User fills form (name, email, password)
   ↓
6. Clicks "Sign Up"
   ↓
7. Better Auth creates account
   ↓
8. JWT token issued
   ↓
9. Redirected to /tasks
   ↓
10. Empty task list shown (welcome message)
   ↓
11. User fills "Add Task" form
   ↓
12. Clicks "Add Task"
   ↓
13. Task created via API
   ↓
14. Task appears in list
   ✓ Success
```

### Flow 2: Returning User Login

```
1. User visits app (/)
   ↓
2. Redirected to /login
   ↓
3. User enters email + password
   ↓
4. Clicks "Login"
   ↓
5. Better Auth verifies credentials
   ↓
6. JWT token issued
   ↓
7. Redirected to /tasks
   ↓
8. Task list loaded from API
   ↓
9. User sees their tasks
   ✓ Success
```

### Flow 3: Complete a Task

```
1. User is on /tasks page
   ↓
2. User clicks checkbox next to pending task
   ↓
3. Frontend optimistically updates UI (checkmark)
   ↓
4. Frontend calls PATCH /api/{user_id}/tasks/{id}/complete
   ↓
5. Backend marks task completed
   ↓
6. Backend returns updated task
   ↓
7. Frontend confirms optimistic update
   ✓ Success

Alternative: If API call fails
   ↓
3b. Frontend reverts optimistic update
   ↓
4b. Shows error message
   ✗ Error handled
```

### Flow 4: Delete a Task

```
1. User is on /tasks page
   ↓
2. User clicks "Delete" button on task
   ↓
3. Confirmation dialog appears
   ↓
4. User confirms deletion
   ↓
5. Frontend optimistically removes from UI
   ↓
6. Frontend calls DELETE /api/{user_id}/tasks/{id}
   ↓
7. Backend deletes task
   ↓
8. Backend returns 204 No Content
   ↓
9. Frontend confirms removal
   ✓ Success
```

### Flow 5: Logout

```
1. User is on /tasks page
   ↓
2. User clicks "Logout" button
   ↓
3. Frontend calls Better Auth logout
   ↓
4. Better Auth clears session
   ↓
5. Frontend clears JWT from storage
   ↓
6. Redirected to /login
   ✓ Success
```

---

## Navigation

### Public Routes (Unauthenticated)

| Route | Component | Redirect If Logged In |
|-------|-----------|----------------------|
| `/` | Landing Page | → `/tasks` |
| `/login` | Login Page | → `/tasks` |
| `/signup` | Signup Page | → `/tasks` |

### Protected Routes (Authenticated)

| Route | Component | Redirect If NOT Logged In |
|-------|-----------|---------------------------|
| `/tasks` | Tasks Page | → `/login` |

### Navigation Guards

**Protected Route Middleware:**
```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const session = await getSession();
  const { pathname } = request.nextUrl;

  // Protected routes
  if (pathname.startsWith('/tasks')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Auth routes (redirect if already logged in)
  if (pathname === '/login' || pathname === '/signup') {
    if (session) {
      return NextResponse.redirect(new URL('/tasks', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

---

## Responsive Design

### Breakpoints (Tailwind CSS)

| Breakpoint | Screen Width | Target Device |
|------------|--------------|---------------|
| `sm` | 640px+ | Large phones (landscape) |
| `md` | 768px+ | Tablets |
| `lg` | 1024px+ | Laptops |
| `xl` | 1280px+ | Desktops |
| `2xl` | 1536px+ | Large screens |

### Mobile Layout (< 640px)

```
┌─────────────────────┐
│ ┌─────────────────┐ │
│ │ Header          │ │
│ │ Todo App   [≡]  │ │
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │ Add Task        │ │
│ │ [Title      ]   │ │
│ │ [Desc...    ]   │ │
│ │ [ + Add ]       │ │
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │ ☐ Buy groceries │ │
│ │ Milk, eggs...   │ │
│ │ [Edit][Delete]  │ │
│ └─────────────────┘ │
│ ┌─────────────────┐ │
│ │ ☑ Finish proj   │ │
│ │ Complete...     │ │
│ │ [Edit][Delete]  │ │
│ └─────────────────┘ │
└─────────────────────┘
```

**Mobile Adaptations:**
- Stack form fields vertically
- Full-width buttons
- Larger touch targets (44x44px minimum)
- Truncate long descriptions with ellipsis

### Tablet Layout (640px - 1024px)

```
┌───────────────────────────────┐
│ ┌───────────────────────────┐ │
│ │ Header                     │ │
│ │ Todo App          Logout   │ │
│ └───────────────────────────┘ │
│                               │
│ ┌───────────────────────────┐ │
│ │ Add Task                   │ │
│ │ Title: [               ]   │ │
│ │ Desc:  [               ]   │ │
│ │        [ Add Task ]        │ │
│ └───────────────────────────┘ │
│                               │
│ ┌───────────────────────────┐ │
│ │ ☐ Buy groceries     [E][D] │ │
│ │ Milk, eggs, bread          │ │
│ └───────────────────────────┘ │
│ ┌───────────────────────────┐ │
│ │ ☑ Finish project    [E][D] │ │
│ │ Complete Phase II          │ │
│ └───────────────────────────┘ │
└───────────────────────────────┘
```

### Desktop Layout (1024px+)

**Use the full Tasks Page layout shown earlier**

---

## Loading and Error States

### Loading States

#### Page Loading
```typescript
// app/(protected)/tasks/loading.tsx
export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      <p className="ml-3">Loading tasks...</p>
    </div>
  );
}
```

#### Task Creation Loading
- Disable "Add Task" button
- Show spinner inside button
- Disable form inputs

#### Task Update Loading
- Show spinner on affected task
- Disable actions for that task

### Error States

#### Page Error
```typescript
// app/(protected)/tasks/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <p className="mb-4">{error.message}</p>
      <button onClick={reset} className="btn-primary">
        Try again
      </button>
    </div>
  );
}
```

#### API Error Handling
```typescript
try {
  const response = await fetch('/api/...');
  if (!response.ok) {
    throw new Error('Failed to fetch tasks');
  }
  const data = await response.json();
} catch (error) {
  setError('Failed to load tasks. Please try again.');
}
```

#### Empty State
```typescript
{tasks.length === 0 ? (
  <div className="text-center py-12">
    <p className="text-gray-500 mb-4">No tasks yet!</p>
    <p className="text-sm text-gray-400">
      Add your first task above to get started.
    </p>
  </div>
) : (
  <TaskList tasks={tasks} />
)}
```

---

## Appendix: Accessibility (a11y)

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Navigate between interactive elements |
| `Enter` | Submit form / Activate button |
| `Space` | Toggle checkbox |
| `Esc` | Close modal / Cancel action |

### ARIA Labels

```tsx
<button aria-label="Add new task">
  <PlusIcon />
</button>

<input
  type="checkbox"
  aria-label={`Mark task "${task.title}" as complete`}
  checked={task.completed}
/>

<button aria-label={`Delete task "${task.title}"`}>
  Delete
</button>
```

### Semantic HTML

```tsx
<header>...</header>
<main>
  <section aria-label="Add new task">...</section>
  <section aria-label="Task list">
    <ul>
      <li>...</li>
    </ul>
  </section>
</main>
```

### Color Contrast

- Text: Minimum 4.5:1 contrast ratio
- Buttons: Minimum 3:1 contrast ratio
- Use tools: WebAIM Contrast Checker

---

**Document Status:** Complete
**Dependencies:** features/task-crud.md, features/authentication.md, api/rest-endpoints.md
**Related Specs:** ui/components.md
**Implementation:** Not started (spec-only phase)
