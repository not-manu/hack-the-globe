import { useRouter } from "next/router"
import { useQuery } from "convex/react"
import { api } from "../../convex/_generated/api"
import { MapPin, Leaf, Navigation } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import dynamic from "next/dynamic"
import { useMemo } from "react"

// Leaflet must be client-only (no SSR)
const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import("react-leaflet").then((m) => m.Marker),
  { ssr: false }
)
const Popup = dynamic(
  () => import("react-leaflet").then((m) => m.Popup),
  { ssr: false }
)

// Demo center: Toronto waterfront area
const MAP_CENTER: [number, number] = [43.644333, -79.377941]
const MAP_ZOOM = 13

export default function MapView() {
  const router = useRouter()
  const listings = useQuery(api.listings.list)

  // Build custom icon on client only
  const pinIcon = useMemo(() => {
    if (typeof window === "undefined") return undefined
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const L = require("leaflet")
    return new L.DivIcon({
      className: "",
      html: `<div style="
        width:32px;height:32px;border-radius:50%;
        background:#16a34a;border:3px solid white;
        box-shadow:0 2px 8px rgba(0,0,0,0.3);
        display:flex;align-items:center;justify-content:center;
      "><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -34],
    })
  }, [])

  return (
    <>
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 px-5 pb-3 pt-4 backdrop-blur-lg">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold tracking-tight">Nearby Materials</h1>
          <Badge variant="secondary" className="gap-1 text-xs">
            <Navigation size={10} />
            Toronto
          </Badge>
        </div>
      </div>

      {/* Map */}
      <div className="relative mx-5 mb-4 overflow-hidden rounded-2xl border border-border" style={{ height: "50vh" }}>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          crossOrigin=""
        />
        <MapContainer
          center={MAP_CENTER}
          zoom={MAP_ZOOM}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
          {listings?.map((listing) => (
            <Marker
              key={listing._id}
              position={[listing.lat, listing.lng]}
              icon={pinIcon}
              eventHandlers={{
                click: () => router.push(`/listing/${listing._id}`),
              }}
            >
              <Popup>
                <div style={{ minWidth: 140, fontFamily: "inherit" }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{listing.title}</div>
                  <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>{listing.location}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
                    <span style={{ fontWeight: 800, fontSize: 14 }}>${listing.price}</span>
                    <span style={{ fontSize: 10, color: "#16a34a", display: "flex", alignItems: "center", gap: 2 }}>
                      🌿 {listing.carbonSaved}kg
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Nearby list */}
      <div className="px-5 pb-8">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">
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
            listings.map((listing) => (
              <button
                key={listing._id}
                onClick={() => router.push(`/listing/${listing._id}`)}
                className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left transition-all active:scale-[0.98]"
              >
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-muted">
                  {(listing.imageUrl || listing.image) ? (
                    <img
                      src={listing.imageUrl ?? listing.image}
                      alt={listing.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-primary">
                      <MapPin size={18} />
                    </div>
                  )}
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
