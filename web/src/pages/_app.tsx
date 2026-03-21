import "@/styles/globals.css"
import type { AppProps } from "next/app"
import { ConvexProvider, ConvexReactClient } from "convex/react"
import { Outfit } from "next/font/google"
import Layout from "@/components/Layout"

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ConvexProvider client={convex}>
      <div className={`${outfit.variable} font-sans`} style={{ height: "100%" }}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </div>
    </ConvexProvider>
  )
}
