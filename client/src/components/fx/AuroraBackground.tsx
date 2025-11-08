import { useEffect, useRef } from 'react'

export function AuroraBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    let animationFrame: number
    let time = 0

    const draw = () => {
      if (!ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const gradient1 = ctx.createRadialGradient(
        canvas.width * 0.3,
        canvas.height * 0.2,
        0,
        canvas.width * 0.3,
        canvas.height * 0.2,
        canvas.width * 0.8
      )
      gradient1.addColorStop(0, `rgba(0, 225, 255, ${0.15 + Math.sin(time * 0.001) * 0.05})`)
      gradient1.addColorStop(1, 'transparent')

      const gradient2 = ctx.createRadialGradient(
        canvas.width * 0.7,
        canvas.height * 0.8,
        0,
        canvas.width * 0.7,
        canvas.height * 0.8,
        canvas.width * 0.6
      )
      gradient2.addColorStop(0, `rgba(147, 51, 234, ${0.1 + Math.cos(time * 0.0012) * 0.03})`)
      gradient2.addColorStop(1, 'transparent')

      ctx.fillStyle = gradient1
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = gradient2
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      time += 16
      animationFrame = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationFrame)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ willChange: 'transform' }}
      aria-hidden="true"
    />
  )
}

