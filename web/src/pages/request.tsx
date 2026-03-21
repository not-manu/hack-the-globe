import { useState } from "react"
import { useRouter } from "next/router"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"
import type { Id } from "../../convex/_generated/dataModel"
import { ArrowLeft, Plus, Megaphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"

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

const URGENCIES = ["Urgent", "This week", "Flexible"]

function RequestForm({
  initial,
  onSubmit,
  onDelete,
  submitLabel,
}: {
  initial?: {
    title: string
    category: string
    budget: string
    urgency: string
    requester: string
  }
  onSubmit: (data: {
    title: string
    category: string
    budget: string
    urgency: string
    requester: string
  }) => void
  onDelete?: () => void
  submitLabel: string
}) {
  const [form, setForm] = useState({
    title: initial?.title ?? "",
    category: initial?.category ?? "",
    budget: initial?.budget ?? "",
    urgency: initial?.urgency ?? "Flexible",
    requester: initial?.requester ?? "",
  })

  const update = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1.5">
        <Label htmlFor="req-title">What do you need?</Label>
        <Input
          id="req-title"
          placeholder='e.g. "4x8 plywood sheets"'
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
              variant={form.category === c.id ? "default" : "outline"}
              onClick={() => update("category", c.id)}
            >
              {c.icon} {c.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="budget">Budget</Label>
          <Input
            id="budget"
            placeholder='e.g. "$200-400"'
            value={form.budget}
            onChange={(e) => update("budget", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Urgency</Label>
          <div className="flex flex-wrap gap-1.5">
            {URGENCIES.map((u) => (
              <Button
                key={u}
                type="button"
                size="xs"
                variant={form.urgency === u ? "default" : "outline"}
                onClick={() => update("urgency", u)}
              >
                {u}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="requester">Your name</Label>
        <Input
          id="requester"
          placeholder="e.g. Sarah M."
          value={form.requester}
          onChange={(e) => update("requester", e.target.value)}
        />
      </div>

      <DialogFooter className="flex gap-2">
        {onDelete && (
          <Button variant="destructive" onClick={onDelete}>
            Delete
          </Button>
        )}
        <div className="flex-1" />
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button
          onClick={() => onSubmit(form)}
          disabled={!form.title || !form.category || !form.requester}
        >
          {submitLabel}
        </Button>
      </DialogFooter>
    </div>
  )
}

export default function RequestPage() {
  const router = useRouter()
  const requests = useQuery(api.requests.list)
  const createRequest = useMutation(api.requests.create)
  const removeRequest = useMutation(api.requests.remove)

  const [createOpen, setCreateOpen] = useState(false)
  const [editId, setEditId] = useState<Id<"requests"> | null>(null)

  const editingRequest = requests?.find((r) => r._id === editId)

  return (
    <>
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 px-5 pb-3 pt-4 backdrop-blur-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              aria-label="Go back"
              className="flex h-9 w-9 items-center justify-center rounded-full transition-colors active:bg-muted"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-lg font-bold tracking-tight">
              Material Requests
            </h1>
          </div>

          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1">
                <Plus size={14} />
                New
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request Materials</DialogTitle>
                <DialogDescription>
                  Post what you need and sellers will reach out.
                </DialogDescription>
              </DialogHeader>
              <RequestForm
                submitLabel="Post Request"
                onSubmit={async (data) => {
                  await createRequest(data)
                  setCreateOpen(false)
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="px-5 pb-8">
        {requests === undefined ? (
          <div className="space-y-2.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl border border-border bg-card p-4"
              >
                <div className="mb-2 h-4 w-16 rounded bg-muted" />
                <div className="mb-1.5 h-4 w-3/4 rounded bg-muted" />
                <div className="h-3 w-1/2 rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Megaphone size={28} className="text-muted-foreground" />
            </div>
            <p className="text-sm font-semibold">No requests yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Be the first to post a material request
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {requests.map((req, i) => {
              const categoryInfo = CATEGORIES.find(
                (c) => c.id === req.category
              )
              return (
                <button
                  key={req._id}
                  onClick={() => setEditId(req._id)}
                  className={`animate-fade-up stagger-${(i % 6) + 1} w-full rounded-2xl border border-border bg-card p-4 text-left transition-all active:scale-[0.98]`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <Badge
                      variant={
                        req.urgency === "Urgent" ? "destructive" : "secondary"
                      }
                      className="text-[10px]"
                    >
                      {req.urgency}
                    </Badge>
                    {categoryInfo && (
                      <span className="text-base">{categoryInfo.icon}</span>
                    )}
                  </div>
                  <div className="text-sm font-semibold leading-snug">
                    {req.title}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Budget: {req.budget || "Not specified"}
                  </div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">
                    by {req.requester}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Edit dialog */}
      <Dialog open={!!editId} onOpenChange={(open) => !open && setEditId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Request</DialogTitle>
            <DialogDescription>
              Update or remove this material request.
            </DialogDescription>
          </DialogHeader>
          {editingRequest && (
            <RequestForm
              initial={editingRequest}
              submitLabel="Save Changes"
              onSubmit={async (data) => {
                await removeRequest({ id: editingRequest._id })
                await createRequest(data)
                setEditId(null)
              }}
              onDelete={async () => {
                await removeRequest({ id: editingRequest._id })
                setEditId(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
