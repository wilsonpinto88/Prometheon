import { useForm } from 'react-hook-form'
import { useEffect } from 'react'
import Input from '../../../shared/ui/Input'

interface TaskFilterValues {
  search: string
  difficulty: string
  type: string
}

interface TaskFiltersProps {
  onFiltersChange: (filters: TaskFilterValues) => void
}

const TaskFilters = ({ onFiltersChange }: TaskFiltersProps) => {
  const {
    register,
    watch,
    formState: { errors },
  } = useForm<TaskFilterValues>({
    defaultValues: { search: '', difficulty: '', type: '' },
  })

  const values = watch()

  useEffect(() => {
    onFiltersChange(values)
  }, [values.search, values.difficulty, values.type])

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1">
        <Input
          type="text"
          placeholder="Search tasks..."
          {...register('search', {
            validate: (val) =>
              val === '' || val.length >= 2 || 'Enter at least 2 characters',
          })}
        />
        {errors.search && (
          <p className="text-red-400 text-sm mt-1">{errors.search.message}</p>
        )}
      </div>
      <select
        {...register('difficulty')}
        className="bg-dark-surface border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500 min-w-[140px]"
      >
        <option value="">All Difficulties</option>
        <option value="Easy">Easy</option>
        <option value="Medium">Medium</option>
        <option value="Hard">Hard</option>
      </select>
      <select
        {...register('type')}
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
