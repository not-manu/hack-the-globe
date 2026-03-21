import { useState } from "react"
import { useRouter } from "next/router"
import { ArrowLeft, Camera, X, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const STEPS = ["Photos", "Details", "Price"]

const CATEGORIES = [
  { id: "lumber", label: "Lumber", icon: "\u{1FAB5}" },
  { id: "steel", label: "Steel", icon: "\u{1F529}" },
  { id: "concrete", label: "Concrete", icon: "\u{1F9F1}" },
  { id: "brick", label: "Brick", icon: "\u{1F3D7}\u{FE0F}" },
  { id: "glass", label: "Glass", icon: "\u{1FA9F}" },
  { id: "pipe", label: "Piping", icon: "\u{1F527}" },
  { id: "electrical", label: "Electrical", icon: "\u{1F4A1}" },
  { id: "fixtures", label: "Fixtures", icon: "\u{1F6BF}" },
]

const CONDITIONS = ["New", "Like New", "Good", "Fair"]

export default function PostMaterial() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [photos, setPhotos] = useState<string[]>([])
  const [form, setForm] = useState({
    title: "",
    category: "",
    quantity: "",
    price: "",
    originalPrice: "",
    condition: "Good",
    description: "",
    location: "",
  })

  const update = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const addMockPhoto = () => {
    const mockPhotos = [
      "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=200&h=200&fit=crop",
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=200&h=200&fit=crop",
      "https://images.unsplash.com/photo-1590075865003-e48277faa558?w=200&h=200&fit=crop",
    ]
    if (photos.length < 5) {
      setPhotos([...photos, mockPhotos[photos.length % mockPhotos.length]])
    }
  }

  const carbonEstimate =
    form.category && form.price ? Math.round(Number(form.price) * 0.18) : 0

  return (
    <>
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 px-5 pb-3 pt-4 backdrop-blur-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => (step > 0 ? setStep(step - 1) : router.back())}
              aria-label="Go back"
              className="flex h-9 w-9 items-center justify-center rounded-full transition-colors active:bg-muted"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-lg font-bold tracking-tight">List Material</h1>
          </div>
          <span className="text-xs font-semibold text-muted-foreground">
            Step {step + 1} of 3
          </span>
        </div>
      </div>

      {/* Progress */}
      <div className="flex gap-1.5 px-5 pb-5">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= step ? "bg-primary" : "bg-border"
            }`}
          />
        ))}
      </div>

      <div className="space-y-5 px-5 pb-8">
        {/* Step 0: Photos */}
        {step === 0 && (
          <div className="animate-fade-up space-y-4">
            <div>
              <h2 className="text-base font-bold">Add photos</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Good photos help your materials sell faster
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {photos.map((photo, i) => (
                <div
                  key={i}
                  className="relative aspect-square overflow-hidden rounded-xl"
                >
                  <img
                    src={photo}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  <button
                    onClick={() =>
                      setPhotos(photos.filter((_, j) => j !== i))
                    }
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/50 text-white"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              {photos.length < 5 && (
                <button
                  onClick={addMockPhoto}
                  className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-border text-muted-foreground transition-colors active:bg-muted"
                >
                  <Camera size={20} />
                  <span className="text-[10px] font-semibold">Add</span>
                </button>
              )}
            </div>

            <button
              onClick={() => router.push("/scan")}
              className="flex w-full items-center gap-3 rounded-2xl border border-green-bg-dark bg-green-bg p-3.5 text-left"
            >
              <Sparkles size={18} className="text-primary" />
              <div className="flex-1">
                <div className="text-sm font-semibold text-green-dark">
                  Use AI Scanner
                </div>
                <div className="text-xs text-muted-foreground">
                  Auto-identify and fill details
                </div>
              </div>
            </button>
          </div>
        )}

        {/* Step 1: Details */}
        {step === 1 && (
          <div className="animate-fade-up space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder='e.g. "4x8 Plywood Sheets"'
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Category</Label>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((c) => (
                  <Button
                    key={c.id}
                    type="button"
                    size="sm"
                    variant={
                      form.category === c.id ? "default" : "outline"
                    }
                    onClick={() => update("category", c.id)}
                  >
                    {c.icon} {c.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                placeholder='e.g. "20 sheets"'
                value={form.quantity}
                onChange={(e) => update("quantity", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Condition</Label>
              <div className="flex gap-1.5">
                {CONDITIONS.map((c) => (
                  <Button
                    key={c}
                    type="button"
                    size="sm"
                    variant={form.condition === c ? "default" : "outline"}
                    onClick={() => update("condition", c)}
                  >
                    {c}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                placeholder="Describe the materials, dimensions, any damage..."
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="location">Pickup Location</Label>
              <Input
                id="location"
                placeholder="Address or area"
                value={form.location}
                onChange={(e) => update("location", e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Step 2: Price */}
        {step === 2 && (
          <div className="animate-fade-up space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="price">Your Price</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="$0"
                  value={form.price}
                  onChange={(e) => update("price", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="originalPrice">Original Price</Label>
                <Input
                  id="originalPrice"
                  type="number"
                  placeholder="$0"
                  value={form.originalPrice}
                  onChange={(e) => update("originalPrice", e.target.value)}
                />
              </div>
            </div>

            {carbonEstimate > 0 && (
              <div className="rounded-2xl border border-green-bg-dark bg-green-bg p-4 text-center">
                <div className="text-2xl font-extrabold text-primary">
                  ~{carbonEstimate} kg
                </div>
                <div className="mt-0.5 text-xs font-semibold text-green-dark">
                  Estimated CO2 prevented
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-2.5 pt-4">
          {step > 0 && (
            <Button
              variant="outline"
              className="flex-1 py-6"
              onClick={() => setStep(step - 1)}
            >
              Back
            </Button>
          )}
          {step < 2 ? (
            <Button
              className="flex-1 py-6"
              onClick={() => setStep(step + 1)}
            >
              Continue
            </Button>
          ) : (
            <Button
              className="flex-1 py-6"
              onClick={() => {
                alert("Listing posted! (mockup)")
                router.push("/")
              }}
            >
              Post Listing
            </Button>
          )}
        </div>
      </div>
    </>
  )
}
