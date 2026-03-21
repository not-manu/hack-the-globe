import { useNavigate, useLocation } from 'react-router-dom'
import { Home, Map, Plus, BarChart3, User } from 'lucide-react'

export default function Layout({ children, hideNav }) {
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/map', icon: Map, label: 'Map' },
    { path: '/carbon', icon: BarChart3, label: 'Impact' },
    { path: '/profile', icon: User, label: 'Profile' },
  ]

  return (
    <div className="app-shell">
      <main className="main-content">
        {children}
      </main>

      {!hideNav && (
        <nav className="bottom-nav" role="navigation" aria-label="Main navigation">
          <div className="bottom-nav-inner">
            {navItems.map((item, i) => {
              if (i === 2) {
                return (
                  <div key="post-group" style={{ display: 'contents' }}>
                    <button
                      className="nav-post-btn"
                      onClick={() => navigate('/post')}
                      aria-label="Post material"
                    >
                      <Plus size={24} strokeWidth={2.5} />
                    </button>
                    <button
                      className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                      onClick={() => navigate(item.path)}
                      aria-label={item.label}
                      aria-current={location.pathname === item.path ? 'page' : undefined}
                    >
                      <item.icon size={20} strokeWidth={location.pathname === item.path ? 2.5 : 1.5} />
                      <span>{item.label}</span>
                    </button>
                  </div>
                )
              }
              return (
                <button
                  key={item.path}
                  className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                  onClick={() => navigate(item.path)}
                  aria-label={item.label}
                  aria-current={location.pathname === item.path ? 'page' : undefined}
                >
                  <item.icon size={20} strokeWidth={location.pathname === item.path ? 2.5 : 1.5} />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>
        </nav>
      )}
    </div>
  )
}
