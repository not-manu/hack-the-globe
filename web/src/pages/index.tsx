import { useRouter } from "next/router"
import { useQuery } from "convex/react"
import { api } from "../../convex/_generated/api"
import { Search, Leaf, ChevronRight, Sparkles } from "lucide-react"
import Logo from "@/components/Logo"

const CATEGORIES = [
  { id: "lumber", label: "Lumber", icon: "\u{1FAB5}" },
  { id: "steel", label: "Steel", icon: "\u{1F529}" },
  { id: "concrete", label: "Concrete", icon: "\u{1F9F1}" },
  { id: "brick", label: "Brick", icon: "\u{1F3D7}\u{FE0F}" },
  { id: "glass", label: "Glass", icon: "\u{1FA9F}" },
  { id: "pipe", label: "Piping", icon: "\u{1F527}" },
  { id: "electrical", label: "Electrical", icon: "\u{1F4A1}" },
  { id: "fixtures", label: "Fixtures", icon: "\u{1F6BF}" },
]

export default function Home() {
  const router = useRouter()
  const listings = useQuery(api.listings.list)
  const requests = useQuery(api.requests.list)

  const recent = listings?.slice(0, 4)

  return (
    <>
      {/* Header */}
      <div className="px-5 pt-5 pb-2">
        <div className="flex items-center justify-between">
          <Logo height={26} />
          <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
            <Leaf size={14} />
            <span>486 kg saved</span>
          </div>
        </div>
      </div>

      <div className="space-y-6 px-5 pb-6">
        {/* Search */}
        <button
          onClick={() => router.push("/browse/all")}
          className="flex w-full items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left"
        >
          <Search size={18} className="text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Search materials...
          </span>
        </button>

        {/* Categories */}
        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            Categories
          </h2>
          <div className="grid grid-cols-4 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => router.push(`/browse/${cat.id}`)}
                className="flex flex-col items-center gap-1 rounded-xl border border-border bg-card py-3 transition-all active:scale-95"
              >
                <span className="text-xl">{cat.icon}</span>
                <span className="text-[11px] font-medium text-muted-foreground">
                  {cat.label}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Recent Listings */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground">
              Recent Listings
            </h2>
            <button
              onClick={() => router.push("/browse/all")}
              className="flex items-center gap-0.5 text-xs font-medium text-primary"
            >
              All <ChevronRight size={14} />
            </button>
          </div>

          <div className="space-y-2">
            {listings === undefined ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex animate-pulse items-center gap-3 rounded-xl border border-border bg-card p-3">
                  <div className="h-14 w-14 rounded-lg bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-2/3 rounded bg-muted" />
                    <div className="h-3 w-1/3 rounded bg-muted" />
                  </div>
                </div>
              ))
            ) : recent && recent.length > 0 ? (
              recent.map((listing) => (
                <button
                  key={listing._id}
                  onClick={() => router.push(`/listing/${listing._id}`)}
                  className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-3 text-left transition-all active:scale-[0.98]"
                >
                  <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                    {(listing.imageUrl || listing.image) && (
                      <img
                        src={listing.imageUrl ?? listing.image}
                        alt={listing.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{listing.title}</div>
                    <div className="text-xs text-muted-foreground">{listing.location}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">${listing.price}</div>
                    <div className="flex items-center gap-1 text-[10px] text-primary">
                      <Leaf size={10} />
                      {listing.carbonSaved}kg
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                No listings yet
              </div>
            )}
          </div>
        </section>

        {/* Requests */}
        {requests && requests.length > 0 && (
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-muted-foreground">
                Requests
              </h2>
              <button
                onClick={() => router.push("/request")}
                className="flex items-center gap-0.5 text-xs font-medium text-primary"
              >
                Post <ChevronRight size={14} />
              </button>
            </div>
            <div className="hide-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
              {requests.map((req) => (
                <div
                  key={req._id}
                  className="min-w-[180px] rounded-xl border border-border bg-card p-3"
                >
                  <div className="mb-1.5 text-[11px] font-medium text-warm">{req.urgency}</div>
                  <div className="text-sm font-semibold leading-snug">{req.title}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {req.budget || "Flexible"} &middot; {req.requester}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* AI Scanner CTA */}
        <button
          onClick={() => router.push("/post?scan=1")}
          className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-green-bg p-4 text-left ring-1 ring-primary/15 transition-all active:scale-[0.98]"
        >
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-green-light shadow-md shadow-primary/20">
              <Sparkles size={22} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold text-foreground">AI Material Scanner</div>
              <div className="text-xs text-muted-foreground">Snap, identify &amp; list in seconds</div>
            </div>
            <ChevronRight size={16} className="text-primary transition-transform group-active:translate-x-0.5" />
          </div>
        </button>
      </div>
    </>
  )
}
