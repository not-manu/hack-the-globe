import { useRouter } from "next/router"
import { Home, Map, Plus, BarChart3, User } from "lucide-react"

const NAV_ITEMS = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/map", icon: Map, label: "Map" },
  { path: "/post", icon: Plus, label: "Post", isCenter: true },
  { path: "/carbon", icon: BarChart3, label: "Impact" },
  { path: "/profile", icon: User, label: "Profile" },
]

const HIDE_NAV_PATHS = ["/listing/", "/scan", "/request"]

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const hideNav = HIDE_NAV_PATHS.some((p) => router.pathname.startsWith(p))

  return (
    <div className="relative mx-auto flex h-full max-w-[430px] flex-col overflow-hidden bg-background">
      <main className="hide-scrollbar flex-1 overflow-y-auto overflow-x-hidden pb-24">
        {children}
      </main>

      {!hideNav && (
        <nav
          className="pointer-events-none fixed bottom-0 left-1/2 z-50 w-full max-w-[430px] -translate-x-1/2 px-4 pb-[calc(8px+var(--safe-bottom))] pt-2"
          style={{
            background:
              "linear-gradient(to top, var(--background) 40%, transparent)",
          }}
          role="navigation"
          aria-label="Main navigation"
        >
          <div className="pointer-events-auto flex items-center justify-around rounded-full border border-border/60 bg-card/90 px-2 py-1 shadow-lg backdrop-blur-xl">
            {NAV_ITEMS.map((item) => {
              const isActive = router.pathname === item.path
              const Icon = item.icon

              if (item.isCenter) {
                return (
                  <button
                    key={item.path}
                    onClick={() => router.push(item.path)}
                    aria-label={item.label}
                    className="-my-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-transform active:scale-90"
                    style={{
                      boxShadow: "0 4px 14px rgba(22,163,74,0.3)",
                    }}
                  >
                    <Icon size={22} strokeWidth={2.5} />
                  </button>
                )
              }

              return (
                <button
                  key={item.path}
                  onClick={() => router.push(item.path)}
                  aria-label={item.label}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex flex-col items-center gap-0.5 rounded-full px-3 py-2 transition-colors ${
                    isActive
                      ? "bg-accent text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  <Icon
                    size={20}
                    strokeWidth={isActive ? 2.5 : 1.5}
                  />
                  <span className="text-[10px] font-semibold leading-none tracking-wide">
                    {item.label}
                  </span>
                </button>
              )
            })}
          </div>
        </nav>
      )}
    </div>
  )
}
