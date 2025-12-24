const SacredTextsPage = () => {
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
      <div className="mb-6 flex flex-wrap gap-2">
        <button className="bg-primary-500 text-white px-4 py-2 rounded-lg">
          All Realms
        </button>
        <button className="bg-dark-surface text-gray-300 hover:bg-dark-border px-4 py-2 rounded-lg transition-colors">
          Tartarus
        </button>
        <button className="bg-dark-surface text-gray-300 hover:bg-dark-border px-4 py-2 rounded-lg transition-colors">
          Gaia
        </button>
        <button className="bg-dark-surface text-gray-300 hover:bg-dark-border px-4 py-2 rounded-lg transition-colors">
          Midgard
        </button>
        <button className="bg-dark-surface text-gray-300 hover:bg-dark-border px-4 py-2 rounded-lg transition-colors">
          Asgard
        </button>
        <button className="bg-dark-surface text-gray-300 hover:bg-dark-border px-4 py-2 rounded-lg transition-colors">
          Valhalla
        </button>
        <button className="bg-dark-surface text-gray-300 hover:bg-dark-border px-4 py-2 rounded-lg transition-colors">
          Elysium
        </button>
        <button className="bg-dark-surface text-gray-300 hover:bg-dark-border px-4 py-2 rounded-lg transition-colors">
          Prometheon
        </button>
      </div>

      {/* Text Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <p className="text-gray-400 col-span-full">
          Sacred text cards will appear here...
        </p>
      </div>
    </div>
  )
}

export default SacredTextsPage

