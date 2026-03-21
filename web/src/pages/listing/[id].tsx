import { useRouter } from "next/router"
import { useQuery } from "convex/react"
import { api } from "../../../convex/_generated/api"
import type { Id } from "../../../convex/_generated/dataModel"
import {
  ArrowLeft,
  Heart,
  Share2,
  MapPin,
  Leaf,
  Clock,
  Package,
  MessageCircle,
  BadgeCheck,
  CreditCard,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"

export default function ListingDetail() {
  const router = useRouter()
  const { id } = router.query
  const listing = useQuery(
    api.listings.getById,
    id ? { id: id as Id<"listings"> } : "skip"
  )
  const [saved, setSaved] = useState(false)

  if (listing === undefined) {
    return (
      <div className="animate-pulse space-y-4 p-5">
        <div className="h-60 rounded-2xl bg-muted" />
        <div className="h-5 w-2/3 rounded bg-muted" />
        <div className="h-4 w-1/3 rounded bg-muted" />
        <div className="h-8 w-1/4 rounded bg-muted" />
      </div>
    )
  }

  if (listing === null) {
    return (
      <div className="flex flex-col items-center justify-center px-5 py-20 text-center">
        <p className="text-sm font-medium text-muted-foreground">
          Material not found
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.back()}
        >
          Go back
        </Button>
      </div>
    )
  }

  const discount = Math.round(
    (1 - listing.price / listing.originalPrice) * 100
  )

  return (
    <div className="animate-fade-in">
      {/* Hero image */}
      <div className="relative h-64 overflow-hidden bg-muted">
        {listing.image && (
          <img
            src={listing.image}
            alt={listing.title}
            className="h-full w-full object-cover"
          />
        )}

        {/* Top bar */}
        <div className="absolute inset-x-0 top-0 flex justify-between p-3">
          <button
            onClick={() => router.back()}
            aria-label="Go back"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-foreground backdrop-blur-md"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex gap-2">
            <button
              aria-label={saved ? "Unsave" : "Save"}
              onClick={() => setSaved(!saved)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur-md"
            >
              <Heart
                size={16}
                fill={saved ? "#ef4444" : "none"}
                className={saved ? "text-red-500" : "text-foreground"}
              />
            </button>
            <button
              aria-label="Share"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-foreground backdrop-blur-md"
            >
              <Share2 size={16} />
            </button>
          </div>
        </div>

        {/* Discount badge */}
        {discount > 0 && (
          <div className="absolute bottom-3 left-3 rounded-full bg-primary px-3 py-1 text-sm font-bold text-primary-foreground">
            Save {discount}%
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-5 p-5">
        {/* Badges */}
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary">{listing.condition}</Badge>
          <Badge variant="secondary" className="gap-1 bg-green-bg text-primary">
            <Leaf size={10} />
            {listing.carbonSaved}kg CO2 saved
          </Badge>
        </div>

        {/* Title & Price */}
        <div>
          <h1 className="text-xl font-extrabold leading-tight tracking-tight">
            {listing.title}
          </h1>
          <div className="mt-2 flex items-baseline gap-2.5">
            <span className="text-2xl font-extrabold">${listing.price}</span>
            <span className="text-sm text-muted-foreground line-through">
              ${listing.originalPrice}
            </span>
            <span className="text-sm font-bold text-primary">
              Save ${listing.originalPrice - listing.price}
            </span>
          </div>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: Package, label: "Quantity", value: listing.quantity },
            { icon: MapPin, label: "Location", value: listing.location },
            { icon: Clock, label: "Condition", value: listing.condition },
            { icon: Leaf, label: "CO2 Saved", value: `${listing.carbonSaved}kg` },
          ].map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="rounded-xl bg-muted/50 p-3"
            >
              <div className="mb-0.5 flex items-center gap-1.5">
                <Icon size={12} className="text-muted-foreground" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {label}
                </span>
              </div>
              <div className="text-sm font-semibold">{value}</div>
            </div>
          ))}
        </div>

        {/* Description */}
        <div>
          <h3 className="mb-1.5 text-sm font-bold text-muted-foreground">
            Description
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {listing.description}
          </p>
        </div>

        {/* Seller card */}
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-bg text-base font-bold text-primary">
                {listing.seller.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold">{listing.seller}</span>
                  {listing.sellerVerified && (
                    <BadgeCheck
                      size={16}
                      className="text-primary"
                    />
                  )}
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {listing.sellerTransactions} sales
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" className="gap-1.5">
              <MessageCircle size={14} />
              Chat
            </Button>
          </div>
        </div>

        {/* Carbon impact */}
        <div className="rounded-2xl border border-green-bg-dark bg-green-bg p-5 text-center">
          <Leaf size={20} className="mx-auto mb-1.5 text-primary" />
          <div className="text-3xl font-extrabold text-primary">
            {listing.carbonSaved} kg
          </div>
          <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-green-dark">
            CO2 Emissions Prevented
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2.5 pb-4">
          <Button className="flex-[2] gap-2 py-6 text-base font-bold">
            <CreditCard size={16} />
            Buy Now - ${listing.price}
          </Button>
          <Button variant="outline" className="flex-1 gap-2 py-6">
            <MessageCircle size={16} />
            Offer
          </Button>
        </div>
      </div>
    </div>
  )
}
