import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Leaf, MapPin, Star, BadgeCheck, X, Navigation, Minus, Plus, Layers } from 'lucide-react'
import { LISTINGS, CATEGORIES } from '../data/listings'

// Simple mock map pin positions (percentage-based)
const PIN_POSITIONS = [
  { id: 1, x: 42, y: 35 },
  { id: 2, x: 28, y: 55 },
  { id: 3, x: 62, y: 28 },
  { id: 4, x: 55, y: 60 },
  { id: 5, x: 18, y: 42 },
  { id: 6, x: 72, y: 50 },
  { id: 7, x: 38, y: 72 },
  { id: 8, x: 80, y: 35 },
]

export default function MapView() {
  const navigate = useNavigate()
  const [selectedPin, setSelectedPin] = useState(null)
  const [zoom, setZoom] = useState(1)

  const selectedListing = selectedPin ? LISTINGS.find(l => l.id === selectedPin) : null

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Search bar overlay */}
      <div style={{
        position: 'absolute',
        top: 14,
        left: 16,
        right: 16,
        zIndex: 20,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: 'white',
          border: '1.5px solid var(--border)',
          borderRadius: 'var(--radius-full)',
          padding: '10px 16px',
          boxShadow: 'var(--shadow-lg)',
        }}>
          <Search size={16} color="var(--text-muted)" />
          <span style={{ fontSize: 14, color: 'var(--text-muted)', flex: 1 }}>
            Search this area...
          </span>
          <div className="badge badge-green" style={{ fontSize: 10, padding: '3px 8px' }}>
            {LISTINGS.length} nearby
          </div>
        </div>
      </div>

      {/* Map area */}
      <div style={{
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
        background: '#e8f5e9',
      }}>
        {/* Mock map tiles with green/park areas */}
        <div style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          transform: `scale(${zoom})`,
          transition: 'transform 0.3s ease',
          transformOrigin: 'center center',
        }}>
          {/* Road grid */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
            {/* Horizontal roads */}
            {[20, 35, 50, 65, 80].map(y => (
              <line key={`h${y}`} x1="0" y1={`${y}%`} x2="100%" y2={`${y}%`} stroke="#d1d5db" strokeWidth="2" />
            ))}
            {/* Vertical roads */}
            {[15, 30, 45, 60, 75, 90].map(x => (
              <line key={`v${x}`} x1={`${x}%`} y1="0" x2={`${x}%`} y2="100%" stroke="#d1d5db" strokeWidth="2" />
            ))}
            {/* Main roads */}
            <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#9ca3af" strokeWidth="4" />
            <line x1="45%" y1="0" x2="45%" y2="100%" stroke="#9ca3af" strokeWidth="4" />
          </svg>

          {/* Park areas */}
          {[
            { x: 10, y: 15, w: 18, h: 15, r: 8 },
            { x: 65, y: 65, w: 22, h: 20, r: 10 },
            { x: 50, y: 10, w: 14, h: 12, r: 6 },
          ].map((park, i) => (
            <div key={i} style={{
              position: 'absolute',
              left: `${park.x}%`,
              top: `${park.y}%`,
              width: `${park.w}%`,
              height: `${park.h}%`,
              background: 'rgba(34,197,94,0.12)',
              borderRadius: park.r,
              border: '1px solid rgba(34,197,94,0.15)',
            }} />
          ))}

          {/* Water area */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '10%',
            background: 'linear-gradient(to bottom, rgba(96,165,250,0.1), rgba(96,165,250,0.2))',
          }} />

          {/* User location */}
          <div style={{
            position: 'absolute',
            left: '45%',
            top: '48%',
            transform: 'translate(-50%, -50%)',
            zIndex: 15,
          }}>
            <div style={{
              width: 18,
              height: 18,
              borderRadius: '50%',
              background: '#3b82f6',
              border: '3px solid white',
              boxShadow: '0 2px 8px rgba(59,130,246,0.4)',
            }} />
            <div style={{
              position: 'absolute',
              top: -3,
              left: -3,
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: 'rgba(59,130,246,0.15)',
              animation: 'pulse 2s ease infinite',
            }} />
          </div>

          {/* Listing pins */}
          {PIN_POSITIONS.map(pin => {
            const listing = LISTINGS.find(l => l.id === pin.id)
            if (!listing) return null
            const isSelected = selectedPin === pin.id

            return (
              <button
                key={pin.id}
                onClick={() => setSelectedPin(isSelected ? null : pin.id)}
                style={{
                  position: 'absolute',
                  left: `${pin.x}%`,
                  top: `${pin.y}%`,
                  transform: `translate(-50%, -100%) ${isSelected ? 'scale(1.2)' : 'scale(1)'}`,
                  zIndex: isSelected ? 12 : 10,
                  transition: 'transform 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
                aria-label={`${listing.title}, $${listing.price}`}
              >
                {/* Price bubble */}
                <div style={{
                  background: isSelected ? 'var(--green)' : 'white',
                  color: isSelected ? 'white' : 'var(--text-primary)',
                  padding: '5px 10px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: 12,
                  fontWeight: 700,
                  boxShadow: isSelected ? 'var(--shadow-green)' : 'var(--shadow-md)',
                  border: isSelected ? 'none' : '1.5px solid var(--border)',
                  whiteSpace: 'nowrap',
                }}>
                  ${listing.price}
                </div>
                {/* Pin tail */}
                <div style={{
                  width: 2,
                  height: 8,
                  background: isSelected ? 'var(--green)' : 'var(--border)',
                }} />
                <div style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: isSelected ? 'var(--green)' : 'var(--text-muted)',
                  boxShadow: isSelected ? '0 0 8px rgba(34,197,94,0.4)' : 'none',
                }} />
              </button>
            )
          })}
        </div>
      </div>

      {/* Zoom controls */}
      <div style={{
        position: 'absolute',
        right: 16,
        bottom: selectedListing ? 210 : 110,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        transition: 'bottom 0.3s ease',
        zIndex: 20,
      }}>
        <button
          onClick={() => setZoom(Math.min(zoom + 0.2, 2))}
          style={{
            width: 40,
            height: 40,
            background: 'white',
            border: '1.5px solid var(--border)',
            borderRadius: '10px 10px 0 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-sm)',
          }}
          aria-label="Zoom in"
        >
          <Plus size={16} />
        </button>
        <button
          onClick={() => setZoom(Math.max(zoom - 0.2, 0.6))}
          style={{
            width: 40,
            height: 40,
            background: 'white',
            border: '1.5px solid var(--border)',
            borderTop: 'none',
            borderRadius: '0 0 10px 10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-sm)',
          }}
          aria-label="Zoom out"
        >
          <Minus size={16} />
        </button>
      </div>

      {/* Re-center button */}
      <button
        onClick={() => setZoom(1)}
        style={{
          position: 'absolute',
          right: 16,
          bottom: selectedListing ? 260 : 160,
          width: 40,
          height: 40,
          background: 'white',
          border: '1.5px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-sm)',
          transition: 'bottom 0.3s ease',
          zIndex: 20,
        }}
        aria-label="Re-center map"
      >
        <Navigation size={16} color="var(--green)" />
      </button>

      {/* Selected listing card */}
      {selectedListing && (
        <div style={{
          position: 'absolute',
          bottom: 96,
          left: 16,
          right: 16,
          zIndex: 20,
          animation: 'fadeUp 0.25s ease-out',
        }}>
          <button
            onClick={() => navigate(`/listing/${selectedListing.id}`)}
            style={{
              width: '100%',
              background: 'white',
              borderRadius: 'var(--radius-lg)',
              padding: 12,
              display: 'flex',
              gap: 12,
              textAlign: 'left',
              boxShadow: 'var(--shadow-lg)',
              border: '1.5px solid var(--border)',
              position: 'relative',
            }}
          >
            <button
              onClick={(e) => { e.stopPropagation(); setSelectedPin(null) }}
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: 'var(--bg-elevated)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label="Close"
            >
              <X size={12} />
            </button>

            <div style={{
              width: 72,
              height: 72,
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              flexShrink: 0,
            }}>
              <img
                src={selectedListing.image}
                alt={selectedListing.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{selectedListing.title}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>
                <MapPin size={11} />
                {selectedListing.distance} away
                {selectedListing.sellerVerified && (
                  <>
                    <span style={{ margin: '0 2px' }}>/</span>
                    <BadgeCheck size={12} color="var(--green)" />
                    <span style={{ color: 'var(--green)', fontWeight: 600, fontSize: 11 }}>Verified</span>
                  </>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18, fontWeight: 800 }}>${selectedListing.price}</span>
                <span className="price-original">${selectedListing.originalPrice}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--green)' }}>
                  <Leaf size={10} />
                  {selectedListing.carbonSaved}kg
                </span>
              </div>
            </div>
          </button>
        </div>
      )}
    </div>
  )
}
