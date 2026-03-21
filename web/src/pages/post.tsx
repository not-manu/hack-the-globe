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
  ChevronDown,
  ChevronUp,
  Trash2,
  Users,
  Check,
  Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/components/AuthContext'

const CATEGORIES = [
  { id: 'lumber', label: '\u{1FAB5} Lumber' },
  { id: 'steel', label: '\u{1F529} Steel' },
  { id: 'concrete', label: '\u{1F9F1} Concrete' },
  { id: 'brick', label: '\u{1F3D7}\u{FE0F} Brick' },
  { id: 'glass', label: '\u{1FA9F} Glass' },
  { id: 'pipe', label: '\u{1F527} Piping' },
  { id: 'electrical', label: '\u{1F4A1} Electrical' },
  { id: 'fixtures', label: '\u{1F6BF} Fixtures' },
]

type ScannedItem = {
  id: string
  material: string
  category: string
  condition: string
  confidence: number
  suggestedPrice: string
  description: string
  carbonSaved: number
  photoUrl: string | null
  // editable overrides
  editTitle: string
  editPrice: string
  editCategory: string
  editLocation: string
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
  'Detecting multiple items...',
  'Assessing condition...',
  'Estimating prices...',
  'Calculating CO2 impact...',
]

let nextItemId = 1

export default function PostMaterial() {
  const router = useRouter()
  const { username } = useAuth()
  const requests = useQuery(api.requests.list)
  const generateUploadUrl = useMutation(api.listings.generateUploadUrl)
  const createListing = useMutation(api.listings.create)

  // Batch state
  const [items, setItems] = useState<ScannedItem[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [posting, setPosting] = useState(false)
  const [posted, setPosted] = useState(false)
  const [location, setLocation] = useState('')

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
    if (router.query.scan === '1') {
      startCamera()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.scan])

  useEffect(() => {
    if (!scanning) return
    const interval = setInterval(() => {
      setScanPhrase((p) => (p + 1) % SCAN_PHRASES.length)
    }, 1800)
    return () => clearInterval(interval)
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
    if (streamRef.current)
      streamRef.current.getTracks().forEach((t) => t.stop())
    navigator.mediaDevices
      .getUserMedia({
        video: { facingMode: next, width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      })
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
        const dataUrl = reader.result as string
        stopCamera()
        await scanImage(dataUrl)
      }
      reader.readAsDataURL(file)
    },
    [stopCamera],
  )

  // --- Scan ---
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
      if (data.items && data.items.length > 0) {
        const newItems: ScannedItem[] = data.items.map((item) => ({
          id: `item-${nextItemId++}`,
          ...item,
          photoUrl: dataUrl,
          editTitle: item.material,
          editPrice: item.suggestedPrice.replace(/[^0-9.]/g, ''),
          editCategory: item.category,
          editLocation: location || '',
        }))
        setItems((prev) => [...prev, ...newItems])
      } else {
        setScanError('No materials detected in this photo. Try a different angle.')
      }
    } catch (err) {
      setScanError(
        err instanceof Error ? err.message : 'Failed to analyze materials',
      )
    } finally {
      setScanning(false)
    }
  }

  // --- Item management ---
  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
    if (expandedId === id) setExpandedId(null)
  }

  const updateItem = (id: string, updates: Partial<ScannedItem>) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, ...updates } : i)),
    )
  }

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  // --- Match counting ---
  const getMatchCount = (category: string) => {
    if (!requests) return 0
    return requests.filter((r) => r.category === category).length
  }

  // --- Post all ---
  const totalPrice = items.reduce((sum, i) => sum + (parseFloat(i.editPrice) || 0), 0)
  const totalCarbon = items.reduce((sum, i) => sum + i.carbonSaved, 0)
  const canPost = items.length > 0 && items.every((i) => i.editTitle && i.editCategory && i.editPrice) && !posting

  const handlePostAll = async () => {
    if (!canPost) return
    setPosting(true)
    try {
      // Upload all unique photos to Convex storage
      const allStorageIds: Id<'_storage'>[] = []
      const uploadedUrls = new Set<string>()
      for (const item of items) {
        if (item.photoUrl && !uploadedUrls.has(item.photoUrl)) {
          uploadedUrls.add(item.photoUrl)
          const blob = await dataUrlToBlob(item.photoUrl)
          const uploadUrl = await generateUploadUrl()
          const res = await fetch(uploadUrl, {
            method: 'POST',
            headers: { 'Content-Type': blob.type },
            body: blob,
          })
          const { storageId } = await res.json()
          allStorageIds.push(storageId)
        }
      }

      // Build items array for the listing
      const listingItems = items.map((item) => ({
        title: item.editTitle,
        category: item.editCategory,
        price: parseFloat(item.editPrice) || 0,
        originalPrice: Math.round((parseFloat(item.editPrice) || 0) * 1.6),
        condition: item.condition,
        description: item.description,
        carbonSaved: item.carbonSaved,
      }))

      // Determine primary category (most common)
      const catCounts: Record<string, number> = {}
      listingItems.forEach((i) => { catCounts[i.category] = (catCounts[i.category] || 0) + 1 })
      const primaryCategory = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? items[0].editCategory

      // Create ONE listing with all items
      const listingTitle = items.length === 1
        ? items[0].editTitle
        : `${items.length} surplus materials`

      await createListing({
        title: listingTitle,
        category: primaryCategory,
        price: totalPrice,
        condition: items[0].condition,
        description: items.length === 1
          ? items[0].description
          : `Batch of ${items.length} materials: ${items.map((i) => i.editTitle).join(', ')}`,
        location: location || items[0].editLocation || 'Toronto, ON',
        carbonSaved: totalCarbon,
        images: allStorageIds,
        seller: username ?? 'Anonymous',
        items: listingItems,
      })

      setPosted(true)
    } catch (err) {
      console.error('Failed to post listing:', err)
      setScanError('Failed to post listing. Please try again.')
    } finally {
      setPosting(false)
    }
  }

  // --- Success screen ---
  if (posted) {
    return (
      <div className="flex min-h-[80dvh] flex-col items-center justify-center gap-6 px-5">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <Check size={36} className="text-primary" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold">
            Listing posted!
          </h2>
          <p className="mt-1 text-sm font-medium text-foreground">
            {items.length} item{items.length !== 1 ? 's' : ''} listed
          </p>
          <p className="mx-auto mt-2 max-w-[260px] text-sm text-muted-foreground">
            Matching with nearby buyers. You&apos;ll be notified when someone&apos;s interested.
          </p>
        </div>
        <div className="flex items-center gap-4 rounded-xl bg-primary/5 px-6 py-3">
          <div className="text-center">
            <div className="text-lg font-bold">${totalPrice.toFixed(0)}</div>
            <div className="text-[10px] text-muted-foreground">Total value</div>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="text-center">
            <div className="text-lg font-bold text-primary">{totalCarbon}kg</div>
            <div className="flex items-center gap-1 text-[10px] text-primary">
              <Leaf size={9} />
              CO2 saved
            </div>
          </div>
        </div>
        <Button onClick={() => router.push('/')} className="w-full max-w-[240px]">
          Back to Home
        </Button>
      </div>
    )
  }

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
          <h1 className="text-lg font-bold">List Surplus</h1>
          {items.length > 0 && (
            <p className="text-[11px] text-muted-foreground">
              {items.length} item{items.length !== 1 ? 's' : ''} · ~${totalPrice.toFixed(0)} · {totalCarbon}kg CO2
            </p>
          )}
        </div>
      </div>

      <div className="space-y-4 px-5 pb-8">

        {/* ── Hero: when no items yet and not scanning ── */}
        {items.length === 0 && !showCamera && !scanning && (
          <div className="ai-fade-in flex flex-col items-center gap-5 pb-2 pt-4">
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary">
                <Zap size={36} className="text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-green-light ring-4 ring-background" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold tracking-tight">
                Scan your surplus
              </h2>
              <p className="mx-auto mt-1.5 max-w-[280px] text-sm text-muted-foreground">
                Take a photo and AI will detect every material — add them all to your batch in one go.
              </p>
            </div>
            <div className="flex w-full gap-3">
              <Button
                onClick={startCamera}
                className="flex-1 gap-2 py-6 text-[15px] font-bold"
              >
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
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover"
            />
            <div className="ai-scan-beam pointer-events-none absolute left-8 right-8 h-[2px] bg-primary/80 shadow-[0_0_16px_2px_rgba(22,163,74,0.35)]" />
            <div className="absolute left-5 top-5 h-8 w-8 rounded-tl-lg border-l-2 border-t-2 border-white/70" />
            <div className="absolute right-5 top-5 h-8 w-8 rounded-tr-lg border-r-2 border-t-2 border-white/70" />
            <div className="absolute bottom-5 left-5 h-8 w-8 rounded-bl-lg border-b-2 border-l-2 border-white/70" />
            <div className="absolute bottom-5 right-5 h-8 w-8 rounded-br-lg border-b-2 border-r-2 border-white/70" />
            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-6 bg-gradient-to-t from-black/60 to-transparent px-5 pb-7 pt-14">
              <button
                onClick={flipCamera}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm active:scale-90"
                aria-label="Flip camera"
              >
                <SwitchCamera size={18} />
              </button>
              <button
                onClick={captureAndScan}
                className="flex h-[68px] w-[68px] items-center justify-center rounded-full border-[3px] border-white active:scale-95"
                aria-label="Capture and scan"
              >
                <span className="flex h-[54px] w-[54px] items-center justify-center rounded-full bg-primary">
                  <Zap size={24} className="text-white" />
                </span>
              </button>
              <button
                onClick={stopCamera}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm active:scale-90"
                aria-label="Close camera"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Hidden elements */}
        <canvas ref={canvasRef} className="hidden" />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* ── Scanning animation ── */}
        {scanning && (
          <div className="ai-fade-in flex flex-col items-center gap-4 py-8">
            <div className="relative flex h-16 w-16 items-center justify-center">
              <div className="ai-spin absolute inset-0 rounded-full border-2 border-primary/20 border-t-primary" />
              <Zap size={24} className="text-primary" />
            </div>
            <div className="text-center">
              <div className="text-base font-bold">Analyzing photo</div>
              <div className="ai-phrase mt-1 text-sm text-muted-foreground" key={scanPhrase}>
                {SCAN_PHRASES[scanPhrase]}
              </div>
            </div>
          </div>
        )}

        {/* ── Error ── */}
        {scanError && (
          <div className="ai-fade-in rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
            {scanError}
            <button
              onClick={() => setScanError(null)}
              className="ml-2 text-xs font-medium underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* ── Item list ── */}
        {items.length > 0 && (
          <div className="space-y-2.5">
            {items.map((item, index) => {
              const isExpanded = expandedId === item.id
              const matchCount = getMatchCount(item.editCategory)
              const catLabel = CATEGORIES.find((c) => c.id === item.editCategory)?.label ?? item.editCategory

              return (
                <div
                  key={item.id}
                  className="ai-fade-in overflow-hidden rounded-xl border border-border bg-card"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  {/* Card header */}
                  <button
                    onClick={() => toggleExpand(item.id)}
                    className="flex w-full items-center gap-3 p-3 text-left"
                  >
                    {/* Thumbnail */}
                    {item.photoUrl && (
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                        <img
                          src={item.photoUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold">
                        {item.editTitle}
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span>{catLabel}</span>
                        <span className="text-border">·</span>
                        <span>{item.condition}</span>
                        <span className="text-border">·</span>
                        <span className="font-medium text-foreground">
                          ${item.editPrice || '0'}
                        </span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {matchCount > 0 && (
                        <Badge variant="default" className="gap-1 text-[10px]">
                          <Users size={10} />
                          {matchCount}
                        </Badge>
                      )}
                      <div className="flex items-center gap-1 text-xs text-primary">
                        <Leaf size={10} />
                        {item.carbonSaved}kg
                      </div>
                      {isExpanded ? (
                        <ChevronUp size={14} className="text-muted-foreground" />
                      ) : (
                        <ChevronDown size={14} className="text-muted-foreground" />
                      )}
                    </div>
                  </button>

                  {/* Expanded edit */}
                  {isExpanded && (
                    <div className="space-y-3 border-t border-border px-3 pb-3 pt-3">
                      {/* AI description */}
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        {item.description}
                      </p>

                      {/* Confidence & match */}
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px]">
                          {item.confidence}% confidence
                        </Badge>
                        {matchCount > 0 ? (
                          <Badge variant="default" className="gap-1 text-[10px]">
                            <Users size={10} />
                            {matchCount} buyer{matchCount !== 1 ? 's' : ''} looking
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px]">
                            No buyers yet
                          </Badge>
                        )}
                      </div>

                      {/* Edit fields */}
                      <Input
                        placeholder="Title"
                        value={item.editTitle}
                        onChange={(e) => updateItem(item.id, { editTitle: e.target.value })}
                        className="h-9 text-sm"
                      />
                      <div className="flex flex-wrap gap-1.5">
                        {CATEGORIES.map((c) => (
                          <button
                            key={c.id}
                            onClick={() => updateItem(item.id, { editCategory: c.id })}
                            className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                              item.editCategory === c.id
                                ? 'bg-primary text-primary-foreground'
                                : 'border border-border bg-card text-muted-foreground'
                            }`}
                          >
                            {c.label}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="Price ($)"
                          value={item.editPrice}
                          onChange={(e) => updateItem(item.id, { editPrice: e.target.value })}
                          className="h-9 flex-1 text-sm"
                        />
                        <Input
                          placeholder="Location"
                          value={item.editLocation}
                          onChange={(e) => updateItem(item.id, { editLocation: e.target.value })}
                          className="h-9 flex-1 text-sm"
                        />
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="flex items-center gap-1.5 text-xs font-medium text-destructive"
                      >
                        <Trash2 size={12} />
                        Remove from batch
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* ── Scan more + Location ── */}
        {items.length > 0 && !showCamera && !scanning && (
          <div className="space-y-3">
            {/* Scan more */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={startCamera}
                className="flex-1 gap-2"
              >
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

            {/* Global location */}
            <Input
              placeholder="Default location for all items"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="h-10"
            />

            {/* Summary bar */}
            <div className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <div className="text-base font-bold">{items.length}</div>
                  <div className="text-[10px] text-muted-foreground">items</div>
                </div>
                <div className="h-6 w-px bg-border" />
                <div className="text-center">
                  <div className="text-base font-bold">${totalPrice.toFixed(0)}</div>
                  <div className="text-[10px] text-muted-foreground">value</div>
                </div>
                <div className="h-6 w-px bg-border" />
                <div className="text-center">
                  <div className="text-base font-bold text-primary">{totalCarbon}kg</div>
                  <div className="flex items-center gap-0.5 text-[10px] text-primary">
                    <Leaf size={8} />
                    CO2
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users size={12} />
                {items.reduce((sum, i) => sum + getMatchCount(i.editCategory), 0)} matches
              </div>
            </div>

            {/* Post all */}
            <Button
              className="w-full gap-2 py-5 text-[15px] font-bold"
              disabled={!canPost}
              onClick={handlePostAll}
            >
              {posting ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Posting...
                </span>
              ) : (
                <>
                  <Plus size={16} />
                  Post {items.length} Item{items.length !== 1 ? 's' : ''} · ${totalPrice.toFixed(0)}
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes scan-beam {
          0%, 100% { top: 15%; }
          50% { top: 80%; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
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
        .ai-scan-beam {
          animation: scan-beam 2.5s ease-in-out infinite;
        }
        .ai-spin {
          animation: spin 1s linear infinite;
        }
        .ai-fade-in {
          animation: fade-in 0.35s ease-out both;
        }
        .ai-phrase {
          animation: phrase 0.25s ease-out both;
        }
        .ai-camera-in {
          animation: camera-in 0.3s ease-out both;
        }
      `}</style>
    </>
  )
}

function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  return fetch(dataUrl).then((r) => r.blob())
}
