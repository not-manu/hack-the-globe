import { useRouter } from "next/router"
import { useQuery } from "convex/react"
import { api } from "../../convex/_generated/api"
import { Search, Leaf, ChevronRight, Zap } from "lucide-react"
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

  const recent = listings?.slice(0, 6)

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
        <div className="hide-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => router.push(`/browse/${cat.id}`)}
              className="flex flex-shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 text-xs font-medium text-muted-foreground active:scale-95"
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* AI Scanner */}
        <button
          onClick={() => router.push("/post?scan=1")}
          className="flex w-full items-center gap-3.5 rounded-xl bg-primary p-4 text-left active:scale-[0.98]"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
            <Zap size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold text-white">AI Scanner</div>
            <div className="text-xs text-white/70">Snap, identify & list</div>
          </div>
          <ChevronRight size={16} className="text-white/60" />
        </button>

        {/* Recent Listings */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground">
              Recent
            </h2>
            <button
              onClick={() => router.push("/browse/all")}
              className="flex items-center gap-0.5 text-xs font-medium text-primary"
            >
              All <ChevronRight size={14} />
            </button>
          </div>

          {listings === undefined ? (
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse overflow-hidden rounded-2xl border border-border bg-card">
                  <div className="aspect-square bg-muted" />
                  <div className="space-y-2 p-3">
                    <div className="h-3 w-3/4 rounded bg-muted" />
                    <div className="h-3 w-1/2 rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : recent && recent.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {recent.map((listing) => (
                <button
                  key={listing._id}
                  onClick={() => router.push(`/listing/${listing._id}`)}
                  className="w-full overflow-hidden rounded-2xl border border-border bg-card text-left active:scale-[0.97]"
                >
                  <div className="aspect-square overflow-hidden bg-muted">
                    {(listing.imageUrl || listing.image) && (
                      <img
                        src={listing.imageUrl ?? listing.image}
                        alt={listing.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    )}
                  </div>
                  <div className="p-3">
                    <div className="truncate text-sm font-semibold">
                      {listing.title}
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-sm font-bold">${listing.price}</span>
                      <span className="flex items-center gap-0.5 text-[10px] text-primary">
                        <Leaf size={9} />
                        {listing.carbonSaved}kg
                      </span>
                    </div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">
                      {listing.location}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No listings yet
            </div>
          )}
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
      </div>
    </>
  )
}
