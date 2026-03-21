import { useState } from "react"
import { useRouter } from "next/router"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"
import type { Id } from "../../convex/_generated/dataModel"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"

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

const URGENCIES = ["Urgent", "This week", "Flexible"]

export default function RequestPage() {
  const router = useRouter()
  const requests = useQuery(api.requests.list)
  const createRequest = useMutation(api.requests.create)
  const removeRequest = useMutation(api.requests.remove)

  const [createOpen, setCreateOpen] = useState(false)
  const [editId, setEditId] = useState<Id<"requests"> | null>(null)

  // Form state (shared for create + edit)
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")
  const [budget, setBudget] = useState("")
  const [urgency, setUrgency] = useState("Flexible")
  const [requester, setRequester] = useState("")

  const editingRequest = requests?.find((r) => r._id === editId)

  const openCreate = () => {
    setTitle("")
    setCategory("")
    setBudget("")
    setUrgency("Flexible")
    setRequester("")
    setCreateOpen(true)
  }

  const openEdit = (id: Id<"requests">) => {
    const req = requests?.find((r) => r._id === id)
    if (!req) return
    setTitle(req.title)
    setCategory(req.category)
    setBudget(req.budget)
    setUrgency(req.urgency)
    setRequester(req.requester)
    setEditId(id)
  }

  const handleCreate = async () => {
    if (!title || !category || !requester) return
    await createRequest({ title, category, budget, urgency, requester })
    setCreateOpen(false)
  }

  const handleUpdate = async () => {
    if (!editId || !title || !category || !requester) return
    await removeRequest({ id: editId })
    await createRequest({ title, category, budget, urgency, requester })
    setEditId(null)
  }

  const handleDelete = async () => {
    if (!editId) return
    await removeRequest({ id: editId })
    setEditId(null)
  }

  const canSubmit = title && category && requester

  const formContent = (
    <div className="space-y-4">
      <Input
        placeholder="What do you need?"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="h-10"
      />

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

      <div className="flex gap-2">
        <Input
          placeholder="Budget (optional)"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          className="h-10 flex-1"
        />
        <Input
          placeholder="Your name"
          value={requester}
          onChange={(e) => setRequester(e.target.value)}
          className="h-10 flex-1"
        />
      </div>

      <div className="flex gap-1.5">
        {URGENCIES.map((u) => (
          <button
            key={u}
            onClick={() => setUrgency(u)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              urgency === u
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-card text-muted-foreground"
            }`}
          >
            {u}
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            aria-label="Go back"
            className="flex h-9 w-9 items-center justify-center rounded-full active:bg-muted"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-bold">Requests</h1>
        </div>
        <Button size="sm" className="gap-1" onClick={openCreate}>
          <Plus size={14} /> New
        </Button>
      </div>

      {/* List */}
      <div className="space-y-2 px-5 pb-8">
        {requests === undefined ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl border border-border bg-card p-3">
              <div className="mb-2 h-3 w-16 rounded bg-muted" />
              <div className="h-3.5 w-3/4 rounded bg-muted" />
            </div>
          ))
        ) : requests.length === 0 ? (
          <div className="py-20 text-center text-sm text-muted-foreground">
            No requests yet
          </div>
        ) : (
          requests.map((req) => (
            <button
              key={req._id}
              onClick={() => openEdit(req._id)}
              className="w-full rounded-xl border border-border bg-card p-3 text-left transition-all active:scale-[0.98]"
            >
              <div className="mb-1 text-[11px] font-medium text-warm">
                {req.urgency}
              </div>
              <div className="text-sm font-semibold">{req.title}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">
                {req.budget || "Flexible"} &middot; {req.requester}
              </div>
            </button>
          ))
        )}
      </div>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Request</DialogTitle>
          </DialogHeader>
          {formContent}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleCreate} disabled={!canSubmit}>
              Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editId} onOpenChange={(open) => !open && setEditId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Request</DialogTitle>
          </DialogHeader>
          {formContent}
          <DialogFooter>
            <Button variant="destructive" size="icon" onClick={handleDelete}>
              <Trash2 size={16} />
            </Button>
            <div className="flex-1" />
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleUpdate} disabled={!canSubmit}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
