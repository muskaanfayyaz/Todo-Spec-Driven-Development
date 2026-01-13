# UI Specification: Components

**Version:** 1.0
**Date:** January 3, 2026
**Framework:** React 19+ with Next.js App Router
**Status:** Specification

---

## Table of Contents

1. [Component Architecture](#component-architecture)
2. [Component Specifications](#component-specifications)
3. [Component Props Reference](#component-props-reference)
4. [State Management](#state-management)
5. [Component Patterns](#component-patterns)

---

## Component Architecture

### Component Organization

```
components/
├── ui/                          # Reusable UI components
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Textarea.tsx
│   ├── Checkbox.tsx
│   └── Modal.tsx
├── tasks/                       # Task-specific components
│   ├── TaskList.tsx
│   ├── TaskItem.tsx
│   ├── AddTaskForm.tsx
│   └── EditTaskModal.tsx
├── layout/                      # Layout components
│   ├── Header.tsx
│   └── Container.tsx
└── auth/                        # Auth components
    ├── LoginForm.tsx
    └── SignupForm.tsx
```

### Component Types

**1. Server Components (Default)**
- Fetch data on server
- No client-side interactivity
- Better performance
- Examples: TaskList (initial render), Header

**2. Client Components ('use client')**
- Interactive elements
- State management
- Event handlers
- Examples: AddTaskForm, TaskItem, Checkbox

**3. Shared Components**
- Used by both server and client components
- Pure UI components
- Examples: Button, Input

---

## Component Specifications

### 1. TaskList Component

**Purpose:** Display list of tasks with filtering

**Type:** Client Component (interactive)

**File:** `components/tasks/TaskList.tsx`

**Props:**
```typescript
interface TaskListProps {
  initialTasks: Task[];     // Tasks from server
  userId: string;           // Authenticated user ID
  token: string;            // JWT token for API calls
}
```

**Features:**
- Display tasks in a list
- Filter by completion status (All, Pending, Completed)
- Real-time updates after actions
- Empty state message

**Implementation:**
```typescript
'use client';

import { useState } from 'react';
import TaskItem from './TaskItem';

interface Task {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

type Filter = 'all' | 'pending' | 'completed';

export default function TaskList({
  initialTasks,
  userId,
  token,
}: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [filter, setFilter] = useState<Filter>('all');

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'pending') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true; // 'all'
  });

  function handleTaskUpdated(updatedTask: Task) {
    setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
  }

  function handleTaskDeleted(taskId: number) {
    setTasks(tasks.filter(t => t.id !== taskId));
  }

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex justify-between items-center">
        <h2>My Tasks ({filteredTasks.length})</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as Filter)}
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <p className="text-center text-gray-500">No tasks found</p>
      ) : (
        <ul className="space-y-2">
          {filteredTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              userId={userId}
              token={token}
              onUpdate={handleTaskUpdated}
              onDelete={handleTaskDeleted}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
```

---

### 2. TaskItem Component

**Purpose:** Display single task with actions

**Type:** Client Component

**File:** `components/tasks/TaskItem.tsx`

**Props:**
```typescript
interface TaskItemProps {
  task: Task;
  userId: string;
  token: string;
  onUpdate: (task: Task) => void;
  onDelete: (taskId: number) => void;
}
```

**Features:**
- Display task title, description, completion status
- Checkbox to toggle completion
- Edit button (opens modal)
- Delete button (with confirmation)
- Optimistic UI updates

**Layout:**
```
┌────────────────────────────────────────────┐
│ ☐ Task Title                    [Edit][Del]│
│   Task description (truncated if long)     │
└────────────────────────────────────────────┘
```

**Implementation:**
```typescript
'use client';

import { useState } from 'react';
import Checkbox from '@/components/ui/Checkbox';
import Button from '@/components/ui/Button';
import EditTaskModal from './EditTaskModal';

export default function TaskItem({
  task,
  userId,
  token,
  onUpdate,
  onDelete,
}: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleToggleComplete() {
    setLoading(true);

    // Optimistic update
    const updatedTask = { ...task, completed: !task.completed };
    onUpdate(updatedTask);

    try {
      const endpoint = task.completed ? 'uncomplete' : 'complete';
      const response = await fetch(
        `/api/${userId}/tasks/${task.id}/${endpoint}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to toggle task');

      const data = await response.json();
      onUpdate(data);
    } catch (error) {
      // Revert optimistic update
      onUpdate(task);
      alert('Failed to update task');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this task?')) return;

    setLoading(true);

    // Optimistic removal
    onDelete(task.id);

    try {
      const response = await fetch(`/api/${userId}/tasks/${task.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete task');
    } catch (error) {
      // Revert optimistic removal (would need to add task back)
      alert('Failed to delete task');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <li className="border rounded-lg p-4 flex items-start gap-3">
        <Checkbox
          checked={task.completed}
          onChange={handleToggleComplete}
          disabled={loading}
          aria-label={`Mark task "${task.title}" as complete`}
        />

        <div className="flex-1">
          <h3 className={task.completed ? 'line-through text-gray-500' : ''}>
            {task.title}
          </h3>
          {task.description && (
            <p className="text-sm text-gray-600 mt-1">
              {task.description}
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <Button size="sm" onClick={() => setIsEditing(true)} disabled={loading}>
            Edit
          </Button>
          <Button size="sm" variant="danger" onClick={handleDelete} disabled={loading}>
            Delete
          </Button>
        </div>
      </li>

      {isEditing && (
        <EditTaskModal
          task={task}
          userId={userId}
          token={token}
          onUpdate={onUpdate}
          onClose={() => setIsEditing(false)}
        />
      )}
    </>
  );
}
```

---

### 3. AddTaskForm Component

**Purpose:** Form to create new tasks

**Type:** Client Component

**File:** `components/tasks/AddTaskForm.tsx`

**Props:**
```typescript
interface AddTaskFormProps {
  userId: string;
  token: string;
  onTaskAdded: (task: Task) => void;
}
```

**Features:**
- Title input (required, 1-200 chars)
- Description textarea (optional, 0-1000 chars)
- Submit button
- Form validation
- Clear form after submit

**Implementation:**
```typescript
'use client';

import { useState } from 'react';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';

export default function AddTaskForm({ userId, token, onTaskAdded }: AddTaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (title.length > 200) {
      setError('Title cannot exceed 200 characters');
      return;
    }

    if (description.length > 1000) {
      setError('Description cannot exceed 1000 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/${userId}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description }),
      });

      if (!response.ok) {
        throw new Error('Failed to create task');
      }

      const newTask = await response.json();
      onTaskAdded(newTask);

      // Clear form
      setTitle('');
      setDescription('');
    } catch (err) {
      setError('Failed to create task. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border rounded-lg p-4 space-y-4">
      <h2>Add New Task</h2>

      <Input
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Task title"
        required
        maxLength={200}
      />

      <Textarea
        label="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Task description"
        rows={3}
        maxLength={1000}
      />

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <Button type="submit" disabled={loading}>
        {loading ? 'Adding...' : 'Add Task'}
      </Button>
    </form>
  );
}
```

---

### 4. EditTaskModal Component

**Purpose:** Modal for editing existing task

**Type:** Client Component

**File:** `components/tasks/EditTaskModal.tsx`

**Props:**
```typescript
interface EditTaskModalProps {
  task: Task;
  userId: string;
  token: string;
  onUpdate: (task: Task) => void;
  onClose: () => void;
}
```

**Features:**
- Pre-filled form with task data
- Title and description inputs
- Save and Cancel buttons
- Validation
- Close on escape key

**Implementation:**
```typescript
'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';

export default function EditTaskModal({
  task,
  userId,
  token,
  onUpdate,
  onClose,
}: EditTaskModalProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSave() {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/${userId}/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description }),
      });

      if (!response.ok) throw new Error('Failed to update task');

      const updatedTask = await response.json();
      onUpdate(updatedTask);
      onClose();
    } catch (err) {
      setError('Failed to update task. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal onClose={onClose}>
      <h2 className="text-xl font-bold mb-4">Edit Task</h2>

      <div className="space-y-4">
        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={200}
        />

        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          maxLength={1000}
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex gap-2 justify-end">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
```

---

### 5. Button Component (UI)

**Purpose:** Reusable button component

**Type:** Shared Component

**File:** `components/ui/Button.tsx`

**Props:**
```typescript
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}
```

**Variants:**
- **primary**: Blue background (default)
- **secondary**: Gray background
- **danger**: Red background

**Sizes:**
- **sm**: Small (py-1 px-3)
- **md**: Medium (py-2 px-4) - default
- **lg**: Large (py-3 px-6)

**Implementation:**
```typescript
export default function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
}: ButtonProps) {
  const baseClasses = 'rounded font-medium transition-colors';

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 disabled:bg-gray-100',
    danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300',
  };

  const sizeClasses = {
    sm: 'py-1 px-3 text-sm',
    md: 'py-2 px-4',
    lg: 'py-3 px-6 text-lg',
  };

  const className = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {children}
    </button>
  );
}
```

---

### 6. Input Component (UI)

**Purpose:** Reusable text input

**Type:** Shared Component

**File:** `components/ui/Input.tsx`

**Props:**
```typescript
interface InputProps {
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: 'text' | 'email' | 'password';
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
  disabled?: boolean;
}
```

**Implementation:**
```typescript
export default function Input({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required,
  maxLength,
  disabled,
}: InputProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        disabled={disabled}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
      />
    </div>
  );
}
```

---

### 7. Textarea Component (UI)

**Purpose:** Reusable multiline text input

**Type:** Shared Component

**File:** `components/ui/Textarea.tsx`

**Implementation:**
```typescript
interface TextareaProps {
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
  disabled?: boolean;
}

export default function Textarea({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  maxLength,
  disabled,
}: TextareaProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        disabled={disabled}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
      />
    </div>
  );
}
```

---

### 8. Checkbox Component (UI)

**Purpose:** Reusable checkbox

**Type:** Shared Component

**File:** `components/ui/Checkbox.tsx`

**Implementation:**
```typescript
interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  'aria-label'?: string;
}

export default function Checkbox({
  checked,
  onChange,
  disabled,
  'aria-label': ariaLabel,
}: CheckboxProps) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      aria-label={ariaLabel}
      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
    />
  );
}
```

---

### 9. Modal Component (UI)

**Purpose:** Reusable modal dialog

**Type:** Client Component

**File:** `components/ui/Modal.tsx`

**Implementation:**
```typescript
'use client';

import { useEffect } from 'react';

interface ModalProps {
  children: React.ReactNode;
  onClose: () => void;
}

export default function Modal({ children, onClose }: ModalProps) {
  // Close on escape key
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
```

---

### 10. Header Component

**Purpose:** App header with logo and logout

**Type:** Server Component (can be client if needed)

**File:** `components/layout/Header.tsx`

**Implementation:**
```typescript
import LogoutButton from './LogoutButton';

interface HeaderProps {
  userName?: string;
}

export default function Header({ userName }: HeaderProps) {
  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Todo App</h1>
        <div className="flex items-center gap-4">
          {userName && <span className="text-sm">Hello, {userName}</span>}
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
```

---

## Component Props Reference

### Task Type Definition

```typescript
interface Task {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  created_at: string;  // ISO 8601
  updated_at: string;  // ISO 8601
}
```

### Common Props Pattern

**Every task operation component needs:**
```typescript
{
  userId: string;    // From authenticated session
  token: string;     // JWT for API calls
}
```

---

## State Management

### Server vs Client State

**Server State (React Server Components):**
- Initial data fetching
- No state management needed
- Pass data as props

**Client State (useState):**
- Form inputs
- UI toggles (modals, filters)
- Optimistic updates
- Loading/error states

### Optimistic Updates Pattern

```typescript
async function handleAction() {
  // 1. Optimistic update (instant UI feedback)
  const optimisticData = { ...currentData, updated: true };
  updateUI(optimisticData);

  try {
    // 2. API call
    const response = await fetch('...');
    const serverData = await response.json();

    // 3. Confirm with server data
    updateUI(serverData);
  } catch (error) {
    // 4. Revert on error
    updateUI(currentData);
    showError('Operation failed');
  }
}
```

---

## Component Patterns

### Pattern 1: Container/Presenter

**Container (Smart Component):**
- Fetches data
- Manages state
- Handles business logic

**Presenter (Dumb Component):**
- Receives data via props
- Renders UI only
- Fires callbacks

**Example:**
```typescript
// Container
function TaskListContainer() {
  const [tasks, setTasks] = useState([]);
  // ... fetch and state management
  return <TaskListPresenter tasks={tasks} onAction={...} />;
}

// Presenter
function TaskListPresenter({ tasks, onAction }) {
  return <ul>{tasks.map(...)}</ul>;
}
```

### Pattern 2: Compound Components

**Parent controls shared state:**
```typescript
<Modal>
  <ModalHeader>Edit Task</ModalHeader>
  <ModalBody>
    <Input />
  </ModalBody>
  <ModalFooter>
    <Button>Save</Button>
  </ModalFooter>
</Modal>
```

### Pattern 3: Render Props (Optional)

**Flexible rendering:**
```typescript
<TaskList
  tasks={tasks}
  renderTask={(task) => <CustomTaskItem task={task} />}
/>
```

---

## Appendix: Component Testing

### Unit Testing (Jest + React Testing Library)

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

test('Button renders with text', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByText('Click me')).toBeInTheDocument();
});

test('Button calls onClick when clicked', () => {
  const handleClick = jest.fn();
  render(<Button onClick={handleClick}>Click me</Button>);

  fireEvent.click(screen.getByText('Click me'));
  expect(handleClick).toHaveBeenCalledTimes(1);
});

test('Button is disabled when disabled prop is true', () => {
  render(<Button disabled>Click me</Button>);
  expect(screen.getByText('Click me')).toBeDisabled();
});
```

### Integration Testing

```typescript
test('TaskItem toggles completion status', async () => {
  const task = { id: 1, title: 'Test', completed: false };
  const onUpdate = jest.fn();

  render(<TaskItem task={task} onUpdate={onUpdate} />);

  const checkbox = screen.getByRole('checkbox');
  fireEvent.click(checkbox);

  await waitFor(() => {
    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ completed: true })
    );
  });
});
```

---

**Document Status:** Complete
**Dependencies:** ui/pages.md, features/task-crud.md, api/rest-endpoints.md
**Related Specs:** All Phase II specifications
**Implementation:** Not started (spec-only phase)
