import { ReactNode, useRef, useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

interface MagneticProps {
  children: ReactNode
  strength?: number
  className?: string
}

export function Magnetic({ children, strength = 12, className = '' }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const springX = useSpring(x, { stiffness: 300, damping: 30 })
  const springY = useSpring(y, { stiffness: 300, damping: 30 })

  useEffect(() => {
    setIsDesktop(window.matchMedia('(min-width: 768px)').matches)
    setPrefersReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])

  useEffect(() => {
    if (!isDesktop || !isHovered || prefersReducedMotion) {
      x.set(0)
      y.set(0)
      return
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!ref.current) return

      const rect = ref.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      const deltaX = (e.clientX - centerX) * 0.1
      const deltaY = (e.clientY - centerY) * 0.1

      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
      if (distance > strength) {
        const angle = Math.atan2(deltaY, deltaX)
        x.set(Math.cos(angle) * strength)
        y.set(Math.sin(angle) * strength)
      } else {
        x.set(deltaX)
        y.set(deltaY)
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [isDesktop, isHovered, prefersReducedMotion, strength, x, y])

  if (prefersReducedMotion || !isDesktop) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      ref={ref}
      style={{ x: springX, y: springY }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        x.set(0)
        y.set(0)
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
