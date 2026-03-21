import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Camera, MapPin, Leaf, Upload, Sparkles, ChevronRight, Image, X } from 'lucide-react'
import { CATEGORIES } from '../data/listings'

const STEPS = ['Photos', 'Details', 'Price']

export default function PostMaterial() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [photos, setPhotos] = useState([])
  const [form, setForm] = useState({
    title: '',
    category: '',
    quantity: '',
    price: '',
    originalPrice: '',
    condition: 'Good',
    description: '',
    location: '',
  })

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const carbonEstimate = form.category && form.price
    ? Math.round(Number(form.price) * 0.18)
    : 0

  const canAdvance = step === 0 ? true : step === 1 ? form.title && form.category : form.price

  const addMockPhoto = () => {
    const mockPhotos = [
      'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1590075865003-e48277faa558?w=200&h=200&fit=crop',
    ]
    if (photos.length < 5) {
      setPhotos([...photos, mockPhotos[photos.length % mockPhotos.length]])
    }
  }

  return (
    <div className="fade-up" style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => step > 0 ? setStep(step - 1) : navigate(-1)} aria-label="Go back">
            <ArrowLeft size={20} />
          </button>
          <h1 style={{ fontSize: 20 }}>List Material</h1>
        </div>
        <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
          Step {step + 1} of 3
        </span>
      </div>

      {/* Progress bar */}
      <div style={{ padding: '0 20px 16px', display: 'flex', gap: 6 }}>
        {STEPS.map((s, i) => (
          <div key={s} style={{
            flex: 1,
            height: 4,
            borderRadius: 2,
            background: i <= step ? 'var(--green)' : 'var(--border)',
            transition: 'background 0.3s',
          }} />
        ))}
      </div>

      <div style={{ padding: '0 20px', flex: 1 }}>
        {/* Step 0: Photos */}
        {step === 0 && (
          <div className="fade-up">
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Add photos</h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
              Good photos help your materials sell faster
            </p>

            {/* Photo grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
              {photos.map((photo, i) => (
                <div key={i} style={{
                  aspectRatio: '1',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  position: 'relative',
                }}>
                  <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button
                    onClick={() => setPhotos(photos.filter((_, j) => j !== i))}
                    style={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background: 'rgba(0,0,0,0.5)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    aria-label="Remove photo"
                  >
                    <X size={12} color="white" />
                  </button>
                </div>
              ))}
              {photos.length < 5 && (
                <button
                  onClick={addMockPhoto}
                  style={{
                    aspectRatio: '1',
                    borderRadius: 'var(--radius-md)',
                    border: '2px dashed var(--border)',
                    background: 'var(--bg-elevated)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                  }}
                >
                  <Camera size={20} color="var(--text-muted)" />
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>Add</span>
                </button>
              )}
            </div>

            {/* AI Scanner shortcut */}
            <button
              onClick={() => navigate('/scan')}
              style={{
                width: '100%',
                background: 'var(--green-bg)',
                border: '1.5px solid var(--green-bg-dark)',
                borderRadius: 'var(--radius-lg)',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                textAlign: 'left',
                marginBottom: 16,
              }}
            >
              <Sparkles size={20} color="var(--green)" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--green-dark)' }}>Scan with AI</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Auto-detect material type and fill details</div>
              </div>
              <ChevronRight size={16} color="var(--green)" />
            </button>

            <button
              onClick={addMockPhoto}
              className="btn btn-secondary"
              style={{ marginBottom: 12 }}
            >
              <Image size={16} />
              Choose from Gallery
            </button>
          </div>
        )}

        {/* Step 1: Details */}
        {step === 1 && (
          <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 2 }}>Material details</h2>

            <div className="form-group">
              <label htmlFor="title">What is it?</label>
              <input
                id="title"
                type="text"
                placeholder='e.g. "2x4 Douglas Fir Studs"'
                value={form.title}
                onChange={e => update('title', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                  <button
                    key={c.id}
                    onClick={() => update('category', c.id)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4,
                      padding: '10px 6px',
                      borderRadius: 'var(--radius-md)',
                      background: form.category === c.id ? 'var(--green-bg)' : 'var(--bg-card)',
                      border: form.category === c.id ? '1.5px solid var(--green)' : '1.5px solid var(--border)',
                      fontSize: 11,
                      fontWeight: form.category === c.id ? 700 : 500,
                      color: form.category === c.id ? 'var(--green-dark)' : 'var(--text-secondary)',
                      transition: 'all 0.15s',
                    }}
                  >
                    <span style={{ fontSize: 20 }}>{c.icon}</span>
                    <span style={{ lineHeight: 1.1, textAlign: 'center' }}>{c.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label htmlFor="quantity">Quantity</label>
                <input
                  id="quantity"
                  type="text"
                  placeholder='e.g. "120 pcs"'
                  value={form.quantity}
                  onChange={e => update('quantity', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Condition</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {['New', 'Like New', 'Good', 'Fair'].map(c => (
                    <button
                      key={c}
                      onClick={() => update('condition', c)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: 12,
                        fontWeight: 600,
                        background: form.condition === c ? 'var(--green)' : 'var(--bg-elevated)',
                        color: form.condition === c ? 'white' : 'var(--text-secondary)',
                        border: form.condition === c ? 'none' : '1px solid var(--border)',
                        transition: 'all 0.15s',
                      }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="location">Pickup Location</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="location"
                  type="text"
                  placeholder="Address or area name"
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
              <label htmlFor="description">Description (optional)</label>
              <textarea
                id="description"
                placeholder="Any extra details about condition, measurements, origin..."
                rows={3}
                value={form.description}
                onChange={e => update('description', e.target.value)}
                style={{ resize: 'none' }}
              />
            </div>
          </div>
        )}

        {/* Step 2: Price */}
        {step === 2 && (
          <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 2 }}>Set your price</h2>

            <div className="form-group">
              <label htmlFor="price">Your Price</label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute',
                  left: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: 18,
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                }}>$</span>
                <input
                  id="price"
                  type="number"
                  placeholder="0"
                  value={form.price}
                  onChange={e => update('price', e.target.value)}
                  style={{ paddingLeft: 36, fontSize: 24, fontWeight: 800, textAlign: 'left' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="originalPrice">Retail Price (what it costs new)</label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute',
                  left: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: 16,
                  color: 'var(--text-muted)',
                }}>$</span>
                <input
                  id="originalPrice"
                  type="number"
                  placeholder="0"
                  value={form.originalPrice}
                  onChange={e => update('originalPrice', e.target.value)}
                  style={{ paddingLeft: 36 }}
                />
              </div>
            </div>

            {form.price && form.originalPrice && Number(form.originalPrice) > Number(form.price) && (
              <div style={{
                background: 'var(--green-bg)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                textAlign: 'center',
              }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--green)' }}>
                  Buyers save {Math.round((1 - Number(form.price) / Number(form.originalPrice)) * 100)}% vs retail
                </span>
              </div>
            )}

            {/* Carbon estimate */}
            {carbonEstimate > 0 && (
              <div style={{
                background: 'var(--green-bg)',
                border: '1.5px solid var(--green-bg-dark)',
                borderRadius: 'var(--radius-lg)',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}>
                <Leaf size={22} color="var(--green)" />
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--green-dark)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>
                    Estimated Carbon Impact
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--green)' }}>
                    ~{carbonEstimate} kg CO2 saved
                  </div>
                </div>
              </div>
            )}

            {/* Payment info */}
            <div style={{
              background: 'var(--bg-elevated)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              fontSize: 12,
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
            }}>
              Payments are processed securely. Funds are held in escrow and released to you once the buyer confirms pickup.
            </div>
          </div>
        )}
      </div>

      {/* Bottom action */}
      <div style={{ padding: '16px 20px 24px', marginTop: 'auto' }}>
        {step < 2 ? (
          <button
            className="btn btn-primary"
            onClick={() => setStep(step + 1)}
            disabled={!canAdvance}
            style={{ opacity: canAdvance ? 1 : 0.5 }}
          >
            Continue
          </button>
        ) : (
          <button
            className="btn btn-primary"
            onClick={() => {
              alert('Listing posted! (mockup)')
              navigate('/')
            }}
          >
            <Upload size={16} />
            Publish Listing
          </button>
        )}
      </div>
    </div>
  )
}
