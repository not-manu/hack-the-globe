import { useRouter } from 'next/router'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useAuth } from '@/components/AuthContext'
import { Search, Leaf, ChevronRight, Zap, MapPin, Package, Megaphone } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  const listings = useQuery(api.listings.list)
  const requests = useQuery(api.requests.list)

  const myListings = listings?.filter((l) => l.seller === username)
  const totalCarbon = myListings?.reduce((sum, l) => sum + l.carbonSaved, 0) ?? 0

  return (
    <>
      {/* Header */}
      <div className="px-5 pt-5 pb-2">
        <div className="flex items-center justify-between">
          <Logo height={26} />
          <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
            <Leaf size={14} />
            <span>{totalCarbon} kg saved</span>
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

        {/* AI Scanner */}
        <button
          onClick={() => router.push('/post?scan=1')}
          className="flex w-full items-center gap-3.5 rounded-xl bg-primary p-4 text-left active:scale-[0.98]"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
            <Zap size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold text-white">Scan & List with AI</div>
            <div className="text-xs text-white/70">
              Snap a photo — find buyers nearby
            </div>
          </div>
          <ChevronRight size={16} className="text-white/60" />
        </button>

        {/* Tabs */}
        <Tabs defaultValue="requests" className="gap-4">
          <TabsList className="w-full">
            <TabsTrigger value="requests" className="gap-1.5">
              <Megaphone size={14} />
              Open Requests
              {requests && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
                  {requests.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="listings" className="gap-1.5">
              <Package size={14} />
              My Listings
              {myListings && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
                  {myListings.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Open Requests Tab */}
          <TabsContent value="requests">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                People nearby looking for materials
              </p>
              <button
                onClick={() => router.push('/request')}
                className="flex items-center gap-0.5 text-xs font-medium text-primary"
              >
                Post request <ChevronRight size={14} />
              </button>
            </div>

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
                No requests yet — be the first to post what you need
              </div>
            )}
          </TabsContent>

          {/* My Listings Tab */}
          <TabsContent value="listings">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Your posted surplus materials
              </p>
              <button
                onClick={() => router.push('/post')}
                className="flex items-center gap-0.5 text-xs font-medium text-primary"
              >
                List material <ChevronRight size={14} />
              </button>
            </div>

            {listings === undefined ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="animate-pulse rounded-xl border border-border bg-card p-4">
                    <div className="flex gap-3">
                      <div className="h-16 w-16 rounded-lg bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-3/4 rounded bg-muted" />
                        <div className="h-3 w-1/2 rounded bg-muted" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : myListings && myListings.length > 0 ? (
              <div className="space-y-2.5">
                {myListings.map((listing) => {
                  const discount = Math.round(
                    (1 - listing.price / listing.originalPrice) * 100
                  )
                  return (
                    <button
                      key={listing._id}
                      onClick={() => router.push(`/listing/${listing._id}`)}
                      className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-3 text-left active:scale-[0.98]"
                    >
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                        {(listing.imageUrl || listing.image) && (
                          <img
                            src={listing.imageUrl ?? listing.image}
                            alt={listing.title}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        )}
                        {discount > 0 && (
                          <div className="absolute top-1 left-1 rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-bold text-white">
                            -{discount}%
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold">
                          {listing.title}
                        </div>
                        <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <MapPin size={10} />
                          {listing.location}
                          <span className="text-border">·</span>
                          {listing.quantity} {listing.unit}
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-sm font-bold">${listing.price}</span>
                          <span className="text-xs text-muted-foreground line-through">
                            ${listing.originalPrice}
                          </span>
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1.5">
                        <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
                          Active
                        </Badge>
                        <span className="flex items-center gap-1 text-[11px] text-primary">
                          <Leaf size={10} />
                          {listing.carbonSaved}kg
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="space-y-3 rounded-xl border border-dashed border-border p-6 text-center">
                <Package size={28} className="mx-auto text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">No listings yet</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    List your surplus materials and find buyers nearby
                  </div>
                </div>
                <button
                  onClick={() => router.push('/post')}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white active:scale-95"
                >
                  <Zap size={14} />
                  Post your first listing
                </button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
