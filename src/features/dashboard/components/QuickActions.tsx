import Card from '../../../shared/ui/Card'
import Button from '../../../shared/ui/Button'
import { Link } from 'react-router-dom'

const QuickActions = () => {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link to="/tasks">
          <Button variant="primary" className="w-full justify-center">
            Browse Tasks
          </Button>
        </Link>
        <Link to="/sacred-texts">
          <Button variant="secondary" className="w-full justify-center">
            Read Texts
          </Button>
        </Link>
        <Button variant="outline" className="w-full justify-center">
          View Progress
        </Button>
        <Button variant="outline" className="w-full justify-center">
          Achievements
        </Button>
      </div>
    </Card>
  )
}

export default QuickActions
