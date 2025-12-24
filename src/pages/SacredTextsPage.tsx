import { useState, useMemo } from 'react'
import RealmFilter from '../components/sacred-texts/RealmFilter'
import TextCard from '../components/sacred-texts/TextCard'
import { mockTexts } from '../data/mockTexts'

const SacredTextsPage = () => {
  const [selectedRealm, setSelectedRealm] = useState<string | null>(null)

  const filteredTexts = useMemo(() => {
    if (!selectedRealm) return mockTexts
    return mockTexts.filter(
      (text) => text.realm.toLowerCase() === selectedRealm.toLowerCase()
    )
  }, [selectedRealm])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <span>📚</span>
          The Sacred Texts
        </h1>
        <p className="text-gray-400 mt-2">
          Embark on a journey through ancient wisdom and modern code. Discover the knowledge to master every realm of software engineering.
        </p>
      </div>

      {/* Realm Filters */}
      <div className="mb-6">
        <RealmFilter
          selectedRealm={selectedRealm}
          onRealmChange={setSelectedRealm}
        />
      </div>

      {/* Text Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTexts.length > 0 ? (
          filteredTexts.map((text) => (
            <TextCard
              key={text.id}
              id={text.id}
              title={text.title}
              author={text.author}
              realm={text.realm}
              description={text.description}
              pages={text.pages}
              difficulty={text.difficulty}
              completed={text.completed}
            />
          ))
        ) : (
          <p className="text-gray-400 col-span-full text-center py-8">
            No texts found in this realm.
          </p>
        )}
      </div>
    </div>
  )
}

export default SacredTextsPage

