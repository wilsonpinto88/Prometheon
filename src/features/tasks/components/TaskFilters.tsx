import Input from '../../../shared/ui/Input'

interface TaskFiltersProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  difficultyFilter: string
  onDifficultyChange: (difficulty: string) => void
  typeFilter: string
  onTypeChange: (type: string) => void
}

const TaskFilters = ({
  searchQuery,
  onSearchChange,
  difficultyFilter,
  onDifficultyChange,
  typeFilter,
  onTypeChange,
}: TaskFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <Input
        type="text"
        placeholder="Search tasks..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="flex-1"
      />
      <select
        value={difficultyFilter}
        onChange={(e) => onDifficultyChange(e.target.value)}
        className="bg-dark-surface border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500 min-w-[140px]"
      >
        <option value="">All Difficulties</option>
        <option value="Easy">Easy</option>
        <option value="Medium">Medium</option>
        <option value="Hard">Hard</option>
      </select>
      <select
        value={typeFilter}
        onChange={(e) => onTypeChange(e.target.value)}
        className="bg-dark-surface border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500 min-w-[140px]"
      >
        <option value="">All Types</option>
        <option value="Coding">Coding</option>
        <option value="System Design">System Design</option>
        <option value="Problem Solving">Problem Solving</option>
        <option value="Research">Research</option>
      </select>
    </div>
  )
}

export default TaskFilters
