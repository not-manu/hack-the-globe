import { useRouter } from "next/router"
import { Home, Map, Plus, BarChart3, User } from "lucide-react"

const NAV_ITEMS = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/map", icon: Map, label: "Map" },
  { path: "/post", icon: Plus, label: "Post", isCenter: true },
  { path: "/carbon", icon: BarChart3, label: "Impact" },
  { path: "/profile", icon: User, label: "Profile" },
]

const HIDE_NAV_PATHS = ["/listing/", "/scan", "/request", "/chat/"]

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const hideNav = HIDE_NAV_PATHS.some((p) => router.pathname.startsWith(p))

  return (
    <div className="mx-auto flex h-full max-h-dvh max-w-[430px] flex-col overflow-hidden bg-background">
      <main className="hide-scrollbar flex-1 overflow-y-auto overflow-x-hidden">
        <div className={hideNav ? "" : "pb-16"}>
          {children}
        </div>
      </main>

      {!hideNav && (
        <div
          className="shrink-0 border-t border-border/40 bg-background/80 backdrop-blur-xl"
          style={{ paddingBottom: "var(--safe-bottom)" }}
          role="navigation"
          aria-label="Main navigation"
        >
          <div className="flex items-center justify-around px-6 py-2">
            {NAV_ITEMS.map((item) => {
              const isActive = router.pathname === item.path
              const Icon = item.icon

              if (item.isCenter) {
                return (
                  <button
                    key={item.path}
                    onClick={() => router.push(item.path)}
                    aria-label={item.label}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform active:scale-90"
                  >
                    <Icon size={20} strokeWidth={2} />
                  </button>
                )
              }

              return (
                <button
                  key={item.path}
                  onClick={() => router.push(item.path)}
                  aria-label={item.label}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <Icon size={22} strokeWidth={isActive ? 2.2 : 1.5} />
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
