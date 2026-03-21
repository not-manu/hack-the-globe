import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Leaf, ChevronRight, Sparkles, MapPin, Eye, ArrowRight, Package, Megaphone } from 'lucide-react'
import { LISTINGS, REQUESTS, MY_LISTINGS, CATEGORIES } from '../data/listings'
import Logo from '../components/Logo'

function RequestCard({ request, index }) {
  const navigate = useNavigate()
  const cat = CATEGORIES.find(c => c.id === request.category)

  return (
    <button
      className={`card fade-up stagger-${(index % 6) + 1}`}
      onClick={() => navigate(`/browse/${request.category}`)}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 14,
        padding: 14,
        textAlign: 'left',
        width: '100%',
      }}
    >
      <div style={{
        width: 44,
        height: 44,
        borderRadius: 'var(--radius-md)',
        background: 'var(--bg-elevated)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 22,
        flexShrink: 0,
      }}>
        {cat?.icon || '📦'}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 14,
          fontWeight: 600,
          marginBottom: 3,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {request.title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>
          <MapPin size={11} />
          {request.location}
          <span style={{ color: 'var(--border)' }}>·</span>
          {request.postedAgo}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--green-dark)' }}>
            {request.budget}
          </span>
          <span className={`badge ${request.urgency === 'Urgent' ? 'badge-warm' : request.urgency === 'This week' ? 'badge-green' : 'badge-gray'}`} style={{ fontSize: 10 }}>
            {request.urgency}
          </span>
        </div>
      </div>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 6,
        flexShrink: 0,
      }}>
        {request.matchCount > 0 ? (
          <div style={{
            fontSize: 10,
            fontWeight: 600,
            color: 'var(--green)',
            background: 'var(--green-bg)',
            padding: '3px 8px',
            borderRadius: 'var(--radius-full)',
            whiteSpace: 'nowrap',
          }}>
            {request.matchCount} match{request.matchCount !== 1 ? 'es' : ''}
          </div>
        ) : (
          <div style={{
            fontSize: 10,
            fontWeight: 600,
            color: 'var(--text-muted)',
            background: 'var(--bg-input)',
            padding: '3px 8px',
            borderRadius: 'var(--radius-full)',
          }}>
            No matches yet
          </div>
        )}
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          by {request.requester}
        </span>
      </div>
    </button>
  )
}

function MyListingCard({ listing, index }) {
  const navigate = useNavigate()
  const discount = Math.round((1 - listing.price / listing.originalPrice) * 100)

  const statusColors = {
    active: { bg: 'var(--green-bg)', color: 'var(--green)', label: 'Active' },
    matched: { bg: '#eff6ff', color: '#2563eb', label: 'Matched' },
    sold: { bg: 'var(--bg-input)', color: 'var(--text-muted)', label: 'Sold' },
  }
  const status = statusColors[listing.status] || statusColors.active

  return (
    <button
      className={`card fade-up stagger-${(index % 6) + 1}`}
      onClick={() => navigate(`/listing/${listing.id}`)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: 12,
        textAlign: 'left',
        width: '100%',
        opacity: listing.status === 'sold' ? 0.6 : 1,
      }}
    >
      <div style={{
        width: 72,
        height: 72,
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        flexShrink: 0,
        background: 'var(--bg-elevated)',
        position: 'relative',
      }}>
        <img
          src={listing.image}
          alt={listing.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          loading="lazy"
        />
        <div style={{
          position: 'absolute',
          top: 4,
          left: 4,
          fontSize: 9,
          fontWeight: 700,
          color: 'white',
          background: 'var(--green)',
          padding: '2px 6px',
          borderRadius: 'var(--radius-full)',
        }}>
          -{discount}%
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 14,
          fontWeight: 600,
          marginBottom: 3,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {listing.title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>
          <MapPin size={11} />
          {listing.location}
          <span style={{ color: 'var(--border)' }}>·</span>
          {listing.quantity}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16, fontWeight: 800 }}>${listing.price}</span>
          <span className="price-original">${listing.originalPrice}</span>
        </div>
      </div>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 6,
        flexShrink: 0,
      }}>
        <div style={{
          fontSize: 10,
          fontWeight: 600,
          color: status.color,
          background: status.bg,
          padding: '3px 8px',
          borderRadius: 'var(--radius-full)',
        }}>
          {status.label}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)' }}>
          <Eye size={10} />
          {listing.views}
          {listing.matchCount > 0 && (
            <>
              <span style={{ color: 'var(--border)' }}>·</span>
              <span style={{ color: 'var(--green)' }}>{listing.matchCount} match{listing.matchCount !== 1 ? 'es' : ''}</span>
            </>
          )}
        </div>
      </div>
    </button>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('requests')

  const totalCarbon = MY_LISTINGS.reduce((sum, l) => sum + l.carbonSaved, 0)

  return (
    <>
      {/* Header */}
      <div className="page-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <Logo height={32} />
          <div className="badge badge-green" style={{ fontSize: 12, padding: '6px 12px' }}>
            <Leaf size={12} />
            {totalCarbon}kg saved
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
            marginBottom: 20,
            textAlign: 'left',
          }}
        >
          <Search size={18} color="var(--text-muted)" />
          <span style={{ fontSize: 15, color: 'var(--text-muted)', flex: 1 }}>
            Search materials...
          </span>
        </button>

        {/* AI Scanner promo — compact */}
        <button
          onClick={() => navigate('/scan')}
          className="fade-up"
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, var(--green-bg) 0%, var(--green-bg-dark) 100%)',
            border: '1.5px solid var(--green-bg-dark)',
            borderRadius: 'var(--radius-lg)',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 24,
            textAlign: 'left',
          }}
        >
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 'var(--radius-md)',
            background: 'var(--green)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Sparkles size={20} color="white" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--green-dark)' }}>
              Scan & List with AI
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
              Snap a photo — AI identifies material, finds buyers nearby
            </div>
          </div>
          <ArrowRight size={16} color="var(--green)" />
        </button>

        {/* Tab bar */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-input)',
          borderRadius: 'var(--radius-full)',
          padding: 3,
          marginBottom: 18,
        }}>
          <button
            onClick={() => setActiveTab('requests')}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '10px 0',
              borderRadius: 'var(--radius-full)',
              fontSize: 13,
              fontWeight: 600,
              background: activeTab === 'requests' ? 'var(--bg-card)' : 'transparent',
              color: activeTab === 'requests' ? 'var(--text-primary)' : 'var(--text-muted)',
              boxShadow: activeTab === 'requests' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            <Megaphone size={14} />
            Open Requests
            <span style={{
              fontSize: 10,
              fontWeight: 700,
              background: activeTab === 'requests' ? 'var(--green-bg)' : 'var(--bg-elevated)',
              color: activeTab === 'requests' ? 'var(--green)' : 'var(--text-muted)',
              padding: '1px 6px',
              borderRadius: 'var(--radius-full)',
            }}>
              {REQUESTS.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('listings')}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '10px 0',
              borderRadius: 'var(--radius-full)',
              fontSize: 13,
              fontWeight: 600,
              background: activeTab === 'listings' ? 'var(--bg-card)' : 'transparent',
              color: activeTab === 'listings' ? 'var(--text-primary)' : 'var(--text-muted)',
              boxShadow: activeTab === 'listings' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            <Package size={14} />
            My Listings
            <span style={{
              fontSize: 10,
              fontWeight: 700,
              background: activeTab === 'listings' ? 'var(--green-bg)' : 'var(--bg-elevated)',
              color: activeTab === 'listings' ? 'var(--green)' : 'var(--text-muted)',
              padding: '1px 6px',
              borderRadius: 'var(--radius-full)',
            }}>
              {MY_LISTINGS.filter(l => l.status !== 'sold').length}
            </span>
          </button>
        </div>

        {/* Tab content */}
        {activeTab === 'requests' && (
          <div style={{ marginBottom: 24 }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                People nearby looking for materials
              </p>
              <button
                onClick={() => navigate('/request')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--green)',
                }}
              >
                Post request
                <ChevronRight size={14} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {REQUESTS.map((request, i) => (
                <RequestCard key={request.id} request={request} index={i} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'listings' && (
          <div style={{ marginBottom: 24 }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Your posted surplus materials
              </p>
              <button
                onClick={() => navigate('/post')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--green)',
                }}
              >
                List material
                <ChevronRight size={14} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {MY_LISTINGS.map((listing, i) => (
                <MyListingCard key={listing.id} listing={listing} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
