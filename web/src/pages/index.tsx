import { useRouter } from 'next/router'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useAuth } from '@/components/AuthContext'
import { Leaf, ChevronRight, Camera, MapPin, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { FulfillmentBar } from '@/components/FulfillmentBar'
import { CATEGORIES, SCAN_HERO_IMG, getCategoryInfo } from '@/lib/categories'
import Logo from '@/components/Logo'

export default function Home() {
  const router = useRouter()
  const { username } = useAuth()
  const requests = useQuery(api.requests.list)

  const totalRequests = requests?.length ?? 0
  const openPools = requests?.filter((r) => r.status === 'open' || !r.status) ?? []
  void username

  return (
    <>
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center justify-between">
          <Logo height={26} />
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-full bg-primary/8 px-3 py-1 text-[11px] font-semibold text-primary">
              <Leaf size={12} />
              {totalRequests} pool{totalRequests !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-5 px-5 pb-6">
        {/* Scan CTA */}
        <button
          onClick={() => router.push('/post?scan=1')}
          className="group relative w-full overflow-hidden rounded-2xl bg-neutral-900 text-left active:scale-[0.98]"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-900 via-neutral-900/90 to-neutral-900/40" />
          <img
            src={SCAN_HERO_IMG}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-40 transition-transform duration-500 group-hover:scale-105"
          />
          <div className="relative flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
              <Camera size={22} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="text-[15px] font-bold text-white">Scan to Sell</div>
              <div className="mt-0.5 text-xs text-white/60">
                AI matches your materials to active buyer pools
              </div>
            </div>
            <ChevronRight size={18} className="text-white/40" />
          </div>
        </button>

        {/* Active Pools */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-bold tracking-tight">Active Pools</h2>
            <button
              onClick={() => router.push('/request')}
              className="flex items-center gap-0.5 text-xs font-semibold text-primary"
            >
              Post request <ChevronRight size={14} />
            </button>
          </div>

          {requests === undefined ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse overflow-hidden rounded-2xl border border-border bg-card">
                  <div className="h-32 bg-muted" />
                  <div className="space-y-2 p-4">
                    <div className="h-3.5 w-3/4 rounded bg-muted" />
                    <div className="h-3 w-1/2 rounded bg-muted" />
                    <div className="h-2 w-full rounded-full bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : requests.length > 0 ? (
            <div className="space-y-3">
              {requests.map((req) => {
                const cat = getCategoryInfo(req.category)
                const isFulfilled = req.status === 'fulfilled'
                const pct = req.quantity
                  ? Math.round(((req.fulfilledQuantity ?? 0) / req.quantity) * 100)
                  : 0

                return (
                  <button
                    key={req._id}
                    onClick={() => router.push(`/request/${req._id}`)}
                    className={`group w-full overflow-hidden rounded-2xl border bg-card text-left transition-all active:scale-[0.98] ${
                      isFulfilled ? 'border-amber-300/50' : 'border-border'
                    }`}
                  >
                    {/* Image */}
                    <div className="relative h-36 overflow-hidden bg-muted">
                      <img
                        src={cat.img}
                        alt={cat.label}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                      {/* Overlaid badges */}
                      <div className="absolute left-3 top-3 flex gap-1.5">
                        <Badge
                          variant={isFulfilled ? 'default' : 'secondary'}
                          className="bg-white/90 text-[10px] font-semibold text-neutral-800 backdrop-blur-sm"
                        >
                          {cat.label}
                        </Badge>
                        <Badge
                          variant={
                            req.urgency === 'Urgent'
                              ? 'destructive'
                              : 'secondary'
                          }
                          className={req.urgency === 'Urgent' ? '' : 'bg-white/90 text-neutral-800 backdrop-blur-sm'}
                        >
                          {req.urgency}
                        </Badge>
                      </div>

                      {/* Progress pill overlay */}
                      {req.quantity != null && (
                        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-sm">
                          <Users size={10} />
                          {pct}% filled
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-3.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-sm font-bold">
                            {req.title}
                          </h3>
                          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                            <MapPin size={10} />
                            <span>{req.requester}</span>
                            <span className="text-border">&middot;</span>
                            <span>{req.budget || 'Flexible'}</span>
                            {req.quantity != null && (
                              <>
                                <span className="text-border">&middot;</span>
                                <span className="font-medium text-foreground">
                                  {req.fulfilledQuantity ?? 0}/{req.quantity} {req.unit ?? 'pcs'}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <ChevronRight size={16} className="mt-0.5 shrink-0 text-muted-foreground" />
                      </div>

                      {/* Fulfillment bar */}
                      {req.quantity != null && (
                        <div className="mt-2.5">
                          <FulfillmentBar
                            fulfilled={req.fulfilledQuantity ?? 0}
                            total={req.quantity}
                            unit={req.unit ?? 'pcs'}
                            size="compact"
                            showLabel={false}
                          />
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border p-10 text-center">
              <div className="text-sm font-medium text-muted-foreground">
                No active pools yet
              </div>
              <p className="text-xs text-muted-foreground">
                Post a request for materials you need
              </p>
            </div>
          )}
        </div>

        {/* Open pools count footer */}
        {openPools.length > 0 && (
          <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
            <Leaf size={11} className="text-primary" />
            <span>
              {openPools.length} open pool{openPools.length !== 1 ? 's' : ''} waiting for contributors
            </span>
          </div>
        )}
      </div>
    </>
  )
}
