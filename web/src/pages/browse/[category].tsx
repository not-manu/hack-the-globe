import { useState } from "react"
import { useRouter } from "next/router"
import { useQuery } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { ArrowLeft, Search, MapPin, Leaf, SlidersHorizontal } from "lucide-react"


import { CATEGORIES as CAT_MAP } from '@/lib/categories'

const CATEGORIES = [
  { id: "all", label: "All" },
  ...Object.entries(CAT_MAP).map(([id, info]) => ({ id, label: info.label })),
]

export default function Browse() {
  const router = useRouter()
  const { category } = router.query
  const [activeCategory, setActiveCategory] = useState<string>(
    (category as string) || "all"
  )
  const [searchQuery, setSearchQuery] = useState("")

  const listings = useQuery(api.listings.list)

  const filtered = listings?.filter((l) => {
    const matchCat = activeCategory === "all" || l.category === activeCategory
    const matchSearch =
      !searchQuery || l.title.toLowerCase().includes(searchQuery.toLowerCase())
    return matchCat && matchSearch
  })

  const catLabel =
    CATEGORIES.find((c) => c.id === activeCategory)?.label || "All"

  return (
    <>
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 px-5 pb-3 pt-4 backdrop-blur-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/")}
            aria-label="Go back"
            className="flex h-9 w-9 items-center justify-center rounded-full transition-colors active:bg-muted"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="flex-1 text-lg font-bold tracking-tight">
            {catLabel === "All" ? "All Materials" : catLabel}
          </h1>
          <span className="text-xs font-semibold text-muted-foreground">
            {filtered?.length ?? 0} items
          </span>
        </div>
      </div>

      <div className="px-5">
        {/* Search */}
        <div className="mb-3 flex items-center gap-2.5 rounded-full border border-border bg-card px-4">
          <Search size={16} className="text-muted-foreground" />
          <input
            type="text"
            placeholder="Search materials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 border-0 bg-transparent py-2.5 text-sm outline-none placeholder:text-muted-foreground"
            aria-label="Search materials"
          />
          <button aria-label="Filters" className="p-1">
            <SlidersHorizontal size={16} className="text-muted-foreground" />
          </button>
        </div>

        {/* Category pills */}
        <div
          className="hide-scrollbar -mx-5 mb-4 flex gap-1.5 overflow-x-auto px-5 pb-1"
          role="tablist"
          aria-label="Material categories"
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              role="tab"
              aria-selected={activeCategory === cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                activeCategory === cat.id
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-card text-muted-foreground"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Listings grid */}
        {listings === undefined ? (
          <div className="grid grid-cols-2 gap-2.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse overflow-hidden rounded-2xl border border-border bg-card"
              >
                <div className="aspect-[4/3] bg-muted" />
                <div className="space-y-2 p-3">
                  <div className="h-3.5 w-3/4 rounded bg-muted" />
                  <div className="h-3 w-1/2 rounded bg-muted" />
                  <div className="h-4 w-1/3 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered && filtered.length > 0 ? (
          <div className="grid grid-cols-2 gap-2.5 pb-6">
            {filtered.map((listing, i) => {
              const discount =
                listing.originalPrice > 0
                  ? Math.round(
                      (1 - listing.price / listing.originalPrice) * 100
                    )
                  : 0
              return (
                <button
                  key={listing._id}
                  onClick={() => router.push(`/listing/${listing._id}`)}
                  className={`animate-fade-up stagger-${(i % 6) + 1} w-full overflow-hidden rounded-2xl border border-border bg-card text-left transition-all active:scale-[0.97]`}
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    {(listing.imageUrl || listing.image) && (
                      <img
                        src={listing.imageUrl ?? listing.image}
                        alt={listing.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    )}
                    {discount > 0 && (
                      <div className="absolute right-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[11px] font-bold text-primary-foreground">
                        -{discount}%
                      </div>
                    )}
                    <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
                      <div className="flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-primary backdrop-blur-sm">
                        <Leaf size={10} />
                        {listing.carbonSaved}kg
                      </div>
                      {listing.items && listing.items.length > 1 && (
                        <div className="rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-foreground backdrop-blur-sm">
                          {listing.items.length} items
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="p-2.5">
                    <h3 className="truncate text-[13px] font-semibold">
                      {listing.title}
                    </h3>
                    <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                      <MapPin size={10} />
                      <span>{listing.location}</span>
                    </div>
                    <div className="mt-1.5 flex items-baseline gap-1.5">
                      <span className="text-base font-extrabold">
                        ${listing.price}
                      </span>
                      {listing.originalPrice > listing.price && (
                        <span className="text-[11px] text-muted-foreground line-through">
                          ${listing.originalPrice}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        ) : (
          <div className="py-16 text-center">
            <p className="text-sm font-medium text-muted-foreground">
              No materials found
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Try a different category or search term
            </p>
          </div>
        )}
      </div>
    </>
  )
}
