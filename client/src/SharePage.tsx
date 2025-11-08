import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Printer, Loader2 } from 'lucide-react'
import type { Quote } from './types'
import { formatCurrency, hasGreenWaste, getPropertyTypeLabel, getUrgencyLabel } from './utils'
import { GlassCard } from './components/ui/GlassCard'
import { NeonButton } from './components/ui/NeonButton'
import { MotionFade } from './components/fx/MotionFade'

export default function SharePage() {
  const { slug } = useParams<{ slug: string }>()
  const [quote, setQuote] = useState<Quote | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) {
      setError('Invalid share link')
      setLoading(false)
      return
    }

    fetch(`/api/share/${slug}`)
      .then(async res => {
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ error: 'Quote not found' }))
          throw new Error(errorData.error || 'Quote not found')
        }
        return res.json()
      })
      .then(data => {
        setQuote(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : 'Failed to load quote')
        setLoading(false)
      })
  }, [slug])

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <GlassCard>
          <div className="flex items-center justify-center gap-3 text-text">
            <Loader2 className="w-6 h-6 animate-spin text-brand" />
            <span>Loading quote...</span>
          </div>
        </GlassCard>
      </div>
    )
  }

  if (error || !quote) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <GlassCard className="border-danger/50 bg-danger/10 max-w-md">
          <p className="text-danger text-center">{error || 'Quote not found'}</p>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 max-w-[480px] sm:max-w-[1040px] mx-auto">
      <MotionFade>
        <GlassCard className="mb-6" padding="lg">
          <div className="text-center mb-8 pb-6 border-b border-border">
            <h1 className="text-4xl sm:text-5xl font-bold mb-3 bg-gradient-to-r from-brand to-brand-glow bg-clip-text text-transparent">
              Quote
            </h1>
            {quote.customerName && (
              <p className="text-text-muted text-lg">For: {quote.customerName}</p>
            )}
          </div>

          {(quote.location || quote.propertyType || quote.urgency) && (
            <div className="mb-6 p-4 rounded-lg glass-strong border border-border/50 space-y-2">
              {quote.location && (
                <p className="text-sm text-text">
                  <span className="font-semibold text-text-muted">Location:</span> {quote.location}
                </p>
              )}
              {quote.propertyType && (
                <p className="text-sm text-text">
                  <span className="font-semibold text-text-muted">Property Type:</span> {getPropertyTypeLabel(quote.propertyType)}
                </p>
              )}
              {quote.urgency && (
                <p className="text-sm text-text">
                  <span className="font-semibold text-text-muted">Timeline:</span> {getUrgencyLabel(quote.urgency)}
                </p>
              )}
            </div>
          )}

          <div className="mb-6 p-5 rounded-lg glass-strong border border-brand/30 bg-brand/5">
            <h2 className="text-sm font-semibold text-text mb-2">Job Description</h2>
            <p className="text-text leading-relaxed">{quote.jobDescription}</p>
          </div>

          <div className="overflow-x-auto mb-6">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 text-sm font-semibold text-text-muted">Item</th>
                  <th className="text-right py-3 px-2 text-sm font-semibold text-text-muted">Qty</th>
                  <th className="text-right py-3 px-2 text-sm font-semibold text-text-muted">Unit</th>
                  <th className="text-right py-3 px-2 text-sm font-semibold text-text-muted">Price</th>
                  <th className="text-right py-3 px-2 text-sm font-semibold text-text-muted">Total</th>
                </tr>
              </thead>
              <tbody>
                {quote.items.map((item, index) => (
                  <tr key={index} className="border-b border-border/50">
                    <td className="py-3 px-2 text-text">{item.label}</td>
                    <td className="py-3 px-2 text-right text-text font-tabular">{item.qty}</td>
                    <td className="py-3 px-2 text-right text-text-muted">{item.unit}</td>
                    <td className="py-3 px-2 text-right text-text font-tabular">{formatCurrency(item.unitPrice)}</td>
                    <td className="py-3 px-2 text-right font-semibold text-text font-tabular">
                      {formatCurrency(item.qty * item.unitPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {hasGreenWaste(quote.jobDescription) && (
            <div className="mb-4 p-4 rounded-lg glass-strong border border-border/50">
              <div className="flex justify-between items-center">
                <span className="text-text-muted">Green waste fee:</span>
                <span className="font-semibold text-text font-tabular">{formatCurrency(25)}</span>
              </div>
            </div>
          )}

          <div className="mb-6 p-4 rounded-lg glass-strong border border-border">
            <div className="flex justify-between items-center mb-2">
              <span className="text-text-muted">Subtotal:</span>
              <span className="font-semibold text-text font-tabular">{formatCurrency(quote.subtotal)}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-text-muted">GST (10%):</span>
              <span className="font-semibold text-text font-tabular">{formatCurrency(quote.gst)}</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-border">
              <span className="text-xl font-bold text-text">Total:</span>
              <span className="text-2xl font-bold text-brand font-tabular">{formatCurrency(quote.total)}</span>
            </div>
          </div>

          {quote.notes && (
            <div className="mb-6 p-5 rounded-lg glass-strong border border-warn/30 bg-warn/5">
              <h2 className="text-sm font-semibold text-text mb-2">Notes</h2>
              <p className="text-text leading-relaxed">{quote.notes}</p>
            </div>
          )}

          <div className="flex justify-center">
            <NeonButton onClick={handlePrint} className="flex items-center gap-2">
              <Printer className="w-5 h-5" />
              Print
            </NeonButton>
          </div>
        </GlassCard>
      </MotionFade>
    </div>
  )
}
