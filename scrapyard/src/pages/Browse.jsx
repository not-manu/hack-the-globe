import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Search, MapPin, Leaf, Star, SlidersHorizontal, BadgeCheck } from 'lucide-react'
import { LISTINGS, CATEGORIES } from '../data/listings'

function MaterialCard({ listing, index }) {
  const navigate = useNavigate()
  const discount = Math.round((1 - listing.price / listing.originalPrice) * 100)

  return (
    <button
      className={`card fade-up stagger-${(index % 6) + 1}`}
      onClick={() => navigate(`/listing/${listing.id}`)}
      style={{ width: '100%', textAlign: 'left' }}
      aria-label={`${listing.title}, $${listing.price}, ${listing.distance} away`}
    >
      {/* Image */}
      <div style={{
        height: 130,
        position: 'relative',
        overflow: 'hidden',
        background: 'var(--bg-elevated)',
      }}>
        <img
          src={listing.image}
          alt={listing.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          loading="lazy"
        />

        {/* Discount badge */}
        <div style={{
          position: 'absolute',
          top: 8,
          right: 8,
          background: 'var(--green)',
          color: '#fff',
          padding: '3px 8px',
          borderRadius: 'var(--radius-full)',
          fontSize: 11,
          fontWeight: 700,
        }}>
          -{discount}%
        </div>

        {/* Carbon badge */}
        <div style={{
          position: 'absolute',
          bottom: 8,
          left: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          background: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(4px)',
          padding: '3px 8px',
          borderRadius: 'var(--radius-full)',
          fontSize: 10,
          fontWeight: 600,
          color: 'var(--green)',
        }}>
          <Leaf size={10} />
          {listing.carbonSaved}kg CO2
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '10px 12px 12px' }}>
        <h3 style={{
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--text-primary)',
          lineHeight: 1.3,
          marginBottom: 4,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {listing.title}
        </h3>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          marginBottom: 6,
          color: 'var(--text-muted)',
          fontSize: 11,
        }}>
          <MapPin size={10} />
          <span>{listing.distance}</span>
          <span style={{ margin: '0 1px' }}>/</span>
          <span>{listing.quantity}</span>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontSize: 17, fontWeight: 800 }}>${listing.price}</span>
            <span className="price-original" style={{ fontSize: 12 }}>${listing.originalPrice}</span>
          </div>
        </div>

        <div style={{
          marginTop: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            fontSize: 11,
            color: 'var(--text-muted)',
          }}>
            {listing.sellerVerified && <BadgeCheck size={12} color="var(--green)" />}
            <span>{listing.seller.split(' ')[0]}</span>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            fontSize: 11,
            color: 'var(--text-muted)',
          }}>
            <Star size={10} fill="var(--warm)" color="var(--warm)" />
            {listing.sellerRating}
          </div>
        </div>
      </div>
    </button>
  )
}

export default function Browse() {
  const { category } = useParams()
  const navigate = useNavigate()
  const [activeCategory, setActiveCategory] = useState(category || 'all')
  const [searchQuery, setSearchQuery] = useState('')

  const allCategories = [{ id: 'all', label: 'All', icon: '📦', count: LISTINGS.length }, ...CATEGORIES]

  const filtered = LISTINGS.filter(l => {
    const matchCat = activeCategory === 'all' || l.category === activeCategory
    const matchSearch = !searchQuery || l.title.toLowerCase().includes(searchQuery.toLowerCase())
    return matchCat && matchSearch
  })

  const catLabel = allCategories.find(c => c.id === activeCategory)?.label || 'All'

  return (
    <>
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate('/')} aria-label="Go back">
            <ArrowLeft size={20} />
          </button>
          <h1 style={{ fontSize: 20 }}>{catLabel === 'All' ? 'All Materials' : catLabel}</h1>
        </div>
        <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
          {filtered.length} items
        </span>
      </div>

      {/* Search */}
      <div style={{ padding: '8px 20px 12px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: 'var(--bg-input)',
          border: '1.5px solid var(--border)',
          borderRadius: 'var(--radius-full)',
          padding: '0 16px',
        }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search materials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              padding: '11px 0',
              flex: 1,
              fontSize: 14,
            }}
            aria-label="Search materials"
          />
          <button aria-label="Filters" style={{ padding: 4 }}>
            <SlidersHorizontal size={16} color="var(--text-muted)" />
          </button>
        </div>
      </div>

      {/* Categories pills */}
      <div style={{
        display: 'flex',
        gap: 6,
        padding: '0 20px 14px',
        overflowX: 'auto',
        scrollbarWidth: 'none',
      }}
        role="tablist"
        aria-label="Material categories"
      >
        {allCategories.map(cat => (
          <button
            key={cat.id}
            role="tab"
            aria-selected={activeCategory === cat.id}
            onClick={() => setActiveCategory(cat.id)}
            style={{
              padding: '7px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: 12,
              fontWeight: 600,
              whiteSpace: 'nowrap',
              background: activeCategory === cat.id ? 'var(--green)' : 'var(--bg-card)',
              color: activeCategory === cat.id ? '#fff' : 'var(--text-secondary)',
              border: activeCategory === cat.id ? '1.5px solid var(--green)' : '1.5px solid var(--border)',
              transition: 'all 0.15s',
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Listings Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 10,
        padding: '0 20px 24px',
      }}>
        {filtered.map((listing, i) => (
          <MaterialCard key={listing.id} listing={listing} index={i} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: 'var(--text-muted)',
        }}>
          <p style={{ fontSize: 14, fontWeight: 500 }}>No materials found</p>
          <p style={{ fontSize: 13, marginTop: 4 }}>Try a different category or search term</p>
        </div>
      )}
    </>
  )
}
