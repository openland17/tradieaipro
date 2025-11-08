import { useState } from 'react'
import type { QuoteItem } from '../types'
import { formatCurrency, hasGreenWaste, getPropertyTypeLabel, getUrgencyLabel } from './utils'

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
    // Ensure numeric values are valid
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
    if (customerName) {
      lines.push(`Customer: ${customerName}`)
    }
    if (location) {
      lines.push(`Location: ${location}`)
    }
    if (propertyType) {
      lines.push(`Property Type: ${getPropertyTypeLabel(propertyType)}`)
    }
    if (urgency) {
      lines.push(`Timeline: ${getUrgencyLabel(urgency)}`)
    }
    if (customerName || location || propertyType || urgency) {
      lines.push('')
    }
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
    <div className="container">
      <header>
        <h1>TradieAI Pro</h1>
        <p className="subtitle">Quote in 60 Seconds</p>
      </header>

      <div className="form-section">
        <div className="form-group">
          <label htmlFor="customerName">Customer Name <span style={{ color: 'var(--text-muted)', fontWeight: '400' }}>(optional)</span></label>
          <input
            type="text"
            id="customerName"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Enter customer name..."
          />
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="location">Location <span style={{ color: 'var(--text-muted)', fontWeight: '400' }}>(optional)</span></label>
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Sydney, Melbourne, Brisbane"
            />
          </div>

          <div className="form-group">
            <label htmlFor="propertyType">Property Type <span style={{ color: 'var(--text-muted)', fontWeight: '400' }}>(optional)</span></label>
            <select
              id="propertyType"
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
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

        <div className="form-group">
          <label htmlFor="urgency">Urgency/Timeline <span style={{ color: 'var(--text-muted)', fontWeight: '400' }}>(optional)</span></label>
          <select
            id="urgency"
            value={urgency}
            onChange={(e) => setUrgency(e.target.value)}
          >
            <option value="">Select timeline...</option>
            <option value="asap">ASAP / Emergency</option>
            <option value="this-week">This Week</option>
            <option value="next-week">Next Week</option>
            <option value="this-month">This Month</option>
            <option value="flexible">Flexible / No Rush</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="jobDescription">Job Description</label>
          <textarea
            id="jobDescription"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Describe the job in detail...&#10;&#10;Example: Trim hedges around the property, mow the lawn, and remove all green waste"
          />
        </div>

        <div className="button-group">
          <button className="btn-primary" onClick={handleGenerate} disabled={loading}>
            {loading ? 'Thinking...' : 'Generate Quote'}
          </button>
          <button className="btn-secondary" onClick={handleClear}>Clear</button>
        </div>
      </div>

      {loading && (
        <div className="loading">
          <span>Generating your quote...</span>
        </div>
      )}

      {error && (
        <div className="error">
          <p>{error}</p>
          <div className="error-actions">
            <button className="btn-secondary btn-small" onClick={handleUseDemo}>
              Use Demo Quote
            </button>
          </div>
        </div>
      )}

      {shareUrl && (
        <div className="share-link">
          <p>✓ Quote saved! Share this link:</p>
          <a href={shareUrl} target="_blank" rel="noopener noreferrer">{shareUrl}</a>
        </div>
      )}

      {items.length > 0 && (
        <div className="quote-results">
          <table className="quote-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Unit</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <td>
                    <input
                      type="text"
                      value={item.label}
                      onChange={(e) => updateItem(index, 'label', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={item.qty}
                      onChange={(e) => updateItem(index, 'qty', parseFloat(e.target.value) || 0)}
                    />
                  </td>
                  <td>
                    <select
                      value={item.unit}
                      onChange={(e) => updateItem(index, 'unit', e.target.value as 'hr' | 'm2' | 'item')}
                    >
                      <option value="hr">hr</option>
                      <option value="m2">m²</option>
                      <option value="item">item</option>
                    </select>
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(index, 'unitPrice', parseInt(e.target.value) || 0)}
                    />
                  </td>
                  <td>{formatCurrency(item.qty * item.unitPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {hasGreenWaste(jobDescription) && (
            <div className="totals">
              <div className="totals-row">
                <span>Green waste fee:</span>
                <span>{formatCurrency(25)}</span>
              </div>
            </div>
          )}

          <div className="totals">
            <div className="totals-row">
              <span>Subtotal:</span>
              <span>{formatCurrency(totals.subtotal)}</span>
            </div>
            <div className="totals-row">
              <span>GST (10%):</span>
              <span>{formatCurrency(totals.gst)}</span>
            </div>
            <div className="totals-row total">
              <span>Total:</span>
              <span>{formatCurrency(totals.total)}</span>
            </div>
          </div>

          <div className="notes-section">
            <label htmlFor="notes">Notes (optional)</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes for the customer..."
            />
          </div>

          <div className="actions">
            <button className="btn-secondary btn-small" onClick={handleCopy}>
              {copySuccess ? '✓ Copied!' : 'Copy Text'}
            </button>
            <button className="btn-primary btn-small" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save & Share'}
            </button>
            <button className="btn-secondary btn-small" onClick={handlePrint}>
              Print
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

