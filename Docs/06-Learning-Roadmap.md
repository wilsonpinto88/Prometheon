# React Learning Roadmap for Prometheon

## Welcome to Your React Journey! 🚀

This document is your step-by-step guide to building Prometheon while learning React. We'll start simple and build up to more complex features.

---

## Learning Philosophy

- **Learn by doing**: Build real features, not just tutorials
- **Incremental progress**: Start simple, add complexity gradually
- **Ask questions**: I'm here to help explain concepts
- **Practice**: Repetition helps concepts stick
- **Build, break, fix**: Making mistakes is part of learning

---

## Prerequisites

Before we start, make sure you have:
- ✅ Node.js 18+ installed
- ✅ A code editor (VS Code recommended)
- ✅ Basic JavaScript knowledge
- ✅ Understanding of HTML/CSS
- ✅ Git installed (optional but recommended)

---

## Phase 1: React Fundamentals (Week 1-2)

### Step 1: Project Setup
**Goal**: Get the project running locally

**What you'll learn**:
- How React projects are structured
- What Vite does
- How to run a development server

**Tasks**:
1. Initialize project with Vite + React + TypeScript
2. Install dependencies
3. Run the dev server
4. Understand the basic file structure

**Key Concepts**:
- `package.json` - Project dependencies
- `vite.config.ts` - Build configuration
- `index.html` - Entry point
- `src/main.tsx` - React entry point
- `src/App.tsx` - Root component

---

### Step 2: Your First Component
**Goal**: Create a simple component

**What you'll learn**:
- What a React component is
- JSX syntax
- How to render components

**Tasks**:
1. Create a `Welcome` component
2. Display "Welcome to Prometheon"
3. Add some styling

**Key Concepts**:
- Functional components
- JSX (JavaScript XML)
- Component export/import
- Props basics

**Example**:
```tsx
// Welcome.tsx
const Welcome = () => {
  return <h1>Welcome to Prometheon</h1>;
};

export default Welcome;
```

---

### Step 3: Component Props
**Goal**: Pass data to components

**What you'll learn**:
- How props work
- TypeScript interfaces for props
- Reusable components

**Tasks**:
1. Create a `Card` component that accepts props
2. Use it to display different content
3. Add TypeScript types

**Key Concepts**:
- Props definition
- TypeScript interfaces
- Prop destructuring
- Default props

---

### Step 4: State with useState
**Goal**: Make components interactive

**What you'll learn**:
- React state
- useState hook
- Event handlers
- Re-rendering

**Tasks**:
1. Create a counter component
2. Add buttons to increment/decrement
3. Display the count

**Key Concepts**:
- State vs props
- useState hook
- Event handling
- State updates

---

### Step 5: Conditional Rendering
**Goal**: Show/hide content based on state

**What you'll learn**:
- if/else in JSX
- Ternary operators
- Logical AND (&&)
- Conditional classes

**Tasks**:
1. Show different content based on state
2. Toggle visibility
3. Apply conditional styling

---

### Step 6: Lists and Keys
**Goal**: Render arrays of data

**What you'll learn**:
- map() function
- Keys in React
- Rendering lists

**Tasks**:
1. Create a list of realms
2. Display them as cards
3. Understand why keys are important

---

## Phase 2: Building Prometheon UI (Week 3-4)

### Step 7: Layout Components
**Goal**: Create the main layout structure

**What you'll learn**:
- Component composition
- Layout patterns
- CSS with Tailwind

**Tasks**:
1. Create `Header` component
2. Create `Footer` component
3. Create `Layout` wrapper
4. Style with Tailwind CSS

**Features to build**:
- Navigation menu
- Logo
- User profile icon
- Footer links

---

### Step 8: Welcome Page
**Goal**: Build the landing page

**What you'll learn**:
- Page components
- Complex layouts
- Image handling
- Call-to-action buttons

**Tasks**:
1. Create `WelcomePage` component
2. Add hero section
3. Add statistics cards
4. Add "Forge Your Path" section
5. Style to match mockup

---

### Step 9: Dashboard Page - Part 1
**Goal**: Build dashboard structure

**What you'll learn**:
- Grid layouts
- Component organization
- Mock data

**Tasks**:
1. Create `DashboardPage` component
2. Create `DashboardStats` component (4 stat cards)
3. Use mock data
4. Style with Tailwind

---

### Step 10: Dashboard Page - Part 2
**Goal**: Add progress and activity sections

**What you'll learn**:
- Progress bars
- Activity feeds
- Date formatting

**Tasks**:
1. Create `RealmProgress` component
2. Create `RecentActivity` component
3. Create `QuickActions` component
4. Display mock data

---

### Step 11: Sacred Texts Page
**Goal**: Build the texts listing page

**What you'll learn**:
- Filtering
- Search functionality
- Card grids

**Tasks**:
1. Create `SacredTextsPage` component
2. Create `TextCard` component
3. Create `RealmFilter` component
4. Add filtering logic
5. Display mock texts data

---

### Step 12: Tasks Page
**Goal**: Build the tasks listing page

**What you'll learn**:
- Multiple filters
- Search
- Task cards

**Tasks**:
1. Create `TasksPage` component
2. Create `TaskCard` component
3. Create `TaskFilters` component
4. Add search and filter logic
5. Display mock tasks data

---

## Phase 3: React Hooks & State Management (Week 5-6)

### Step 13: useEffect Hook
**Goal**: Understand side effects

**What you'll learn**:
- useEffect hook
- Dependency arrays
- Cleanup functions
- When to use useEffect

**Tasks**:
1. Fetch data on component mount
2. Update document title
3. Set up timers
4. Clean up effects

---

### Step 14: Custom Hooks
**Goal**: Extract reusable logic

**What you'll learn**:
- Creating custom hooks
- Sharing logic between components
- Hook composition

**Tasks**:
1. Create `useLocalStorage` hook
2. Create `useDebounce` hook
3. Create `useTheme` hook
4. Use them in components

---

### Step 15: Context API
**Goal**: Share data without prop drilling

**What you'll learn**:
- createContext
- useContext
- Provider pattern
- When to use Context

**Tasks**:
1. Create ThemeContext
2. Create AuthContext (mock)
3. Use context in components
4. Update theme toggle

---

### Step 16: React Router
**Goal**: Add navigation between pages

**What you'll learn**:
- React Router setup
- Routes and Links
- useNavigate hook
- Route parameters

**Tasks**:
1. Install React Router
2. Set up routes
3. Create navigation links
4. Add route guards (mock auth)
5. Handle 404 pages

---

## Phase 4: Advanced Features (Week 7-8)

### Step 17: Forms with React Hook Form
**Goal**: Handle form inputs

**What you'll learn**:
- React Hook Form
- Form validation
- Controlled vs uncontrolled inputs

**Tasks**:
1. Create a search form
2. Create a filter form
3. Add validation
4. Handle form submission

---

### Step 18: State Management with Zustand
**Goal**: Manage global state

**What you'll learn**:
- Zustand setup
- Creating stores
- Using stores in components
- When to use global state

**Tasks**:
1. Install Zustand
2. Create userStore
3. Create progressStore
4. Use stores in components
5. Update progress when tasks complete

---

### Step 19: Data Fetching (Mock API)
**Goal**: Simulate API calls

**What you'll learn**:
- Async/await
- Fetch API
- Loading states
- Error handling

**Tasks**:
1. Create mock API service
2. Add loading states
3. Add error handling
4. Fetch data in components
5. Update UI based on data

---

### Step 20: Optimistic Updates
**Goal**: Improve UX with instant feedback

**What you'll learn**:
- Optimistic UI updates
- Error rollback
- Better user experience

**Tasks**:
1. Update task status optimistically
2. Update progress optimistically
3. Handle errors gracefully
4. Sync with "server" (mock)

---

## Phase 5: Polish & Best Practices (Week 9-10)

### Step 21: Performance Optimization
**Goal**: Make the app fast

**What you'll learn**:
- React.memo
- useMemo
- useCallback
- Code splitting

**Tasks**:
1. Memoize expensive calculations
2. Memoize callbacks
3. Lazy load routes
4. Analyze bundle size

---

### Step 22: Error Handling
**Goal**: Handle errors gracefully

**What you'll learn**:
- Error boundaries
- Try/catch
- Error states
- User-friendly error messages

**Tasks**:
1. Create ErrorBoundary component
2. Add error states to components
3. Handle API errors
4. Display user-friendly messages

---

### Step 23: Accessibility
**Goal**: Make the app accessible

**What you'll learn**:
- Semantic HTML
- ARIA attributes
- Keyboard navigation
- Screen reader support

**Tasks**:
1. Add semantic HTML
2. Add ARIA labels
3. Test keyboard navigation
4. Test with screen reader

---

### Step 24: Testing Basics
**Goal**: Write your first tests

**What you'll learn**:
- React Testing Library
- Writing tests
- Testing user interactions

**Tasks**:
1. Set up testing
2. Write component tests
3. Test user interactions
4. Test edge cases

---

## Learning Tips

### As You Code

1. **Read the error messages**: They usually tell you what's wrong
2. **Console.log is your friend**: Use it to debug
3. **Break things**: Experiment and see what happens
4. **Read the docs**: React docs are excellent
5. **Ask questions**: I'm here to help!

### Common Mistakes (And How to Avoid Them)

1. **Forgetting to import React**: Not needed in React 17+, but good to know
2. **Missing keys in lists**: Always add `key` prop
3. **Mutating state directly**: Always use setState or state updater
4. **Infinite loops in useEffect**: Check dependency arrays
5. **Not handling loading/error states**: Always consider these cases

### Debugging Strategies

1. **Check the console**: Browser DevTools console
2. **React DevTools**: Install the browser extension
3. **Breakpoints**: Use debugger statement
4. **Component inspection**: React DevTools component tree
5. **Network tab**: Check API calls (when we add them)

---

## Progress Tracking

Track your progress here:

- [ ] Phase 1: React Fundamentals
  - [ ] Step 1: Project Setup
  - [ ] Step 2: First Component
  - [ ] Step 3: Component Props
  - [ ] Step 4: State with useState
  - [ ] Step 5: Conditional Rendering
  - [ ] Step 6: Lists and Keys

- [ ] Phase 2: Building Prometheon UI
  - [ ] Step 7: Layout Components
  - [ ] Step 8: Welcome Page
  - [ ] Step 9: Dashboard Page - Part 1
  - [ ] Step 10: Dashboard Page - Part 2
  - [ ] Step 11: Sacred Texts Page
  - [ ] Step 12: Tasks Page

- [ ] Phase 3: React Hooks & State Management
  - [ ] Step 13: useEffect Hook
  - [ ] Step 14: Custom Hooks
  - [ ] Step 15: Context API
  - [ ] Step 16: React Router

- [ ] Phase 4: Advanced Features
  - [ ] Step 17: Forms
  - [ ] Step 18: Zustand
  - [ ] Step 19: Data Fetching
  - [ ] Step 20: Optimistic Updates

- [ ] Phase 5: Polish & Best Practices
  - [ ] Step 21: Performance
  - [ ] Step 22: Error Handling
  - [ ] Step 23: Accessibility
  - [ ] Step 24: Testing

---

## Next Steps

Ready to start? Let's begin with **Step 1: Project Setup**!

I'll guide you through:
1. Setting up the project
2. Installing dependencies
3. Understanding the structure
4. Running your first React app

Just let me know when you're ready, and we'll start coding! 🎉

