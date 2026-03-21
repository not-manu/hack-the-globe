import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import {
  ArrowLeft,
  Send,
  Loader2,
  Check,
  Pencil,
  Trash2,
  Leaf,
  Users,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/AuthContext'

const CATEGORIES: Record<string, { label: string; icon: string }> = {
  lumber: { label: 'Lumber', icon: '\u{1FAB5}' },
  steel: { label: 'Steel', icon: '\u{1F529}' },
  concrete: { label: 'Concrete', icon: '\u{1F9F1}' },
  brick: { label: 'Brick', icon: '\u{1F3D7}\u{FE0F}' },
  glass: { label: 'Glass', icon: '\u{1FA9F}' },
  pipe: { label: 'Piping', icon: '\u{1F527}' },
  electrical: { label: 'Electrical', icon: '\u{1F4A1}' },
  fixtures: { label: 'Fixtures', icon: '\u{1F6BF}' },
}

type ParsedRequest = {
  title: string
  category: string
  budget: string
  urgency: string
  reply: string
}

type ChatMessage =
  | { role: 'user'; text: string }
  | { role: 'assistant'; text: string }
  | { role: 'card'; data: ParsedRequest; posted: boolean; posting: boolean }

export default function RequestPage() {
  const router = useRouter()
  const { username } = useAuth()
  const requests = useQuery(api.requests.list)
  const listings = useQuery(api.listings.list)
  const createRequest = useMutation(api.requests.create)
  const removeRequest = useMutation(api.requests.remove)

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      text: 'What construction materials do you need? Just describe it naturally — I\'ll handle the rest.',
    },
  ])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const [showExisting, setShowExisting] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, thinking])

  // Count listings matching a category
  const getMatchCount = (category: string) => {
    if (!listings) return 0
    return listings.filter((l) => l.category === category).length
  }

  const handleSend = async () => {
    const text = input.trim()
    if (!text || thinking) return

    setInput('')
    setMessages((prev) => [...prev, { role: 'user', text }])
    setThinking(true)

    try {
      const res = await fetch('/api/parse-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to understand request')
      }

      const data: ParsedRequest = await res.json()

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: data.reply },
        { role: 'card', data, posted: false, posting: false },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'Sorry, I couldn\'t understand that. Could you describe the materials you need in a bit more detail?',
        },
      ])
    } finally {
      setThinking(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  const handlePost = async (index: number) => {
    const msg = messages[index]
    if (msg.role !== 'card' || msg.posted || msg.posting) return

    // Set posting state
    setMessages((prev) =>
      prev.map((m, i) =>
        i === index && m.role === 'card' ? { ...m, posting: true } : m,
      ),
    )

    try {
      await createRequest({
        title: msg.data.title,
        category: msg.data.category,
        budget: msg.data.budget,
        urgency: msg.data.urgency,
        requester: username ?? 'Anonymous',
      })

      setMessages((prev) =>
        prev.map((m, i) =>
          i === index && m.role === 'card'
            ? { ...m, posted: true, posting: false }
            : m,
        ),
      )

      // Add confirmation
      const matchCount = getMatchCount(msg.data.category)
      const matchText =
        matchCount > 0
          ? ` There ${matchCount === 1 ? 'is' : 'are'} already ${matchCount} listing${matchCount !== 1 ? 's' : ''} in ${CATEGORIES[msg.data.category]?.label ?? msg.data.category} — you might find a match soon.`
          : ''

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `Posted! We'll notify you when matching materials show up nearby.${matchText} Need anything else?`,
        },
      ])
    } catch {
      setMessages((prev) =>
        prev.map((m, i) =>
          i === index && m.role === 'card'
            ? { ...m, posting: false }
            : m,
        ),
      )
    }
  }

  const myRequests = requests?.filter((r) => r.requester === username)

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-border/50 px-5 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            aria-label="Go back"
            className="flex h-9 w-9 items-center justify-center rounded-full active:bg-muted"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-lg font-bold">Find Materials</h1>
            <p className="text-[11px] text-muted-foreground">
              Describe what you need
            </p>
          </div>
        </div>
        {myRequests && myRequests.length > 0 && (
          <button
            onClick={() => setShowExisting(!showExisting)}
            className="text-xs font-medium text-primary"
          >
            {showExisting ? 'Chat' : `My requests (${myRequests.length})`}
          </button>
        )}
      </div>

      {/* Existing requests list */}
      {showExisting && myRequests && (
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="space-y-2.5">
            {myRequests.map((req) => {
              const cat = CATEGORIES[req.category]
              const matchCount = getMatchCount(req.category)
              return (
                <div
                  key={req._id}
                  className="rounded-xl border border-border bg-card p-3.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{cat?.icon ?? '📦'}</span>
                        <span className="truncate text-sm font-semibold">
                          {req.title}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span>{req.budget || 'Flexible'}</span>
                        <span className="text-border">·</span>
                        <Badge
                          variant={
                            req.urgency === 'Urgent'
                              ? 'destructive'
                              : req.urgency === 'This week'
                                ? 'default'
                                : 'secondary'
                          }
                          className="h-4 px-1.5 text-[9px]"
                        >
                          {req.urgency}
                        </Badge>
                        {matchCount > 0 && (
                          <>
                            <span className="text-border">·</span>
                            <span className="flex items-center gap-0.5 font-medium text-primary">
                              <Leaf size={9} />
                              {matchCount} available
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => removeRequest({ id: req._id })}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-destructive"
                      aria-label="Delete request"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Chat messages */}
      {!showExisting && (
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4">
          <div className="space-y-3">
            {messages.map((msg, i) => {
              if (msg.role === 'user') {
                return (
                  <div key={i} className="flex justify-end">
                    <div className="max-w-[80%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm text-primary-foreground">
                      {msg.text}
                    </div>
                  </div>
                )
              }

              if (msg.role === 'assistant') {
                return (
                  <div key={i} className="flex justify-start">
                    <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-muted px-4 py-2.5 text-sm">
                      {msg.text}
                    </div>
                  </div>
                )
              }

              if (msg.role === 'card') {
                const cat = CATEGORIES[msg.data.category]
                const matchCount = getMatchCount(msg.data.category)
                return (
                  <div key={i} className="flex justify-start">
                    <div className="w-full max-w-[90%] overflow-hidden rounded-2xl border border-border bg-card">
                      <div className="p-3.5">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-lg">
                            {cat?.icon ?? '📦'}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-semibold">{msg.data.title}</div>
                            <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                              <span>{cat?.label ?? msg.data.category}</span>
                              <span className="text-border">·</span>
                              <span className="font-medium text-foreground">{msg.data.budget}</span>
                              <span className="text-border">·</span>
                              <Badge
                                variant={
                                  msg.data.urgency === 'Urgent'
                                    ? 'destructive'
                                    : msg.data.urgency === 'This week'
                                      ? 'default'
                                      : 'secondary'
                                }
                                className="h-4 px-1.5 text-[9px]"
                              >
                                {msg.data.urgency}
                              </Badge>
                            </div>
                            {matchCount > 0 && (
                              <div className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-primary">
                                <Users size={10} />
                                {matchCount} listing{matchCount !== 1 ? 's' : ''} already available
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      {!msg.posted && (
                        <div className="flex border-t border-border">
                          <button
                            onClick={() => handlePost(i)}
                            disabled={msg.posting}
                            className="flex flex-1 items-center justify-center gap-2 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-muted disabled:opacity-50"
                          >
                            {msg.posting ? (
                              <>
                                <Loader2 size={14} className="animate-spin" />
                                Posting...
                              </>
                            ) : (
                              <>
                                <Check size={14} />
                                Post Request
                              </>
                            )}
                          </button>
                          <div className="w-px bg-border" />
                          <button
                            onClick={() => {
                              setInput(messages.find((m, mi) => mi === i - 2 && m.role === 'user')
                                ? (messages[i - 2] as { role: 'user'; text: string }).text
                                : '')
                              setMessages((prev) => prev.filter((_, mi) => mi < i - 1))
                              inputRef.current?.focus()
                            }}
                            className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted"
                          >
                            <Pencil size={12} />
                            Edit
                          </button>
                        </div>
                      )}
                      {msg.posted && (
                        <div className="flex items-center justify-center gap-1.5 border-t border-primary/10 bg-primary/5 py-2 text-xs font-medium text-primary">
                          <Check size={12} />
                          Posted
                        </div>
                      )}
                    </div>
                  </div>
                )
              }

              return null
            })}

            {/* Thinking indicator */}
            {thinking && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl rounded-bl-md bg-muted px-4 py-3">
                  <div className="flex gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/40" style={{ animationDelay: '0ms' }} />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/40" style={{ animationDelay: '150ms' }} />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/40" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Input bar */}
      {!showExisting && (
        <div className="shrink-0 border-t border-border/50 bg-background px-4 py-3" style={{ paddingBottom: 'calc(12px + var(--safe-bottom))' }}>
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
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. I need 50 bricks for a garden wall..."
              className="h-10 flex-1 rounded-xl border border-border bg-card px-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/20"
              disabled={thinking}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || thinking}
              className="h-10 w-10 shrink-0 rounded-xl"
            >
              <Send size={16} />
            </Button>
          </form>
          <div className="mt-2 flex gap-1.5 overflow-x-auto">
            {[
              'I need some lumber for decking',
              '50 bricks, under $200',
              'Looking for steel rebar, urgent',
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => {
                  setInput(suggestion)
                  inputRef.current?.focus()
                }}
                className="shrink-0 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
