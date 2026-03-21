import { useState } from "react"
import { useRouter } from "next/router"
import { ArrowLeft, Camera, Zap, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ScanMaterial() {
  const router = useRouter()
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<{
    material: string
    category: string
    condition: string
    confidence: number
  } | null>(null)

  const startScan = () => {
    setScanning(true)
    setResult(null)

    // Mock scan result after delay
    setTimeout(() => {
      setScanning(false)
      setResult({
        material: "Douglas Fir 2x4 Lumber",
        category: "lumber",
        condition: "Good",
        confidence: 94,
      })
    }, 3000)
  }

  return (
    <>
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 px-5 pb-3 pt-4 backdrop-blur-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            aria-label="Go back"
            className="flex h-9 w-9 items-center justify-center rounded-full transition-colors active:bg-muted"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-bold tracking-tight">AI Scanner</h1>
        </div>
      </div>

      <div className="flex flex-col items-center px-5 pb-8">
        {/* Camera viewport */}
        <div className="relative mb-6 aspect-[3/4] w-full overflow-hidden rounded-3xl bg-muted">
          {/* Placeholder camera view */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Camera size={48} strokeWidth={1} />
            <span className="text-sm font-medium">Camera preview</span>
          </div>

          {/* Scan line animation */}
          {scanning && (
            <div
              className="absolute left-4 right-4 h-0.5 bg-primary shadow-[0_0_12px_rgba(22,163,74,0.5)]"
              style={{
                animation: "scan 2s ease-in-out infinite",
              }}
            />
          )}

          {/* Corner brackets */}
          <div className="absolute left-4 top-4 h-8 w-8 border-l-2 border-t-2 border-primary/60 rounded-tl-lg" />
          <div className="absolute right-4 top-4 h-8 w-8 border-r-2 border-t-2 border-primary/60 rounded-tr-lg" />
          <div className="absolute bottom-4 left-4 h-8 w-8 border-b-2 border-l-2 border-primary/60 rounded-bl-lg" />
          <div className="absolute bottom-4 right-4 h-8 w-8 border-b-2 border-r-2 border-primary/60 rounded-br-lg" />
        </div>

        {/* Result */}
        {result && (
          <div className="animate-fade-up mb-6 w-full space-y-3 rounded-2xl border border-green-bg-dark bg-green-bg p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-primary" />
              <span className="text-sm font-bold text-green-dark">
                Material Identified
              </span>
              <span className="ml-auto text-xs font-semibold text-primary">
                {result.confidence}% match
              </span>
            </div>
            <div>
              <div className="text-base font-bold">{result.material}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">
                Category: {result.category} / Condition: {result.condition}
              </div>
            </div>
            <Button
              className="w-full"
              onClick={() => router.push("/post")}
            >
              Create Listing
            </Button>
          </div>
        )}

        {/* Scan button */}
        {!result && (
          <Button
            className="w-full gap-2 py-6 text-base font-bold"
            onClick={startScan}
            disabled={scanning}
          >
            {scanning ? (
              <>
                <Zap size={18} className="animate-pulse" />
                Analyzing...
              </>
            ) : (
              <>
                <Zap size={18} />
                Scan Material
              </>
            )}
          </Button>
        )}

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Point your camera at construction materials for instant identification
        </p>
      </div>

      <style jsx>{`
        @keyframes scan {
          0% { top: 15%; }
          50% { top: 80%; }
          100% { top: 15%; }
        }
      `}</style>
    </>
  )
}
