import { ReactNode } from 'react'
import { MotionFade } from '../fx/MotionFade'

interface GlassCardProps {
  children: ReactNode
  variant?: 'panel' | 'tile'
  padding?: 'sm' | 'md' | 'lg'
  className?: string
  delay?: number
}

const paddingMap = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

export function GlassCard({
  children,
  variant = 'panel',
  padding = 'md',
  className = '',
  delay = 0,
}: GlassCardProps) {
  const baseClasses = variant === 'panel' ? 'glass' : 'glass-strong'
  const roundedClass = variant === 'panel' ? 'rounded-xl' : 'rounded-2xl'

  return (
    <MotionFade delay={delay}>
      <div
        className={`${baseClasses} ${roundedClass} ${paddingMap[padding]} ${className} transition-all duration-200 hover:shadow-glow`}
      >
        {children}
      </div>
    </MotionFade>
  )
}

