import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, Leaf, Star, MessageCircle, Share2, Heart, Clock, Package, BadgeCheck, ShieldCheck, CreditCard, Truck, Lock } from 'lucide-react'
import { LISTINGS } from '../data/listings'

export default function ListingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const listing = LISTINGS.find(l => l.id === Number(id))
  const [saved, setSaved] = useState(false)

  if (!listing) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
        <p>Material not found</p>
        <button className="btn btn-secondary" style={{ marginTop: 16, width: 'auto' }} onClick={() => navigate(-1)}>
          Go back
        </button>
      </div>
    )
  }

  const discount = Math.round((1 - listing.price / listing.originalPrice) * 100)

  return (
    <div className="fade-up">
      {/* Hero image */}
      <div style={{
        height: 260,
        position: 'relative',
        overflow: 'hidden',
        background: 'var(--bg-elevated)',
      }}>
        <img
          src={listing.image}
          alt={listing.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />

        {/* Top bar */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'space-between',
          padding: '12px 16px',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), transparent)',
        }}>
          <button
            onClick={() => navigate(-1)}
            aria-label="Go back"
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-primary)',
            }}
          >
            <ArrowLeft size={18} />
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              aria-label={saved ? 'Unsave listing' : 'Save listing'}
              onClick={() => setSaved(!saved)}
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.9)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: saved ? '#ef4444' : 'var(--text-primary)',
              }}
            >
              <Heart size={16} fill={saved ? '#ef4444' : 'none'} />
            </button>
            <button
              aria-label="Share listing"
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.9)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-primary)',
              }}
            >
              <Share2 size={16} />
            </button>
          </div>
        </div>

        {/* Discount */}
        <div style={{
          position: 'absolute',
          bottom: 12,
          left: 12,
          background: 'var(--green)',
          color: '#fff',
          padding: '5px 12px',
          borderRadius: 'var(--radius-full)',
          fontSize: 13,
          fontWeight: 700,
        }}>
          Save {discount}%
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '20px' }}>
        {/* Badges row */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
          <span className="badge badge-gray">{listing.condition}</span>
          <span className="badge badge-green">
            <Leaf size={10} />
            {listing.carbonSaved}kg CO2 saved
          </span>
        </div>

        {/* Title */}
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, lineHeight: 1.2 }}>
          {listing.title}
        </h2>

        {/* Price */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 16 }}>
          <span className="price" style={{ fontSize: 28 }}>${listing.price}</span>
          <span className="price-original" style={{ fontSize: 16 }}>${listing.originalPrice}</span>
          <span className="savings" style={{ fontSize: 14 }}>
            Save ${listing.originalPrice - listing.price}
          </span>
        </div>

        {/* Details row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 8,
          marginBottom: 20,
        }}>
          {[
            { icon: Package, label: 'Quantity', value: listing.quantity },
            { icon: MapPin, label: 'Distance', value: listing.distance },
            { icon: Clock, label: 'Posted', value: listing.postedAgo },
            { icon: MapPin, label: 'Location', value: listing.location },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} style={{
              background: 'var(--bg-elevated)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 12px',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                marginBottom: 2,
              }}>
                <Icon size={12} color="var(--text-muted)" />
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Description */}
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 6, color: 'var(--text-secondary)' }}>Description</h3>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {listing.description}
          </p>
        </div>

        {/* Seller card with verification/ratings */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1.5px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px',
          marginBottom: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: 'var(--green-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                fontWeight: 700,
                color: 'var(--green)',
              }}>
                {listing.seller.charAt(0)}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 15, fontWeight: 700 }}>{listing.seller}</span>
                  {listing.sellerVerified && (
                    <BadgeCheck size={16} color="var(--green)" fill="var(--green-bg)" />
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, color: 'var(--text-secondary)' }}>
                    <Star size={12} fill="var(--warm)" color="var(--warm)" />
                    {listing.sellerRating}
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {listing.sellerTransactions} sales
                  </span>
                </div>
              </div>
            </div>
            <button className="btn-outline-green btn" style={{ width: 'auto', padding: '8px 14px', fontSize: 13 }}>
              <MessageCircle size={14} />
              Chat
            </button>
          </div>

          {/* Seller verification details */}
          {listing.sellerVerified && (
            <div style={{
              marginTop: 12,
              paddingTop: 12,
              borderTop: '1px solid var(--border)',
              display: 'flex',
              gap: 12,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--green)', fontWeight: 600 }}>
                <ShieldCheck size={12} />
                ID Verified
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--green)', fontWeight: 600 }}>
                <BadgeCheck size={12} />
                Licensed Contractor
              </div>
            </div>
          )}
        </div>

        {/* Carbon impact */}
        <div style={{
          background: 'var(--green-bg)',
          border: '1.5px solid var(--green-bg-dark)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px',
          marginBottom: 16,
          textAlign: 'center',
        }}>
          <Leaf size={20} color="var(--green)" style={{ marginBottom: 6 }} />
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--green)', lineHeight: 1 }}>
            {listing.carbonSaved} kg
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--green-dark)', marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            CO2 Emissions Prevented
          </div>
        </div>

        {/* Payment section placeholder */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1.5px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px',
          marginBottom: 20,
        }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Lock size={14} color="var(--green)" />
            Secure Payment
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              background: 'var(--bg-elevated)',
              borderRadius: 'var(--radius-md)',
            }}>
              <CreditCard size={18} color="var(--text-muted)" />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Pay with Card</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Visa, Mastercard, Amex</div>
              </div>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              background: 'var(--bg-elevated)',
              borderRadius: 'var(--radius-md)',
            }}>
              <Truck size={18} color="var(--text-muted)" />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Pickup or Delivery</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Arrange after purchase</div>
              </div>
            </div>
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 10, textAlign: 'center' }}>
            Payment held in escrow until pickup confirmed
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <button className="btn btn-primary" style={{ flex: 2 }}>
            <CreditCard size={16} />
            Buy Now - ${listing.price}
          </button>
          <button className="btn btn-secondary" style={{ flex: 1 }}>
            <MessageCircle size={16} />
            Offer
          </button>
        </div>
      </div>
    </div>
  )
}
