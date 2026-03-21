import { useState, useRef, useCallback, useEffect } from "react"
import { useRouter } from "next/router"
import {
  ArrowLeft,
  Camera,
  X,
  Zap,
  SwitchCamera,
  ImageIcon,
  Leaf,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const CATEGORIES = [
  { id: "lumber", label: "\u{1FAB5} Lumber" },
  { id: "steel", label: "\u{1F529} Steel" },
  { id: "concrete", label: "\u{1F9F1} Concrete" },
  { id: "brick", label: "\u{1F3D7}\u{FE0F} Brick" },
  { id: "glass", label: "\u{1FA9F} Glass" },
  { id: "pipe", label: "\u{1F527} Piping" },
  { id: "electrical", label: "\u{1F4A1} Electrical" },
  { id: "fixtures", label: "\u{1F6BF} Fixtures" },
]

type ScanResult = {
  material: string
  category: string
  condition: string
  confidence: number
  suggestedPrice: string
  description: string
  carbonSaved: number
}

const SCAN_PHRASES = [
  "Identifying material...",
  "Assessing condition...",
  "Estimating price...",
  "Calculating CO2 impact...",
]

export default function PostMaterial() {
  const router = useRouter()
  const [photos, setPhotos] = useState<string[]>([])
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")
  const [price, setPrice] = useState("")
  const [location, setLocation] = useState("")

  const [showCamera, setShowCamera] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [scanError, setScanError] = useState<string | null>(null)
  const [scanPhrase, setScanPhrase] = useState(0)
  const [facingMode, setFacingMode] = useState<"environment" | "user">(
    "environment"
  )
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (router.query.scan === "1") {
      startCamera()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.scan])

  useEffect(() => {
    if (!scanning) return
    const interval = setInterval(() => {
      setScanPhrase((p) => (p + 1) % SCAN_PHRASES.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [scanning])

  const startCamera = useCallback(async () => {
    setScanResult(null)
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
      setScanError("Could not access camera. Try uploading a photo instead.")
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
    const next = facingMode === "environment" ? "user" : "environment"
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
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.drawImage(video, 0, 0)
    const dataUrl = canvas.toDataURL("image/jpeg", 0.8)
    setPhotos((prev) => (prev.length < 3 ? [...prev, dataUrl] : prev))
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
        setPhotos((prev) => (prev.length < 3 ? [...prev, dataUrl] : prev))
        stopCamera()
        await scanImage(dataUrl)
      }
      reader.readAsDataURL(file)
    },
    [stopCamera]
  )

  const scanImage = async (dataUrl: string) => {
    setScanning(true)
    setScanResult(null)
    setScanError(null)
    setScanPhrase(0)
    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Scan failed")
      }
      const data: ScanResult = await res.json()
      setScanResult(data)
      if (data.material) setTitle(data.material)
      if (data.category) setCategory(data.category)
      if (data.suggestedPrice) {
        const num = data.suggestedPrice.replace(/[^0-9.]/g, "")
        if (num) setPrice(num)
      }
    } catch (err) {
      setScanError(
        err instanceof Error ? err.message : "Failed to analyze material"
      )
    } finally {
      setScanning(false)
    }
  }

  const canPost = title && category && price
  const hasStarted = photos.length > 0 || scanning || scanResult

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
        <h1 className="text-lg font-bold">Post Material</h1>
      </div>

      <div className="space-y-5 px-5 pb-8">

        {/* ── Hero: AI Scan CTA ── */}
        {!hasStarted && !showCamera && (
          <div className="animate-fade-up flex flex-col items-center gap-6 pb-2 pt-6">
            <div className="relative">
              <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-primary">
                <Zap size={40} className="text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-green-light ring-4 ring-background" />
            </div>

            <div className="text-center">
              <h2 className="text-2xl font-bold tracking-tight">
                AI Material Scanner
              </h2>
              <p className="mx-auto mt-2 max-w-[260px] text-sm leading-relaxed text-muted-foreground">
                Take a photo to auto-identify, price, and calculate carbon savings.
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

            {/* Scan line */}
            <div className="ai-scan-beam pointer-events-none absolute left-8 right-8 h-[2px] bg-primary/80 shadow-[0_0_16px_2px_rgba(22,163,74,0.35)]" />

            {/* Corners */}
            <div className="absolute left-5 top-5 h-8 w-8 rounded-tl-lg border-l-2 border-t-2 border-white/70" />
            <div className="absolute right-5 top-5 h-8 w-8 rounded-tr-lg border-r-2 border-t-2 border-white/70" />
            <div className="absolute bottom-5 left-5 h-8 w-8 rounded-bl-lg border-b-2 border-l-2 border-white/70" />
            <div className="absolute bottom-5 right-5 h-8 w-8 rounded-br-lg border-b-2 border-r-2 border-white/70" />

            {/* Controls */}
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

        {/* Hidden */}
        <canvas ref={canvasRef} className="hidden" />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* ── Scanning ── */}
        {scanning && (
          <div className="ai-fade-in flex flex-col items-center gap-5 py-8">
            <div className="relative flex h-20 w-20 items-center justify-center">
              <div className="ai-spin absolute inset-0 rounded-full border-2 border-primary/20 border-t-primary" />
              <Zap size={28} className="text-primary" />
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">Analyzing</div>
              <div className="ai-phrase mt-1 text-sm text-muted-foreground" key={scanPhrase}>
                {SCAN_PHRASES[scanPhrase]}
              </div>
            </div>
          </div>
        )}

        {/* ── Error ── */}
        {scanError && (
          <div className="animate-fade-up rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
            {scanError}
          </div>
        )}

        {/* ── Result ── */}
        {scanResult && (
          <div className="ai-fade-in rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <span className="text-xs font-semibold tracking-wide text-primary uppercase">
                AI Result
              </span>
              <span className="text-xs font-bold text-muted-foreground">
                {scanResult.confidence}% match
              </span>
            </div>

            <div className="space-y-4 px-5 py-4">
              <div>
                <h3 className="text-xl font-bold leading-snug">
                  {scanResult.material}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                  {scanResult.description}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-muted/50 px-3 py-3 text-center">
                  <div className="text-sm font-bold">{scanResult.condition}</div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">Condition</div>
                </div>
                <div className="rounded-xl bg-muted/50 px-3 py-3 text-center">
                  <div className="text-sm font-bold">{scanResult.suggestedPrice}</div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">Est. Price</div>
                </div>
                <div className="rounded-xl bg-primary/8 px-3 py-3 text-center">
                  <div className="text-sm font-bold text-primary">{scanResult.carbonSaved}kg</div>
                  <div className="mt-0.5 flex items-center justify-center gap-1 text-[11px] text-primary">
                    <Leaf size={10} />
                    CO2 saved
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Photos ── */}
        {hasStarted && !showCamera && (
          <div className="flex gap-2">
            {photos.map((photo, i) => (
              <div key={i} className="relative h-20 w-20 overflow-hidden rounded-xl">
                <img src={photo} alt="" className="h-full w-full object-cover" />
                <button
                  onClick={() => setPhotos(photos.filter((_, j) => j !== i))}
                  className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/50 text-white"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
            {photos.length < 3 && (
              <>
                <button
                  onClick={startCamera}
                  className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-primary/30 text-primary active:bg-primary/5"
                >
                  <Camera size={16} />
                  <span className="text-[10px] font-medium">Scan</span>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border text-muted-foreground active:bg-muted"
                >
                  <ImageIcon size={16} />
                  <span className="text-[10px] font-medium">Upload</span>
                </button>
              </>
            )}
          </div>
        )}

        {/* ── Form ── */}
        <Input
          placeholder="What are you selling?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="h-11"
        />

        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                category === c.id
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-card text-muted-foreground"
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
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="h-11 flex-1"
          />
          <Input
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="h-11 flex-1"
          />
        </div>

        <Button
          className="w-full py-5"
          disabled={!canPost}
          onClick={() => router.push("/")}
        >
          Post Listing
        </Button>
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
