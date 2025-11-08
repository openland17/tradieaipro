import { ButtonHTMLAttributes, ReactNode, forwardRef } from 'react'
import { motion } from 'framer-motion'

interface NeonButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

export const NeonButton = forwardRef<HTMLButtonElement, NeonButtonProps>(
  ({ children, variant = 'primary', size = 'md', className = '', disabled, ...props }, ref) => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const baseClasses = 'font-semibold rounded-lg transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-50 disabled:cursor-not-allowed'
    
    const variantClasses = {
      primary: 'bg-brand text-bg shadow-glow hover:shadow-glow-strong hover:-translate-y-0.5 active:translate-y-0',
      secondary: 'bg-panel-strong text-text border border-border hover:border-brand/50',
      outline: 'bg-transparent text-brand border-2 border-brand hover:bg-brand/10 hover:shadow-glow',
    }

    const sizeClasses = {
      sm: 'px-4 py-2 text-sm min-h-[44px]',
      md: 'px-6 py-3 text-base min-h-[44px]',
      lg: 'px-8 py-4 text-lg min-h-[52px]',
    }

    const button = (
      <button
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    )

    if (prefersReducedMotion || disabled) {
      return button
    }

    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.15 }}
      >
        {button}
      </motion.div>
    )
  }
)

NeonButton.displayName = 'NeonButton'

