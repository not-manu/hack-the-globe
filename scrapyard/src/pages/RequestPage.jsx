import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Send, MapPin } from 'lucide-react'
import { CATEGORIES } from '../data/listings'

export default function RequestPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '',
    category: '',
    budget: '',
    urgency: 'Flexible',
    description: '',
    location: '',
  })

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  return (
    <div className="fade-up" style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate(-1)} aria-label="Go back">
            <ArrowLeft size={20} />
          </button>
          <h1 style={{ fontSize: 20 }}>Request Materials</h1>
        </div>
      </div>

      <div style={{ padding: '16px 20px', flex: 1 }}>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
          Post what you need and sellers in your area will reach out to you with offers.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label htmlFor="req-title">What do you need?</label>
            <input
              id="req-title"
              type="text"
              placeholder='e.g. "4x8 plywood sheets"'
              value={form.title}
              onChange={e => update('title', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {CATEGORIES.map(c => (
                <button
                  key={c.id}
                  onClick={() => update('category', c.id)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: 12,
                    fontWeight: 600,
                    background: form.category === c.id ? 'var(--green)' : 'var(--bg-card)',
                    color: form.category === c.id ? 'white' : 'var(--text-secondary)',
                    border: form.category === c.id ? '1.5px solid var(--green)' : '1.5px solid var(--border)',
                    transition: 'all 0.15s',
                  }}
                >
                  {c.icon} {c.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label htmlFor="budget">Budget</label>
              <input
                id="budget"
                type="text"
                placeholder='e.g. "$200-400"'
                value={form.budget}
                onChange={e => update('budget', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Urgency</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {['Urgent', 'This week', 'Flexible'].map(u => (
                  <button
                    key={u}
                    onClick={() => update('urgency', u)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: 11,
                      fontWeight: 600,
                      background: form.urgency === u ? 'var(--green)' : 'var(--bg-elevated)',
                      color: form.urgency === u ? 'white' : 'var(--text-secondary)',
                      border: form.urgency === u ? 'none' : '1px solid var(--border)',
                    }}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="req-location">Your Area</label>
            <div style={{ position: 'relative' }}>
              <input
                id="req-location"
                type="text"
                placeholder="Address or area"
                value={form.location}
                onChange={e => update('location', e.target.value)}
                style={{ paddingRight: 40 }}
              />
              <MapPin
                size={16}
                color="var(--green)"
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="req-desc">Details (optional)</label>
            <textarea
              id="req-desc"
              placeholder="Specific measurements, quantity needed, any requirements..."
              rows={3}
              value={form.description}
              onChange={e => update('description', e.target.value)}
              style={{ resize: 'none' }}
            />
          </div>
        </div>
      </div>

      <div style={{ padding: '16px 20px 24px' }}>
        <button
          className="btn btn-primary"
          onClick={() => {
            alert('Request posted! Sellers will contact you. (mockup)')
            navigate('/')
          }}
        >
          <Send size={16} />
          Post Request
        </button>
      </div>
    </div>
  )
}
