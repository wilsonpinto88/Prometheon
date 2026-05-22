import RealmProgress from '../features/dashboard/components/RealmProgress'
import RecentActivity from '../features/dashboard/components/RecentActivity'
import QuickActions from '../features/dashboard/components/QuickActions'
import Card from '../shared/ui/Card'

const DashboardPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <span>📊</span>
          Dashboard
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Stats Cards */}
        <Card className="p-6">
          <h3 className="text-gray-400 text-sm mb-2">Books Read</h3>
          <p className="text-3xl font-bold text-white">7/10</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-gray-400 text-sm mb-2">Tasks Completed</h3>
          <p className="text-3xl font-bold text-white">42</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-gray-400 text-sm mb-2">Current Realm</h3>
          <p className="text-2xl font-bold text-primary-500 flex items-center gap-2">
            Midgard <span>🔥</span>
          </p>
        </Card>
        <Card className="p-6">
          <h3 className="text-gray-400 text-sm mb-2">Total Points</h3>
          <p className="text-3xl font-bold text-white">12,450</p>
          <p className="text-sm text-green-400 mt-1">↑ 10% this week</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RealmProgress />
        <RecentActivity />
        <QuickActions />
      </div>
    </div>
  )
}

export default DashboardPage

