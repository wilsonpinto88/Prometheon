import { useState, useMemo } from 'react'
import TaskFilters from '../components/tasks/TaskFilters'
import TaskCard from '../components/tasks/TaskCard'
import { mockTasks } from '../data/mockTasks'

const TasksPage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  const filteredTasks = useMemo(() => {
    return mockTasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesDifficulty = !difficultyFilter || task.difficulty === difficultyFilter
      const matchesType = !typeFilter || task.type === typeFilter

      return matchesSearch && matchesDifficulty && matchesType
    })
  }, [searchQuery, difficultyFilter, typeFilter])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <span>✓</span>
          Tasks & Challenges
        </h1>
      </div>

      {/* Search and Filters */}
      <div className="mb-6">
        <TaskFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          difficultyFilter={difficultyFilter}
          onDifficultyChange={setDifficultyFilter}
          typeFilter={typeFilter}
          onTypeChange={setTypeFilter}
        />
      </div>

      {/* Task Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              id={task.id}
              title={task.title}
              description={task.description}
              difficulty={task.difficulty}
              type={task.type}
              points={task.points}
              completed={task.completed}
            />
          ))
        ) : (
          <p className="text-gray-400 col-span-full text-center py-8">
            No tasks found matching your filters.
          </p>
        )}
      </div>
    </div>
  )
}

export default TasksPage

