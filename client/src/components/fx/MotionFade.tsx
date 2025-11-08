import { motion, MotionProps } from 'framer-motion'
import { ReactNode, useEffect, useState } from 'react'

interface MotionFadeProps {
  children: ReactNode
  delay?: number
  className?: string
}

export function MotionFade({ children, delay = 0, className = '' }: MotionFadeProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    setPrefersReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])

  const motionProps: MotionProps = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.18, delay, ease: [0.4, 0, 0.2, 1] },
      }

  return (
    <motion.div {...motionProps} className={className}>
      {children}
    </motion.div>
  )
}

