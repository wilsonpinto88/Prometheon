import { useProgressStore } from './progressStore'
import { mockTasks } from '../../data/mockTasks'

const initialState = {
  tasks: [...mockTasks],
  pendingId: null,
  error: null,
}

beforeEach(() => {
  useProgressStore.setState(initialState)
})

describe('progressStore', () => {
  test('completedCount returns correct initial count', () => {
    const { completedCount } = useProgressStore.getState()
    const expected = mockTasks.filter((t) => t.completed).length
    expect(completedCount()).toBe(expected)
  })

  test('totalPoints sums points of completed tasks', () => {
    const { totalPoints } = useProgressStore.getState()
    const expected = mockTasks
      .filter((t) => t.completed)
      .reduce((sum, t) => sum + t.points, 0)
    expect(totalPoints()).toBe(expected)
  })

  test('tasks initialise from mockTasks', () => {
    const { tasks } = useProgressStore.getState()
    expect(tasks).toHaveLength(mockTasks.length)
  })

  test('clearError resets error to null', () => {
    useProgressStore.setState({ error: 'Something failed' })
    useProgressStore.getState().clearError()
    expect(useProgressStore.getState().error).toBeNull()
  })

  test('pendingId is null initially', () => {
    expect(useProgressStore.getState().pendingId).toBeNull()
  })
})
