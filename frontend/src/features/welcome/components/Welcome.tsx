import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../../../shared/contexts/AuthContext'

const Welcome = () => {
  const { isAuthenticated, user, login, register } = useAuthContext()
  const navigate = useNavigate()

  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      if (mode === 'login') await login(email, password)
      else await register(email, name, password)
      navigate('/dashboard')
    } catch {
      setError(
        mode === 'login'
          ? 'Login failed. Check your email and password.'
          : 'Registration failed. Email may already be in use.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-bg p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-primary-500 mb-4">
          Welcome to Prometheon! 🚀
        </h1>
        <p className="text-gray-300 mb-8">
          Your React learning journey begins here. Let's build something amazing together!
        </p>

        {isAuthenticated ? (
          <div className="bg-dark-card p-6 rounded-lg border border-dark-border">
            <h2 className="text-2xl font-semibold mb-4">Welcome back, {user?.name}!</h2>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-primary-500 hover:bg-primary-400 text-white font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div className="bg-dark-card p-6 rounded-lg border border-dark-border max-w-md">
            <h2 className="text-2xl font-semibold mb-4">
              {mode === 'login' ? 'Log in' : 'Create your account'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                autoComplete="email"
                className="w-full bg-dark-surface text-white text-sm rounded-lg px-3 py-2 outline-none border border-dark-border focus:ring-1 focus:ring-primary-500"
                aria-label="Email"
              />
              {mode === 'register' && (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Name"
                  required
                  autoComplete="name"
                  className="w-full bg-dark-surface text-white text-sm rounded-lg px-3 py-2 outline-none border border-dark-border focus:ring-1 focus:ring-primary-500"
                  aria-label="Name"
                />
              )}
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                minLength={8}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                className="w-full bg-dark-surface text-white text-sm rounded-lg px-3 py-2 outline-none border border-dark-border focus:ring-1 focus:ring-primary-500"
                aria-label="Password"
              />
              {error && (
                <p role="alert" className="text-red-400 text-sm">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary-500 hover:bg-primary-400 disabled:opacity-50 text-white font-medium px-4 py-2 rounded-lg transition-colors"
              >
                {submitting ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Register'}
              </button>
            </form>
            <button
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login')
                setError(null)
              }}
              className="mt-4 text-sm text-gray-400 hover:text-primary-400 transition-colors"
            >
              {mode === 'login'
                ? "Don't have an account? Register"
                : 'Already have an account? Log in'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Welcome
