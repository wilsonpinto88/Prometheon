import clsx from 'clsx'

interface RealmFilterProps {
  selectedRealm: string | null
  onRealmChange: (realm: string | null) => void
}

const realms = [
  { id: 'all', name: 'All Realms' },
  { id: 'tartarus', name: 'Tartarus' },
  { id: 'gaia', name: 'Gaia' },
  { id: 'midgard', name: 'Midgard' },
  { id: 'asgard', name: 'Asgard' },
  { id: 'valhalla', name: 'Valhalla' },
  { id: 'elysium', name: 'Elysium' },
  { id: 'prometheon', name: 'Prometheon' }
]

const RealmFilter = ({ selectedRealm, onRealmChange }: RealmFilterProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {realms.map((realm) => {
        const isSelected = selectedRealm === realm.id || (realm.id === 'all' && selectedRealm === null)
        return (
          <button
            key={realm.id}
            onClick={() => onRealmChange(realm.id === 'all' ? null : realm.id)}
            className={clsx(
              'px-4 py-2 rounded-lg transition-colors font-medium',
              isSelected
                ? 'bg-primary-500 text-white'
                : 'bg-dark-surface text-gray-300 hover:bg-dark-border'
            )}
          >
            {realm.name}
          </button>
        )
      })}
    </div>
  )
}

export default RealmFilter

