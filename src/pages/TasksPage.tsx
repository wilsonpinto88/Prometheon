import { useState, useMemo } from 'react'
import TaskFilters from '../features/tasks/components/TaskFilters'
import TaskCard from '../features/tasks/components/TaskCard'
import { useProgressStore } from '../shared/store/progressStore'

interface Filters {
  search: string
  difficulty: string
  type: string
}

const TasksPage = () => {
  const { tasks } = useProgressStore()
  const [filters, setFilters] = useState<Filters>({ search: '', difficulty: '', type: '' })

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        task.description.toLowerCase().includes(filters.search.toLowerCase())
      const matchesDifficulty = !filters.difficulty || task.difficulty === filters.difficulty
      const matchesType = !filters.type || task.type === filters.type
      return matchesSearch && matchesDifficulty && matchesType
    })
  }, [filters, tasks])

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
        <TaskFilters onFiltersChange={setFilters} />
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

