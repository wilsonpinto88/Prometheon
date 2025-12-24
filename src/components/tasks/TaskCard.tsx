import Card from '../shared/ui/Card'
import Badge from '../shared/ui/Badge'
import Button from '../shared/ui/Button'

interface TaskCardProps {
  id: string
  title: string
  description: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  type: 'Coding' | 'System Design' | 'Problem Solving' | 'Research'
  points: number
  completed?: boolean
}

const TaskCard = ({
  title,
  description,
  difficulty,
  type,
  points,
  completed = false
}: TaskCardProps) => {
  const difficultyColors = {
    Easy: 'success',
    Medium: 'warning',
    Hard: 'danger'
  } as const

  return (
    <Card className="p-6 hover:border-primary-500 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-white flex-1">{title}</h3>
        {completed && (
          <Badge variant="success" size="sm">
            ✓
          </Badge>
        )}
      </div>
      
      <p className="text-gray-300 text-sm mb-4 line-clamp-2">{description}</p>
      
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Badge variant={difficultyColors[difficulty]} size="sm">
          {difficulty}
        </Badge>
        <Badge variant="info" size="sm">
          {type}
        </Badge>
        <span className="text-xs text-gray-500">+{points} pts</span>
      </div>
      
      <Button variant="primary" size="sm" className="w-full">
        {completed ? 'Review' : 'Start Task'}
      </Button>
    </Card>
  )
}

export default TaskCard

