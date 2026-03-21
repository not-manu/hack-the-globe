import { useNavigate } from 'react-router-dom'
import { Search, Leaf, Clock, ChevronRight, Megaphone, Sparkles } from 'lucide-react'
import { CATEGORIES, LISTINGS, REQUESTS } from '../data/listings'
import Logo from '../components/Logo'

export default function Home() {
  const navigate = useNavigate()

  const recentListings = [...LISTINGS].sort(() => 0.5 - Math.random()).slice(0, 3)

  return (
    <>
      {/* Header */}
      <div className="page-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <Logo height={32} />
          <div className="badge badge-green" style={{ fontSize: 12, padding: '6px 12px' }}>
            <Leaf size={12} />
            486kg saved
          </div>
        </div>
      </div>

      <div style={{ padding: '0 20px' }}>
        {/* Search bar */}
        <button
          onClick={() => navigate('/browse/all')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            width: '100%',
            background: 'var(--bg-input)',
            border: '1.5px solid var(--border)',
            borderRadius: 'var(--radius-full)',
            padding: '12px 18px',
            marginBottom: 24,
            textAlign: 'left',
          }}
        >
          <Search size={18} color="var(--text-muted)" />
          <span style={{ fontSize: 15, color: 'var(--text-muted)', flex: 1 }}>
            Search surplus materials...
          </span>
        </button>

        {/* What are you looking for? */}
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 14 }}>
            What are you looking for?
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 10,
          }}>
            {CATEGORIES.map((cat, i) => (
              <button
                key={cat.id}
                className={`fade-up stagger-${(i % 6) + 1}`}
                onClick={() => navigate(`/browse/${cat.id}`)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                  padding: '14px 8px',
                  background: 'var(--bg-card)',
                  border: '1.5px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  transition: 'all 0.15s',
                }}
                aria-label={`Browse ${cat.label}`}
              >
                <span style={{ fontSize: 28 }}>{cat.icon}</span>
                <span style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  lineHeight: 1.2,
                  textAlign: 'center',
                }}>
                  {cat.label}
                </span>
                {cat.count > 0 && (
                  <span style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: 'var(--green)',
                    background: 'var(--green-bg)',
                    padding: '2px 6px',
                    borderRadius: 'var(--radius-full)',
                  }}>
                    {cat.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Recent Listings */}
        <div style={{ marginBottom: 24 }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={16} color="var(--green)" />
              <h2 style={{ fontSize: 16, fontWeight: 700 }}>Recently Added</h2>
            </div>
            <button
              onClick={() => navigate('/browse/all')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--green)',
              }}
            >
              See all
              <ChevronRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {recentListings.map((listing, i) => {
              const discount = Math.round((1 - listing.price / listing.originalPrice) * 100)
              return (
                <button
                  key={listing.id}
                  className={`card fade-up stagger-${i + 1}`}
                  onClick={() => navigate(`/listing/${listing.id}`)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: 12,
                    textAlign: 'left',
                    width: '100%',
                  }}
                >
                  {/* Thumbnail */}
                  <div style={{
                    width: 72,
                    height: 72,
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    flexShrink: 0,
                    background: 'var(--bg-elevated)',
                  }}>
                    <img
                      src={listing.image}
                      alt={listing.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                      loading="lazy"
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 14,
                      fontWeight: 600,
                      marginBottom: 2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {listing.title}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>
                      {listing.distance} away / {listing.quantity}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 16, fontWeight: 800 }}>${listing.price}</span>
                      <span className="price-original">${listing.originalPrice}</span>
                    </div>
                  </div>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: 4,
                  }}>
                    <div className="badge badge-green" style={{ fontSize: 10 }}>-{discount}%</div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 3,
                      fontSize: 10,
                      color: 'var(--green)',
                    }}>
                      <Leaf size={10} />
                      {listing.carbonSaved}kg
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Requests section */}
        <div style={{ marginBottom: 24 }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Megaphone size={16} color="var(--warm)" />
              <h2 style={{ fontSize: 16, fontWeight: 700 }}>Material Requests</h2>
            </div>
            <button
              onClick={() => navigate('/request')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--green)',
              }}
            >
              Post request
              <ChevronRight size={14} />
            </button>
          </div>

          <div style={{
            display: 'flex',
            gap: 10,
            overflowX: 'auto',
            paddingBottom: 4,
            scrollbarWidth: 'none',
          }}>
            {REQUESTS.map((req, i) => (
              <div
                key={req.id}
                className={`fade-up stagger-${i + 1}`}
                style={{
                  minWidth: 220,
                  background: 'var(--bg-card)',
                  border: '1.5px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 14,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span className="badge badge-warm" style={{ fontSize: 10 }}>{req.urgency}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{req.postedAgo}</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, lineHeight: 1.3 }}>
                  {req.title}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  Budget: {req.budget}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  by {req.requester}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Scanner promo */}
        <button
          onClick={() => navigate('/scan')}
          className="fade-up"
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, var(--green-bg) 0%, var(--green-bg-dark) 100%)',
            border: '1.5px solid var(--green-bg-dark)',
            borderRadius: 'var(--radius-lg)',
            padding: '18px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            marginBottom: 24,
            textAlign: 'left',
          }}
        >
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 'var(--radius-md)',
            background: 'var(--green)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Sparkles size={22} color="white" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--green-dark)', marginBottom: 2 }}>
              AI Material Scanner
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Point your camera to instantly identify and list materials
            </div>
          </div>
          <ChevronRight size={18} color="var(--green)" />
        </button>
      </div>
    </>
  )
}
