import "@/styles/globals.css"
import { useState, useEffect } from "react"
import type { AppProps } from "next/app"
import { ConvexProvider, ConvexReactClient } from "convex/react"
import Layout from "@/components/Layout"

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

function SplashScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<"enter" | "hold" | "exit">("enter")

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("hold"), 100)
    const t2 = setTimeout(() => setPhase("exit"), 1600)
    const t3 = setTimeout(() => onDone(), 2400)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onDone])

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
      style={{
        opacity: phase === "exit" ? 0 : 1,
        transition: "opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {/* Logo */}
      <img
        src="/logo-transparent-cropped.png"
        alt="ScrapYard"
        draggable={false}
        className="w-48"
        style={{
          opacity: phase === "enter" ? 0 : 1,
          transform: phase === "enter"
            ? "translateY(24px) scale(0.92)"
            : phase === "exit"
              ? "translateY(-32px) scale(0.95)"
              : "translateY(0) scale(1)",
          transition: "all 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      />

      {/* Tagline */}
      <p
        className="mt-4 text-sm font-medium text-muted-foreground"
        style={{
          opacity: phase === "hold" ? 1 : 0,
          transform: phase === "enter"
            ? "translateY(12px)"
            : phase === "exit"
              ? "translateY(-16px)"
              : "translateY(0)",
          transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.15s",
        }}
      >
        Construction surplus marketplace
      </p>
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
