import { useState } from 'react'
import { Sparkles, Copy, Share2, Printer, X, Loader2 } from 'lucide-react'
import type { QuoteItem } from './types'
import { formatCurrency, hasGreenWaste, getPropertyTypeLabel, getUrgencyLabel } from './utils'
import { GlassCard } from './components/ui/GlassCard'
import { NeonButton } from './components/ui/NeonButton'
import { Magnetic } from './components/ui/Magnetic'
import { MotionFade } from './components/fx/MotionFade'

interface GeneratedQuote {
  items: QuoteItem[]
  notes?: string
  subtotal: number
  gst: number
  total: number
}

export default function QuoteEditor() {
  const [customerName, setCustomerName] = useState('')
  const [location, setLocation] = useState('')
  const [propertyType, setPropertyType] = useState('')
  const [urgency, setUrgency] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [items, setItems] = useState<QuoteItem[]>([])
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [copySuccess, setCopySuccess] = useState(false)

  const calculateTotals = (currentItems: QuoteItem[]): { subtotal: number; gst: number; total: number } => {
    const itemsTotal = currentItems.reduce((sum, item) => sum + (item.qty * item.unitPrice), 0)
    const hasGreenWasteFee = hasGreenWaste(jobDescription)
    const greenWasteFee = hasGreenWasteFee ? 25 : 0
    const subtotal = Math.round(itemsTotal + greenWasteFee)
    const gst = Math.round(subtotal * 0.1)
    const total = subtotal + gst
    return { subtotal, gst, total }
  }

  const totals = items.length > 0 ? calculateTotals(items) : { subtotal: 0, gst: 0, total: 0 }

  const handleGenerate = async () => {
    if (!jobDescription.trim()) {
      setError('Please enter a job description')
      return
    }

    setLoading(true)
    setError(null)
    setShareUrl(null)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobDescription: jobDescription.trim(),
          customerName: customerName.trim() || undefined,
          location: location.trim() || undefined,
          propertyType: propertyType || undefined,
          urgency: urgency || undefined
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to generate quote' }))
        throw new Error(errorData.error || 'Failed to generate quote')
      }

      const data: GeneratedQuote = await response.json()
      setItems(data.items)
      setNotes(data.notes || '')
    } catch (err) {
      setError('Failed to generate quote. Please try again or use the demo quote.')
    } finally {
      setLoading(false)
    }
  }

  const handleUseDemo = () => {
    setItems([
      { label: 'Hedge trimming', qty: 2, unit: 'hr', unitPrice: 90 },
      { label: 'Lawn mowing', qty: 1.5, unit: 'hr', unitPrice: 90 },
      { label: 'Green waste removal', qty: 1, unit: 'item', unitPrice: 25 }
    ])
    setNotes('Includes disposal of all green waste. Weather permitting.')
    setError(null)
    setShareUrl(null)
  }

  const handleClear = () => {
    setCustomerName('')
    setLocation('')
    setPropertyType('')
    setUrgency('')
    setJobDescription('')
    setItems([])
    setNotes('')
    setError(null)
    setShareUrl(null)
  }

  const updateItem = (index: number, field: keyof QuoteItem, value: string | number) => {
    const newItems = [...items]
    if (field === 'qty' || field === 'unitPrice') {
      const numValue = typeof value === 'number' ? value : parseFloat(String(value)) || 0
      newItems[index] = { ...newItems[index], [field]: Math.max(0, numValue) }
    } else {
      newItems[index] = { ...newItems[index], [field]: value }
    }
    setItems(newItems)
  }

  const handleSave = async () => {
    if (items.length === 0) {
      setError('Please generate a quote first')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const response = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName.trim() || undefined,
          location: location.trim() || undefined,
          propertyType: propertyType || undefined,
          urgency: urgency || undefined,
          jobDescription: jobDescription.trim(),
          items,
          notes: notes.trim() || undefined
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to save quote' }))
        throw new Error(errorData.error || 'Failed to save quote')
      }

      const data = await response.json()
      const fullUrl = `${window.location.origin}/share/${data.slug}`
      setShareUrl(fullUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save quote. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleCopy = () => {
    if (items.length === 0) return

    const lines: string[] = []
    if (customerName) lines.push(`Customer: ${customerName}`)
    if (location) lines.push(`Location: ${location}`)
    if (propertyType) lines.push(`Property Type: ${getPropertyTypeLabel(propertyType)}`)
    if (urgency) lines.push(`Timeline: ${getUrgencyLabel(urgency)}`)
    if (customerName || location || propertyType || urgency) lines.push('')
    lines.push(`Job: ${jobDescription}`)
    lines.push('')
    lines.push('Quote:')
    items.forEach(item => {
      lines.push(`${item.label}: ${item.qty} ${item.unit} @ $${item.unitPrice}/${item.unit} = $${item.qty * item.unitPrice}`)
    })
    if (hasGreenWaste(jobDescription)) {
      lines.push(`Green waste fee: $25`)
    }
    lines.push(`Subtotal: $${totals.subtotal}`)
    lines.push(`GST (10%): $${totals.gst}`)
    lines.push(`Total: $${totals.total}`)
    if (notes) {
      lines.push('')
      lines.push(`Notes: ${notes}`)
    }

    navigator.clipboard.writeText(lines.join('\n'))
    setCopySuccess(true)
    setTimeout(() => setCopySuccess(false), 2000)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 max-w-[480px] sm:max-w-[1040px] mx-auto">
      <MotionFade>
        <GlassCard className="mb-6" padding="lg">
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold mb-3 bg-gradient-to-r from-brand to-brand-glow bg-clip-text text-transparent">
              TradieAI Pro
            </h1>
            <p className="text-text-muted text-lg">Quote in 60 Seconds</p>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label htmlFor="customerName" className="block text-sm font-semibold text-text mb-2">
                Customer Name <span className="text-text-muted font-normal">(optional)</span>
              </label>
              <input
                type="text"
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter customer name..."
                className="w-full px-4 py-3 rounded-lg glass-strong border border-border text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="location" className="block text-sm font-semibold text-text mb-2">
                  Location <span className="text-text-muted font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Sydney, Melbourne"
                  className="w-full px-4 py-3 rounded-lg glass-strong border border-border text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label htmlFor="propertyType" className="block text-sm font-semibold text-text mb-2">
                  Property Type <span className="text-text-muted font-normal">(optional)</span>
                </label>
                <select
                  id="propertyType"
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg glass-strong border border-border text-text bg-panel focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                >
                  <option value="">Select property type...</option>
                  <option value="residential-house">Residential - House</option>
                  <option value="residential-unit">Residential - Unit/Apartment</option>
                  <option value="commercial">Commercial</option>
                  <option value="industrial">Industrial</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="urgency" className="block text-sm font-semibold text-text mb-2">
                Urgency/Timeline <span className="text-text-muted font-normal">(optional)</span>
              </label>
              <select
                id="urgency"
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
                className="w-full px-4 py-3 rounded-lg glass-strong border border-border text-text bg-panel focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
              >
                <option value="">Select timeline...</option>
                <option value="asap">ASAP / Emergency</option>
                <option value="this-week">This Week</option>
                <option value="next-week">Next Week</option>
                <option value="this-month">This Month</option>
                <option value="flexible">Flexible / No Rush</option>
              </select>
            </div>

            <div>
              <label htmlFor="jobDescription" className="block text-sm font-semibold text-text mb-2">
                Job Description
              </label>
              <textarea
                id="jobDescription"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Describe the job in detail..."
                rows={5}
                className="w-full px-4 py-3 rounded-lg glass-strong border border-border text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all resize-y"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Magnetic>
              <NeonButton
                onClick={handleGenerate}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Thinking...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Quote
                  </>
                )}
              </NeonButton>
            </Magnetic>
            <NeonButton variant="outline" onClick={handleClear} className="flex items-center justify-center gap-2">
              <X className="w-5 h-5" />
              Clear
            </NeonButton>
          </div>
        </GlassCard>
      </MotionFade>

      {loading && (
        <MotionFade>
          <GlassCard className="mb-6">
            <div className="flex items-center justify-center gap-3 text-text">
              <Loader2 className="w-5 h-5 animate-spin text-brand" />
              <span>Generating your quote...</span>
            </div>
          </GlassCard>
        </MotionFade>
      )}

      {error && (
        <MotionFade>
          <GlassCard className="mb-6 border-danger/50 bg-danger/10">
            <p className="text-danger mb-4">{error}</p>
            <NeonButton variant="outline" onClick={handleUseDemo} size="sm">
              Use Demo Quote
            </NeonButton>
          </GlassCard>
        </MotionFade>
      )}

      {shareUrl && (
        <MotionFade>
          <GlassCard className="mb-6 border-ok/50 bg-ok/10">
            <p className="text-ok font-semibold mb-2">Quote saved! Share this link:</p>
            <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand hover:text-brand-glow break-all underline"
            >
              {shareUrl}
            </a>
          </GlassCard>
        </MotionFade>
      )}

      {items.length > 0 && (
        <MotionFade delay={0.1}>
          <GlassCard className="mb-6" padding="lg">
            <h2 className="text-2xl font-bold text-text mb-6">Quote Details</h2>

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
                  {items.map((item, index) => (
                    <tr key={index} className="border-b border-border/50">
                      <td className="py-3 px-2">
                        <input
                          type="text"
                          value={item.label}
                          onChange={(e) => updateItem(index, 'label', e.target.value)}
                          className="w-full px-3 py-2 rounded glass-strong border border-border/50 text-text text-sm focus:outline-none focus:ring-1 focus:ring-brand"
                        />
                      </td>
                      <td className="py-3 px-2">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          value={item.qty}
                          onChange={(e) => updateItem(index, 'qty', parseFloat(e.target.value) || 0)}
                          className="w-20 px-3 py-2 rounded glass-strong border border-border/50 text-text text-sm text-right font-tabular focus:outline-none focus:ring-1 focus:ring-brand"
                        />
                      </td>
                      <td className="py-3 px-2">
                        <select
                          value={item.unit}
                          onChange={(e) => updateItem(index, 'unit', e.target.value as 'hr' | 'm2' | 'item')}
                          className="px-3 py-2 rounded glass-strong border border-border/50 text-text text-sm bg-panel focus:outline-none focus:ring-1 focus:ring-brand"
                        >
                          <option value="hr">hr</option>
                          <option value="m2">m²</option>
                          <option value="item">item</option>
                        </select>
                      </td>
                      <td className="py-3 px-2">
                        <input
                          type="number"
                          min="0"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(index, 'unitPrice', parseInt(e.target.value) || 0)}
                          className="w-24 px-3 py-2 rounded glass-strong border border-border/50 text-text text-sm text-right font-tabular focus:outline-none focus:ring-1 focus:ring-brand"
                        />
                      </td>
                      <td className="py-3 px-2 text-right font-semibold text-text font-tabular">
                        {formatCurrency(item.qty * item.unitPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {hasGreenWaste(jobDescription) && (
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
                <span className="font-semibold text-text font-tabular">{formatCurrency(totals.subtotal)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-text-muted">GST (10%):</span>
                <span className="font-semibold text-text font-tabular">{formatCurrency(totals.gst)}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-border">
                <span className="text-xl font-bold text-text">Total:</span>
                <span className="text-2xl font-bold text-brand font-tabular">{formatCurrency(totals.total)}</span>
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="notes" className="block text-sm font-semibold text-text mb-2">
                Notes (optional)
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes for the customer..."
                rows={3}
                className="w-full px-4 py-3 rounded-lg glass-strong border border-border text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all resize-y"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <NeonButton
                variant="outline"
                onClick={handleCopy}
                size="sm"
                className="flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                {copySuccess ? 'Copied!' : 'Copy Text'}
              </NeonButton>
              <Magnetic>
                <NeonButton
                  onClick={handleSave}
                  disabled={saving}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4" />
                      Save & Share
                    </>
                  )}
                </NeonButton>
              </Magnetic>
              <NeonButton
                variant="outline"
                onClick={handlePrint}
                size="sm"
                className="flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Print
              </NeonButton>
            </div>
          </GlassCard>
        </MotionFade>
      )}
    </div>
  )
}
