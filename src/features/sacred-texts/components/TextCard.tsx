import { useNavigate } from 'react-router-dom'
import Card from '../../../shared/ui/Card'
import Badge from '../../../shared/ui/Badge'
import Button from '../../../shared/ui/Button'

interface TextCardProps {
  id: string
  title: string
  author: string
  realm: string
  description: string
  pages: number
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  completed?: boolean
}

const TextCard = ({
  id,
  title,
  author,
  realm,
  description,
  pages,
  difficulty,
  completed = false,
}: TextCardProps) => {
  const navigate = useNavigate()
  const difficultyColors = {
    Beginner: 'success',
    Intermediate: 'warning',
    Advanced: 'danger',
  } as const

  return (
    <Card className="p-6 hover:border-primary-500 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
          <p className="text-sm text-gray-400">by {author}</p>
        </div>
        {completed && (
          <Badge variant="success" size="sm">
            ✓ Read
          </Badge>
        )}
      </div>

      <p className="text-gray-300 text-sm mb-4 line-clamp-2">{description}</p>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Badge variant="info" size="sm">{realm}</Badge>
        <Badge variant={difficultyColors[difficulty]} size="sm">{difficulty}</Badge>
        <span className="text-xs text-gray-500">{pages} pages</span>
      </div>

      <Button variant="primary" size="sm" className="w-full" onClick={() => navigate(`/sacred-texts/${id}`)}>
        {completed ? 'Review' : 'Start Reading'}
      </Button>
    </Card>
  )
}

export default TextCard
