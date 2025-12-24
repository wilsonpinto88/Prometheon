# Technology Stack & Conventions

## Core Technologies

### Frontend Framework
- **React 18+** (Latest stable version)
  - Functional components with Hooks
  - React Server Components (if using Next.js) or Client Components
  - Concurrent features for better UX

### Language
- **TypeScript 5+** (Strongly recommended)
  - Type safety for better maintainability
  - Better IDE support and autocomplete
  - Reduced runtime errors

### Build Tool
- **Vite** (Recommended)
  - Fast HMR (Hot Module Replacement)
  - Optimized production builds
  - Modern ES modules support
- Alternative: **Next.js 14+** (if SSR/SSG needed)

### Styling
- **Tailwind CSS 3+**
  - Utility-first CSS framework
  - Dark mode support (matches mockup theme)
  - Custom theme configuration for orange/red accents
- **CSS Modules** (Optional, for component-scoped styles)

### State Management
- **Zustand** (Recommended for simplicity)
  - Lightweight, no boilerplate
  - Great TypeScript support
  - Perfect for medium-scale apps
- Alternative: **Redux Toolkit** (if complex state logic needed)
- **React Context API** (for theme, auth, etc.)

### Routing
- **React Router v6+**
  - Client-side routing
  - Nested routes support
  - Route-based code splitting

### Data Fetching
- **TanStack Query (React Query)**
  - Server state management
  - Caching and synchronization
  - Optimistic updates
- **Axios** or **Fetch API** (for HTTP requests)

### Form Management
- **React Hook Form**
  - Performance optimized
  - Minimal re-renders
  - Easy validation

### UI Components
- **Headless UI** or **Radix UI** (Accessible primitives)
- Custom components built on top
- **Lucide React** or **React Icons** (for icons)

### Testing
- **Vitest** (Unit tests)
- **React Testing Library** (Component tests)
- **Playwright** or **Cypress** (E2E tests)

### Code Quality
- **ESLint** (with React plugin)
- **Prettier** (Code formatting)
- **Husky** (Git hooks)
- **lint-staged** (Pre-commit checks)

---

## Coding Conventions

### Component Structure
```typescript
// Component file structure
import React from 'react';
import { ComponentProps } from './types';
import { useCustomHook } from './hooks';
import './Component.module.css';

interface ComponentProps {
  // Props definition
}

export const Component: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // Hooks
  // State
  // Effects
  // Handlers
  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
};

export default Component;
```

### Naming Conventions
- **Components**: PascalCase (`UserDashboard.tsx`)
- **Files**: Match component name
- **Hooks**: camelCase starting with `use` (`useUserProgress.ts`)
- **Utilities**: camelCase (`formatDate.ts`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Types/Interfaces**: PascalCase (`UserProgress`, `TaskStatus`)

### File Organization
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI primitives (Button, Card, etc.)
│   ├── layout/         # Layout components (Header, Footer, etc.)
│   └── features/       # Feature-specific components
├── pages/              # Page components (routes)
├── hooks/              # Custom React hooks
├── store/              # State management (Zustand stores)
├── services/           # API services
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
├── constants/          # App constants
├── assets/             # Images, fonts, etc.
└── styles/             # Global styles, Tailwind config
```

### Component Guidelines
1. **Single Responsibility**: Each component should do one thing
2. **Composition over Inheritance**: Build complex UIs from simple components
3. **Props Interface**: Always define TypeScript interfaces for props
4. **Default Props**: Use default parameters or defaultProps
5. **Memoization**: Use `React.memo`, `useMemo`, `useCallback` judiciously
6. **Error Boundaries**: Implement for error handling

### Hooks Guidelines
- Custom hooks should start with `use`
- Extract reusable logic into custom hooks
- Keep hooks focused and composable
- Document hook dependencies and return values

### TypeScript Guidelines
- Avoid `any` type - use `unknown` if type is truly unknown
- Use interfaces for object shapes
- Use types for unions, intersections, and computed types
- Export types alongside components
- Use generic types for reusable components

---

## Environment Setup

### Required Node Version
- **Node.js**: 18+ (LTS recommended)
- **npm**: 9+ or **pnpm**: 8+ or **yarn**: 3+

### Environment Variables
```env
# .env.example
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_NAME=Prometheon
VITE_ENABLE_ANALYTICS=false
```

### Package Manager
- **pnpm** (Recommended for speed and disk efficiency)
- Alternative: npm or yarn

---

## Development Tools

### IDE/Editor
- **VS Code** (Recommended)
  - Extensions:
    - ESLint
    - Prettier
    - TypeScript and JavaScript Language Features
    - Tailwind CSS IntelliSense
    - React snippets

### Browser DevTools
- React Developer Tools
- Redux DevTools (if using Redux)

---

## Performance Best Practices

1. **Code Splitting**: Use React.lazy() and Suspense
2. **Image Optimization**: Use next/image or similar
3. **Bundle Analysis**: Regular bundle size monitoring
4. **Memoization**: Strategic use of memo, useMemo, useCallback
5. **Virtual Scrolling**: For long lists (react-window)
6. **Debouncing/Throttling**: For search and scroll events

---

## Accessibility (a11y)

- Semantic HTML elements
- ARIA labels where needed
- Keyboard navigation support
- Focus management
- Screen reader compatibility
- Color contrast compliance (WCAG AA minimum)

---

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile browsers: iOS Safari, Chrome Mobile

---

## Sacred Texts Convention

The **Sacred Texts** feature in Prometheon is based on the canonical list of "10 Books for Software Engineers" that are essential for becoming a 10x software engineer. This list is standardized and should remain consistent across the application.

### The 10 Sacred Texts

1. **The Pragmatic Programmer** - Andrew Hunt & David Thomas
   - *Teaches:* Core software development process

2. **Designing Data-Intensive Applications** - Martin Kleppmann
   - *Teaches:* Distributed systems

3. **The Mythical Man-Month** - Frederick P. Brooks Jr.
   - *Teaches:* Managing large-scale projects

4. **Refactoring** - Martin Fowler
   - *Teaches:* Techniques to restructure code for maintainability

5. **Software Architecture: The Hard Parts** - Neal Ford, Mark Richards, Pramod Sadalage, Zhamak Dehghani
   - *Teaches:* Making better architectural decisions with tradeoffs

6. **Working Effectively with Legacy Code** - Michael C. Feathers
   - *Teaches:* Techniques to refactor legacy code

7. **Database Internals** - Alex Petrov
   - *Teaches:* How databases work: storage engines and distributed systems

8. **A Philosophy of Software Design** - John Ousterhout
   - *Teaches:* How to write clean and maintainable code

9. **Clean Code** - Robert C. Martin
   - *Teaches:* Practices to write easy-to-understand code and refactor

10. **Why Programs Fail** - Andreas Zeller
    - *Teaches:* Systematic debugging

### Implementation Guidelines

- **Data Source**: The sacred texts are defined in `src/data/mockTexts.ts`
- **Immutability**: This list should not be modified without updating this documentation
- **Realm Assignment**: Each book is assigned to a realm based on its difficulty and topic
- **Consistency**: All references to sacred texts should use this canonical list
- **Future API**: When connecting to a backend, ensure the API returns these exact 10 books

### Realm Distribution

- **Tartarus**: Beginner/Foundation books
- **Gaia**: Practical application books
- **Midgard**: Code quality and design books
- **Asgard**: Advanced systems and architecture books
- **Valhalla**: Project management and team books
- **Elysium**: Advanced architecture and design books
- **Prometheon**: Mastery-level technical deep dives

