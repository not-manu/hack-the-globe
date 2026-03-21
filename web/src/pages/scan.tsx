import { useEffect } from "react"
import { useRouter } from "next/router"

// The AI scanner is now integrated directly into the Post Material page.
// This page redirects there so any existing links still work.
export default function ScanMaterial() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/post?scan=1")
  }, [router])

  return (
    <div className="flex h-[60vh] items-center justify-center text-sm text-muted-foreground">
      Redirecting to AI Scanner...
    </div>
  )
}
