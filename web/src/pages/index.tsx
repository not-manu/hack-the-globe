import { useRouter } from 'next/router'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useAuth } from '@/components/AuthContext'
import { Search, Leaf, ChevronRight, Camera, MapPin, Megaphone } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { FulfillmentBar } from '@/components/FulfillmentBar'
import Logo from '@/components/Logo'

const CATEGORIES: Record<string, { label: string; icon: string }> = {
  lumber: { label: 'Lumber', icon: '\u{1FAB5}' },
  steel: { label: 'Steel', icon: '\u{1F529}' },
  concrete: { label: 'Concrete', icon: '\u{1F9F1}' },
  brick: { label: 'Brick', icon: '\u{1F3D7}\u{FE0F}' },
  glass: { label: 'Glass', icon: '\u{1FA9F}' },
  pipe: { label: 'Piping', icon: '\u{1F527}' },
  electrical: { label: 'Electrical', icon: '\u{1F4A1}' },
  fixtures: { label: 'Fixtures', icon: '\u{1F6BF}' },
  other: { label: 'Other', icon: '\u{1F4E6}' },
}

export default function Home() {
  const router = useRouter()
  const { username } = useAuth()
  const requests = useQuery(api.requests.list)

  // Rough carbon estimate from all request contributions
  const totalRequests = requests?.length ?? 0
  void username // used by auth context

  return (
    <>
      {/* Header */}
      <div className="px-5 pt-5 pb-2">
        <div className="flex items-center justify-between">
          <Logo height={26} />
          <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
            <Leaf size={14} />
            <span>{totalRequests} active pools</span>
          </div>
        </div>
      </div>

      <div className="space-y-5 px-5 pb-6">
        {/* Search */}
        <button
          onClick={() => router.push('/browse/all')}
          className="flex w-full items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left"
        >
          <Search size={18} className="text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Search materials...
          </span>
        </button>

        {/* Scan to Sell CTA */}
        <button
          onClick={() => router.push('/post?scan=1')}
          className="flex w-full items-center gap-3.5 rounded-xl bg-primary p-4 text-left active:scale-[0.98]"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
            <Camera size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold text-white">Scan to Sell</div>
            <div className="text-xs text-white/70">
              Snap a photo — join buyer pools instantly
            </div>
          </div>
          <ChevronRight size={16} className="text-white/60" />
        </button>

        {/* Active Pools */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Megaphone size={14} className="text-primary" />
              <h2 className="text-sm font-bold">Active Pools</h2>
              {requests && (
                <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                  {requests.length}
                </Badge>
              )}
            </div>
            <button
              onClick={() => router.push('/request')}
              className="flex items-center gap-0.5 text-xs font-medium text-primary"
            >
              Post request <ChevronRight size={14} />
            </button>
          </div>

          <p className="text-[11px] text-muted-foreground">
            Buyers looking for materials — scan yours to join a pool
          </p>

          {requests === undefined ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-xl border border-border bg-card p-4">
                  <div className="flex gap-3">
                    <div className="h-10 w-10 rounded-lg bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-3/4 rounded bg-muted" />
                      <div className="h-3 w-1/2 rounded bg-muted" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : requests.length > 0 ? (
            <div className="space-y-2.5">
              {requests.map((req) => {
                const cat = CATEGORIES[req.category]
                const isFulfilled = req.status === 'fulfilled'
                return (
                  <button
                    key={req._id}
                    onClick={() => router.push(`/request/${req._id}`)}
                    className={`flex w-full flex-col gap-2.5 rounded-xl border bg-card p-3.5 text-left active:scale-[0.98] ${isFulfilled ? 'border-amber-200 bg-amber-50/50' : 'border-border'}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-lg">
                        {cat?.icon ?? '\u{1F4E6}'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold">
                          {req.title}
                        </div>
                        <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <MapPin size={10} />
                          <span>{req.requester}</span>
                          <span className="text-border">&middot;</span>
                          <span>{req.budget || 'Flexible'}</span>
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <Badge
                          variant={
                            req.urgency === 'Urgent'
                              ? 'destructive'
                              : req.urgency === 'This week'
                                ? 'default'
                                : 'secondary'
                          }
                          className="h-5 px-1.5 text-[10px]"
                        >
                          {req.urgency}
                        </Badge>
                        <ChevronRight size={14} className="text-muted-foreground" />
                      </div>
                    </div>
                    {/* Fulfillment bar */}
                    {req.quantity != null && (
                      <FulfillmentBar
                        fulfilled={req.fulfilledQuantity ?? 0}
                        total={req.quantity}
                        unit={req.unit ?? 'pcs'}
                        size="compact"
                      />
                    )}
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No active pools yet — post a request for what you need
            </div>
          )}
        </div>
      </div>
    </>
  )
}
