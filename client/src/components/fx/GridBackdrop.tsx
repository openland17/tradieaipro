import { useEffect, useState } from 'react'

export function GridBackdrop() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[1] opacity-[0.08]"
      style={{
        backgroundImage: `
          linear-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
        transform: prefersReducedMotion
          ? 'none'
          : `translateY(${scrollY * 0.02}px) rotate(${scrollY * 0.0001}deg)`,
        transition: prefersReducedMotion ? 'none' : 'transform 0.1s ease-out',
      }}
      aria-hidden="true"
    />
  )
}

