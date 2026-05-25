import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import type { Task } from '../shared/types/task'
import Badge from '../shared/ui/Badge'
import Button from '../shared/ui/Button'
import { api } from '../services/api'
import { useProgressStore } from '../shared/store/progressStore'

const TaskDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { tasks, toggleComplete } = useProgressStore()
  const completed = tasks.find((t) => t.id === id)?.completed ?? false

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)

    api.fetchTaskById(id)
      .then(setTask)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  const difficultyColors = {
    Easy: 'success',
    Medium: 'warning',
    Hard: 'danger',
  } as const

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-primary-500 text-lg animate-pulse">Loading...</div>
      </div>
    )
  }

  if (error || !task) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <p className="text-red-400 text-lg">{error ?? 'Not found.'}</p>
        <Link to="/tasks">
          <Button variant="primary" size="sm">Back to Tasks</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <Link to="/tasks" className="text-primary-400 hover:text-primary-300 text-sm mb-6 inline-block">
        ← Back to Tasks
      </Link>

      <div className="bg-dark-800 border border-dark-700 rounded-xl p-8">
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-2xl font-bold text-white flex-1">{task.title}</h1>
          {completed && <Badge variant="success">✓ Done</Badge>}
        </div>

        <p className="text-gray-300 mb-6">{task.description}</p>

        <div className="flex flex-wrap gap-2 mb-6">
          <Badge variant={difficultyColors[task.difficulty]}>{task.difficulty}</Badge>
          <Badge variant="info">{task.type}</Badge>
          <span className="text-sm text-gray-500 flex items-center">+{task.points} pts</span>
        </div>

        <div className="flex gap-3">
          <Button variant="primary" className="flex-1">
            {completed ? 'Review Task' : 'Start Task'}
          </Button>
          <Button
            variant={completed ? 'outline' : 'secondary'}
            onClick={() => id && toggleComplete(id)}
            title={completed ? 'Mark incomplete' : 'Mark complete'}
          >
            {completed ? '↩ Undo' : '✓ Complete'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default TaskDetailPage
