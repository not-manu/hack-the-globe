import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"
import type { Id } from "../../convex/_generated/dataModel"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
  { id: "lumber", label: "Lumber", icon: "🪵" },
  { id: "steel", label: "Steel & Metal", icon: "🔩" },
  { id: "concrete", label: "Concrete", icon: "🧱" },
  { id: "brick", label: "Brick", icon: "🏗️" },
  { id: "glass", label: "Glass", icon: "🪟" },
  { id: "pipe", label: "Piping", icon: "🔧" },
  { id: "electrical", label: "Electrical", icon: "💡" },
  { id: "fixtures", label: "Fixtures", icon: "🚿" },
]

const URGENCIES = ["Urgent", "This week", "Flexible"]

function CreateRequestForm({ onClose }: { onClose: () => void }) {
  const create = useMutation(api.requests.create)
  const [form, setForm] = useState({
    title: "",
    category: "",
    budget: "",
    urgency: "Flexible",
    requester: "",
  })

  const update = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async () => {
    if (!form.title || !form.category || !form.requester) return
    await create(form)
    onClose()
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-2">
        <Label htmlFor="req-title">What do you need?</Label>
        <Input
          id="req-title"
          placeholder='e.g. "4x8 plywood sheets"'
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
        />
      </div>

      <div className="space-y-2">
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
        <div className="space-y-2">
          <Label htmlFor="budget">Budget</Label>
          <Input
            id="budget"
            placeholder='e.g. "$200-400"'
            value={form.budget}
            onChange={(e) => update("budget", e.target.value)}
          />
        </div>
        <div className="space-y-2">
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

      <div className="space-y-2">
        <Label htmlFor="requester">Your name</Label>
        <Input
          id="requester"
          placeholder="e.g. Sarah M."
          value={form.requester}
          onChange={(e) => update("requester", e.target.value)}
        />
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button
          onClick={handleSubmit}
          disabled={!form.title || !form.category || !form.requester}
        >
          Post Request
        </Button>
      </DialogFooter>
    </div>
  )
}

function EditRequestForm({
  request,
  onClose,
}: {
  request: {
    _id: Id<"requests">
    title: string
    category: string
    budget: string
    urgency: string
    requester: string
  }
  onClose: () => void
}) {
  const remove = useMutation(api.requests.remove)
  const create = useMutation(api.requests.create)
  const [form, setForm] = useState({
    title: request.title,
    category: request.category,
    budget: request.budget,
    urgency: request.urgency,
    requester: request.requester,
  })

  const update = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleUpdate = async () => {
    if (!form.title || !form.category || !form.requester) return
    await remove({ id: request._id })
    await create(form)
    onClose()
  }

  const handleDelete = async () => {
    await remove({ id: request._id })
    onClose()
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-2">
        <Label htmlFor="edit-title">What do you need?</Label>
        <Input
          id="edit-title"
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
        />
      </div>

      <div className="space-y-2">
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
        <div className="space-y-2">
          <Label htmlFor="edit-budget">Budget</Label>
          <Input
            id="edit-budget"
            value={form.budget}
            onChange={(e) => update("budget", e.target.value)}
          />
        </div>
        <div className="space-y-2">
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

      <div className="space-y-2">
        <Label htmlFor="edit-requester">Your name</Label>
        <Input
          id="edit-requester"
          value={form.requester}
          onChange={(e) => update("requester", e.target.value)}
        />
      </div>

      <DialogFooter className="flex gap-2">
        <Button variant="destructive" onClick={handleDelete}>
          Delete
        </Button>
        <div className="flex-1" />
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button
          onClick={handleUpdate}
          disabled={!form.title || !form.category || !form.requester}
        >
          Save Changes
        </Button>
      </DialogFooter>
    </div>
  )
}

function RequestCard({
  request,
}: {
  request: {
    _id: Id<"requests">
    title: string
    category: string
    budget: string
    urgency: string
    requester: string
  }
}) {
  const [open, setOpen] = useState(false)
  const categoryInfo = CATEGORIES.find((c) => c.id === request.category)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Card className="cursor-pointer transition-shadow hover:shadow-md">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <Badge
                variant={request.urgency === "Urgent" ? "destructive" : "secondary"}
              >
                {request.urgency}
              </Badge>
              {categoryInfo && (
                <span className="text-lg">{categoryInfo.icon}</span>
              )}
            </div>
            <CardTitle className="text-sm leading-tight">
              {request.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-xs">
              Budget: {request.budget || "Not specified"}
            </CardDescription>
            <p className="mt-1 text-xs text-muted-foreground">
              by {request.requester}
            </p>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Request</DialogTitle>
          <DialogDescription>
            Update or remove this material request.
          </DialogDescription>
        </DialogHeader>
        <EditRequestForm request={request} onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}

export default function Home() {
  const requests = useQuery(api.requests.list)
  const [createOpen, setCreateOpen] = useState(false)

  return (
    <div className="mx-auto min-h-screen max-w-2xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">ScrapYard</h1>
          <p className="text-sm text-muted-foreground">
            Construction surplus materials marketplace
          </p>
        </div>
        <Badge variant="secondary" className="gap-1 text-xs">
          🌿 486kg CO2 saved
        </Badge>
      </div>

      {/* Material Requests */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Material Requests</h2>
            <p className="text-sm text-muted-foreground">
              Post what you need — sellers in your area will reach out.
            </p>
          </div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm">+ New Request</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request Materials</DialogTitle>
                <DialogDescription>
                  Post what you need and sellers in your area will reach out with
                  offers.
                </DialogDescription>
              </DialogHeader>
              <CreateRequestForm onClose={() => setCreateOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        {requests === undefined ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-2">
                  <div className="h-5 w-16 rounded bg-muted" />
                  <div className="mt-2 h-4 w-3/4 rounded bg-muted" />
                </CardHeader>
                <CardContent>
                  <div className="h-3 w-1/2 rounded bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : requests.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <span className="mb-2 text-4xl">📋</span>
              <p className="font-medium">No requests yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Be the first to post a material request.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
            {requests.map((request) => (
              <RequestCard key={request._id} request={request} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
