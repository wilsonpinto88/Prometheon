import { ReactNode } from 'react'
import clsx from 'clsx'

interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md'
  className?: string
}

const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}: BadgeProps) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-full'

  const variants = {
    default: 'bg-dark-surface text-gray-300',
    success: 'bg-green-500/20 text-green-400',
    warning: 'bg-yellow-500/20 text-yellow-400',
    danger: 'bg-red-500/20 text-red-400',
    info: 'bg-blue-500/20 text-blue-400',
  }

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  }

  return (
    <span className={clsx(baseStyles, variants[variant], sizes[size], className)}>
      {children}
    </span>
  )
}

export default Badge
