import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { mockTasks } from '../data/mockTasks'
import type { Task } from '../shared/types/task'
import Badge from '../shared/ui/Badge'
import Button from '../shared/ui/Button'

const TaskDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    const timer = setTimeout(() => {
      const found = mockTasks.find((t) => t.id === id)
      if (found) {
        setTask(found)
      } else {
        setError('Task not found.')
      }
      setLoading(false)
    }, 400)

    return () => clearTimeout(timer)
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
          {task.completed && <Badge variant="success">✓ Done</Badge>}
        </div>

        <p className="text-gray-300 mb-6">{task.description}</p>

        <div className="flex flex-wrap gap-2 mb-6">
          <Badge variant={difficultyColors[task.difficulty]}>{task.difficulty}</Badge>
          <Badge variant="info">{task.type}</Badge>
          <span className="text-sm text-gray-500 flex items-center">+{task.points} pts</span>
        </div>

        <Button variant="primary" className="w-full">
          {task.completed ? 'Review Task' : 'Start Task'}
        </Button>
      </div>
    </div>
  )
}

export default TaskDetailPage
