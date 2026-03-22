import { useState } from 'react'
import { useRouter } from 'next/router'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import {
  ArrowLeft,
  Users,
  Clock,
  Loader2,
  Plus,
  Minus,
  Check,
  Package,
  Leaf,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FulfillmentBar } from '@/components/FulfillmentBar'
import { useAuth } from '@/components/AuthContext'

const CATEGORIES: Record<string, { label: string; img: string }> = {
  lumber: { label: 'Lumber', img: 'https://images.unsplash.com/photo-1520333789090-1afc82db536a?w=400&h=400&fit=crop' },
  steel: { label: 'Steel', img: 'https://images.unsplash.com/photo-1530982011887-3cc11cc85693?w=400&h=400&fit=crop' },
  concrete: { label: 'Concrete', img: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop' },
  brick: { label: 'Brick', img: 'https://images.unsplash.com/photo-1590075865003-e48277faa558?w=400&h=400&fit=crop' },
  glass: { label: 'Glass', img: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=400&h=400&fit=crop' },
  pipe: { label: 'Piping', img: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&h=400&fit=crop' },
  electrical: { label: 'Electrical', img: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=400&fit=crop' },
  fixtures: { label: 'Fixtures', img: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&h=400&fit=crop' },
  other: { label: 'Other', img: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=400&fit=crop' },
}

export default function RequestDetail() {
  const router = useRouter()
  const { username } = useAuth()
  const { id } = router.query
  const requestId = id as Id<'requests'> | undefined

  const request = useQuery(
    api.requests.getById,
    requestId ? { id: requestId } : 'skip',
  )
  const contributions = useQuery(
    api.contributions.listByRequest,
    requestId ? { requestId } : 'skip',
  )
  const contribute = useMutation(api.contributions.contribute)

  const [amount, setAmount] = useState(1)
  const [note, setNote] = useState('')
  const [contributing, setContributing] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [justContributed, setJustContributed] = useState(false)

  if (!requestId) return null

  if (request === undefined) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (request === null) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-5">
        <Package size={32} className="text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Request not found</p>
        <Button variant="outline" size="sm" onClick={() => router.push('/')}>
          Go Home
        </Button>
      </div>
    )
  }

  const cat = CATEGORIES[request.category]
  const qty = request.quantity ?? 0
  const fulfilledQty = request.fulfilledQuantity ?? 0
  const unitLabel = request.unit ?? 'pcs'
  const remaining = qty - fulfilledQty
  const isFulfilled = request.status === 'fulfilled'

  const handleContribute = async () => {
    if (!username || contributing || amount <= 0) return
    setContributing(true)
    try {
      await contribute({
        requestId: requestId!,
        contributor: username,
        quantity: amount,
        note: note.trim() || undefined,
      })
      setShowForm(false)
      setJustContributed(true)
      setAmount(1)
      setNote('')
      setTimeout(() => setJustContributed(false), 3000)
    } catch (err) {
      console.error('Contribute error:', err)
    } finally {
      setContributing(false)
    }
  }

  const adjustAmount = (delta: number) => {
    setAmount((prev) => Math.max(1, Math.min(prev + delta, remaining)))
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex shrink-0 items-center gap-3 border-b border-border/50 px-5 pt-4 pb-3">
        <button
          onClick={() => router.back()}
          aria-label="Go back"
          className="flex h-9 w-9 items-center justify-center rounded-full active:bg-muted"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-bold">Request Pool</h1>
          <p className="text-[11px] text-muted-foreground">
            Contribute materials to fill this request
          </p>
        </div>
        <Badge
          variant={isFulfilled ? 'default' : 'secondary'}
          className="shrink-0"
        >
          {isFulfilled ? 'Fulfilled' : 'Open'}
        </Badge>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-5 px-5 py-5">
          {/* Request info card */}
          <div className="animate-fade-up overflow-hidden rounded-2xl border border-border bg-card">
            {/* Category hero image */}
            <div className="relative h-40 overflow-hidden bg-muted">
              <img
                src={cat?.img ?? CATEGORIES.other.img}
                alt={cat?.label ?? request.category}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute bottom-3 left-4 right-4">
                <h2 className="text-[17px] font-bold leading-tight text-white">
                  {request.title}
                </h2>
                <div className="mt-1 flex items-center gap-2 text-[11px] text-white/70">
                  <span className="font-medium text-white/90">{cat?.label ?? request.category}</span>
                  <span>&middot;</span>
                  <span>{request.budget || 'Flexible'}</span>
                  <span>&middot;</span>
                  <span>by {request.requester}</span>
                </div>
              </div>
              <div className="absolute right-3 top-3">
                <Badge
                  variant={
                    request.urgency === 'Urgent'
                      ? 'destructive'
                      : request.urgency === 'This week'
                        ? 'default'
                        : 'secondary'
                  }
                  className="text-[10px]"
                >
                  <Clock size={9} className="mr-0.5" />
                  {request.urgency}
                </Badge>
              </div>
            </div>

            {/* Fulfillment bar */}
            <div className="px-4 py-4">
              <FulfillmentBar
                fulfilled={fulfilledQty}
                total={qty}
                unit={unitLabel}
                size="full"
              />
            </div>
          </div>

          {/* Contributors */}
          <div className="animate-fade-up stagger-1">
            <div className="mb-3 flex items-center gap-2">
              <Users size={14} className="text-muted-foreground" />
              <h3 className="text-sm font-bold">
                Contributors
                {contributions && contributions.length > 0 && (
                  <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                    ({contributions.length})
                  </span>
                )}
              </h3>
            </div>

            {contributions === undefined ? (
              <div className="space-y-2">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse rounded-xl border border-border bg-card p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-muted" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 w-24 rounded bg-muted" />
                        <div className="h-2.5 w-16 rounded bg-muted" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : contributions.length > 0 ? (
              <div className="space-y-2">
                {contributions.map((c) => {
                  const cPct =
                    qty > 0
                      ? Math.round((c.quantity / qty) * 100)
                      : 0
                  return (
                    <div
                      key={c._id}
                      className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                        {c.contributor.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-semibold">
                            {c.contributor}
                          </span>
                          {c.contributor === username && (
                            <Badge
                              variant="outline"
                              className="h-4 px-1 text-[8px]"
                            >
                              You
                            </Badge>
                          )}
                        </div>
                        {c.note && (
                          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                            {c.note}
                          </p>
                        )}
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="text-sm font-bold text-primary">
                          +{c.quantity} {unitLabel}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {cPct}% of total
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border p-6 text-center">
                <Leaf size={24} className="mx-auto text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  No contributions yet — be the first!
                </p>
              </div>
            )}
          </div>

          {/* Carbon impact estimate */}
          <div className="animate-fade-up stagger-2 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-3.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-100">
              <Leaf size={18} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-green-800">
                Estimated Carbon Impact
              </p>
              <p className="text-[11px] text-green-700">
                Fulfilling this request saves ~
                <span className="font-bold">
                  {Math.round(qty * 2.5)} kg CO2
                </span>{' '}
                vs buying new
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom contribute bar */}
      {!isFulfilled && (
        <div
          className="shrink-0 border-t border-border bg-background px-5 py-4"
          style={{ paddingBottom: 'calc(16px + var(--safe-bottom))' }}
        >
          {justContributed ? (
            <div className="flex items-center justify-center gap-2 rounded-xl bg-green-50 py-3 text-sm font-bold text-green-700">
              <Check size={16} />
              Contribution added!
            </div>
          ) : showForm ? (
            <div className="space-y-3">
              {/* Quantity stepper */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-muted-foreground">
                  Quantity
                </span>
                <div className="flex flex-1 items-center justify-center gap-2">
                  <button
                    onClick={() => adjustAmount(-1)}
                    disabled={amount <= 1}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-colors hover:bg-muted disabled:opacity-30"
                  >
                    <Minus size={14} />
                  </button>
                  <div className="min-w-[80px] text-center">
                    <span className="text-xl font-bold">{amount}</span>
                    <span className="ml-1 text-xs text-muted-foreground">
                      {unitLabel}
                    </span>
                  </div>
                  <button
                    onClick={() => adjustAmount(1)}
                    disabled={amount >= remaining}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-colors hover:bg-muted disabled:opacity-30"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <button
                  onClick={() => setAmount(remaining)}
                  className="text-[10px] font-medium text-primary"
                >
                  Max ({remaining})
                </button>
              </div>

              {/* Note input */}
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note (optional)"
                className="h-9 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/20"
              />

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowForm(false)
                    setAmount(1)
                    setNote('')
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 gap-1.5"
                  disabled={contributing || amount <= 0}
                  onClick={handleContribute}
                >
                  {contributing ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Contributing...
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      Contribute {amount} {unitLabel}
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <Button
              className="w-full gap-2 py-6 text-base font-bold"
              onClick={() => setShowForm(true)}
            >
              <Plus size={18} />
              Contribute to this Request
              <Badge variant="secondary" className="ml-1 bg-white/20 text-white">
                {remaining} {unitLabel} needed
              </Badge>
            </Button>
          )}
        </div>
      )}

      {isFulfilled && (
        <div
          className="shrink-0 border-t border-border bg-amber-50 px-5 py-4 text-center"
          style={{ paddingBottom: 'calc(16px + var(--safe-bottom))' }}
        >
          <p className="text-sm font-bold text-amber-700">
            This request has been fully fulfilled!
          </p>
        </div>
      )}
    </div>
  )
}
