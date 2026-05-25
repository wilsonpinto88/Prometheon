import { SacredText } from '../shared/types/sacredText'
import { Task } from '../shared/types/task'
import { mockTexts } from '../data/mockTexts'
import { mockTasks } from '../data/mockTasks'

const delay = (ms: number) => new Promise<void>((res) => setTimeout(res, ms))

export const api = {
  async fetchTexts(): Promise<SacredText[]> {
    await delay(400)
    return mockTexts
  },

  async fetchTextById(id: string): Promise<SacredText> {
    await delay(400)
    const text = mockTexts.find((t) => t.id === id)
    if (!text) throw new Error('Sacred text not found.')
    return text
  },

  async fetchTasks(): Promise<Task[]> {
    await delay(400)
    return mockTasks
  },

  async fetchTaskById(id: string): Promise<Task> {
    await delay(400)
    const task = mockTasks.find((t) => t.id === id)
    if (!task) throw new Error('Task not found.')
    return task
  },
}
