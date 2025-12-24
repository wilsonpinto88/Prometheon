import Card from '../shared/ui/Card'

interface Activity {
  id: string
  type: 'task' | 'text' | 'achievement'
  title: string
  time: string
  icon: string
}

const activities: Activity[] = [
  {
    id: '1',
    type: 'task',
    title: 'Completed "Build a Todo App"',
    time: '2 hours ago',
    icon: '✓'
  },
  {
    id: '2',
    type: 'text',
    title: 'Read "Clean Code" Chapter 3',
    time: '5 hours ago',
    icon: '📚'
  },
  {
    id: '3',
    type: 'achievement',
    title: 'Unlocked "First Steps" achievement',
    time: '1 day ago',
    icon: '🏆'
  },
  {
    id: '4',
    type: 'task',
    title: 'Started "React Hooks Challenge"',
    time: '2 days ago',
    icon: '🚀'
  },
  {
    id: '5',
    type: 'text',
    title: 'Bookmarked "System Design Patterns"',
    time: '3 days ago',
    icon: '⭐'
  }
]

const RecentActivity = () => {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-3 pb-4 border-b border-dark-border last:border-0 last:pb-0"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-dark-surface flex items-center justify-center text-lg">
              {activity.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-300 text-sm">{activity.title}</p>
              <p className="text-gray-500 text-xs mt-1">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

export default RecentActivity

