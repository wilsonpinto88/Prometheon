import { memo } from 'react'
import { useForm } from 'react-hook-form'
import { useEffect } from 'react'
import Input from '../ui/Input'

interface SearchFormValues {
  query: string
}

interface SearchFormProps {
  onSearch: (query: string) => void
  placeholder?: string
}

const SearchForm = ({ onSearch, placeholder = 'Search...' }: SearchFormProps) => {
  const {
    register,
    watch,
    formState: { errors },
  } = useForm<SearchFormValues>({ defaultValues: { query: '' } })

  const query = watch('query')

  useEffect(() => {
    onSearch(query)
  }, [query, onSearch])

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <Input
        placeholder={placeholder}
        aria-label="Search"
        {...register('query', {
          validate: (val) =>
            val === '' || val.length >= 2 || 'Enter at least 2 characters',
        })}
      />
      {errors.query && (
        <p role="alert" className="text-red-400 text-sm mt-1">{errors.query.message}</p>
      )}
    </form>
  )
}

export default memo(SearchForm)
