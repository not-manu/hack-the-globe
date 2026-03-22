import { useRouter } from 'next/router'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { ArrowLeft, Clock, Trash2, Leaf, Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/components/AuthContext'

const CATEGORIES: Record<string, { label: string; img: string }> = {
  lumber: { label: 'Lumber', img: 'https://images.unsplash.com/photo-1520333789090-1afc82db536a?w=200&h=200&fit=crop' },
  steel: { label: 'Steel', img: 'https://images.unsplash.com/photo-1530982011887-3cc11cc85693?w=200&h=200&fit=crop' },
  concrete: { label: 'Concrete', img: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=200&fit=crop' },
  brick: { label: 'Brick', img: 'https://images.unsplash.com/photo-1590075865003-e48277faa558?w=200&h=200&fit=crop' },
  glass: { label: 'Glass', img: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=200&h=200&fit=crop' },
  pipe: { label: 'Piping', img: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=200&h=200&fit=crop' },
  electrical: { label: 'Electrical', img: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=200&h=200&fit=crop' },
  fixtures: { label: 'Fixtures', img: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=200&h=200&fit=crop' },
  other: { label: 'Other', img: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=200&h=200&fit=crop' },
}

export default function HoldPage() {
  const router = useRouter()
  const { username } = useAuth()

  const waitlistItems = useQuery(
    api.waitlist.listBySeller,
    username ? { seller: username } : 'skip',
  )
  const openRequests = useQuery(api.requests.listOpen)
  const removeFromWaitlist = useMutation(api.waitlist.remove)

  const activeItems = waitlistItems?.filter((w) => w.status === 'waiting') ?? []
  const matchedItems = waitlistItems?.filter((w) => w.status === 'matched') ?? []

  // Check if any new pools match waitlisted categories
  const getNewMatches = (category: string) => {
    if (!openRequests) return []
    return openRequests.filter(
      (r) => r.category === category && (r.status === 'open' || !r.status),
    )
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border/50 px-5 pt-4 pb-3">
        <button
          onClick={() => router.back()}
          aria-label="Go back"
          className="flex h-9 w-9 items-center justify-center rounded-full active:bg-muted"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-lg font-bold">Selling Hold</h1>
          <p className="text-[11px] text-muted-foreground">
            Materials waiting for matching buyers
          </p>
        </div>
      </div>

      <div className="space-y-4 px-5 py-5">
        {/* Explanation card */}
        <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/30 p-3.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
            <Clock size={16} className="text-muted-foreground" />
          </div>
          <div className="text-xs text-muted-foreground">
            <p className="font-semibold text-foreground">How it works</p>
            <p className="mt-0.5">
              When you scan materials with no matching buyer pool, they go on
              hold. When a buyer posts a matching request, you&apos;ll be
              notified to join their pool.
            </p>
          </div>
        </div>

        {/* Active items on hold */}
        {activeItems.length > 0 ? (
          <div className="space-y-2.5">
            {activeItems.map((item) => {
              const cat = CATEGORIES[item.category]
              const newMatches = getNewMatches(item.category)
              const hasNewMatch = newMatches.length > 0

              return (
                <div
                  key={item._id}
                  className={`overflow-hidden rounded-xl border bg-card ${
                    hasNewMatch
                      ? 'border-primary/30 bg-primary/5'
                      : 'border-border'
                  }`}
                >
                  <div className="flex items-center gap-3 p-3.5">
                    <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-muted">
                      <img src={cat?.img ?? CATEGORIES.other.img} alt="" className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold">
                        {item.material}
                      </div>
                      <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <span>{cat?.label ?? item.category}</span>
                        <span className="text-border">&middot;</span>
                        <span>
                          {item.quantity} {item.unit}
                        </span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {hasNewMatch ? (
                        <Badge
                          variant="default"
                          className="gap-1 text-[10px]"
                        >
                          {newMatches.length} pool
                          {newMatches.length !== 1 ? 's' : ''} available!
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="gap-1 text-[10px]"
                        >
                          <Clock size={9} />
                          Waiting
                        </Badge>
                      )}
                      <button
                        onClick={() => removeFromWaitlist({ id: item._id })}
                        className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-destructive"
                        aria-label="Remove"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* If new matching pool appeared, show CTA to join */}
                  {hasNewMatch && (
                    <div className="border-t border-primary/20 px-3.5 py-2.5">
                      {newMatches.map((req) => (
                        <button
                          key={req._id}
                          onClick={() => router.push(`/request/${req._id}`)}
                          className="flex w-full items-center gap-2 rounded-lg p-1.5 text-left transition-colors hover:bg-primary/10"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-xs font-semibold text-primary">
                              {req.title}
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              {req.requester} &middot;{' '}
                              {(req.quantity ?? 0) -
                                (req.fulfilledQuantity ?? 0)}{' '}
                              {req.unit ?? 'pcs'} needed
                            </div>
                          </div>
                          <Button size="sm" className="h-7 gap-1 text-[10px]">
                            Join Pool
                          </Button>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : matchedItems.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border p-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <Leaf size={24} className="text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">Nothing on hold</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Scan materials to sell — if there&apos;s no matching buyer
                pool, they&apos;ll appear here.
              </p>
            </div>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => router.push('/post')}
            >
              <Camera size={14} />
              Scan Materials
            </Button>
          </div>
        ) : null}

        {/* Matched / completed items */}
        {matchedItems.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-muted-foreground">
              Previously Matched
            </h3>
            {matchedItems.map((item) => {
              const cat = CATEGORIES[item.category]
              return (
                <div
                  key={item._id}
                  className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3 opacity-60"
                >
                  <div className="h-6 w-6 shrink-0 overflow-hidden rounded bg-muted">
                    <img src={cat?.img ?? CATEGORIES.other.img} alt="" className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-medium">
                      {item.material}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[9px]">
                    Matched
                  </Badge>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
