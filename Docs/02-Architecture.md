# Architecture Documentation

## System Overview

Prometheon is a client-side React application focused on learning and skill acquisition. The architecture follows modern React patterns with emphasis on scalability, maintainability, and performance.

## Architecture Principles

1. **Component-Based**: Modular, reusable components
2. **Feature-Driven**: Organize by features, not file types
3. **Separation of Concerns**: Clear boundaries between UI, logic, and data
4. **Type Safety**: TypeScript throughout
5. **Performance First**: Optimize for fast load times and smooth interactions

---

## Application Structure

### Recommended Structure (Feature-Based)

```
src/
├── app/                    # App-level configuration
│   ├── router.tsx         # Route definitions
│   ├── providers.tsx      # Context providers wrapper
│   └── store.ts           # Global store setup
│
├── features/               # Feature modules (main organization)
│   ├── auth/
│   │   ├── components/    # Auth-specific components
│   │   ├── hooks/         # useAuth, useLogin, etc.
│   │   ├── services/      # Auth API calls
│   │   ├── store/         # Auth state (Zustand)
│   │   └── types/         # Auth-related types
│   │
│   ├── dashboard/
│   │   ├── components/
│   │   │   ├── DashboardStats.tsx
│   │   │   ├── RealmProgress.tsx
│   │   │   ├── RecentActivity.tsx
│   │   │   └── QuickActions.tsx
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   │
│   ├── sacred-texts/
│   │   ├── components/
│   │   │   ├── TextCard.tsx
│   │   │   ├── TextList.tsx
│   │   │   └── RealmFilter.tsx
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   │
│   ├── tasks/
│   │   ├── components/
│   │   │   ├── TaskCard.tsx
│   │   │   ├── TaskList.tsx
│   │   │   └── TaskFilters.tsx
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   │
│   └── progress/
│       ├── components/
│       ├── hooks/
│       ├── services/
│       └── types/
│
├── shared/                 # Shared across features
│   ├── components/         # Reusable UI components
│   │   ├── ui/            # Basic primitives
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Badge.tsx
│   │   ├── layout/        # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Navigation.tsx
│   │   │   └── Sidebar.tsx
│   │   └── feedback/      # Loading, Error, Empty states
│   │
│   ├── hooks/             # Shared hooks
│   │   ├── useTheme.ts
│   │   ├── useLocalStorage.ts
│   │   └── useDebounce.ts
│   │
│   ├── utils/             # Utility functions
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   └── helpers.ts
│   │
│   ├── types/             # Shared types
│   │   ├── api.ts
│   │   ├── common.ts
│   │   └── realm.ts
│   │
│   └── constants/         # App-wide constants
│       ├── realms.ts
│       ├── routes.ts
│       └── config.ts
│
├── pages/                  # Page-level components (route handlers)
│   ├── WelcomePage.tsx
│   ├── DashboardPage.tsx
│   ├── SacredTextsPage.tsx
│   └── TasksPage.tsx
│
└── assets/                 # Static assets
    ├── images/
    ├── icons/
    └── fonts/
```

---

## State Management Architecture

### Global State (Zustand Stores)

```typescript
// Example store structure
stores/
├── authStore.ts           # Authentication state
├── userStore.ts           # User profile and preferences
├── progressStore.ts       # User progress tracking
└── uiStore.ts             # UI state (theme, modals, etc.)
```

### State Management Strategy

1. **Global State (Zustand)**: 
   - User authentication
   - User profile
   - Progress tracking
   - UI preferences (theme, sidebar state)

2. **Server State (TanStack Query)**:
   - Sacred texts data
   - Tasks data
   - User activity
   - Real-time updates

3. **Local State (useState/useReducer)**:
   - Form inputs
   - UI component state
   - Temporary selections

4. **URL State (React Router)**:
   - Current page/route
   - Query parameters (filters, search)
   - Deep linking support

---

## Data Flow

### Unidirectional Data Flow

```
User Action
    ↓
Component Event Handler
    ↓
Service/API Call (TanStack Query)
    ↓
Store Update (Zustand) [if needed]
    ↓
Component Re-render
```

### Example: Starting a Task

```
1. User clicks "Start Task" button
2. TaskCard component calls handleStartTask()
3. handleStartTask() calls useStartTaskMutation() (TanStack Query)
4. Mutation updates server state
5. Progress store updates (Zustand)
6. UI reflects new state
```

---

## Component Architecture

### Component Hierarchy

```
App
├── Providers (Theme, Router, Query Client)
│   └── Router
│       ├── Layout (Header, Footer)
│       │   ├── WelcomePage
│       │   ├── DashboardPage
│       │   │   ├── DashboardStats
│       │   │   ├── RealmProgress
│       │   │   ├── RecentActivity
│       │   │   └── QuickActions
│       │   ├── SacredTextsPage
│       │   │   ├── RealmFilter
│       │   │   └── TextList
│       │   │       └── TextCard (multiple)
│       │   └── TasksPage
│       │       ├── TaskFilters
│       │       └── TaskList
│       │           └── TaskCard (multiple)
```

### Component Patterns

1. **Container/Presentational Pattern** (Optional)
   - Container: Handles logic, data fetching
   - Presentational: Pure UI component

2. **Compound Components**
   - For complex UI patterns (e.g., Card with CardHeader, CardBody)

3. **Render Props / Children as Function**
   - For flexible component composition

---

## Routing Architecture

### Route Structure

```typescript
/                           # Welcome/Landing page
/dashboard                  # User dashboard
/sacred-texts              # List of all texts
/sacred-texts/:id          # Individual text reader
/tasks                     # List of all tasks
/tasks/:id                 # Individual task view
/profile                   # User profile
/achievements              # User achievements
```

### Route Configuration

- Use React Router v6 with nested routes
- Implement route guards for protected routes
- Lazy load routes for code splitting
- Use route-based data fetching

---

## API Integration

### Service Layer Pattern

```typescript
// services/apiClient.ts - Base API client
// services/sacredTextsService.ts - Sacred texts endpoints
// services/tasksService.ts - Tasks endpoints
// services/progressService.ts - Progress endpoints
// services/userService.ts - User endpoints
```

### API Response Handling

- Centralized error handling
- Request/response interceptors
- Type-safe API responses
- Retry logic for failed requests

---

## Theme & Styling Architecture

### Tailwind Configuration

```typescript
// tailwind.config.js
theme: {
  extend: {
    colors: {
      primary: {
        // Orange/red accent colors
      },
      dark: {
        // Dark theme colors
      }
    }
  }
}
```

### Theme Provider

- Context-based theme management
- Dark mode support (matches mockup)
- Custom color palette
- Responsive breakpoints

---

## Performance Architecture

### Code Splitting Strategy

1. **Route-based**: Each route is a separate chunk
2. **Component-based**: Large components lazy loaded
3. **Library-based**: Vendor chunks separated

### Caching Strategy

1. **Static Assets**: Long-term caching
2. **API Responses**: TanStack Query cache
3. **User Data**: LocalStorage for preferences
4. **Progress Data**: Optimistic updates with server sync

---

## Security Architecture

1. **Authentication**: JWT tokens stored in httpOnly cookies (preferred) or secure storage
2. **Authorization**: Role-based access control
3. **Input Validation**: Client and server-side
4. **XSS Protection**: React's built-in escaping
5. **CSRF Protection**: Token-based protection

---

## Testing Architecture

### Test Structure

```
__tests__/
├── unit/                  # Unit tests
├── integration/           # Integration tests
└── e2e/                   # End-to-end tests
```

### Testing Strategy

- Unit tests for utilities and hooks
- Component tests for UI components
- Integration tests for feature workflows
- E2E tests for critical user paths

---

## Build & Deployment

### Build Process

1. TypeScript compilation
2. Bundle optimization
3. Code minification
4. Asset optimization
5. Source maps generation

### Deployment Strategy

- Static hosting (Vercel, Netlify, AWS S3)
- CDN for assets
- Environment-based configuration
- CI/CD pipeline integration

---

## Future Considerations

1. **Server-Side Rendering**: Consider Next.js if SEO becomes important
2. **Progressive Web App**: Offline support, installable
3. **Real-time Features**: WebSocket integration for live updates
4. **Micro-frontends**: If scaling to multiple teams
5. **Internationalization**: i18n support for multiple languages

