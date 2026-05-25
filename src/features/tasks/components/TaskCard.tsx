import { useNavigate } from 'react-router-dom'
import Card from '../../../shared/ui/Card'
import Badge from '../../../shared/ui/Badge'
import Button from '../../../shared/ui/Button'
import { useProgressStore } from '../../../shared/store/progressStore'

interface TaskCardProps {
  id: string
  title: string
  description: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  type: 'Coding' | 'System Design' | 'Problem Solving' | 'Research'
  points: number
}

const TaskCard = ({ id, title, description, difficulty, type, points }: TaskCardProps) => {
  const navigate = useNavigate()
  const { tasks, toggleComplete } = useProgressStore()
  const task = tasks.find((t) => t.id === id)
  const completed = task?.completed ?? false

  const difficultyColors = {
    Easy: 'success',
    Medium: 'warning',
    Hard: 'danger',
  } as const

  return (
    <Card className="p-6 hover:border-primary-500 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-white flex-1">{title}</h3>
        {completed && <Badge variant="success" size="sm">✓</Badge>}
      </div>

      <p className="text-gray-300 text-sm mb-4 line-clamp-2">{description}</p>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Badge variant={difficultyColors[difficulty]} size="sm">{difficulty}</Badge>
        <Badge variant="info" size="sm">{type}</Badge>
        <span className="text-xs text-gray-500">+{points} pts</span>
      </div>

      <div className="flex gap-2">
        <Button
          variant="primary"
          size="sm"
          className="flex-1"
          onClick={() => navigate(`/tasks/${id}`)}
        >
          {completed ? 'Review' : 'Start Task'}
        </Button>
        <Button
          variant={completed ? 'outline' : 'secondary'}
          size="sm"
          onClick={() => toggleComplete(id)}
          title={completed ? 'Mark incomplete' : 'Mark complete'}
        >
          {completed ? '↩' : '✓'}
        </Button>
      </div>
    </Card>
  )
}

export default TaskCard
