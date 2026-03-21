import { useRouter } from 'next/router'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import {
  Package,
  Megaphone,
  Leaf,
  ChevronRight,
  LogOut,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/components/AuthContext'

export default function Profile() {
  const router = useRouter()
  const { username, logout } = useAuth()
  const listings = useQuery(api.listings.list)
  const requests = useQuery(api.requests.list)
  const myListings = listings?.filter((l) => l.seller === username)
  const myRequests = requests?.filter((r) => r.requester === username)
  const myCarbonSaved = myListings?.reduce((s, l) => s + l.carbonSaved, 0) ?? 0

  return (
    <>
      <div className="px-5 pt-5 pb-2">
        <h1 className="text-lg font-bold tracking-tight">Profile</h1>
      </div>

      <div className="space-y-6 px-5 pb-8">
        {/* User card */}
        <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
            {username?.charAt(0).toUpperCase() ?? '?'}
          </div>
          <div className="flex-1">
            <div className="text-base font-bold">{username ?? 'User'}</div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              Member since 2026
            </div>
          </div>
          <Badge
            variant="secondary"
            className="gap-1 bg-primary/5 text-xs text-primary"
          >
            <Leaf size={10} />
            {myCarbonSaved}kg saved
          </Badge>
        </div>

        {/* Activity */}
        <div className="space-y-1.5">
          <button
            onClick={() => router.push('/')}
            className="flex w-full items-center gap-3.5 rounded-2xl border border-border bg-card p-3.5 text-left active:scale-[0.98]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/5 text-primary">
              <Package size={18} />
            </div>
            <span className="flex-1 text-sm font-semibold">My Listings</span>
            <span className="text-sm font-bold text-muted-foreground">
              {myListings?.length ?? 0}
            </span>
            <ChevronRight size={16} className="text-muted-foreground" />
          </button>

          <button
            onClick={() => router.push('/request')}
            className="flex w-full items-center gap-3.5 rounded-2xl border border-border bg-card p-3.5 text-left active:scale-[0.98]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/5 text-primary">
              <Megaphone size={18} />
            </div>
            <span className="flex-1 text-sm font-semibold">My Requests</span>
            <span className="text-sm font-bold text-muted-foreground">
              {myRequests?.length ?? 0}
            </span>
            <ChevronRight size={16} className="text-muted-foreground" />
          </button>

          <button
            onClick={() => router.push('/carbon')}
            className="flex w-full items-center gap-3.5 rounded-2xl border border-border bg-card p-3.5 text-left active:scale-[0.98]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/5 text-primary">
              <Leaf size={18} />
            </div>
            <span className="flex-1 text-sm font-semibold">Carbon Impact</span>
            <span className="text-sm font-bold text-primary">
              {myCarbonSaved}kg
            </span>
            <ChevronRight size={16} className="text-muted-foreground" />
          </button>
        </div>

        {/* Sign out */}
        <button
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card p-3.5 text-sm font-semibold text-destructive active:scale-[0.98]"
          onClick={logout}
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </>
  )
}
