import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import {
  ArrowLeft,
  Camera,
  X,
  Zap,
  SwitchCamera,
  ImageIcon,
  Leaf,
  Loader2,
  Check,
  Users,
  Clock,
  ChevronRight,
  Plus,
  Minus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FulfillmentBar } from '@/components/FulfillmentBar'
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
  other: { label: 'Other', icon: '\u{1F4E6}' },
}

type DetectedMaterial = {
  id: string
  material: string
  category: string
  condition: string
  confidence: number
  description: string
  carbonSaved: number
  photoUrl: string
}

type MatchedPool = {
  requestId: Id<'requests'>
  title: string
  category: string
  requester: string
  urgency: string
  quantity: number
  fulfilledQuantity: number
  unit: string
  contributeAmount: number
}

type ScanApiResult = {
  items: Array<{
    material: string
    category: string
    condition: string
    confidence: number
    suggestedPrice: string
    description: string
    carbonSaved: number
  }>
}

const SCAN_PHRASES = [
  'Identifying materials...',
  'Matching to open pools...',
  'Assessing condition...',
  'Finding nearby buyers...',
  'Calculating CO2 impact...',
]

let nextId = 1

export default function ScanToSell() {
  const router = useRouter()
  const { username } = useAuth()
  const openRequests = useQuery(api.requests.listOpen)
  const contributeMutation = useMutation(api.contributions.contribute)
  const addToWaitlist = useMutation(api.waitlist.add)

  // Detected materials from scan
  const [materials, setMaterials] = useState<DetectedMaterial[]>([])
  // Matched pools the user can join
  const [pools, setPools] = useState<MatchedPool[]>([])
  // Categories with no pool match (will go to selling hold)
  const [holdCategories, setHoldCategories] = useState<string[]>([])

  // Action state
  const [joining, setJoining] = useState(false)
  const [done, setDone] = useState(false)
  const [results, setResults] = useState<{
    joined: Array<{ title: string; amount: number; unit: string }>
    onHold: string[]
  } | null>(null)

  // Camera state
  const [showCamera, setShowCamera] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [scanError, setScanError] = useState<string | null>(null)
  const [scanPhrase, setScanPhrase] = useState(0)
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment')
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (router.query.scan === '1') startCamera()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.scan])

  useEffect(() => {
    if (!scanning) return
    const iv = setInterval(() => setScanPhrase((p) => (p + 1) % SCAN_PHRASES.length), 1800)
    return () => clearInterval(iv)
  }, [scanning])

  // --- Camera ---
  const startCamera = useCallback(async () => {
    setScanError(null)
    setShowCamera(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
    } catch {
      setScanError('Could not access camera. Try uploading a photo instead.')
    }
  }, [facingMode])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    setShowCamera(false)
  }, [])

  const flipCamera = useCallback(() => {
    const next = facingMode === 'environment' ? 'user' : 'environment'
    setFacingMode(next)
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop())
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: next, width: { ideal: 1280 }, height: { ideal: 960 } }, audio: false })
      .then((stream) => {
        streamRef.current = stream
        if (videoRef.current) videoRef.current.srcObject = stream
      })
      .catch(() => {})
  }, [facingMode])

  const captureAndScan = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
    stopCamera()
    await scanImage(dataUrl)
  }, [stopCamera])

  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onloadend = async () => {
        stopCamera()
        await scanImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    },
    [stopCamera],
  )

  // --- Scan & match ---
  const scanImage = async (dataUrl: string) => {
    setScanning(true)
    setScanError(null)
    setScanPhrase(0)
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: dataUrl }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Scan failed')
      }
      const data: ScanApiResult = await res.json()
      if (!data.items || data.items.length === 0) {
        setScanError('No materials detected. Try a different angle.')
        return
      }

      // Build detected materials
      const detected: DetectedMaterial[] = data.items.map((item) => ({
        id: `m-${nextId++}`,
        material: item.material,
        category: item.category,
        condition: item.condition,
        confidence: item.confidence,
        description: item.description,
        carbonSaved: item.carbonSaved,
        photoUrl: dataUrl,
      }))
      setMaterials(detected)

      // Auto-match to open request pools
      const detectedCategories = [...new Set(detected.map((d) => d.category))]
      const matched: MatchedPool[] = []
      const unmatched: string[] = []

      for (const cat of detectedCategories) {
        const matchingReqs = (openRequests ?? []).filter(
          (r) => r.category === cat && (r.status === 'open' || !r.status),
        )
        if (matchingReqs.length > 0) {
          for (const req of matchingReqs) {
            const remaining = (req.quantity ?? 0) - (req.fulfilledQuantity ?? 0)
            if (remaining > 0) {
              matched.push({
                requestId: req._id,
                title: req.title,
                category: req.category,
                requester: req.requester,
                urgency: req.urgency,
                quantity: req.quantity ?? 0,
                fulfilledQuantity: req.fulfilledQuantity ?? 0,
                unit: req.unit ?? 'pcs',
                contributeAmount: 1, // default
              })
            }
          }
        }
        if (matchingReqs.length === 0 || matchingReqs.every((r) => ((r.quantity ?? 0) - (r.fulfilledQuantity ?? 0)) <= 0)) {
          unmatched.push(cat)
        }
      }

      setPools(matched)
      setHoldCategories(unmatched)
    } catch (err) {
      setScanError(err instanceof Error ? err.message : 'Failed to analyze')
    } finally {
      setScanning(false)
    }
  }

  // Update contribute amount for a pool
  const setPoolAmount = (requestId: Id<'requests'>, amount: number) => {
    setPools((prev) =>
      prev.map((p) => (p.requestId === requestId ? { ...p, contributeAmount: amount } : p)),
    )
  }

  // --- Join all pools + auto-hold ---
  const handleJoinAll = async () => {
    if (!username) return
    setJoining(true)
    const joined: Array<{ title: string; amount: number; unit: string }> = []
    const onHold: string[] = []

    // Contribute to each pool
    for (const pool of pools) {
      if (pool.contributeAmount <= 0) continue
      try {
        await contributeMutation({
          requestId: pool.requestId,
          contributor: username,
          quantity: pool.contributeAmount,
        })
        joined.push({ title: pool.title, amount: pool.contributeAmount, unit: pool.unit })
      } catch (err) {
        console.error('Join pool error:', err)
      }
    }

    // Auto-join waitlist for unmatched categories
    for (const cat of holdCategories) {
      try {
        const mat = materials.find((m) => m.category === cat)
        await addToWaitlist({
          seller: username,
          category: cat,
          material: mat?.material ?? cat,
          quantity: 1,
          unit: 'pcs',
        })
        onHold.push(CATEGORIES[cat]?.label ?? cat)
      } catch (err) {
        console.error('Waitlist error:', err)
      }
    }

    setResults({ joined, onHold })
    setDone(true)
    setJoining(false)
  }

  const totalCarbon = materials.reduce((s, m) => s + m.carbonSaved, 0)

  // ─── Done screen ───
  if (done && results) {
    return (
      <div className="flex min-h-[80dvh] flex-col items-center justify-center gap-5 px-5">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <Check size={36} className="text-primary" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold">You&apos;re in!</h2>
          <p className="mx-auto mt-2 max-w-[260px] text-sm text-muted-foreground">
            {results.joined.length > 0 && results.onHold.length > 0
              ? 'Joined pools and placed on selling hold.'
              : results.joined.length > 0
                ? 'Successfully joined request pools.'
                : 'Placed on selling hold — we\'ll notify you when buyers appear.'}
          </p>
        </div>

        {totalCarbon > 0 && (
          <div className="flex items-center gap-2 rounded-xl bg-primary/5 px-5 py-2.5">
            <Leaf size={16} className="text-primary" />
            <span className="text-sm font-bold text-primary">{totalCarbon}kg CO2 saved</span>
          </div>
        )}

        <div className="w-full max-w-[320px] space-y-2">
          {results.joined.map((j, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 rounded-xl border border-primary/20 bg-primary/5 px-3.5 py-2.5"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Users size={12} className="text-primary" />
              </div>
              <div className="min-w-0 flex-1 text-xs">
                <span className="font-bold text-primary">Joined pool</span>
                <span className="text-muted-foreground"> — contributed {j.amount} {j.unit} to </span>
                <span className="font-semibold text-foreground">{j.title}</span>
              </div>
            </div>
          ))}
          {results.onHold.length > 0 && (
            <div className="flex items-center gap-2.5 rounded-xl border border-border bg-muted/50 px-3.5 py-2.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">
                <Clock size={12} className="text-muted-foreground" />
              </div>
              <div className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Selling hold</span> for{' '}
                {results.onHold.join(', ')} — you&apos;ll be notified when a buyer appears
              </div>
            </div>
          )}
        </div>

        <div className="flex w-full max-w-[280px] gap-2">
          <Button className="flex-1" onClick={() => router.push('/')}>
            Home
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              setDone(false)
              setResults(null)
              setMaterials([])
              setPools([])
              setHoldCategories([])
            }}
          >
            Scan More
          </Button>
        </div>
      </div>
    )
  }

  // ─── Main page ───
  const hasResults = materials.length > 0
  const hasPoolsToJoin = pools.length > 0
  const hasHolds = holdCategories.length > 0

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-4 pb-2">
        <button
          onClick={() => { stopCamera(); router.back() }}
          aria-label="Go back"
          className="flex h-9 w-9 items-center justify-center rounded-full active:bg-muted"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold">Scan to Sell</h1>
          <p className="text-[11px] text-muted-foreground">
            {hasResults
              ? `${materials.length} material${materials.length !== 1 ? 's' : ''} detected`
              : 'Snap a photo to find matching buyers'}
          </p>
        </div>
      </div>

      <div className="space-y-4 px-5 pb-8">

        {/* ── Hero: no scan yet ── */}
        {!hasResults && !showCamera && !scanning && (
          <div className="ai-fade-in flex flex-col items-center gap-5 pb-2 pt-4">
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary">
                <Camera size={36} className="text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-green-light ring-4 ring-background" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold tracking-tight">
                Scan your material
              </h2>
              <p className="mx-auto mt-1.5 max-w-[280px] text-sm text-muted-foreground">
                AI will detect what you have and instantly match you with buyers looking for it.
              </p>
            </div>
            <div className="flex w-full gap-3">
              <Button onClick={startCamera} className="flex-1 gap-2 py-6 text-[15px] font-bold">
                <Camera size={18} />
                Camera
              </Button>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 gap-2 py-6 text-[15px] font-semibold"
              >
                <ImageIcon size={18} />
                Upload
              </Button>
            </div>
          </div>
        )}

        {/* ── Camera ── */}
        {showCamera && (
          <div className="ai-camera-in relative aspect-[3/4] w-full overflow-hidden rounded-3xl bg-black">
            <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
            <div className="ai-scan-beam pointer-events-none absolute left-8 right-8 h-[2px] bg-primary/80 shadow-[0_0_16px_2px_rgba(22,163,74,0.35)]" />
            <div className="absolute left-5 top-5 h-8 w-8 rounded-tl-lg border-l-2 border-t-2 border-white/70" />
            <div className="absolute right-5 top-5 h-8 w-8 rounded-tr-lg border-r-2 border-t-2 border-white/70" />
            <div className="absolute bottom-5 left-5 h-8 w-8 rounded-bl-lg border-b-2 border-l-2 border-white/70" />
            <div className="absolute bottom-5 right-5 h-8 w-8 rounded-br-lg border-b-2 border-r-2 border-white/70" />
            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-6 bg-gradient-to-t from-black/60 to-transparent px-5 pb-7 pt-14">
              <button onClick={flipCamera} className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm active:scale-90" aria-label="Flip camera">
                <SwitchCamera size={18} />
              </button>
              <button onClick={captureAndScan} className="flex h-[68px] w-[68px] items-center justify-center rounded-full border-[3px] border-white active:scale-95" aria-label="Capture">
                <span className="flex h-[54px] w-[54px] items-center justify-center rounded-full bg-primary">
                  <Zap size={24} className="text-white" />
                </span>
              </button>
              <button onClick={stopCamera} className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm active:scale-90" aria-label="Close">
                <X size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Hidden */}
        <canvas ref={canvasRef} className="hidden" />
        <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileUpload} className="hidden" />

        {/* ── Scanning ── */}
        {scanning && (
          <div className="ai-fade-in flex flex-col items-center gap-4 py-8">
            <div className="relative flex h-16 w-16 items-center justify-center">
              <div className="ai-spin absolute inset-0 rounded-full border-2 border-primary/20 border-t-primary" />
              <Zap size={24} className="text-primary" />
            </div>
            <div className="text-center">
              <div className="text-base font-bold">Analyzing & matching</div>
              <div className="ai-phrase mt-1 text-sm text-muted-foreground" key={scanPhrase}>
                {SCAN_PHRASES[scanPhrase]}
              </div>
            </div>
          </div>
        )}

        {/* ── Error ── */}
        {scanError && (
          <div className="ai-fade-in rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {scanError}
            <button onClick={() => setScanError(null)} className="ml-2 text-xs font-medium underline">
              Dismiss
            </button>
          </div>
        )}

        {/* ── Detected materials ── */}
        {hasResults && !scanning && (
          <>
            {/* Material summary strip */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {materials.map((m) => {
                const cat = CATEGORIES[m.category]
                return (
                  <div
                    key={m.id}
                    className="ai-fade-in flex shrink-0 items-center gap-2 rounded-xl border border-border bg-card px-3 py-2"
                  >
                    {m.photoUrl && (
                      <div className="h-8 w-8 shrink-0 overflow-hidden rounded-md bg-muted">
                        <img src={m.photoUrl} alt="" className="h-full w-full object-cover" />
                      </div>
                    )}
                    <div>
                      <div className="truncate text-xs font-semibold" style={{ maxWidth: 120 }}>
                        {m.material}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <span>{cat?.icon}</span>
                        <span>{cat?.label ?? m.category}</span>
                        <span className="text-border">&middot;</span>
                        <span>{m.condition}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* ── Matching pools to join ── */}
            {hasPoolsToJoin && (
              <div className="space-y-2.5">
                <h3 className="flex items-center gap-2 text-sm font-bold">
                  <Users size={14} className="text-primary" />
                  Matching Pools ({pools.length})
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Buyers looking for what you have. Tap Join All to contribute.
                </p>

                {pools.map((pool) => {
                  const cat = CATEGORIES[pool.category]
                  const remaining = pool.quantity - pool.fulfilledQuantity
                  return (
                    <div
                      key={pool.requestId}
                      className="ai-fade-in overflow-hidden rounded-xl border border-primary/20 bg-card"
                    >
                      <div className="p-3.5">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-lg">
                            {cat?.icon ?? '\u{1F4E6}'}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-semibold">{pool.title}</div>
                            <div className="mt-0.5 text-[11px] text-muted-foreground">
                              {pool.requester} needs {remaining} {pool.unit} more
                            </div>
                          </div>
                          <Badge
                            variant={pool.urgency === 'Urgent' ? 'destructive' : pool.urgency === 'This week' ? 'default' : 'secondary'}
                            className="shrink-0 text-[10px]"
                          >
                            {pool.urgency}
                          </Badge>
                        </div>

                        {/* Fulfillment bar */}
                        <div className="mt-3">
                          <FulfillmentBar
                            fulfilled={pool.fulfilledQuantity}
                            total={pool.quantity}
                            unit={pool.unit}
                            size="compact"
                          />
                        </div>
                      </div>

                      {/* Contribute amount */}
                      <div className="flex items-center justify-between border-t border-primary/10 bg-primary/5 px-3.5 py-2">
                        <span className="text-[11px] font-medium text-primary">Your contribution</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setPoolAmount(pool.requestId, Math.max(1, pool.contributeAmount - 1))}
                            className="flex h-6 w-6 items-center justify-center rounded-md border border-primary/20 text-primary"
                          >
                            <Minus size={10} />
                          </button>
                          <span className="min-w-[40px] text-center text-sm font-bold">
                            {pool.contributeAmount} {pool.unit}
                          </span>
                          <button
                            onClick={() => setPoolAmount(pool.requestId, Math.min(remaining, pool.contributeAmount + 1))}
                            className="flex h-6 w-6 items-center justify-center rounded-md border border-primary/20 text-primary"
                          >
                            <Plus size={10} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* ── Selling hold items ── */}
            {hasHolds && (
              <div className="space-y-2">
                <h3 className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
                  <Clock size={14} />
                  Selling Hold
                </h3>
                {holdCategories.map((cat) => {
                  const c = CATEGORIES[cat]
                  const mat = materials.find((m) => m.category === cat)
                  return (
                    <div
                      key={cat}
                      className="ai-fade-in flex items-center gap-3 rounded-xl border border-dashed border-border bg-muted/30 px-3.5 py-3"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-base">
                        {c?.icon ?? '\u{1F4E6}'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-xs font-semibold">
                          {mat?.material ?? c?.label ?? cat}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          No active pools — you&apos;ll be notified when a buyer appears
                        </div>
                      </div>
                      <Clock size={14} className="shrink-0 text-muted-foreground" />
                    </div>
                  )
                })}
              </div>
            )}

            {/* ── No pools AND no holds (shouldn't happen, but safety) ── */}
            {!hasPoolsToJoin && !hasHolds && (
              <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                No matching request pools found. Try scanning different materials.
              </div>
            )}

            {/* ── Scan more ── */}
            <div className="flex gap-2">
              <Button variant="outline" onClick={startCamera} className="flex-1 gap-2">
                <Camera size={16} />
                Scan more
              </Button>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 gap-2"
              >
                <ImageIcon size={16} />
                Upload
              </Button>
            </div>

            {/* ── Join All button ── */}
            <Button
              className="w-full gap-2 py-5 text-[15px] font-bold"
              disabled={joining || (!hasPoolsToJoin && !hasHolds)}
              onClick={handleJoinAll}
            >
              {joining ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Joining pools...
                </span>
              ) : hasPoolsToJoin ? (
                <>
                  <Zap size={16} />
                  Join {pools.length} Pool{pools.length !== 1 ? 's' : ''}
                  {hasHolds && (
                    <span className="text-xs opacity-70">+ {holdCategories.length} on hold</span>
                  )}
                  <ChevronRight size={14} />
                </>
              ) : (
                <>
                  <Clock size={16} />
                  Go on Selling Hold
                  <ChevronRight size={14} />
                </>
              )}
            </Button>
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes scan-beam {
          0%, 100% { top: 15%; }
          50% { top: 80%; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes phrase {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes camera-in {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }
        .ai-scan-beam { animation: scan-beam 2.5s ease-in-out infinite; }
        .ai-spin { animation: spin 1s linear infinite; }
        .ai-fade-in { animation: fade-in 0.35s ease-out both; }
        .ai-phrase { animation: phrase 0.25s ease-out both; }
        .ai-camera-in { animation: camera-in 0.3s ease-out both; }
      `}</style>
    </>
  )
}
