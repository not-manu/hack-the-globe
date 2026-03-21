import { useRouter } from 'next/router'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import {
  ArrowLeft,
  Leaf,
  MapPin,
  MessageCircle,
  BadgeCheck,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'
import { useAuth } from '@/components/AuthContext'

const CATEGORIES: Record<string, { label: string; icon: string }> = {
  lumber: { label: 'Lumber', icon: '\u{1FAB5}' },
  steel: { label: 'Steel', icon: '\u{1F529}' },
  concrete: { label: 'Concrete', icon: '\u{1F9F1}' },
  brick: { label: 'Brick', icon: '\u{1F3D7}\u{FE0F}' },
  glass: { label: 'Glass', icon: '\u{1FA9F}' },
  pipe: { label: 'Piping', icon: '\u{1F527}' },
  electrical: { label: 'Electrical', icon: '\u{1F4A1}' },
  fixtures: { label: 'Fixtures', icon: '\u{1F6BF}' },
}

export default function ListingDetail() {
  const router = useRouter()
  const { username } = useAuth()
  const { id } = router.query
  const listing = useQuery(
    api.listings.getById,
    id ? { id: id as Id<'listings'> } : 'skip',
  )
  const [showDelete, setShowDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const removeListing = useMutation(api.listings.remove)

  if (listing === undefined) {
    return (
      <div className="animate-pulse space-y-4 p-5">
        <div className="h-48 rounded-2xl bg-muted" />
        <div className="h-5 w-2/3 rounded bg-muted" />
        <div className="h-4 w-1/3 rounded bg-muted" />
      </div>
    )
  }

  if (listing === null) {
    return (
      <div className="flex flex-col items-center justify-center px-5 py-20 text-center">
        <p className="text-sm font-medium text-muted-foreground">
          Listing not found
        </p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          Go back
        </Button>
      </div>
    )
  }

  const isOwner = username && listing.seller === username
  const hasItems = listing.items && listing.items.length > 0
  const itemCount = listing.items?.length ?? 1
  const discount = Math.round((1 - listing.price / listing.originalPrice) * 100)

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <button
          onClick={() => router.back()}
          aria-label="Go back"
          className="flex h-9 w-9 items-center justify-center rounded-full active:bg-muted"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-2">
          {isOwner && (
            <button
              onClick={() => setShowDelete(true)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-destructive active:bg-muted"
              aria-label="Delete"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4 px-5 pb-8">
        {/* Hero image */}
        {(listing.imageUrl || listing.image) && (
          <div className="overflow-hidden rounded-2xl bg-muted">
            <img
              src={listing.imageUrl ?? listing.image}
              alt={listing.title}
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
        )}

        {/* Title + price */}
        <div>
          <h1 className="text-xl font-bold leading-tight">{listing.title}</h1>
          <div className="mt-1.5 flex items-center gap-3">
            <span className="text-2xl font-extrabold">${listing.price}</span>
            {discount > 0 && (
              <>
                <span className="text-sm text-muted-foreground line-through">
                  ${listing.originalPrice}
                </span>
                <Badge variant="default" className="text-[10px]">
                  -{discount}%
                </Badge>
              </>
            )}
          </div>
        </div>

        {/* Quick info row */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <MapPin size={10} />
            {listing.location}
          </Badge>
          <Badge variant="secondary">{listing.condition}</Badge>
          <Badge variant="secondary" className="gap-1 bg-primary/5 text-primary">
            <Leaf size={10} />
            {listing.carbonSaved}kg CO2
          </Badge>
          {hasItems && (
            <Badge variant="secondary">{itemCount} items</Badge>
          )}
        </div>

        {/* Items list (multi-item listing) */}
        {hasItems && (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Items included
            </h3>
            {listing.items!.map((item, i) => {
              const cat = CATEGORIES[item.category]
              const itemDiscount = Math.round((1 - item.price / item.originalPrice) * 100)
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-lg">
                    {cat?.icon ?? '📦'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{item.title}</div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">
                      {cat?.label ?? item.category} · {item.condition}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-sm font-bold">${item.price}</div>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      {itemDiscount > 0 && (
                        <span className="font-medium text-primary">-{itemDiscount}%</span>
                      )}
                      <span className="flex items-center gap-0.5 text-primary">
                        <Leaf size={8} />
                        {item.carbonSaved}kg
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Description (single-item or batch summary) */}
        {!hasItems && listing.description && (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {listing.description}
          </p>
        )}

        {/* Seller */}
        <div className="flex items-center justify-between rounded-xl border border-border bg-card p-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              {listing.seller.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold">{listing.seller}</span>
                {listing.sellerVerified && (
                  <BadgeCheck size={14} className="text-primary" />
                )}
              </div>
              {listing.sellerTransactions > 0 && (
                <div className="text-[11px] text-muted-foreground">
                  {listing.sellerTransactions} sales
                </div>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => router.push(`/chat/${listing._id}`)}
          >
            <MessageCircle size={14} />
            Chat
          </Button>
        </div>

        {/* Action */}
        {!isOwner && (
          <Button
            className="w-full gap-2 py-5 text-base font-bold"
            onClick={() => router.push(`/chat/${listing._id}?intro=1`)}
          >
            <MessageCircle size={16} />
            Contact Seller · ${listing.price}
          </Button>
        )}
      </div>

      {/* Delete confirmation */}
      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm">
          <div className="mx-4 mb-8 w-full max-w-[400px] animate-fade-up rounded-2xl bg-card p-5">
            <div className="mb-1 text-center text-base font-bold">
              Delete listing?
            </div>
            <p className="mb-5 text-center text-sm text-muted-foreground">
              This will permanently remove this listing.
            </p>
            <div className="flex gap-2.5">
              <Button
                variant="outline"
                className="flex-1 py-5"
                onClick={() => setShowDelete(false)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1 gap-2 py-5 font-bold"
                disabled={deleting}
                onClick={async () => {
                  setDeleting(true)
                  await removeListing({ id: listing._id })
                  router.replace('/')
                }}
              >
                <Trash2 size={14} />
                {deleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
