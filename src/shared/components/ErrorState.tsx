import { Link } from 'react-router-dom'
import Button from '../ui/Button'

interface ErrorStateProps {
  message: string
  backTo?: { href: string; label: string }
  onRetry?: () => void
}

const ErrorState = ({ message, backTo, onRetry }: ErrorStateProps) => (
  <div role="alert" className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
    <div className="text-4xl">⚠️</div>
    <p className="text-red-400 text-lg text-center max-w-sm">{message}</p>
    <div className="flex gap-3">
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
      {backTo && (
        <Link to={backTo.href}>
          <Button variant="primary" size="sm">{backTo.label}</Button>
        </Link>
      )}
    </div>
  </div>
)

export default ErrorState
