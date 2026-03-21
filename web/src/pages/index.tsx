import { useRouter } from "next/router"
import { useQuery } from "convex/react"
import { api } from "../../convex/_generated/api"
import { Search, Leaf, Clock, ChevronRight, Megaphone, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Logo from "@/components/Logo"

const CATEGORIES = [
  { id: "lumber", label: "Lumber", icon: "\u{1FAB5}", count: 12 },
  { id: "steel", label: "Steel", icon: "\u{1F529}", count: 8 },
  { id: "concrete", label: "Concrete", icon: "\u{1F9F1}", count: 15 },
  { id: "brick", label: "Brick", icon: "\u{1F3D7}\u{FE0F}", count: 6 },
  { id: "glass", label: "Glass", icon: "\u{1FA9F}", count: 4 },
  { id: "pipe", label: "Piping", icon: "\u{1F527}", count: 9 },
  { id: "electrical", label: "Electrical", icon: "\u{1F4A1}", count: 7 },
  { id: "fixtures", label: "Fixtures", icon: "\u{1F6BF}", count: 3 },
]

export default function Home() {
  const router = useRouter()
  const listings = useQuery(api.listings.list)
  const requests = useQuery(api.requests.list)

  const recentListings = listings?.slice(0, 3)

  return (
    <>
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 px-5 pb-3 pt-4 backdrop-blur-lg">
        <div className="flex items-center justify-between">
          <Logo height={28} />
          <Badge variant="secondary" className="gap-1 border-green-bg-dark bg-green-bg text-xs font-semibold text-primary">
            <Leaf size={12} />
            486kg saved
          </Badge>
        </div>
      </div>

      <div className="space-y-7 px-5 pb-8">
        {/* Search */}
        <button
          onClick={() => router.push("/browse/all")}
          className="flex w-full items-center gap-3 rounded-full border border-border bg-card px-4 py-3 text-left transition-colors active:bg-muted"
        >
          <Search size={18} className="text-muted-foreground" />
          <span className="flex-1 text-sm text-muted-foreground">
            Search surplus materials...
          </span>
        </button>

        {/* Categories */}
        <section>
          <h2 className="mb-3 text-base font-bold tracking-tight">
            What are you looking for?
          </h2>
          <div className="grid grid-cols-4 gap-2.5">
            {CATEGORIES.map((cat, i) => (
              <button
                key={cat.id}
                onClick={() => router.push(`/browse/${cat.id}`)}
                className={`animate-fade-up stagger-${(i % 6) + 1} flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-card p-3 transition-all active:scale-95`}
                aria-label={`Browse ${cat.label}`}
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-center text-[11px] font-semibold leading-tight text-muted-foreground">
                  {cat.label}
                </span>
                {cat.count > 0 && (
                  <span className="rounded-full bg-green-bg px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                    {cat.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Recent Listings */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-primary" />
              <h2 className="text-base font-bold tracking-tight">Recently Added</h2>
            </div>
            <button
              onClick={() => router.push("/browse/all")}
              className="flex items-center gap-1 text-xs font-semibold text-primary"
            >
              See all
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="space-y-2.5">
            {listings === undefined ? (
              // Skeleton
              Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex animate-pulse items-center gap-3.5 rounded-2xl border border-border bg-card p-3"
                >
                  <div className="h-16 w-16 flex-shrink-0 rounded-xl bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-3/4 rounded bg-muted" />
                    <div className="h-3 w-1/2 rounded bg-muted" />
                    <div className="h-4 w-1/3 rounded bg-muted" />
                  </div>
                </div>
              ))
            ) : recentListings && recentListings.length > 0 ? (
              recentListings.map((listing, i) => {
                const discount = listing.originalPrice > 0
                  ? Math.round((1 - listing.price / listing.originalPrice) * 100)
                  : 0
                return (
                  <button
                    key={listing._id}
                    onClick={() => router.push(`/listing/${listing._id}`)}
                    className={`animate-fade-up stagger-${i + 1} flex w-full items-center gap-3.5 rounded-2xl border border-border bg-card p-3 text-left transition-all active:scale-[0.98]`}
                  >
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-muted">
                      {listing.image && (
                        <img
                          src={listing.image}
                          alt={listing.title}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold">
                        {listing.title}
                      </div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        {listing.location} / {listing.quantity}
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-base font-extrabold">${listing.price}</span>
                        {listing.originalPrice > listing.price && (
                          <span className="text-xs text-muted-foreground line-through">
                            ${listing.originalPrice}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      {discount > 0 && (
                        <Badge variant="secondary" className="bg-green-bg text-[10px] text-primary">
                          -{discount}%
                        </Badge>
                      )}
                      <div className="flex items-center gap-1 text-[10px] text-primary">
                        <Leaf size={10} />
                        {listing.carbonSaved}kg
                      </div>
                    </div>
                  </button>
                )
              })
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
                <p className="text-sm font-medium text-muted-foreground">No listings yet</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Be the first to post surplus materials
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Material Requests */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Megaphone size={16} className="text-warm" />
              <h2 className="text-base font-bold tracking-tight">Requests</h2>
            </div>
            <button
              onClick={() => router.push("/request")}
              className="flex items-center gap-1 text-xs font-semibold text-primary"
            >
              Post request
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="hide-scrollbar -mx-5 flex gap-2.5 overflow-x-auto px-5 pb-1">
            {requests === undefined ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="min-w-[200px] animate-pulse rounded-2xl border border-border bg-card p-3.5"
                >
                  <div className="mb-2 h-4 w-16 rounded bg-muted" />
                  <div className="mb-1.5 h-3.5 w-3/4 rounded bg-muted" />
                  <div className="h-3 w-1/2 rounded bg-muted" />
                </div>
              ))
            ) : requests.length > 0 ? (
              requests.map((req, i) => (
                <div
                  key={req._id}
                  className={`animate-fade-up stagger-${i + 1} min-w-[200px] rounded-2xl border border-border bg-card p-3.5`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <Badge
                      variant={req.urgency === "Urgent" ? "destructive" : "secondary"}
                      className="text-[10px]"
                    >
                      {req.urgency}
                    </Badge>
                  </div>
                  <div className="mb-1 text-[13px] font-semibold leading-snug">
                    {req.title}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Budget: {req.budget || "Flexible"}
                  </div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">
                    by {req.requester}
                  </div>
                </div>
              ))
            ) : (
              <div className="min-w-[200px] rounded-2xl border border-dashed border-border bg-card p-6 text-center">
                <p className="text-xs font-medium text-muted-foreground">No requests yet</p>
              </div>
            )}
          </div>
        </section>

        {/* AI Scanner promo */}
        <button
          onClick={() => router.push("/scan")}
          className="animate-fade-up flex w-full items-center gap-3.5 rounded-2xl border border-green-bg-dark bg-gradient-to-br from-green-bg to-green-bg-dark p-4 text-left transition-all active:scale-[0.98]"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary">
            <Sparkles size={20} className="text-primary-foreground" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold text-green-dark">
              AI Material Scanner
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              Point your camera to instantly identify and list materials
            </div>
          </div>
          <ChevronRight size={18} className="text-primary" />
        </button>
      </div>
    </>
  )
}
