import { create } from 'zustand'
import { Task } from '../types/task'
import { mockTasks } from '../../data/mockTasks'
import { api } from '../../services/api'

interface ProgressState {
  tasks: Task[]
  pendingId: string | null
  error: string | null
  toggleComplete: (id: string) => Promise<void>
  clearError: () => void
  completedCount: () => number
  totalPoints: () => number
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  tasks: mockTasks,
  pendingId: null,
  error: null,

  toggleComplete: async (id) => {
    const previous = get().tasks
    const task = previous.find((t) => t.id === id)
    if (!task) return

    // Optimistic update
    set((state) => ({
      pendingId: id,
      error: null,
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      ),
    }))

    try {
      await api.updateTaskComplete(id, !task.completed)
    } catch (err) {
      // Rollback
      set({ tasks: previous, error: (err as Error).message })
    } finally {
      set({ pendingId: null })
    }
  },

  clearError: () => set({ error: null }),
  completedCount: () => get().tasks.filter((t) => t.completed).length,
  totalPoints: () =>
    get().tasks
      .filter((t) => t.completed)
      .reduce((sum, t) => sum + t.points, 0),
}))
