# React Quick Reference Guide

A cheat sheet for common React patterns you'll use in Prometheon.

---

## Component Basics

### Functional Component
```tsx
import React from 'react';

interface Props {
  title: string;
  count?: number;
}

const MyComponent: React.FC<Props> = ({ title, count = 0 }) => {
  return (
    <div>
      <h1>{title}</h1>
      <p>Count: {count}</p>
    </div>
  );
};

export default MyComponent;
```

### Using a Component
```tsx
import MyComponent from './MyComponent';

const App = () => {
  return <MyComponent title="Hello" count={5} />;
};
```

---

## State Management

### useState Hook
```tsx
import { useState } from 'react';

const Counter = () => {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => setCount(prev => prev + 1)}>Increment (functional)</button>
    </div>
  );
};
```

### Multiple State Values
```tsx
const Form = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Or use an object:
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  
  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
};
```

---

## Effects

### useEffect - Run on Mount
```tsx
import { useEffect } from 'react';

const Component = () => {
  useEffect(() => {
    console.log('Component mounted');
    // Fetch data, set up subscriptions, etc.
  }, []); // Empty array = run once on mount
};
```

### useEffect - Run on Update
```tsx
const Component = ({ userId }: { userId: string }) => {
  useEffect(() => {
    // Fetch user data when userId changes
    fetchUserData(userId);
  }, [userId]); // Run when userId changes
};
```

### useEffect - Cleanup
```tsx
const Component = () => {
  useEffect(() => {
    const timer = setInterval(() => {
      console.log('Tick');
    }, 1000);
    
    // Cleanup function
    return () => {
      clearInterval(timer);
    };
  }, []);
};
```

---

## Conditional Rendering

### If/Else
```tsx
const Component = ({ isLoggedIn }: { isLoggedIn: boolean }) => {
  if (isLoggedIn) {
    return <Dashboard />;
  }
  return <LoginForm />;
};
```

### Ternary Operator
```tsx
const Component = ({ count }: { count: number }) => {
  return (
    <div>
      {count > 0 ? (
        <p>You have {count} items</p>
      ) : (
        <p>No items</p>
      )}
    </div>
  );
};
```

### Logical AND
```tsx
const Component = ({ user }: { user: User | null }) => {
  return (
    <div>
      {user && <UserProfile user={user} />}
      {user?.name && <p>Welcome, {user.name}!</p>}
    </div>
  );
};
```

---

## Lists

### Rendering Arrays
```tsx
const TaskList = ({ tasks }: { tasks: Task[] }) => {
  return (
    <ul>
      {tasks.map(task => (
        <li key={task.id}>{task.title}</li>
      ))}
    </ul>
  );
};
```

### With Index (if needed)
```tsx
const List = ({ items }: { items: string[] }) => {
  return (
    <ul>
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
};
```

---

## Event Handlers

### Click Handler
```tsx
const Button = () => {
  const handleClick = () => {
    console.log('Clicked!');
  };
  
  return <button onClick={handleClick}>Click me</button>;
};
```

### With Parameters
```tsx
const TaskCard = ({ task }: { task: Task }) => {
  const handleStart = (taskId: string) => {
    console.log('Starting task:', taskId);
  };
  
  return (
    <button onClick={() => handleStart(task.id)}>
      Start Task
    </button>
  );
};
```

### Form Handler
```tsx
const Form = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted');
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input type="text" />
      <button type="submit">Submit</button>
    </form>
  );
};
```

---

## Props

### Basic Props
```tsx
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ label, onClick, disabled = false }) => {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
};
```

### Children Prop
```tsx
interface CardProps {
  title: string;
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, children }) => {
  return (
    <div className="card">
      <h2>{title}</h2>
      {children}
    </div>
  );
};

// Usage
<Card title="My Card">
  <p>Card content</p>
</Card>
```

---

## Context API

### Create Context
```tsx
import { createContext, useContext, useState } from 'react';

interface ThemeContextType {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  
  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
```

### Use Context
```tsx
const Component = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div className={theme}>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
};
```

---

## Custom Hooks

### Simple Custom Hook
```tsx
import { useState, useEffect } from 'react';

const useLocalStorage = <T,>(key: string, initialValue: T) => {
  const [value, setValue] = useState<T>(() => {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : initialValue;
  });
  
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  
  return [value, setValue] as const;
};

// Usage
const Component = () => {
  const [name, setName] = useLocalStorage('name', '');
  
  return (
    <input value={name} onChange={e => setName(e.target.value)} />
  );
};
```

---

## React Router

### Setup Routes
```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/sacred-texts" element={<SacredTextsPage />} />
        <Route path="/tasks" element={<TasksPage />} />
      </Routes>
    </BrowserRouter>
  );
};
```

### Navigation
```tsx
import { Link, useNavigate } from 'react-router-dom';

const Component = () => {
  const navigate = useNavigate();
  
  return (
    <div>
      <Link to="/dashboard">Go to Dashboard</Link>
      <button onClick={() => navigate('/tasks')}>
        Go to Tasks
      </button>
    </div>
  );
};
```

---

## TypeScript Types

### Basic Types
```tsx
interface User {
  id: string;
  name: string;
  email: string;
  age?: number; // Optional
}

type Status = 'pending' | 'completed' | 'failed';

interface Task {
  id: string;
  title: string;
  status: Status;
  user: User;
}
```

### Component Props Type
```tsx
interface CardProps {
  title: string;
  description?: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, description, onClick, children }) => {
  // ...
};
```

---

## Common Patterns

### Loading State
```tsx
const Component = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetchData().then(result => {
      setData(result);
      setLoading(false);
    });
  }, []);
  
  if (loading) return <div>Loading...</div>;
  if (!data) return <div>No data</div>;
  
  return <div>{/* Render data */}</div>;
};
```

### Error Handling
```tsx
const Component = () => {
  const [error, setError] = useState<string | null>(null);
  
  const handleAction = async () => {
    try {
      await doSomething();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  };
  
  if (error) return <div>Error: {error}</div>;
  
  return <button onClick={handleAction}>Do Something</button>;
};
```

### Controlled Input
```tsx
const Form = () => {
  const [value, setValue] = useState('');
  
  return (
    <input
      type="text"
      value={value}
      onChange={e => setValue(e.target.value)}
    />
  );
};
```

---

## Styling with Tailwind

### Basic Classes
```tsx
<div className="bg-dark text-white p-4 rounded-lg">
  <h1 className="text-2xl font-bold">Title</h1>
  <p className="text-gray-300">Description</p>
</div>
```

### Conditional Classes
```tsx
const Button = ({ active }: { active: boolean }) => {
  return (
    <button
      className={`px-4 py-2 rounded ${
        active ? 'bg-orange-500' : 'bg-gray-600'
      }`}
    >
      Click me
    </button>
  );
};
```

### Using clsx (optional helper)
```tsx
import clsx from 'clsx';

const Button = ({ active }: { active: boolean }) => {
  return (
    <button
      className={clsx(
        'px-4 py-2 rounded',
        active && 'bg-orange-500',
        !active && 'bg-gray-600'
      )}
    >
      Click me
    </button>
  );
};
```

---

## Debugging Tips

### Console Logging
```tsx
const Component = ({ data }: { data: any }) => {
  console.log('Component rendered with:', data);
  console.table(data); // For arrays/objects
  
  return <div>{/* ... */}</div>;
};
```

### Debugger Statement
```tsx
const Component = () => {
  const handleClick = () => {
    debugger; // Pauses execution here
    // Your code
  };
  
  return <button onClick={handleClick}>Click</button>;
};
```

---

## Common Mistakes to Avoid

1. **Mutating state directly**
   ```tsx
   // ❌ Wrong
   const [items, setItems] = useState([1, 2, 3]);
   items.push(4); // Don't do this!
   
   // ✅ Correct
   setItems([...items, 4]);
   ```

2. **Missing keys in lists**
   ```tsx
   // ❌ Wrong
   {items.map(item => <div>{item}</div>)}
   
   // ✅ Correct
   {items.map(item => <div key={item.id}>{item}</div>)}
   ```

3. **Infinite loops in useEffect**
   ```tsx
   // ❌ Wrong - missing dependency
   useEffect(() => {
     fetchData(userId);
   }, []); // userId changes but effect doesn't run
   
   // ✅ Correct
   useEffect(() => {
     fetchData(userId);
   }, [userId]);
   ```

---

## Resources

- [React Official Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Router Docs](https://reactrouter.com)

---

Keep this reference handy as you code! 📚

