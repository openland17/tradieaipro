import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import type { Quote } from '../types'
import { formatCurrency, hasGreenWaste, getPropertyTypeLabel, getUrgencyLabel } from './utils'

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
      <div className="container">
        <div className="loading">Loading quote...</div>
      </div>
    )
  }

  if (error || !quote) {
    return (
      <div className="container">
        <div className="error">
          <p>{error || 'Quote not found'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="read-only">
        <header>
          <h1>Quote</h1>
          {quote.customerName && (
            <p className="subtitle">For: {quote.customerName}</p>
          )}
        </header>

        {(quote.location || quote.propertyType || quote.urgency) && (
          <div style={{ marginBottom: '24px', padding: '16px 20px', background: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
            {quote.location && (
              <p style={{ marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Location:</strong> {quote.location}
              </p>
            )}
            {quote.propertyType && (
              <p style={{ marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Property Type:</strong> {getPropertyTypeLabel(quote.propertyType)}
              </p>
            )}
            {quote.urgency && (
              <p style={{ marginBottom: '0', color: 'var(--text-secondary)', fontSize: '14px' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Timeline:</strong> {getUrgencyLabel(quote.urgency)}
              </p>
            )}
          </div>
        )}

        <div style={{ marginBottom: '32px', padding: '20px', background: 'var(--primary-light)', borderRadius: 'var(--radius-sm)', border: '2px solid var(--border)' }}>
          <strong style={{ display: 'block', marginBottom: '10px', color: 'var(--text-primary)', fontSize: '15px' }}>Job Description:</strong>
          <p style={{ marginTop: '8px', color: 'var(--text-secondary)', lineHeight: '1.7' }}>{quote.jobDescription}</p>
        </div>

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
            {quote.items.map((item, index) => (
              <tr key={index}>
                <td>{item.label}</td>
                <td>{item.qty}</td>
                <td>{item.unit}</td>
                <td>{formatCurrency(item.unitPrice)}</td>
                <td>{formatCurrency(item.qty * item.unitPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {hasGreenWaste(quote.jobDescription) && (
          <div className="totals" style={{ marginBottom: '16px' }}>
            <div className="totals-row">
              <span>Green waste fee:</span>
              <span>{formatCurrency(25)}</span>
            </div>
          </div>
        )}

        <div className="totals">
          <div className="totals-row">
            <span>Subtotal:</span>
            <span>{formatCurrency(quote.subtotal)}</span>
          </div>
          <div className="totals-row">
            <span>GST (10%):</span>
            <span>{formatCurrency(quote.gst)}</span>
          </div>
          <div className="totals-row total">
            <span>Total:</span>
            <span>{formatCurrency(quote.total)}</span>
          </div>
        </div>

        {quote.notes && (
          <div style={{ marginTop: '32px', padding: '20px', background: '#fef3c7', borderRadius: 'var(--radius-sm)', border: '2px solid #fde68a' }}>
            <strong style={{ display: 'block', marginBottom: '10px', color: 'var(--text-primary)', fontSize: '15px' }}>Notes:</strong>
            <p style={{ marginTop: '8px', color: 'var(--text-secondary)', lineHeight: '1.7' }}>{quote.notes}</p>
          </div>
        )}

        <div className="actions" style={{ marginTop: '32px' }}>
          <button className="btn-primary" onClick={handlePrint}>
            Print
          </button>
        </div>
      </div>
    </div>
  )
}

