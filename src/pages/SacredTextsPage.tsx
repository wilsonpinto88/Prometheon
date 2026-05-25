import { useState, useMemo, useCallback } from 'react'
import RealmFilter from '../features/sacred-texts/components/RealmFilter'
import TextCard from '../features/sacred-texts/components/TextCard'
import { mockTexts } from '../data/mockTexts'
import useLocalStorage from '../shared/hooks/useLocalStorage'
import useDebounce from '../shared/hooks/useDebounce'
import SearchForm from '../shared/components/SearchForm'

const SacredTextsPage = () => {
  const [selectedRealm, setSelectedRealm] = useLocalStorage<string | null>(
    'sacred-texts-realm-filter',
    null
  )
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearch = useDebounce(searchQuery, 300)

  const handleSearch = useCallback((q: string) => setSearchQuery(q), [])
  const handleRealmChange = useCallback(
    (realm: string | null) => setSelectedRealm(realm),
    [setSelectedRealm]
  )

  const filteredTexts = useMemo(() => {
    return mockTexts.filter((text) => {
      const matchesRealm = !selectedRealm || text.realm.toLowerCase() === selectedRealm.toLowerCase()
      const matchesSearch =
        !debouncedSearch ||
        text.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        text.author.toLowerCase().includes(debouncedSearch.toLowerCase())
      return matchesRealm && matchesSearch
    })
  }, [selectedRealm, debouncedSearch])

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

      <div className="mb-4">
        <SearchForm
          placeholder="Search by title or author..."
          onSearch={handleSearch}
        />
      </div>

      <div className="mb-6">
        <RealmFilter
          selectedRealm={selectedRealm}
          onRealmChange={handleRealmChange}
        />
      </div>

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
            No texts found.
          </p>
        )}
      </div>
    </div>
  )
}

export default SacredTextsPage
