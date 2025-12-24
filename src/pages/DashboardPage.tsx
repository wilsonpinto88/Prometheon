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
        <div className="bg-dark-card p-6 rounded-lg border border-dark-border">
          <h3 className="text-gray-400 text-sm mb-2">Books Read</h3>
          <p className="text-3xl font-bold text-white">7/10</p>
        </div>
        <div className="bg-dark-card p-6 rounded-lg border border-dark-border">
          <h3 className="text-gray-400 text-sm mb-2">Tasks Completed</h3>
          <p className="text-3xl font-bold text-white">42</p>
        </div>
        <div className="bg-dark-card p-6 rounded-lg border border-dark-border">
          <h3 className="text-gray-400 text-sm mb-2">Current Realm</h3>
          <p className="text-2xl font-bold text-primary-500 flex items-center gap-2">
            Midgard <span>🔥</span>
          </p>
        </div>
        <div className="bg-dark-card p-6 rounded-lg border border-dark-border">
          <h3 className="text-gray-400 text-sm mb-2">Total Points</h3>
          <p className="text-3xl font-bold text-white">12,450</p>
          <p className="text-sm text-green-400 mt-1">↑ 10% this week</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Realm Progress */}
        <div className="bg-dark-card p-6 rounded-lg border border-dark-border">
          <h2 className="text-xl font-semibold text-white mb-4">Realm Progress</h2>
          <div className="space-y-4">
            <p className="text-gray-400">Realm progress component coming soon...</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-dark-card p-6 rounded-lg border border-dark-border">
          <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <p className="text-gray-400">Activity feed coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage

