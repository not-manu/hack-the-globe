import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, X, Zap, Camera, RotateCcw, Check, Loader2 } from 'lucide-react'

const SCAN_STATES = {
  READY: 'ready',
  SCANNING: 'scanning',
  DETECTED: 'detected',
}

export default function ScanMaterial() {
  const navigate = useNavigate()
  const [scanState, setScanState] = useState(SCAN_STATES.READY)
  const [detected, setDetected] = useState(null)

  const startScan = () => {
    setScanState(SCAN_STATES.SCANNING)
    // Simulate AI detection after 2.5 seconds
    setTimeout(() => {
      setDetected({
        material: '2x4 Lumber - Douglas Fir',
        category: 'Lumber',
        confidence: 94,
        estimatedQuantity: '~50 pieces',
        condition: 'Good',
        suggestedPrice: '$120 - $180',
        carbonImpact: '~22 kg CO2',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=400&fit=crop',
      })
      setScanState(SCAN_STATES.DETECTED)
    }, 2500)
  }

  const reset = () => {
    setScanState(SCAN_STATES.READY)
    setDetected(null)
  }

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: '#000',
      position: 'relative',
    }}>
      {/* Camera viewfinder (mock) */}
      <div style={{
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {/* Simulated camera feed */}
        <div style={{
          width: '100%',
          height: '100%',
          background: scanState === SCAN_STATES.DETECTED
            ? 'none'
            : 'linear-gradient(135deg, #1a2e1a 0%, #0d1f0d 50%, #1a2e1a 100%)',
          position: 'relative',
        }}>
          {/* Show detected image */}
          {scanState === SCAN_STATES.DETECTED && detected && (
            <img
              src={detected.image}
              alt="Detected material"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: 0.7,
              }}
            />
          )}

          {/* Camera grid overlay */}
          {scanState !== SCAN_STATES.DETECTED && (
            <div style={{
              position: 'absolute',
              inset: '15%',
              border: '2px solid rgba(34,197,94,0.3)',
              borderRadius: 'var(--radius-lg)',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gridTemplateRows: '1fr 1fr 1fr',
            }}>
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} style={{
                  borderRight: i % 3 !== 2 ? '1px solid rgba(34,197,94,0.15)' : 'none',
                  borderBottom: i < 6 ? '1px solid rgba(34,197,94,0.15)' : 'none',
                }} />
              ))}
            </div>
          )}

          {/* Corner brackets */}
          {scanState !== SCAN_STATES.DETECTED && (
            <>
              {[
                { top: '15%', left: '15%', borderTop: '3px solid #22c55e', borderLeft: '3px solid #22c55e', borderRadius: '12px 0 0 0' },
                { top: '15%', right: '15%', borderTop: '3px solid #22c55e', borderRight: '3px solid #22c55e', borderRadius: '0 12px 0 0' },
                { bottom: '15%', left: '15%', borderBottom: '3px solid #22c55e', borderLeft: '3px solid #22c55e', borderRadius: '0 0 0 12px' },
                { bottom: '15%', right: '15%', borderBottom: '3px solid #22c55e', borderRight: '3px solid #22c55e', borderRadius: '0 0 12px 0' },
              ].map((style, i) => (
                <div key={i} style={{
                  position: 'absolute',
                  width: 24,
                  height: 24,
                  ...style,
                }} />
              ))}
            </>
          )}

          {/* Scanning animation line */}
          {scanState === SCAN_STATES.SCANNING && (
            <div style={{
              position: 'absolute',
              left: '15%',
              right: '15%',
              height: 2,
              background: 'linear-gradient(90deg, transparent, #22c55e, transparent)',
              boxShadow: '0 0 20px #22c55e',
              animation: 'scan 2s ease-in-out infinite',
            }} />
          )}

          {/* Detection boxes overlay */}
          {scanState === SCAN_STATES.DETECTED && (
            <div className="fade-up" style={{
              position: 'absolute',
              inset: '12%',
              border: '2px solid #22c55e',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 0 30px rgba(34,197,94,0.3)',
            }}>
              <div style={{
                position: 'absolute',
                top: -12,
                left: 12,
                background: '#22c55e',
                color: 'white',
                padding: '2px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: 11,
                fontWeight: 700,
              }}>
                {detected.confidence}% match
              </div>
            </div>
          )}
        </div>

        {/* Top bar */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 16px',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)',
        }}>
          <button
            onClick={() => navigate(-1)}
            aria-label="Close scanner"
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} color="white" />
          </button>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)',
            padding: '6px 12px',
            borderRadius: 'var(--radius-full)',
          }}>
            <Zap size={12} color="#22c55e" />
            <span style={{ fontSize: 12, fontWeight: 600, color: 'white' }}>AI Scanner</span>
          </div>
          <div style={{ width: 36 }} />
        </div>
      </div>

      {/* Bottom panel */}
      <div style={{
        background: 'white',
        borderRadius: '24px 24px 0 0',
        padding: '20px 20px 32px',
        marginTop: -20,
        position: 'relative',
        zIndex: 10,
      }}>
        {scanState === SCAN_STATES.READY && (
          <div className="fade-up" style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
              Point at your materials
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
              Our AI will identify the material type, estimate quantity, and suggest a price
            </p>
            <button className="btn btn-primary" onClick={startScan}>
              <Camera size={18} />
              Start Scanning
            </button>
          </div>
        )}

        {scanState === SCAN_STATES.SCANNING && (
          <div className="fade-up" style={{ textAlign: 'center' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              marginBottom: 8,
            }}>
              <Loader2 size={18} color="var(--green)" style={{ animation: 'spin 1s linear infinite' }} />
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
                Analyzing...
              </h2>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Identifying material type and condition
            </p>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {scanState === SCAN_STATES.DETECTED && detected && (
          <div className="fade-up">
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 16,
            }}>
              <div style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: 'var(--green)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Check size={14} color="white" />
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
                Material Detected
              </h2>
            </div>

            <div style={{
              background: 'var(--bg-elevated)',
              borderRadius: 'var(--radius-lg)',
              padding: '14px',
              marginBottom: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}>
              {[
                { label: 'Material', value: detected.material },
                { label: 'Category', value: detected.category },
                { label: 'Est. Quantity', value: detected.estimatedQuantity },
                { label: 'Condition', value: detected.condition },
                { label: 'Suggested Price', value: detected.suggestedPrice },
                { label: 'Carbon Impact', value: detected.carbonImpact },
              ].map(({ label, value }) => (
                <div key={label} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{value}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-primary" style={{ flex: 2 }} onClick={() => {
                alert('Creating listing with AI data... (mockup)')
                navigate('/post')
              }}>
                <Check size={16} />
                Create Listing
              </button>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={reset}>
                <RotateCcw size={16} />
                Retry
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
