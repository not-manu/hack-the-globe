import { useRouter } from "next/router"
import { useQuery } from "convex/react"
import { api } from "../../convex/_generated/api"
import { MapPin, Navigation, Leaf } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function MapView() {
  const router = useRouter()
  const listings = useQuery(api.listings.list)

  return (
    <>
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 px-5 pb-3 pt-4 backdrop-blur-lg">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold tracking-tight">Nearby Materials</h1>
          <Badge variant="secondary" className="gap-1 text-xs">
            <Navigation size={10} />
            2km radius
          </Badge>
        </div>
      </div>

      {/* Map placeholder */}
      <div className="relative mx-5 mb-5 aspect-square overflow-hidden rounded-3xl border border-border bg-muted">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
          <MapPin size={40} strokeWidth={1} />
          <span className="text-sm font-medium">Map View</span>
          <span className="text-xs">Interactive map coming soon</span>
        </div>

        {/* Fake pins */}
        {listings?.slice(0, 5).map((listing, i) => {
          const positions = [
            { top: "30%", left: "40%" },
            { top: "45%", left: "60%" },
            { top: "55%", left: "30%" },
            { top: "35%", left: "70%" },
            { top: "65%", left: "50%" },
          ]
          return (
            <button
              key={listing._id}
              onClick={() => router.push(`/listing/${listing._id}`)}
              className="absolute flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-transform active:scale-110"
              style={positions[i]}
              aria-label={listing.title}
            >
              <MapPin size={14} />
            </button>
          )
        })}
      </div>

      {/* Nearby listings */}
      <div className="px-5 pb-8">
        <h2 className="mb-3 text-sm font-bold text-muted-foreground uppercase tracking-wider">
          Nearby
        </h2>
        <div className="space-y-2.5">
          {listings === undefined ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex animate-pulse items-center gap-3 rounded-2xl border border-border bg-card p-3"
              >
                <div className="h-12 w-12 rounded-xl bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-3/4 rounded bg-muted" />
                  <div className="h-3 w-1/2 rounded bg-muted" />
                </div>
              </div>
            ))
          ) : listings.length > 0 ? (
            listings.slice(0, 5).map((listing) => (
              <button
                key={listing._id}
                onClick={() => router.push(`/listing/${listing._id}`)}
                className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left transition-all active:scale-[0.98]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-bg text-primary">
                  <MapPin size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">
                    {listing.title}
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {listing.location}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-extrabold">${listing.price}</div>
                  <div className="flex items-center gap-1 text-[10px] text-primary">
                    <Leaf size={10} />
                    {listing.carbonSaved}kg
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="py-12 text-center">
              <p className="text-sm text-muted-foreground">
                No materials nearby yet
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
