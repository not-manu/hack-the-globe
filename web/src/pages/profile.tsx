import { useRouter } from "next/router"
import { useQuery } from "convex/react"
import { api } from "../../convex/_generated/api"
import {
  Settings,
  Package,
  Megaphone,
  Leaf,
  ChevronRight,
  LogOut,
  Bell,
  Shield,
  HelpCircle,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function Profile() {
  const router = useRouter()
  const listings = useQuery(api.listings.list)
  const requests = useQuery(api.requests.list)

  const menuItems = [
    {
      icon: Package,
      label: "My Listings",
      value: `${listings?.length ?? 0}`,
      onClick: () => router.push("/browse/all"),
    },
    {
      icon: Megaphone,
      label: "My Requests",
      value: `${requests?.length ?? 0}`,
      onClick: () => router.push("/request"),
    },
    {
      icon: Leaf,
      label: "Carbon Impact",
      value: `${listings?.reduce((s, l) => s + l.carbonSaved, 0) ?? 0}kg`,
      onClick: () => router.push("/carbon"),
    },
  ]

  const settingsItems = [
    { icon: Bell, label: "Notifications" },
    { icon: Shield, label: "Privacy & Security" },
    { icon: HelpCircle, label: "Help & Support" },
  ]

  return (
    <>
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 px-5 pb-3 pt-4 backdrop-blur-lg">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold tracking-tight">Profile</h1>
          <button
            aria-label="Settings"
            className="flex h-9 w-9 items-center justify-center rounded-full transition-colors active:bg-muted"
          >
            <Settings size={20} className="text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="space-y-6 px-5 pb-8">
        {/* Avatar card */}
        <div className="animate-fade-up flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
            S
          </div>
          <div className="flex-1">
            <div className="text-base font-bold">ScrapYard User</div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              Member since 2026
            </div>
          </div>
          <Badge
            variant="secondary"
            className="gap-1 bg-green-bg text-xs text-primary"
          >
            <Leaf size={10} />
            Verified
          </Badge>
        </div>

        {/* Activity items */}
        <div className="space-y-1.5">
          {menuItems.map(({ icon: Icon, label, value, onClick }, i) => (
            <button
              key={label}
              onClick={onClick}
              className={`animate-fade-up stagger-${i + 1} flex w-full items-center gap-3.5 rounded-2xl border border-border bg-card p-3.5 text-left transition-all active:scale-[0.98]`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-bg text-primary">
                <Icon size={18} />
              </div>
              <span className="flex-1 text-sm font-semibold">{label}</span>
              <span className="text-sm font-bold text-muted-foreground">
                {value}
              </span>
              <ChevronRight size={16} className="text-muted-foreground" />
            </button>
          ))}
        </div>

        {/* Settings items */}
        <div>
          <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Settings
          </h2>
          <div className="space-y-1.5">
            {settingsItems.map(({ icon: Icon, label }, i) => (
              <button
                key={label}
                className={`animate-fade-up stagger-${i + 1} flex w-full items-center gap-3.5 rounded-2xl border border-border bg-card p-3.5 text-left transition-all active:scale-[0.98]`}
                onClick={() => alert(`${label} (coming soon)`)}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                  <Icon size={18} className="text-muted-foreground" />
                </div>
                <span className="flex-1 text-sm font-semibold">{label}</span>
                <ChevronRight size={16} className="text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>

        {/* Sign out */}
        <button
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card p-3.5 text-sm font-semibold text-destructive transition-all active:scale-[0.98]"
          onClick={() => alert("Sign out (coming soon)")}
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </>
  )
}
