import { useState, useRef, useCallback, useEffect } from "react"
import { useRouter } from "next/router"
import {
  ArrowLeft,
  Camera,
  X,
  Zap,
  CheckCircle2,
  Leaf,
  SwitchCamera,
  ImageIcon,
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

export default function PostMaterial() {
  const router = useRouter()
  const [photos, setPhotos] = useState<string[]>([])
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")
  const [price, setPrice] = useState("")
  const [location, setLocation] = useState("")

  // Camera & scanning state
  const [showCamera, setShowCamera] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [scanError, setScanError] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<"environment" | "user">(
    "environment"
  )
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Auto-open camera when navigated from /scan
  useEffect(() => {
    if (router.query.scan === "1") {
      startCamera()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.scan])

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
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
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
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
    }
    // Restart with new facing mode
    navigator.mediaDevices
      .getUserMedia({
        video: {
          facingMode: next,
          width: { ideal: 1280 },
          height: { ideal: 960 },
        },
        audio: false,
      })
      .then((stream) => {
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      })
      .catch(() => {
        /* ignore flip errors */
      })
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
    // Add to photos
    setPhotos((prev) => (prev.length < 3 ? [...prev, dataUrl] : prev))

    // Stop camera and scan
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

      // Auto-fill form fields from AI result
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

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-4 pb-2">
        <button
          onClick={() => {
            stopCamera()
            router.back()
          }}
          aria-label="Go back"
          className="flex h-9 w-9 items-center justify-center rounded-full active:bg-muted"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold">Post Material</h1>
      </div>

      <div className="space-y-5 px-5 pb-8">
        {/* Camera viewport */}
        {showCamera && (
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-3xl bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover"
            />

            {/* Corner brackets */}
            <div className="absolute left-4 top-4 h-8 w-8 rounded-tl-lg border-l-2 border-t-2 border-primary/60" />
            <div className="absolute right-4 top-4 h-8 w-8 rounded-tr-lg border-r-2 border-t-2 border-primary/60" />
            <div className="absolute bottom-4 left-4 h-8 w-8 rounded-bl-lg border-b-2 border-l-2 border-primary/60" />
            <div className="absolute bottom-4 right-4 h-8 w-8 rounded-br-lg border-b-2 border-r-2 border-primary/60" />

            {/* Camera controls */}
            <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-4">
              <button
                onClick={flipCamera}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm"
                aria-label="Flip camera"
              >
                <SwitchCamera size={18} />
              </button>
              <button
                onClick={captureAndScan}
                className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-primary shadow-lg"
                aria-label="Capture and scan"
              >
                <Zap size={24} className="text-white" />
              </button>
              <button
                onClick={stopCamera}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm"
                aria-label="Close camera"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Photos + add button */}
        {!showCamera && (
          <div className="flex gap-2">
            {photos.map((photo, i) => (
              <div
                key={i}
                className="relative h-20 w-20 overflow-hidden rounded-xl"
              >
                <img
                  src={photo}
                  alt=""
                  className="h-full w-full object-cover"
                />
                <button
                  onClick={() => setPhotos(photos.filter((_, j) => j !== i))}
                  className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/50 text-white"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
            {photos.length < 3 && (
              <div className="flex gap-2">
                <button
                  onClick={startCamera}
                  className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 text-primary active:bg-primary/10"
                >
                  <Camera size={18} />
                  <span className="text-[10px] font-medium">AI Scan</span>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border text-muted-foreground active:bg-muted"
                >
                  <ImageIcon size={18} />
                  <span className="text-[10px] font-medium">Upload</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Scanning indicator */}
        {scanning && (
          <div className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4">
            <div className="relative flex h-10 w-10 items-center justify-center">
              <Zap size={20} className="animate-pulse text-primary" />
              <div className="absolute inset-0 animate-ping rounded-full border-2 border-primary/30" />
            </div>
            <div>
              <div className="text-sm font-bold text-primary">
                AI Analyzing...
              </div>
              <div className="text-xs text-muted-foreground">
                Identifying material, condition &amp; pricing
              </div>
            </div>
          </div>
        )}

        {/* Scan error */}
        {scanError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
            {scanError}
          </div>
        )}

        {/* Scan result */}
        {scanResult && (
          <div className="animate-fade-up space-y-3 rounded-2xl border border-green-bg-dark bg-green-bg p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-primary" />
              <span className="text-sm font-bold text-green-dark">
                Material Identified
              </span>
              <span className="ml-auto text-xs font-semibold text-primary">
                {scanResult.confidence}% match
              </span>
            </div>
            <div>
              <div className="text-base font-bold">{scanResult.material}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">
                {scanResult.description}
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>
                Condition:{" "}
                <strong className="text-foreground">
                  {scanResult.condition}
                </strong>
              </span>
              <span>
                Price:{" "}
                <strong className="text-foreground">
                  {scanResult.suggestedPrice}
                </strong>
              </span>
            </div>
            {scanResult.carbonSaved > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-primary">
                <Leaf size={12} />
                <span>
                  ~{scanResult.carbonSaved} kg CO2 saved by reusing
                </span>
              </div>
            )}
          </div>
        )}

        {/* Title */}
        <Input
          placeholder="What are you selling?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="h-10"
        />

        {/* Category */}
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

        {/* Price + Location side by side */}
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Price ($)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="h-10 flex-1"
          />
          <Input
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="h-10 flex-1"
          />
        </div>

        {/* Post */}
        <Button
          className="w-full py-5"
          disabled={!canPost}
          onClick={() => router.push("/")}
        >
          Post
        </Button>
      </div>
    </>
  )
}
