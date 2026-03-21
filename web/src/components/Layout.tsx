import { useState } from 'react'
import { useRouter } from 'next/router'
import { Home, Search, Plus, BarChart3, User, Camera, Megaphone, X } from 'lucide-react'

const NAV_ITEMS = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/browse/all', icon: Search, label: 'Browse' },
  { path: '__center__', icon: Plus, label: 'Post', isCenter: true },
  { path: '/carbon', icon: BarChart3, label: 'Impact' },
  { path: '/profile', icon: User, label: 'Profile' },
]

const HIDE_NAV_PATHS = ['/listing/', '/scan', '/chat/']

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [showMenu, setShowMenu] = useState(false)
  const hideNav = HIDE_NAV_PATHS.some((p) => router.pathname.startsWith(p))

  return (
    <div className="mx-auto flex h-full max-h-dvh max-w-[430px] flex-col overflow-hidden bg-background">
      <main className="hide-scrollbar flex-1 overflow-y-auto overflow-x-hidden">
        <div className={hideNav ? '' : 'pb-16'}>
          {children}
        </div>
      </main>

      {!hideNav && (
        <>
          {/* Backdrop */}
          {showMenu && (
            <div
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
              onClick={() => setShowMenu(false)}
              style={{ maxWidth: 430, margin: '0 auto' }}
            />
          )}

          {/* Action menu */}
          {showMenu && (
            <div
              className="fixed bottom-20 left-1/2 z-50 flex w-56 -translate-x-1/2 flex-col gap-1.5 rounded-2xl border border-border bg-card p-2 shadow-lg"
              style={{ marginBottom: 'var(--safe-bottom)' }}
            >
              <button
                onClick={() => {
                  setShowMenu(false)
                  router.push('/post')
                }}
                className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-left transition-colors hover:bg-muted active:bg-muted"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Camera size={18} />
                </div>
                <div>
                  <div className="text-sm font-semibold">List Surplus</div>
                  <div className="text-[11px] text-muted-foreground">Sell materials you don&apos;t need</div>
                </div>
              </button>
              <div className="mx-3 border-t border-border/60" />
              <button
                onClick={() => {
                  setShowMenu(false)
                  router.push('/request')
                }}
                className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-left transition-colors hover:bg-muted active:bg-muted"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
                  <Megaphone size={18} />
                </div>
                <div>
                  <div className="text-sm font-semibold">Post Request</div>
                  <div className="text-[11px] text-muted-foreground">Find materials you need</div>
                </div>
              </button>
            </div>
          )}

          {/* Bottom nav */}
          <div
            className="shrink-0 border-t border-border/40 bg-background/80 backdrop-blur-xl"
            style={{ paddingBottom: 'var(--safe-bottom)' }}
            role="navigation"
            aria-label="Main navigation"
          >
            <div className="flex items-center justify-around px-6 py-2">
              {NAV_ITEMS.map((item) => {
                const isActive =
                  item.path === '/'
                    ? router.pathname === '/'
                    : router.pathname.startsWith(item.path.split('/').slice(0, 2).join('/'))
                const Icon = item.icon

                if (item.isCenter) {
                  return (
                    <button
                      key={item.path}
                      onClick={() => setShowMenu((v) => !v)}
                      aria-label={showMenu ? 'Close' : 'Create'}
                      className={`flex h-10 w-10 items-center justify-center rounded-full transition-all active:scale-90 ${
                        showMenu
                          ? 'rotate-45 bg-muted text-foreground'
                          : 'bg-primary text-primary-foreground'
                      }`}
                    >
                      {showMenu ? <X size={20} strokeWidth={2} /> : <Plus size={20} strokeWidth={2} />}
                    </button>
                  )
                }

                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      setShowMenu(false)
                      router.push(item.path)
                    }}
                    aria-label={item.label}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    <Icon size={22} strokeWidth={isActive ? 2.2 : 1.5} />
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
