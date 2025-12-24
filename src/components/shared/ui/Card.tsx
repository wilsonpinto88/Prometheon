import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
}

const Card = ({ children, className = '' }: CardProps) => {
  return (
    <div className={`bg-dark-card rounded-lg border border-dark-border ${className}`}>
      {children}
    </div>
  )
}

export default Card

