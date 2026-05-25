import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import type { SacredText } from '../shared/types/sacredText'
import Badge from '../shared/ui/Badge'
import Button from '../shared/ui/Button'
import ErrorState from '../shared/components/ErrorState'
import { api } from '../services/api'

const SacredTextDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const [text, setText] = useState<SacredText | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)

    api.fetchTextById(id)
      .then(setText)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id, retryKey])

  const difficultyColors = {
    Beginner: 'success',
    Intermediate: 'warning',
    Advanced: 'danger',
  } as const

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-primary-500 text-lg animate-pulse">Loading...</div>
      </div>
    )
  }

  if (error || !text) {
    return (
      <ErrorState
        message={error ?? 'Sacred text not found.'}
        onRetry={() => setRetryKey((k) => k + 1)}
        backTo={{ href: '/sacred-texts', label: 'Back to Sacred Texts' }}
      />
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <Link to="/sacred-texts" className="text-primary-400 hover:text-primary-300 text-sm mb-6 inline-block">
        ← Back to Sacred Texts
      </Link>

      <div className="bg-dark-800 border border-dark-700 rounded-xl p-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">{text.title}</h1>
            <p className="text-gray-400">by {text.author}</p>
          </div>
          {text.completed && <Badge variant="success">✓ Read</Badge>}
        </div>

        <p className="text-gray-300 mb-6">{text.description}</p>

        <div className="flex flex-wrap gap-2 mb-6">
          <Badge variant="info">{text.realm}</Badge>
          <Badge variant={difficultyColors[text.difficulty]}>{text.difficulty}</Badge>
          <span className="text-sm text-gray-500 flex items-center">{text.pages} pages</span>
        </div>

        <Button variant="primary" className="w-full">
          {text.completed ? 'Review Text' : 'Start Reading'}
        </Button>
      </div>
    </div>
  )
}

export default SacredTextDetailPage
