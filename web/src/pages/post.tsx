import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
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
  Sparkles,
  ScanLine,
  Shield,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FulfillmentBar } from '@/components/FulfillmentBar'
import { useAuth } from '@/components/AuthContext'

const CATEGORIES: Record<string, { label: string; img: string }> = {
  lumber: { label: 'Lumber', img: 'https://images.unsplash.com/photo-1520333789090-1afc82db536a?w=200&h=200&fit=crop' },
  steel: { label: 'Steel', img: 'https://images.unsplash.com/photo-1530982011887-3cc11cc85693?w=200&h=200&fit=crop' },
  concrete: { label: 'Concrete', img: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=200&fit=crop' },
  brick: { label: 'Brick', img: 'https://images.unsplash.com/photo-1590075865003-e48277faa558?w=200&h=200&fit=crop' },
  glass: { label: 'Glass', img: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=200&h=200&fit=crop' },
  pipe: { label: 'Piping', img: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=200&h=200&fit=crop' },
  electrical: { label: 'Electrical', img: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=200&h=200&fit=crop' },
  fixtures: { label: 'Fixtures', img: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=200&h=200&fit=crop' },
  other: { label: 'Other', img: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=200&h=200&fit=crop' },
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
  'Running object detection...',
  'Classifying materials...',
  'Analyzing condition & grade...',
  'Cross-referencing buyer pools...',
  'Estimating carbon offset...',
]

let nextId = 1

export default function ScanToSell() {
  const router = useRouter()
  const { username } = useAuth()
  const openRequests = useQuery(api.requests.listOpen)
  const contributeMutation = useMutation(api.contributions.contribute)
  const addToWaitlist = useMutation(api.waitlist.add)

  const [materials, setMaterials] = useState<DetectedMaterial[]>([])
  const [contributeAmounts, setContributeAmounts] = useState<Record<string, number>>({})
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null)

  const { pools, holdCategories } = useMemo(() => {
    if (materials.length === 0) return { pools: [] as MatchedPool[], holdCategories: [] as string[] }
    const reqs = openRequests ?? []
    const detectedCategories = [...new Set(materials.map((d) => d.category))]
    const matched: MatchedPool[] = []
    const unmatched: string[] = []
    for (const cat of detectedCategories) {
      const matchingReqs = reqs.filter((r) => r.category === cat && (r.status === 'open' || !r.status))
      let hasOpenPool = false
      for (const req of matchingReqs) {
        const remaining = (req.quantity ?? 0) - (req.fulfilledQuantity ?? 0)
        if (remaining > 0) {
          hasOpenPool = true
          matched.push({
            requestId: req._id, title: req.title, category: req.category,
            requester: req.requester, urgency: req.urgency,
            quantity: req.quantity ?? 0, fulfilledQuantity: req.fulfilledQuantity ?? 0,
            unit: req.unit ?? 'pcs', contributeAmount: contributeAmounts[req._id] ?? 1,
          })
        }
      }
      if (!hasOpenPool) unmatched.push(cat)
    }
    return { pools: matched, holdCategories: unmatched }
  }, [materials, openRequests, contributeAmounts])

  const [joining, setJoining] = useState(false)
  const [done, setDone] = useState(false)
  const [results, setResults] = useState<{
    joined: Array<{ title: string; amount: number; unit: string }>
    onHold: string[]
  } | null>(null)

  const [showCamera, setShowCamera] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [scanError, setScanError] = useState<string | null>(null)
  const [scanPhrase, setScanPhrase] = useState(0)
  const [lastPhotoUrl, setLastPhotoUrl] = useState<string | null>(null)
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
    const iv = setInterval(() => setScanPhrase((p) => (p + 1) % SCAN_PHRASES.length), 1400)
    return () => clearInterval(iv)
  }, [scanning])

  // Auto-select first material after detection
  useEffect(() => {
    if (materials.length > 0 && !selectedMaterial) {
      setSelectedMaterial(materials[0].id)
    }
  }, [materials, selectedMaterial])

  const startCamera = useCallback(async () => {
    setScanError(null); setShowCamera(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 960 } }, audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
    } catch { setScanError('Could not access camera.') }
  }, [facingMode])

  const stopCamera = useCallback(() => {
    if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null }
    setShowCamera(false)
  }, [])

  const flipCamera = useCallback(() => {
    const next = facingMode === 'environment' ? 'user' : 'environment'
    setFacingMode(next)
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop())
    navigator.mediaDevices.getUserMedia({ video: { facingMode: next, width: { ideal: 1280 }, height: { ideal: 960 } }, audio: false })
      .then((s) => { streamRef.current = s; if (videoRef.current) videoRef.current.srcObject = s })
      .catch(() => {})
  }, [facingMode])

  const captureAndScan = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current; const canvas = canvasRef.current
    canvas.width = video.videoWidth; canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d'); if (!ctx) return
    ctx.drawImage(video, 0, 0)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
    stopCamera(); setLastPhotoUrl(dataUrl)
    await scanImage(dataUrl)
  }, [stopCamera])

  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]; if (!file) return
      const reader = new FileReader()
      reader.onloadend = async () => {
        const dataUrl = reader.result as string
        stopCamera(); setLastPhotoUrl(dataUrl)
        await scanImage(dataUrl)
      }
      reader.readAsDataURL(file)
    }, [stopCamera],
  )

  const scanImage = async (dataUrl: string) => {
    setScanning(true); setScanError(null); setScanPhrase(0); setSelectedMaterial(null)
    try {
      const res = await fetch('/api/scan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image: dataUrl }) })
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Scan failed') }
      const data: ScanApiResult = await res.json()
      if (!data.items || data.items.length === 0) { setScanError('No materials detected. Try a different angle.'); return }
      setMaterials(data.items.map((item) => ({
        id: `m-${nextId++}`, material: item.material, category: item.category,
        condition: item.condition, confidence: item.confidence,
        description: item.description, carbonSaved: item.carbonSaved, photoUrl: dataUrl,
      })))
    } catch (err) { setScanError(err instanceof Error ? err.message : 'Failed to analyze') }
    finally { setScanning(false) }
  }

  const setPoolAmount = (requestId: Id<'requests'>, amount: number) => {
    setContributeAmounts((prev) => ({ ...prev, [requestId]: amount }))
  }

  const handleJoinAll = async () => {
    if (!username) return
    setJoining(true)
    const joined: Array<{ title: string; amount: number; unit: string }> = []
    const onHold: string[] = []
    for (const pool of pools) {
      if (pool.contributeAmount <= 0) continue
      try {
        await contributeMutation({ requestId: pool.requestId, contributor: username, quantity: pool.contributeAmount })
        joined.push({ title: pool.title, amount: pool.contributeAmount, unit: pool.unit })
      } catch (err) { console.error('Join pool error:', err) }
    }
    for (const cat of holdCategories) {
      try {
        const mat = materials.find((m) => m.category === cat)
        await addToWaitlist({ seller: username, category: cat, material: mat?.material ?? cat, quantity: 1, unit: 'pcs' })
        onHold.push(CATEGORIES[cat]?.label ?? cat)
      } catch (err) { console.error('Waitlist error:', err) }
    }
    setResults({ joined, onHold }); setDone(true); setJoining(false)
  }

  const totalCarbon = materials.reduce((s, m) => s + m.carbonSaved, 0)
  const activeMaterial = materials.find((m) => m.id === selectedMaterial) ?? materials[0]

  // ─── Done ───
  if (done && results) {
    return (
      <div className="flex min-h-[80dvh] flex-col items-center justify-center gap-5 px-5">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <Check size={36} className="text-primary" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold">You&apos;re in!</h2>
          <p className="mx-auto mt-2 max-w-[260px] text-sm text-muted-foreground">
            {results.joined.length > 0 && results.onHold.length > 0 ? 'Joined pools and placed on selling hold.'
              : results.joined.length > 0 ? 'Successfully joined request pools.'
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
            <div key={i} className="flex items-center gap-2.5 rounded-xl border border-primary/20 bg-primary/5 px-3.5 py-2.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10"><Users size={12} className="text-primary" /></div>
              <div className="min-w-0 flex-1 text-xs">
                <span className="font-bold text-primary">Joined pool</span>
                <span className="text-muted-foreground"> — {j.amount} {j.unit} to </span>
                <span className="font-semibold text-foreground">{j.title}</span>
              </div>
            </div>
          ))}
          {results.onHold.length > 0 && (
            <div className="flex items-center gap-2.5 rounded-xl border border-border bg-muted/50 px-3.5 py-2.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted"><Clock size={12} className="text-muted-foreground" /></div>
              <div className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Selling hold</span> for {results.onHold.join(', ')}
              </div>
            </div>
          )}
        </div>
        <div className="flex w-full max-w-[280px] flex-col gap-2">
          <div className="flex gap-2">
            <Button className="flex-1" onClick={() => router.push('/')}>Home</Button>
            <Button variant="outline" className="flex-1" onClick={() => { setDone(false); setResults(null); setMaterials([]); setContributeAmounts({}); setLastPhotoUrl(null); setSelectedMaterial(null) }}>Scan More</Button>
          </div>
          {results.onHold.length > 0 && (
            <Button variant="outline" className="w-full gap-1.5" onClick={() => router.push('/hold')}><Clock size={14} />View Selling Hold</Button>
          )}
        </div>
      </div>
    )
  }

  // ─── Main ───
  const hasResults = materials.length > 0
  const hasPoolsToJoin = pools.length > 0
  const hasHolds = holdCategories.length > 0

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-4 pb-2">
        <button onClick={() => { stopCamera(); router.back() }} aria-label="Go back" className="flex h-9 w-9 items-center justify-center rounded-full active:bg-muted">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold">AI Scanner</h1>
          <p className="text-[11px] text-muted-foreground">
            {hasResults ? `${materials.length} object${materials.length !== 1 ? 's' : ''} identified` : 'Computer vision material detection'}
          </p>
        </div>
        {hasResults && (
          <Badge variant="secondary" className="gap-1 text-[10px]">
            <Sparkles size={9} />
            AI Detected
          </Badge>
        )}
      </div>

      <div className="space-y-4 px-5 pb-8">

        {/* ── Hero: no scan yet ── */}
        {!hasResults && !showCamera && !scanning && (
          <div className="ai-fade-in space-y-5 pt-2">
            {/* Dark hero card */}
            <div className="relative overflow-hidden rounded-2xl bg-neutral-900 p-6">
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
              <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-primary/5 blur-xl" />
              <div className="relative space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 backdrop-blur-sm">
                    <ScanLine size={24} className="text-primary" />
                  </div>
                  <div>
                    <div className="text-[15px] font-bold text-white">Material Detection</div>
                    <div className="text-xs text-neutral-400">Powered by Gemini Vision AI</div>
                  </div>
                </div>
                <div className="space-y-2 text-xs text-neutral-400">
                  <div className="flex items-center gap-2">
                    <div className="h-px flex-1 bg-neutral-700" />
                    <span className="text-[10px] uppercase tracking-wider text-neutral-500">Capabilities</span>
                    <div className="h-px flex-1 bg-neutral-700" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 rounded-lg bg-white/5 px-2.5 py-2">
                      <Zap size={11} className="text-primary" />
                      <span>Multi-object detection</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg bg-white/5 px-2.5 py-2">
                      <Shield size={11} className="text-primary" />
                      <span>Condition grading</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg bg-white/5 px-2.5 py-2">
                      <Users size={11} className="text-primary" />
                      <span>Instant pool match</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg bg-white/5 px-2.5 py-2">
                      <Leaf size={11} className="text-primary" />
                      <span>CO2 estimation</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex w-full gap-3">
              <Button onClick={startCamera} className="flex-1 gap-2 py-6 text-[15px] font-bold">
                <Camera size={18} /> Camera
              </Button>
              <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="flex-1 gap-2 py-6 text-[15px] font-semibold">
                <ImageIcon size={18} /> Upload
              </Button>
            </div>
          </div>
        )}

        {/* ── Camera ── */}
        {showCamera && (
          <div className="ai-camera-in relative aspect-[3/4] w-full overflow-hidden rounded-3xl bg-black">
            <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
            <div className="ai-scan-beam pointer-events-none absolute left-8 right-8 h-[2px] bg-primary/80 shadow-[0_0_16px_2px_rgba(22,163,74,0.35)]" />
            {/* Corner brackets */}
            <div className="absolute left-5 top-5 h-8 w-8 rounded-tl-lg border-l-2 border-t-2 border-primary/60" />
            <div className="absolute right-5 top-5 h-8 w-8 rounded-tr-lg border-r-2 border-t-2 border-primary/60" />
            <div className="absolute bottom-20 left-5 h-8 w-8 rounded-bl-lg border-b-2 border-l-2 border-primary/60" />
            <div className="absolute bottom-20 right-5 h-8 w-8 rounded-br-lg border-b-2 border-r-2 border-primary/60" />
            {/* Top HUD */}
            <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/40 px-3 py-1 backdrop-blur-sm">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
              <span className="text-[10px] font-medium text-white/80">LIVE</span>
            </div>
            {/* Controls */}
            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-6 bg-gradient-to-t from-black/70 to-transparent px-5 pb-7 pt-16">
              <button onClick={flipCamera} className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm active:scale-90"><SwitchCamera size={18} /></button>
              <button onClick={captureAndScan} className="flex h-[68px] w-[68px] items-center justify-center rounded-full border-[3px] border-primary active:scale-95">
                <span className="flex h-[54px] w-[54px] items-center justify-center rounded-full bg-primary"><Zap size={24} className="text-white" /></span>
              </button>
              <button onClick={stopCamera} className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm active:scale-90"><X size={18} /></button>
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
        <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileUpload} className="hidden" />

        {/* ── Scanning overlay ── */}
        {scanning && lastPhotoUrl && (
          <div className="ai-fade-in relative overflow-hidden rounded-2xl">
            {/* Show the captured photo with scanning overlay */}
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
              <img src={lastPhotoUrl} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-black/50" />
              <div className="ai-scan-beam pointer-events-none absolute left-6 right-6 h-[2px] bg-primary shadow-[0_0_20px_4px_rgba(22,163,74,0.4)]" />
              {/* Grid overlay */}
              <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(22,163,74,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(22,163,74,0.06) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
              {/* Center status */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <div className="relative flex h-16 w-16 items-center justify-center">
                  <div className="ai-spin absolute inset-0 rounded-full border-2 border-primary/30 border-t-primary" />
                  <Zap size={22} className="text-primary" />
                </div>
                <div className="rounded-full bg-black/60 px-4 py-1.5 backdrop-blur-sm">
                  <div className="ai-phrase text-xs font-medium text-white" key={scanPhrase}>{SCAN_PHRASES[scanPhrase]}</div>
                </div>
              </div>
              {/* Corner brackets */}
              <div className="absolute left-4 top-4 h-6 w-6 rounded-tl border-l-2 border-t-2 border-primary/70" />
              <div className="absolute right-4 top-4 h-6 w-6 rounded-tr border-r-2 border-t-2 border-primary/70" />
              <div className="absolute bottom-4 left-4 h-6 w-6 rounded-bl border-b-2 border-l-2 border-primary/70" />
              <div className="absolute bottom-4 right-4 h-6 w-6 rounded-br border-b-2 border-r-2 border-primary/70" />
            </div>
          </div>
        )}

        {scanning && !lastPhotoUrl && (
          <div className="ai-fade-in flex flex-col items-center gap-4 py-10">
            <div className="relative flex h-16 w-16 items-center justify-center">
              <div className="ai-spin absolute inset-0 rounded-full border-2 border-primary/20 border-t-primary" />
              <Zap size={24} className="text-primary" />
            </div>
            <div className="text-center">
              <div className="text-sm font-bold">Processing</div>
              <div className="ai-phrase mt-1 text-xs text-muted-foreground" key={scanPhrase}>{SCAN_PHRASES[scanPhrase]}</div>
            </div>
          </div>
        )}

        {/* ── Error ── */}
        {scanError && (
          <div className="ai-fade-in rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {scanError}
            <button onClick={() => setScanError(null)} className="ml-2 text-xs font-medium underline">Dismiss</button>
          </div>
        )}

        {/* ══════════ AI DETECTION RESULTS ══════════ */}
        {hasResults && !scanning && (
          <>
            {/* ── Hero: scanned photo with detection overlays ── */}
            <div className="ai-fade-in relative overflow-hidden rounded-2xl">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                <img src={lastPhotoUrl ?? materials[0]?.photoUrl} alt="" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />

                {/* Detection badge pills floating on image */}
                <div className="absolute left-3 right-3 top-3 flex flex-wrap gap-1.5">
                  {materials.map((m, i) => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMaterial(m.id)}
                      className={`det-pill flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold backdrop-blur-md transition-all ${
                        selectedMaterial === m.id
                          ? 'bg-primary text-white shadow-lg shadow-primary/30'
                          : 'bg-black/40 text-white/90 hover:bg-black/60'
                      }`}
                      style={{ animationDelay: `${i * 120}ms` }}
                    >
                      <Sparkles size={9} />
                      {m.material}
                      <span className="ml-0.5 opacity-60">{m.confidence}%</span>
                    </button>
                  ))}
                </div>

                {/* Bottom info overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-1.5 text-[10px] text-primary">
                        <Sparkles size={10} />
                        <span className="font-semibold uppercase tracking-wider">AI Detection</span>
                      </div>
                      <div className="mt-1 text-lg font-bold text-white">
                        {materials.length} Material{materials.length !== 1 ? 's' : ''} Found
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full bg-primary/20 px-3 py-1 backdrop-blur-sm">
                      <Leaf size={10} className="text-primary" />
                      <span className="text-xs font-bold text-primary">{totalCarbon}kg CO2</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Selected material detail card ── */}
            {activeMaterial && (
              <div className="ai-fade-in overflow-hidden rounded-2xl border border-border bg-card">
                <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-2.5">
                  <ScanLine size={12} className="text-primary" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Detection Details</span>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-[15px] font-bold">{activeMaterial.material}</h3>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{CATEGORIES[activeMaterial.category]?.label ?? activeMaterial.category}</span>
                        <span className="text-border">&middot;</span>
                        <span>{activeMaterial.condition}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1">
                      <Sparkles size={10} className="text-primary" />
                      <span className="text-xs font-bold text-primary">{activeMaterial.confidence}%</span>
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {activeMaterial.description}
                  </p>
                  <div className="flex gap-2">
                    <div className="flex-1 rounded-lg bg-muted/50 px-3 py-2 text-center">
                      <div className="text-xs font-bold">{activeMaterial.condition}</div>
                      <div className="text-[10px] text-muted-foreground">Condition</div>
                    </div>
                    <div className="flex-1 rounded-lg bg-muted/50 px-3 py-2 text-center">
                      <div className="text-xs font-bold text-primary">{activeMaterial.carbonSaved}kg</div>
                      <div className="text-[10px] text-muted-foreground">CO2 Saved</div>
                    </div>
                    <div className="flex-1 rounded-lg bg-muted/50 px-3 py-2 text-center">
                      <div className="text-xs font-bold">{activeMaterial.confidence}%</div>
                      <div className="text-[10px] text-muted-foreground">Confidence</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Material selector (if multiple) ── */}
            {materials.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {materials.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMaterial(m.id)}
                    className={`flex shrink-0 items-center gap-2.5 rounded-xl border px-3 py-2.5 transition-all ${
                      selectedMaterial === m.id
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border bg-card'
                    }`}
                  >
                    <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-muted">
                      <img src={CATEGORIES[m.category]?.img ?? CATEGORIES.other.img} alt="" className="h-full w-full object-cover" />
                    </div>
                    <div className="text-left">
                      <div className="truncate text-xs font-semibold" style={{ maxWidth: 100 }}>{m.material}</div>
                      <div className="text-[10px] text-muted-foreground">{m.confidence}% match</div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* ── Matching pools ── */}
            {hasPoolsToJoin && (
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-border" />
                  <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <Users size={10} />
                    {pools.length} Matching Pool{pools.length !== 1 ? 's' : ''}
                  </span>
                  <div className="h-px flex-1 bg-border" />
                </div>

                {pools.map((pool) => {
                  const cat = CATEGORIES[pool.category]
                  const remaining = pool.quantity - pool.fulfilledQuantity
                  return (
                    <div key={pool.requestId} className="ai-fade-in overflow-hidden rounded-2xl border border-primary/20 bg-card">
                      <div className="p-3.5">
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                            <img src={cat?.img ?? CATEGORIES.other.img} alt="" className="h-full w-full object-cover" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-bold">{pool.title}</div>
                            <div className="mt-0.5 text-[11px] text-muted-foreground">{pool.requester} needs {remaining} {pool.unit} more</div>
                          </div>
                          <Badge variant={pool.urgency === 'Urgent' ? 'destructive' : pool.urgency === 'This week' ? 'default' : 'secondary'} className="shrink-0 text-[10px]">{pool.urgency}</Badge>
                        </div>
                        <div className="mt-3"><FulfillmentBar fulfilled={pool.fulfilledQuantity} total={pool.quantity} unit={pool.unit} size="compact" /></div>
                      </div>
                      <div className="flex items-center justify-between border-t border-primary/10 bg-primary/5 px-3.5 py-2">
                        <span className="text-[11px] font-medium text-primary">Your contribution</span>
                        <div className="flex items-center gap-2">
                          <button onClick={() => setPoolAmount(pool.requestId, Math.max(1, pool.contributeAmount - 1))} className="flex h-6 w-6 items-center justify-center rounded-md border border-primary/20 text-primary"><Minus size={10} /></button>
                          <span className="min-w-[40px] text-center text-sm font-bold">{pool.contributeAmount} {pool.unit}</span>
                          <button onClick={() => setPoolAmount(pool.requestId, Math.min(remaining, pool.contributeAmount + 1))} className="flex h-6 w-6 items-center justify-center rounded-md border border-primary/20 text-primary"><Plus size={10} /></button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* ── Selling hold ── */}
            {hasHolds && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-border" />
                  <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <Clock size={10} />Selling Hold
                  </span>
                  <div className="h-px flex-1 bg-border" />
                </div>
                {holdCategories.map((cat) => {
                  const c = CATEGORIES[cat]; const mat = materials.find((m) => m.category === cat)
                  return (
                    <div key={cat} className="ai-fade-in flex items-center gap-3 rounded-xl border border-dashed border-border bg-muted/30 px-3.5 py-3">
                      <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-muted">
                        <img src={c?.img ?? CATEGORIES.other.img} alt="" className="h-full w-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-xs font-semibold">{mat?.material ?? c?.label ?? cat}</div>
                        <div className="text-[10px] text-muted-foreground">No pools yet — auto-notified when available</div>
                      </div>
                      <Clock size={14} className="shrink-0 text-muted-foreground" />
                    </div>
                  )
                })}
              </div>
            )}

            {!hasPoolsToJoin && !hasHolds && (
              <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">No matching pools found.</div>
            )}

            {/* ── Actions ── */}
            <div className="flex gap-2">
              <Button variant="outline" onClick={startCamera} className="flex-1 gap-2"><Camera size={16} />Rescan</Button>
              <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="flex-1 gap-2"><ImageIcon size={16} />Upload</Button>
            </div>

            <Button className="w-full gap-2 py-5 text-[15px] font-bold" disabled={joining || (!hasPoolsToJoin && !hasHolds)} onClick={handleJoinAll}>
              {joining ? (
                <span className="flex items-center gap-2"><Loader2 size={16} className="animate-spin" />Joining...</span>
              ) : hasPoolsToJoin ? (
                <><Zap size={16} />Join {pools.length} Pool{pools.length !== 1 ? 's' : ''}{hasHolds && <span className="text-xs opacity-70">+ {holdCategories.length} on hold</span>}<ChevronRight size={14} /></>
              ) : (
                <><Clock size={16} />Go on Selling Hold<ChevronRight size={14} /></>
              )}
            </Button>
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes scan-beam { 0%, 100% { top: 10%; } 50% { top: 85%; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fade-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes phrase { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes camera-in { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: scale(1); } }
        @keyframes det-appear { from { opacity: 0; transform: scale(0.8) translateY(-4px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .ai-scan-beam { animation: scan-beam 2.2s ease-in-out infinite; }
        .ai-spin { animation: spin 1s linear infinite; }
        .ai-fade-in { animation: fade-in 0.4s ease-out both; }
        .ai-phrase { animation: phrase 0.25s ease-out both; }
        .ai-camera-in { animation: camera-in 0.3s ease-out both; }
        .det-pill { animation: det-appear 0.35s ease-out both; }
      `}</style>
    </>
  )
}
