import { useState } from "react"
import { useRouter } from "next/router"
import { ArrowLeft, Camera, X } from "lucide-react"
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

export default function PostMaterial() {
  const router = useRouter()
  const [photos, setPhotos] = useState<string[]>([])
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")
  const [price, setPrice] = useState("")
  const [location, setLocation] = useState("")

  const addMockPhoto = () => {
    const mocks = [
      "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=200&h=200&fit=crop",
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=200&h=200&fit=crop",
      "https://images.unsplash.com/photo-1590075865003-e48277faa558?w=200&h=200&fit=crop",
    ]
    if (photos.length < 3) {
      setPhotos([...photos, mocks[photos.length % mocks.length]])
    }
  }

  const canPost = title && category && price

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-4 pb-2">
        <button
          onClick={() => router.back()}
          aria-label="Go back"
          className="flex h-9 w-9 items-center justify-center rounded-full active:bg-muted"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold">Post Material</h1>
      </div>

      <div className="space-y-5 px-5 pb-8">
        {/* Photos */}
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
            <button
              onClick={addMockPhoto}
              className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border text-muted-foreground active:bg-muted"
            >
              <Camera size={18} />
              <span className="text-[10px] font-medium">Photo</span>
            </button>
          )}
        </div>

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
