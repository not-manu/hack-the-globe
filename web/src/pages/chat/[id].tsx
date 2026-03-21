import { useRouter } from "next/router"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../../convex/_generated/api"
import type { Id } from "../../../convex/_generated/dataModel"
import { ArrowLeft, Send } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/components/AuthContext"

function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  // Deterministic color from name
  const colors = [
    "#16a34a", "#0891b2", "#7c3aed", "#db2777", "#ea580c",
    "#ca8a04", "#059669", "#4f46e5", "#be185d", "#0d9488",
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const color = colors[Math.abs(hash) % colors.length]

  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-bold text-white"
      style={{ width: size, height: size, backgroundColor: color, fontSize: size * 0.4 }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

export default function ChatPage() {
  const router = useRouter()
  const { username } = useAuth()
  const { id } = router.query
  const listingId = id as Id<"listings"> | undefined

  const listing = useQuery(
    api.listings.getById,
    listingId ? { id: listingId } : "skip"
  )
  const messages = useQuery(
    api.messages.list,
    listingId ? { listingId } : "skip"
  )
  const sendMessage = useMutation(api.messages.send)

  const [text, setText] = useState("")
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages?.length])

  // Auto-send intro message when arriving from listing detail
  const introSent = useRef(false)
  useEffect(() => {
    if (
      router.query.intro === "1" &&
      !introSent.current &&
      listing &&
      listingId &&
      username &&
      messages &&
      messages.length === 0
    ) {
      introSent.current = true
      const intro = `Hi, I'm interested in ${listing.title}. Is $${listing.price} still available?`
      sendMessage({ listingId, sender: username, body: intro })
    }
  }, [router.query.intro, listing, listingId, username, messages, sendMessage])

  async function handleSend() {
    const body = text.trim()
    if (!body || !listingId || !username) return
    setSending(true)
    setText("")
    try {
      await sendMessage({ listingId, sender: username, body })
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  if (!listing && listing !== null) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (listing === null) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-5 text-center">
        <p className="text-sm text-muted-foreground">Listing not found</p>
        <button
          onClick={() => router.back()}
          className="text-sm font-medium text-primary"
        >
          Go back
        </button>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex shrink-0 items-center gap-3 border-b border-border/40 px-4 py-3">
        <button
          onClick={() => router.back()}
          aria-label="Go back"
          className="flex h-8 w-8 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
        >
          <ArrowLeft size={18} />
        </button>
        {listing && (
          <div className="flex min-w-0 items-center gap-2.5">
            {(listing.imageUrl || listing.image) && (
              <img
                src={listing.imageUrl ?? listing.image ?? undefined}
                alt=""
                className="h-9 w-9 shrink-0 rounded-lg object-cover"
              />
            )}
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold leading-tight">
                {listing.title}
              </div>
              <div className="text-xs text-muted-foreground">
                ${listing.price} &middot; {listing.seller}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="hide-scrollbar flex-1 overflow-y-auto px-4 py-4">
        {messages && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-2 text-2xl">💬</div>
            <p className="text-sm text-muted-foreground">
              No messages yet. Start the conversation!
            </p>
          </div>
        )}

        {messages?.map((msg, i) => {
          const isMe = msg.sender === username
          const showAvatar =
            i === 0 || messages[i - 1].sender !== msg.sender

          return (
            <div
              key={msg._id}
              className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : ""} ${showAvatar ? "mt-3" : "mt-0.5"}`}
            >
              {/* Avatar slot */}
              <div className="w-7 shrink-0">
                {showAvatar && !isMe && (
                  <Avatar name={msg.sender} size={28} />
                )}
              </div>

              <div className={`max-w-[75%] ${isMe ? "items-end" : "items-start"}`}>
                {showAvatar && !isMe && (
                  <div className="mb-0.5 px-1 text-[11px] font-medium text-muted-foreground">
                    {msg.sender}
                  </div>
                )}
                <div
                  className={`rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                    isMe
                      ? "rounded-br-md bg-primary text-primary-foreground"
                      : "rounded-bl-md bg-muted text-foreground"
                  }`}
                >
                  {msg.body}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        className="shrink-0 border-t border-border/40 bg-background px-4 py-3"
        style={{ paddingBottom: "calc(12px + var(--safe-bottom, 0px))" }}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
          className="flex items-center gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-full border border-border bg-muted/50 px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/40 focus:bg-background"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!text.trim() || sending}
            aria-label="Send message"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-all disabled:opacity-30"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  )
}
