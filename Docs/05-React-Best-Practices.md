# React.js Best Practices & Discussion Guide

## Overview

This document discusses the best approaches for building Prometheon with React.js. It covers component design, state management, performance optimization, and common patterns specific to our learning platform.

---

## Component Design Philosophy

### 1. Functional Components with Hooks

**Why**: Modern React standard, better performance, cleaner code.

```typescript
// ✅ Good: Functional component with hooks
const TaskCard: React.FC<TaskCardProps> = ({ task, onStart }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { data: progress } = useTaskProgress(task.id);
  
  return (
    <Card onMouseEnter={() => setIsHovered(true)}>
      {/* Component JSX */}
    </Card>
  );
};

// ❌ Avoid: Class components (unless absolutely necessary)
```

### 2. Component Composition

**Why**: Promotes reusability and maintainability.

```typescript
// ✅ Good: Composable components
const Dashboard = () => {
  return (
    <Layout>
      <DashboardHeader />
      <DashboardStats />
      <RealmProgress />
      <RecentActivity />
      <QuickActions />
    </Layout>
  );
};

// ❌ Avoid: Monolithic components
const Dashboard = () => {
  // 500+ lines of JSX
};
```

### 3. Single Responsibility Principle

**Why**: Easier to test, maintain, and understand.

```typescript
// ✅ Good: Focused components
const TaskCard = ({ task }: TaskCardProps) => {
  return <Card>{/* Task display only */}</Card>;
};

const TaskCardActions = ({ task, onStart }: TaskCardActionsProps) => {
  return <div>{/* Action buttons only */}</div>;
};

// ❌ Avoid: Components doing too much
const TaskCard = ({ task }: TaskCardProps) => {
  // Display task
  // Handle actions
  // Fetch progress
  // Update state
  // Handle errors
  // ...
};
```

---

## State Management Strategy

### When to Use What

#### 1. Local State (`useState`, `useReducer`)

**Use for**:
- Form inputs
- UI state (modals, dropdowns, toggles)
- Component-specific temporary state

```typescript
// ✅ Good: Local state for UI
const TaskFilters = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  
  return (
    <div>
      <Input value={searchQuery} onChange={setSearchQuery} />
      <Select value={selectedDifficulty} onChange={setSelectedDifficulty} />
    </div>
  );
};
```

#### 2. Context API

**Use for**:
- Theme (dark/light mode)
- User authentication state
- UI preferences (sidebar state, etc.)
- Data that rarely changes

```typescript
// ✅ Good: Context for theme
const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

#### 3. Zustand (Global State)

**Use for**:
- User profile data
- Progress tracking
- Application-wide settings
- Complex state that needs to be shared

```typescript
// ✅ Good: Zustand for progress
const useProgressStore = create<ProgressStore>((set) => ({
  userProgress: null,
  updateProgress: (progress) => set({ userProgress: progress }),
}));
```

#### 4. TanStack Query (Server State)

**Use for**:
- API data fetching
- Caching server responses
- Synchronization
- Optimistic updates

```typescript
// ✅ Good: TanStack Query for server data
const useSacredTexts = (realm?: Realm) => {
  return useQuery({
    queryKey: ['sacred-texts', realm],
    queryFn: () => sacredTextsService.getAll(realm),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
```

---

## Performance Optimization

### 1. Code Splitting

**Why**: Reduce initial bundle size, improve load time.

```typescript
// ✅ Good: Lazy load routes
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const SacredTextsPage = lazy(() => import('./pages/SacredTextsPage'));

const App = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/sacred-texts" element={<SacredTextsPage />} />
      </Routes>
    </Suspense>
  );
};
```

### 2. Memoization

**When to use**:
- Expensive calculations
- Preventing unnecessary re-renders
- Stable references for dependencies

```typescript
// ✅ Good: Memoize expensive calculations
const RealmProgress = ({ realmId }: { realmId: string }) => {
  const { tasks, texts } = useRealmData(realmId);
  const { taskProgress, textProgress } = useProgressStore();
  
  const progress = useMemo(() => {
    return calculateRealmProgress(realmId, tasks, texts, taskProgress, textProgress);
  }, [realmId, tasks, texts, taskProgress, textProgress]);
  
  return <ProgressBar progress={progress} />;
};

// ✅ Good: Memoize callbacks
const TaskList = ({ tasks, onTaskClick }: TaskListProps) => {
  const handleClick = useCallback((taskId: string) => {
    onTaskClick(taskId);
  }, [onTaskClick]);
  
  return (
    <div>
      {tasks.map(task => (
        <TaskCard key={task.id} task={task} onClick={handleClick} />
      ))}
    </div>
  );
};

// ✅ Good: Memoize components
const TaskCard = React.memo<TaskCardProps>(({ task, onStart }) => {
  return <Card>{/* Task display */}</Card>;
});
```

**⚠️ Don't over-memoize**: Only use when you've identified a performance issue.

### 3. Virtual Scrolling

**Why**: Handle large lists efficiently.

```typescript
// ✅ Good: Virtual scrolling for long lists
import { useVirtualizer } from '@tanstack/react-virtual';

const TaskList = ({ tasks }: { tasks: Task[] }) => {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: tasks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 200,
  });
  
  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <TaskCard task={tasks[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

## Data Fetching Patterns

### 1. TanStack Query Best Practices

```typescript
// ✅ Good: Proper query configuration
const useUserProgress = (userId: string) => {
  return useQuery({
    queryKey: ['progress', userId],
    queryFn: () => progressService.getUserProgress(userId),
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
};

// ✅ Good: Optimistic updates
const useCompleteTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (taskId: string) => taskService.completeTask(taskId),
    onMutate: async (taskId) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previousTasks = queryClient.getQueryData(['tasks']);
      
      queryClient.setQueryData(['tasks'], (old: Task[]) =>
        old.map(task =>
          task.id === taskId ? { ...task, status: 'completed' } : task
        )
      );
      
      return { previousTasks };
    },
    onError: (err, taskId, context) => {
      queryClient.setQueryData(['tasks'], context.previousTasks);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};
```

### 2. Parallel Queries

```typescript
// ✅ Good: Fetch related data in parallel
const Dashboard = () => {
  const { data: progress } = useUserProgress(userId);
  const { data: activities } = useRecentActivities(userId);
  const { data: achievements } = useAchievements(userId);
  
  // All queries run in parallel
  // ...
};
```

### 3. Dependent Queries

```typescript
// ✅ Good: Fetch dependent data sequentially
const RealmDetails = ({ realmId }: { realmId: string }) => {
  const { data: realm } = useQuery({
    queryKey: ['realm', realmId],
    queryFn: () => realmService.getRealm(realmId),
  });
  
  const { data: tasks } = useQuery({
    queryKey: ['realm', realmId, 'tasks'],
    queryFn: () => taskService.getTasksByRealm(realmId),
    enabled: !!realm, // Only fetch when realm is loaded
  });
  
  // ...
};
```

---

## Form Handling

### React Hook Form

```typescript
// ✅ Good: React Hook Form for forms
const TaskFilterForm = () => {
  const { register, handleSubmit, watch } = useForm<TaskFilters>({
    defaultValues: {
      search: '',
      difficulty: null,
      type: null,
    },
  });
  
  const onSubmit = (data: TaskFilters) => {
    // Handle form submission
  };
  
  // Watch for real-time updates
  const searchQuery = watch('search');
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input {...register('search')} />
      <Select {...register('difficulty')} />
      <Button type="submit">Filter</Button>
    </form>
  );
};
```

---

## Error Handling

### Error Boundaries

```typescript
// ✅ Good: Error boundary for component errors
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Log to error tracking service
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    
    return this.props.children;
  }
}

// Usage
<ErrorBoundary>
  <Dashboard />
</ErrorBoundary>
```

### Query Error Handling

```typescript
// ✅ Good: Handle query errors gracefully
const TaskList = () => {
  const { data: tasks, error, isLoading } = useTasks();
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!tasks?.length) return <EmptyState />;
  
  return (
    <div>
      {tasks.map(task => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
};
```

---

## Accessibility (a11y)

### Semantic HTML

```typescript
// ✅ Good: Semantic HTML
const TaskCard = ({ task }: TaskCardProps) => {
  return (
    <article>
      <header>
        <h2>{task.title}</h2>
      </header>
      <p>{task.description}</p>
      <footer>
        <Button aria-label={`Start task ${task.title}`}>
          Start Task
        </Button>
      </footer>
    </article>
  );
};
```

### Keyboard Navigation

```typescript
// ✅ Good: Keyboard support
const TaskCard = ({ task, onStart }: TaskCardProps) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onStart(task.id);
    }
  };
  
  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={() => onStart(task.id)}
      onKeyDown={handleKeyDown}
      aria-label={`Task: ${task.title}`}
    >
      {/* Card content */}
    </Card>
  );
};
```

---

## Testing Patterns

### Component Testing

```typescript
// ✅ Good: Test user interactions
import { render, screen, fireEvent } from '@testing-library/react';

describe('TaskCard', () => {
  it('calls onStart when start button is clicked', () => {
    const mockOnStart = jest.fn();
    render(<TaskCard task={mockTask} onStart={mockOnStart} />);
    
    const startButton = screen.getByRole('button', { name: /start task/i });
    fireEvent.click(startButton);
    
    expect(mockOnStart).toHaveBeenCalledWith(mockTask.id);
  });
});
```

---

## Common Pitfalls & Solutions

### 1. Infinite Re-renders

```typescript
// ❌ Bad: Creating new object/array in render
const Component = ({ items }) => {
  const filtered = items.filter(i => i.active); // New array every render
  return <List items={filtered} />;
};

// ✅ Good: Memoize
const Component = ({ items }) => {
  const filtered = useMemo(() => items.filter(i => i.active), [items]);
  return <List items={filtered} />;
};
```

### 2. Stale Closures

```typescript
// ❌ Bad: Stale closure
const Component = () => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCount(count + 1); // Always uses initial count (0)
    }, 1000);
    return () => clearInterval(interval);
  }, []); // Missing count dependency
  
  return <div>{count}</div>;
};

// ✅ Good: Functional update
const Component = () => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCount(prev => prev + 1); // Uses latest count
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  
  return <div>{count}</div>;
};
```

### 3. Prop Drilling

```typescript
// ❌ Bad: Prop drilling
const App = () => <Dashboard user={user} />;
const Dashboard = ({ user }) => <Stats user={user} />;
const Stats = ({ user }) => <Progress user={user} />;

// ✅ Good: Context or state management
const UserContext = createContext<User | null>(null);
const App = () => (
  <UserContext.Provider value={user}>
    <Dashboard />
  </UserContext.Provider>
);
const Dashboard = () => <Stats />;
const Stats = () => {
  const user = useContext(UserContext);
  return <Progress user={user} />;
};
```

---

## Recommended Patterns for Prometheon

### 1. Feature-Based Components

Organize components by feature, not by type:
```
features/tasks/
  ├── components/
  │   ├── TaskCard.tsx
  │   ├── TaskList.tsx
  │   └── TaskFilters.tsx
  ├── hooks/
  │   └── useTasks.ts
  └── services/
      └── taskService.ts
```

### 2. Custom Hooks for Logic

Extract reusable logic into custom hooks:
```typescript
// hooks/useTaskProgress.ts
export const useTaskProgress = (taskId: string) => {
  const { data, isLoading } = useQuery({
    queryKey: ['task-progress', taskId],
    queryFn: () => progressService.getTaskProgress(taskId),
  });
  
  const updateProgress = useMutation({
    mutationFn: (status: TaskStatus) =>
      progressService.updateTaskProgress(taskId, status),
  });
  
  return { progress: data, isLoading, updateProgress };
};
```

### 3. Compound Components

For complex UI patterns:
```typescript
// ✅ Good: Compound component pattern
const Card = ({ children }: { children: React.ReactNode }) => (
  <div className="card">{children}</div>
);

Card.Header = ({ children }: { children: React.ReactNode }) => (
  <header className="card-header">{children}</header>
);

Card.Body = ({ children }: { children: React.ReactNode }) => (
  <div className="card-body">{children}</div>
);

// Usage
<Card>
  <Card.Header>Title</Card.Header>
  <Card.Body>Content</Card.Body>
</Card>
```

---

## Summary: Key Takeaways

1. **Use functional components** with hooks
2. **Compose components** for reusability
3. **Choose the right state management** tool for each use case
4. **Optimize performance** strategically (don't over-optimize)
5. **Handle errors gracefully** with error boundaries
6. **Make it accessible** from the start
7. **Test user interactions**, not implementation details
8. **Follow feature-based organization** for scalability
9. **Use TypeScript** for type safety
10. **Keep components focused** and single-purpose

---

## Next Steps

1. Review the architecture document for system design
2. Set up the project structure following the feature-based pattern
3. Implement shared UI components first
4. Build features incrementally
5. Add tests as you build
6. Refactor and optimize based on real usage

