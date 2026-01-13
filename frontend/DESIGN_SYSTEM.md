# Premium Design System

## Overview

This design system transforms the Todo app into a production-grade SaaS product with a modern, calming, and productivity-focused aesthetic inspired by Linear, Notion, and Vercel.

---

## Design Philosophy

### Core Principles

1. **Clarity First** - Every element has a clear purpose and hierarchy
2. **Subtle Motion** - Smooth transitions that feel natural, never jarring
3. **Calm Colors** - Professional palette suitable for long-term daily usage
4. **Accessibility** - WCAG AA+ contrast ratios, keyboard navigation, reduced motion support

### Visual Direction

- **Light mode optimized** with warm neutral grays
- **Indigo primary** for trust and productivity
- **Rounded corners** (8px default) for modern, friendly feel
- **Generous whitespace** for breathing room
- **Micro-interactions** that delight without distracting

---

## Color System

### Primary - Indigo
Professional, trustworthy, and calming. Used for primary actions and brand elements.

```
50:  #eef2ff  (Lightest background)
100: #e0e7ff
200: #c7d2fe
300: #a5b4fc
400: #818cf8
500: #6366f1  ← Main brand color
600: #4f46e5  ← Primary button hover
700: #4338ca
800: #3730a3
900: #312e81
```

### Neutral - Warm Grays
Comfortable for extended viewing, reduces eye strain.

```
0:   #ffffff  (Pure white)
50:  #fafaf9  ← Background
100: #f5f5f4  (Secondary background)
200: #e7e5e4  (Border light)
300: #d6d3d1  (Border)
400: #a8a29e  (Disabled text)
500: #78716c  (Secondary text)
600: #57534e  ← Body text
700: #44403c  (Heading text)
800: #292524
900: #1c1917  (High contrast)
```

### Success - Green
Task completion, positive feedback.

```
500: #22c55e  ← Main success color
600: #16a34a
```

### Danger - Red
Destructive actions, errors.

```
500: #ef4444  ← Main danger color
600: #dc2626
```

### Semantic Colors

- **Background**: `#fafaf9` - Page background
- **Surface**: `#ffffff` - Card/panel background
- **Border**: `#e7e5e4` - Default borders
- **Text Primary**: `#1c1917` - Headings
- **Text Secondary**: `#57534e` - Body text
- **Text Tertiary**: `#78716c` - Helper text

---

## Typography

### Font Family

**Inter** - Modern, highly legible sans-serif designed for screens.

```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

**Font Features Enabled:**
- Character variants for improved readability
- Tabular numbers for data alignment

### Type Scale

```
xs:   12px - Captions, small labels
sm:   14px - Secondary text, helper text
base: 16px - Body text (default)
lg:   18px - Emphasized body text
xl:   20px - Subheadings
2xl:  24px - Section headings
3xl:  30px - Page headings
4xl:  36px - Hero headings
5xl:  48px - Display headings
```

### Font Weights

```
400 (Normal)    - Body text
500 (Medium)    - Emphasized text
600 (Semibold)  - Headings, buttons
700 (Bold)      - Strong emphasis
```

### Line Heights

```
tight:   1.25  - Headings
normal:  1.5   - Body text (default)
relaxed: 1.625 - Long-form content
loose:   2     - Poetry, special layouts
```

---

## Spacing System

**8-point grid** for consistent rhythm and alignment.

```
1:  4px   - Tiny gaps
2:  8px   - Default gap
3:  12px  - Compact spacing
4:  16px  - Standard spacing
5:  20px  - Comfortable spacing
6:  24px  - Section spacing
8:  32px  - Large section spacing
12: 48px  - Page section spacing
16: 64px  - Hero spacing
```

---

## Components

### Button

**Variants:**
- `primary` - Main actions (indigo, elevated)
- `secondary` - Secondary actions (neutral, flat)
- `ghost` - Tertiary actions (transparent, hover only)
- `danger` - Destructive actions (red, elevated)
- `success` - Positive actions (green, elevated)

**Sizes:**
- `sm` - 32px height
- `md` - 40px height (default)
- `lg` - 48px height

**States:**
- Hover: Darker background, subtle shadow increase
- Active: Even darker background
- Focus: 2px ring with brand color
- Disabled: 50% opacity, no interaction
- Loading: Spinner animation

**Example:**
```tsx
<Button variant="primary" size="md">
  Save Changes
</Button>
```

### Input

**Features:**
- Floating labels (optional)
- Error states with validation messages
- Helper text support
- Icon support (left/right)
- Full-width option
- Auto-focus states

**States:**
- Default: Neutral border
- Hover: Darker border
- Focus: Primary ring + border
- Error: Danger ring + border
- Disabled: Gray background

**Example:**
```tsx
<Input
  label="Email Address"
  type="email"
  placeholder="you@example.com"
  error={errors.email}
  fullWidth
/>
```

### Textarea

**Features:**
- Auto-resize option
- Character counter
- Same states as Input
- Min/max height controls

**Example:**
```tsx
<Textarea
  label="Description"
  autoResize
  maxLength={1000}
  showCount
/>
```

### Card

**Variants:**
- `flat` - No shadow
- `elevated` - Subtle shadow (default)
- `outlined` - Border instead of shadow

**Padding:**
- `none` - No padding
- `sm` - 16px
- `md` - 24px (default)
- `lg` - 32px

**Subcomponents:**
- `CardHeader` - Top section
- `CardTitle` - Main heading
- `CardDescription` - Supporting text
- `CardContent` - Main content
- `CardFooter` - Bottom section (actions)

**Example:**
```tsx
<Card variant="elevated" padding="md">
  <CardHeader>
    <CardTitle>Task Details</CardTitle>
    <CardDescription>Update task information</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
  <CardFooter>
    <Button>Save</Button>
  </CardFooter>
</Card>
```

---

## Motion Guidelines

### Principles

1. **Purpose-Driven** - Motion should communicate, not decorate
2. **Subtle & Quick** - Fast enough to feel responsive, slow enough to perceive
3. **Natural Easing** - Cubic bezier curves that feel organic
4. **Respects Preferences** - Honors `prefers-reduced-motion`

### Durations

```
instant:  100ms - Immediate feedback
fast:     150ms - Hover states
normal:   200ms - Default transitions
slow:     300ms - Complex animations
slower:   400ms - Page transitions
```

### Easing Functions

```
default:  cubic-bezier(0.4, 0, 0.2, 1)  - Most UI transitions
in:       cubic-bezier(0.4, 0, 1, 1)    - Enter animations
out:      cubic-bezier(0, 0, 0.2, 1)    - Exit animations
spring:   cubic-bezier(0.34, 1.56, 0.64, 1) - Playful bounce
```

### Common Animations

**Fade In:**
```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

**Slide In:**
```css
@keyframes slideIn {
  from {
    transform: translateX(-10px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
```

**Scale In:**
```css
@keyframes scaleIn {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
```

---

## Shadows

Layered elevation system for depth hierarchy.

```
none:  none                                   - Flush elements
sm:    0 1px 2px rgba(0,0,0,0.05)           - Subtle lift
md:    0 4px 6px rgba(0,0,0,0.07)           - Standard cards
lg:    0 10px 15px rgba(0,0,0,0.08)         - Floating panels
xl:    0 20px 25px rgba(0,0,0,0.08)         - Modals
2xl:   0 25px 50px rgba(0,0,0,0.15)         - Hero elements
inner: inset 0 2px 4px rgba(0,0,0,0.06)     - Pressed states
```

**Focus Ring:**
```
0 0 0 3px rgba(99, 102, 241, 0.1)
```

---

## Border Radius

```
none: 0      - Sharp corners
sm:   4px    - Subtle rounding
md:   6px    - Default (buttons, inputs)
lg:   8px    - Cards, modals
xl:   12px   - Large cards
2xl:  16px   - Hero sections
full: 9999px - Pills, avatars
```

---

## Z-Index Scale

```
base:     0    - Default layer
dropdown: 1000 - Dropdown menus
sticky:   1100 - Sticky headers
fixed:    1200 - Fixed elements
modal:    1300 - Modal overlays
popover:  1400 - Popovers
tooltip:  1500 - Tooltips
toast:    1600 - Toast notifications
```

---

## Accessibility

### Contrast Ratios

All text meets **WCAG AA standards** (minimum 4.5:1).

- Headings on background: **10.5:1**
- Body text on background: **7.2:1**
- Secondary text on background: **4.6:1**

### Keyboard Navigation

- All interactive elements are keyboard accessible
- Visible focus indicators (2px ring)
- Logical tab order
- Skip to content links

### Screen Readers

- Semantic HTML elements
- ARIA labels where needed
- Alt text for images
- Status announcements for dynamic content

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Usage Guidelines

### Do's ✅

- Use consistent spacing (8px grid)
- Follow component variants (don't create custom hybrids)
- Use semantic color names (danger, success) not color values
- Animate on state changes for feedback
- Test with keyboard only
- Check contrast ratios

### Don'ts ❌

- Don't mix spacing units (stick to 8px grid)
- Don't create custom button styles outside variants
- Don't use hard-coded colors (use design tokens)
- Don't over-animate (subtle is better)
- Don't forget focus states
- Don't rely on color alone for information

---

## Implementation

All design tokens are available in:

1. **TypeScript**: `/lib/design-tokens.ts`
2. **Tailwind Config**: `/tailwind.config.js`
3. **Global CSS**: `/app/globals.css`

### Using Design Tokens

```tsx
import { colors, typography, spacing } from '@/lib/design-tokens';

// In styled components or JS
const styles = {
  color: colors.primary[600],
  fontSize: typography.fontSize.lg,
  padding: spacing[4],
};
```

### Using Tailwind Classes

```tsx
// Preferred method
<div className="text-primary-600 text-lg p-4">
  Hello World
</div>
```

---

## Component Library

All components are located in `/components/ui/`:

- `Button.tsx`
- `Input.tsx`
- `Textarea.tsx`
- `Card.tsx`

Import from index:

```tsx
import { Button, Input, Card } from '@/components/ui';
```

---

## Future Enhancements

Planned additions to the design system:

1. **Dark Mode** - Full dark theme support
2. **Select Component** - Custom dropdown select
3. **Checkbox & Radio** - Styled form controls
4. **Modal Component** - Reusable modal dialog
5. **Toast Notifications** - Global notification system
6. **Tabs Component** - Tabbed interfaces
7. **Badge Component** - Status indicators
8. **Avatar Component** - User profile images
9. **Skeleton Loaders** - Loading placeholders
10. **Data Tables** - Sortable, filterable tables

---

## Maintenance

### Adding New Colors

1. Update `/lib/design-tokens.ts`
2. Update `/tailwind.config.js`
3. Document in this file
4. Test contrast ratios

### Adding New Components

1. Create component in `/components/ui/`
2. Export from `/components/ui/index.ts`
3. Document props and usage
4. Add Storybook stories (future)
5. Add tests (future)

---

**Design System Version:** 1.0.0
**Last Updated:** January 2026
**Maintained By:** Development Team
