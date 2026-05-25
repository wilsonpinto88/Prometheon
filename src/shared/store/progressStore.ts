import { create } from 'zustand'
import { Task } from '../types/task'
import { mockTasks } from '../../data/mockTasks'

interface ProgressState {
  tasks: Task[]
  toggleComplete: (id: string) => void
  completedCount: () => number
  totalPoints: () => number
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  tasks: mockTasks,
  toggleComplete: (id) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      ),
    })),
  completedCount: () => get().tasks.filter((t) => t.completed).length,
  totalPoints: () =>
    get().tasks
      .filter((t) => t.completed)
      .reduce((sum, t) => sum + t.points, 0),
}))
