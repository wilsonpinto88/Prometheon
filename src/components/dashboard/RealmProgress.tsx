import Card from '../shared/ui/Card'

interface Realm {
  name: string
  progress: number
  icon: string
}

const realms: Realm[] = [
  { name: 'Tartarus', progress: 100, icon: '🔥' },
  { name: 'Gaia', progress: 100, icon: '🌍' },
  { name: 'Midgard', progress: 65, icon: '⚔️' },
  { name: 'Asgard', progress: 30, icon: '⚡' },
  { name: 'Valhalla', progress: 10, icon: '🛡️' },
  { name: 'Elysium', progress: 0, icon: '✨' },
  { name: 'Prometheon', progress: 0, icon: '🏆' }
]

const RealmProgress = () => {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold text-white mb-4">Realm Progress</h2>
      <div className="space-y-4">
        {realms.map((realm) => (
          <div key={realm.name}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-lg">{realm.icon}</span>
                <span className="text-gray-300 font-medium">{realm.name}</span>
              </div>
              <span className="text-sm text-gray-400">{realm.progress}%</span>
            </div>
            <div className="w-full bg-dark-surface rounded-full h-2">
              <div
                className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${realm.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

export default RealmProgress

