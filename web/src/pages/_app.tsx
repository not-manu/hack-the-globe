import "@/styles/globals.css"
import { useState, useEffect, useRef } from "react"
import type { AppProps } from "next/app"
import { ConvexProvider, ConvexReactClient } from "convex/react"
import Layout from "@/components/Layout"

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

// Splash logo height vs header logo height
const SPLASH_H = 192
const HEADER_H = 26

function SplashScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<"center" | "move" | "done">("center")
  const logoRef = useRef<HTMLImageElement>(null)
  const [target, setTarget] = useState({ x: 20, y: 20 })

  useEffect(() => {
    // Find where the header logo will land
    // The header is px-5 (20px) pt-5 (20px), logo is inside the max-w-[430px] container
    const containerLeft = Math.max(0, (window.innerWidth - 430) / 2)
    setTarget({
      x: containerLeft + 20,
      y: 20,
    })

    const t1 = setTimeout(() => setPhase("move"), 1200)
    const t2 = setTimeout(() => onDone(), 2200)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [onDone])

  // Calculate where the logo needs to go
  const scale = HEADER_H / SPLASH_H
  // Current position: centered in viewport
  const centerX = (typeof window !== "undefined" ? window.innerWidth : 430) / 2
  const centerY = (typeof window !== "undefined" ? window.innerHeight : 800) / 2
  // Target: top-left, but offset for the scaled size (transform-origin is center)
  const targetX = target.x + (SPLASH_H * scale) / 2
  const targetY = target.y + (SPLASH_H * scale) / 2
  const dx = targetX - centerX
  const dy = targetY - centerY

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
      style={{
        opacity: phase === "done" ? 0 : 1,
        transition: "opacity 0.4s ease",
        pointerEvents: phase === "done" ? "none" : "auto",
      }}
    >
      <div
        className="flex flex-col items-center"
        style={{
          transform: phase === "move"
            ? `translate(${dx}px, ${dy}px) scale(${scale})`
            : phase === "center"
              ? "translate(0, 0) scale(1)"
              : `translate(${dx}px, ${dy}px) scale(${scale})`,
          opacity: phase === "done" ? 0 : 1,
          transition: phase === "move"
            ? "transform 0.8s cubic-bezier(0.4, 0, 0, 1), opacity 0.4s ease 0.6s"
            : "none",
        }}
      >
        <img
          ref={logoRef}
          src="/logo-transparent-cropped.png"
          alt="ScrapYard"
          draggable={false}
          style={{ height: SPLASH_H, width: "auto" }}
        />
      </div>

      {/* Tagline - fades out before logo moves */}
      <p
        className="absolute text-sm font-medium text-muted-foreground"
        style={{
          top: "calc(50% + 110px)",
          opacity: phase === "center" ? 1 : 0,
          transform: phase === "center" ? "translateY(0)" : "translateY(-8px)",
          transition: "all 0.3s ease",
        }}
      >
        Construction surplus marketplace
      </p>

      {/* Background fades out as logo settles */}
      {phase === "move" && (
        <div
          className="absolute inset-0 bg-background"
          style={{
            animation: "splash-bg-fade 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.3s forwards",
          }}
        />
      )}

      <style jsx>{`
        @keyframes splash-bg-fade {
          from { opacity: 1; }
          to { opacity: 0; }
        }
      `}</style>
    </div>
  )
}

export default function App({ Component, pageProps }: AppProps) {
  const [showSplash, setShowSplash] = useState(true)

  return (
    <ConvexProvider client={convex}>
      <div className="h-full max-h-dvh overflow-hidden">
        {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </div>
    </ConvexProvider>
  )
}
