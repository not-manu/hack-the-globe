import "@/styles/globals.css"
import { useState, useEffect } from "react"
import type { AppProps } from "next/app"
import { ConvexProvider, ConvexReactClient } from "convex/react"
import Layout from "@/components/Layout"

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

function SplashScreen({ onDone }: { onDone: () => void }) {
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), 1200)
    const doneTimer = setTimeout(() => onDone(), 1700)
    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(doneTimer)
    }
  }, [onDone])

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background transition-opacity duration-500 ${
        fading ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="animate-fade-up flex flex-col items-center gap-3">
        <img
          src="/logo-transparent-cropped.png"
          alt="ScrapYard"
          className="h-24 w-auto"
          draggable={false}
        />
        <p className="text-xs font-medium text-muted-foreground">
          Construction surplus marketplace
        </p>
      </div>
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
