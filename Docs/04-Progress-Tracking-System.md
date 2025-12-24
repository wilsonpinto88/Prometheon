# Progress Tracking System Design

## Overview

The Progress Tracking System is a core feature of Prometheon that monitors and displays user advancement through learning materials, tasks, and realms. This document outlines the architecture, data models, and implementation approach.

---

## System Requirements

### Core Functionalities

1. **Track Reading Progress**: Monitor progress through Sacred Texts
2. **Track Task Completion**: Record completed tasks and challenges
3. **Realm Progression**: Calculate advancement through the 7 realms
4. **Points System**: Award and track points for achievements
5. **Activity Timeline**: Log user activities and milestones
6. **Achievement System**: Unlock achievements based on progress
7. **Statistics Dashboard**: Display comprehensive progress metrics

---

## Data Models

### User Progress Schema

```typescript
interface UserProgress {
  userId: string;
  booksRead: number;
  totalBooks: number;
  tasksCompleted: number;
  currentRealm: Realm;
  totalPoints: number;
  pointsThisWeek: number;
  pointsChangePercent: number;
  lastUpdated: Date;
}

interface RealmProgress {
  realmId: string;
  realmName: Realm;
  progress: number; // 0-100 percentage
  completedTasks: number;
  totalTasks: number;
  completedTexts: number;
  totalTexts: number;
  unlocked: boolean;
  unlockedAt?: Date;
}

interface TaskProgress {
  taskId: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'skipped';
  startedAt?: Date;
  completedAt?: Date;
  timeSpent?: number; // in minutes
  attempts: number;
  pointsEarned?: number;
  lastAccessed?: Date;
}

interface TextProgress {
  textId: string;
  status: 'not_started' | 'reading' | 'completed';
  currentChapter?: number;
  totalChapters: number;
  progress: number; // 0-100 percentage
  startedAt?: Date;
  completedAt?: Date;
  lastReadAt?: Date;
  bookmarkedPages?: string[];
}

interface Activity {
  id: string;
  userId: string;
  type: 'task_completed' | 'text_started' | 'text_completed' | 'realm_unlocked' | 'achievement_earned';
  entityId: string; // taskId, textId, realmId, etc.
  entityName: string;
  timestamp: Date;
  pointsEarned?: number;
  metadata?: Record<string, unknown>;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'reading' | 'tasks' | 'realms' | 'streak' | 'special';
  requirement: AchievementRequirement;
  unlockedAt?: Date;
  pointsReward: number;
}

type AchievementRequirement =
  | { type: 'books_read'; count: number }
  | { type: 'tasks_completed'; count: number }
  | { type: 'realm_completed'; realm: Realm }
  | { type: 'streak_days'; days: number }
  | { type: 'points_earned'; points: number };
```

---

## State Management

### Progress Store (Zustand)

```typescript
interface ProgressStore {
  // State
  userProgress: UserProgress | null;
  realmProgress: RealmProgress[];
  taskProgress: Record<string, TaskProgress>;
  textProgress: Record<string, TextProgress>;
  activities: Activity[];
  achievements: Achievement[];
  
  // Actions
  initializeProgress: (userId: string) => Promise<void>;
  updateTaskProgress: (taskId: string, status: TaskProgress['status']) => Promise<void>;
  updateTextProgress: (textId: string, progress: Partial<TextProgress>) => Promise<void>;
  calculateRealmProgress: (realmId: string) => RealmProgress;
  addActivity: (activity: Omit<Activity, 'id' | 'timestamp'>) => Promise<void>;
  checkAchievements: () => Promise<void>;
  syncProgress: () => Promise<void>;
}
```

### Server State (TanStack Query)

```typescript
// Query keys
const progressKeys = {
  all: ['progress'] as const,
  user: (userId: string) => [...progressKeys.all, 'user', userId] as const,
  realms: (userId: string) => [...progressKeys.user(userId), 'realms'] as const,
  tasks: (userId: string) => [...progressKeys.user(userId), 'tasks'] as const,
  texts: (userId: string) => [...progressKeys.user(userId), 'texts'] as const,
  activities: (userId: string) => [...progressKeys.user(userId), 'activities'] as const,
  achievements: (userId: string) => [...progressKeys.user(userId), 'achievements'] as const,
};

// Hooks
const useUserProgress = (userId: string) => {
  return useQuery({
    queryKey: progressKeys.user(userId),
    queryFn: () => progressService.getUserProgress(userId),
  });
};

const useUpdateTaskProgress = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: TaskProgress['status'] }) =>
      progressService.updateTaskProgress(taskId, status),
    onSuccess: (data, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: progressKeys.tasks(variables.userId) });
      queryClient.invalidateQueries({ queryKey: progressKeys.user(variables.userId) });
    },
  });
};
```

---

## Progress Calculation Logic

### Realm Progress Calculation

```typescript
const calculateRealmProgress = (
  realmId: string,
  tasks: Task[],
  texts: Text[],
  taskProgress: Record<string, TaskProgress>,
  textProgress: Record<string, TextProgress>
): RealmProgress => {
  const realmTasks = tasks.filter(t => t.realm === realmId);
  const realmTexts = texts.filter(t => t.realm === realmId);
  
  const completedTasks = realmTasks.filter(
    t => taskProgress[t.id]?.status === 'completed'
  ).length;
  
  const completedTexts = realmTexts.filter(
    t => textProgress[t.id]?.status === 'completed'
  ).length;
  
  // Weighted calculation: 60% tasks, 40% texts
  const taskProgressPercent = (completedTasks / realmTasks.length) * 100;
  const textProgressPercent = (completedTexts / realmTexts.length) * 100;
  const overallProgress = (taskProgressPercent * 0.6) + (textProgressPercent * 0.4);
  
  return {
    realmId,
    realmName: realmId as Realm,
    progress: Math.round(overallProgress),
    completedTasks,
    totalTasks: realmTasks.length,
    completedTexts,
    totalTexts: realmTexts.length,
    unlocked: isRealmUnlocked(realmId, overallProgress),
  };
};
```

### Points Calculation

```typescript
const calculatePoints = (
  taskProgress: Record<string, TaskProgress>,
  textProgress: Record<string, TextProgress>,
  achievements: Achievement[]
): number => {
  const taskPoints = Object.values(taskProgress)
    .filter(tp => tp.status === 'completed')
    .reduce((sum, tp) => sum + (tp.pointsEarned || 0), 0);
  
  const textPoints = Object.values(textProgress)
    .filter(tp => tp.status === 'completed')
    .reduce((sum, tp) => {
      // Base points for completing a text
      return sum + 100;
    }, 0);
  
  const achievementPoints = achievements
    .filter(a => a.unlockedAt)
    .reduce((sum, a) => sum + a.pointsReward, 0);
  
  return taskPoints + textPoints + achievementPoints;
};
```

---

## Real-time Updates

### Optimistic Updates

```typescript
const useStartTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (taskId: string) => progressService.startTask(taskId),
    onMutate: async (taskId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: progressKeys.tasks(userId) });
      
      // Snapshot previous value
      const previousProgress = queryClient.getQueryData(progressKeys.tasks(userId));
      
      // Optimistically update
      queryClient.setQueryData(progressKeys.tasks(userId), (old: any) => ({
        ...old,
        [taskId]: {
          ...old[taskId],
          status: 'in_progress',
          startedAt: new Date(),
        },
      }));
      
      return { previousProgress };
    },
    onError: (err, taskId, context) => {
      // Rollback on error
      queryClient.setQueryData(progressKeys.tasks(userId), context.previousProgress);
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: progressKeys.tasks(userId) });
    },
  });
};
```

### Periodic Sync

```typescript
// Sync progress every 30 seconds if user is active
useEffect(() => {
  const interval = setInterval(() => {
    if (document.visibilityState === 'visible') {
      queryClient.invalidateQueries({ queryKey: progressKeys.user(userId) });
    }
  }, 30000);
  
  return () => clearInterval(interval);
}, [userId, queryClient]);
```

---

## Local Storage Strategy

### Caching Progress Locally

```typescript
// Store progress in localStorage for offline support
const PROGRESS_CACHE_KEY = 'prometheon_progress_cache';

const cacheProgress = (progress: UserProgress) => {
  try {
    localStorage.setItem(PROGRESS_CACHE_KEY, JSON.stringify({
      data: progress,
      timestamp: Date.now(),
    }));
  } catch (error) {
    console.error('Failed to cache progress:', error);
  }
};

const getCachedProgress = (): UserProgress | null => {
  try {
    const cached = localStorage.getItem(PROGRESS_CACHE_KEY);
    if (!cached) return null;
    
    const { data, timestamp } = JSON.parse(cached);
    // Use cache if less than 1 hour old
    if (Date.now() - timestamp < 3600000) {
      return data;
    }
  } catch (error) {
    console.error('Failed to read cached progress:', error);
  }
  return null;
};
```

---

## API Endpoints

### Progress Service

```typescript
class ProgressService {
  // Get user progress summary
  async getUserProgress(userId: string): Promise<UserProgress> {
    // GET /api/users/:userId/progress
  }
  
  // Get realm progress
  async getRealmProgress(userId: string): Promise<RealmProgress[]> {
    // GET /api/users/:userId/progress/realms
  }
  
  // Update task progress
  async updateTaskProgress(
    taskId: string,
    status: TaskProgress['status']
  ): Promise<TaskProgress> {
    // PATCH /api/tasks/:taskId/progress
  }
  
  // Update text progress
  async updateTextProgress(
    textId: string,
    progress: Partial<TextProgress>
  ): Promise<TextProgress> {
    // PATCH /api/texts/:textId/progress
  }
  
  // Get activities
  async getActivities(
    userId: string,
    limit?: number
  ): Promise<Activity[]> {
    // GET /api/users/:userId/activities?limit=20
  }
  
  // Get achievements
  async getAchievements(userId: string): Promise<Achievement[]> {
    // GET /api/users/:userId/achievements
  }
  
  // Sync progress (batch update)
  async syncProgress(
    userId: string,
    updates: ProgressUpdates
  ): Promise<void> {
    // POST /api/users/:userId/progress/sync
  }
}
```

---

## UI Components

### Progress Display Components

```typescript
// components/progress/RealmProgressBar.tsx
interface RealmProgressBarProps {
  realm: RealmProgress;
  showDetails?: boolean;
}

// components/progress/ProgressStats.tsx
interface ProgressStatsProps {
  progress: UserProgress;
}

// components/progress/ActivityFeed.tsx
interface ActivityFeedProps {
  activities: Activity[];
  limit?: number;
}

// components/progress/AchievementBadge.tsx
interface AchievementBadgeProps {
  achievement: Achievement;
  size?: 'sm' | 'md' | 'lg';
}
```

---

## Testing Strategy

### Unit Tests

- Progress calculation functions
- Points calculation logic
- Realm unlock conditions
- Achievement requirements

### Integration Tests

- Progress store updates
- API synchronization
- Optimistic updates
- Cache management

### E2E Tests

- Complete a task and verify progress
- Read a text and verify progress
- Unlock a realm
- Earn an achievement

---

## Performance Considerations

1. **Debounce Progress Updates**: Batch rapid updates
2. **Lazy Load Activities**: Load activities on scroll
3. **Memoize Calculations**: Cache realm progress calculations
4. **IndexedDB**: For large progress datasets (future)
5. **Web Workers**: For heavy calculations (if needed)

---

## Future Enhancements

1. **Streak Tracking**: Daily login streaks
2. **Leaderboards**: Compare progress with others
3. **Progress Sharing**: Share achievements on social media
4. **Progress Analytics**: Detailed insights and recommendations
5. **Offline Mode**: Full offline progress tracking
6. **Progress Export**: Download progress data

