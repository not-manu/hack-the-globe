import { useNavigate } from 'react-router-dom'
import { Settings, ChevronRight, LogOut, Bell, Shield, HelpCircle, Star, Package, Leaf, Edit3, BadgeCheck, CreditCard, Wallet } from 'lucide-react'

export default function Profile() {
  const navigate = useNavigate()

  return (
    <>
      <div className="page-header">
        <h1>Profile</h1>
        <button aria-label="Settings">
          <Settings size={20} color="var(--text-muted)" />
        </button>
      </div>

      <div style={{ padding: '12px 20px 20px' }}>
        {/* Avatar + info */}
        <div className="fade-up" style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          marginBottom: 20,
        }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'var(--green)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            fontWeight: 800,
            color: 'white',
            position: 'relative',
            flexShrink: 0,
          }}>
            JD
            <button
              aria-label="Edit profile"
              style={{
                position: 'absolute',
                bottom: -2,
                right: -2,
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: 'white',
                border: '1.5px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Edit3 size={10} color="var(--text-secondary)" />
            </button>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 18, fontWeight: 700 }}>Jordan Davis</span>
              <BadgeCheck size={18} color="var(--green)" fill="var(--green-bg)" />
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 2 }}>
              Contractor / Buyer
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12 }}>
                <Star size={12} fill="var(--warm)" color="var(--warm)" />
                <span style={{ fontWeight: 700 }}>4.8</span>
                <span style={{ color: 'var(--text-muted)' }}>(34 reviews)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Verification card */}
        <div className="fade-up stagger-1" style={{
          background: 'var(--green-bg)',
          border: '1.5px solid var(--green-bg-dark)',
          borderRadius: 'var(--radius-lg)',
          padding: '14px 16px',
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <Shield size={20} color="var(--green)" />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--green-dark)' }}>Verified Contractor</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>ID and license verified</div>
          </div>
          <span className="badge badge-green" style={{ fontSize: 10 }}>Active</span>
        </div>

        {/* Quick stats */}
        <div className="fade-up stagger-2" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 8,
          marginBottom: 20,
        }}>
          {[
            { icon: Package, value: '12', label: 'Listed', color: 'var(--green)' },
            { icon: Package, value: '8', label: 'Bought', color: 'var(--warm)' },
            { icon: Leaf, value: '486kg', label: 'CO2 Saved', color: 'var(--green)' },
          ].map(({ icon: Icon, value, label, color }) => (
            <div key={label} style={{
              background: 'var(--bg-card)',
              border: '1.5px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '12px',
              textAlign: 'center',
            }}>
              <Icon size={14} color={color} style={{ marginBottom: 4 }} />
              <div style={{ fontSize: 20, fontWeight: 800, color }}>{value}</div>
              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.3 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Payment section */}
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Payment Methods</h3>
        <div style={{
          background: 'var(--bg-card)',
          border: '1.5px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          marginBottom: 20,
        }}>
          <button style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 16px',
            width: '100%',
            textAlign: 'left',
            borderBottom: '1px solid var(--border)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <CreditCard size={18} color="var(--text-muted)" />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Visa ending in 4242</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Default</div>
              </div>
            </div>
            <ChevronRight size={16} color="var(--text-muted)" />
          </button>
          <button style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 16px',
            width: '100%',
            textAlign: 'left',
            borderBottom: '1px solid var(--border)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Wallet size={18} color="var(--text-muted)" />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>ScrapYard Balance</div>
                <div style={{ fontSize: 11, color: 'var(--green)', fontWeight: 600 }}>$340.00</div>
              </div>
            </div>
            <ChevronRight size={16} color="var(--text-muted)" />
          </button>
          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '14px 16px',
            width: '100%',
            textAlign: 'left',
            color: 'var(--green)',
            fontWeight: 600,
            fontSize: 13,
          }}>
            <CreditCard size={16} />
            Add Payment Method
          </button>
        </div>

        {/* Menu items */}
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Account</h3>
        <div style={{
          background: 'var(--bg-card)',
          border: '1.5px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          marginBottom: 20,
        }}>
          {[
            { icon: Bell, label: 'Notifications', detail: '3 new' },
            { icon: Package, label: 'My Listings', detail: '12 active' },
            { icon: Star, label: 'Reviews & Ratings', detail: '4.8 avg' },
            { icon: Shield, label: 'Verification', detail: 'Verified' },
            { icon: HelpCircle, label: 'Help & Support', detail: '' },
          ].map(({ icon: Icon, label, detail }, i) => (
            <button key={label} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              width: '100%',
              textAlign: 'left',
              borderBottom: i < 4 ? '1px solid var(--border-light)' : 'none',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Icon size={18} color="var(--text-muted)" />
                <span style={{ fontSize: 14, fontWeight: 500 }}>{label}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {detail && (
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{detail}</span>
                )}
                <ChevronRight size={16} color="var(--text-muted)" />
              </div>
            </button>
          ))}
        </div>

        <button className="btn btn-secondary" style={{ marginBottom: 20 }}>
          <LogOut size={16} />
          Sign Out
        </button>

        <div style={{
          textAlign: 'center',
          fontSize: 11,
          color: 'var(--text-muted)',
          paddingBottom: 20,
        }}>
          ScrapYard v0.1.0 / Mockup
        </div>
      </div>
    </>
  )
}
