import { useState } from "react"
import { useAuth } from "./AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function NamePrompt() {
  const { setUsername } = useAuth()
  const [value, setValue] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (value.trim()) setUsername(value.trim())
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-background">
      <form
        onSubmit={handleSubmit}
        className="mx-6 w-full max-w-[340px] animate-fade-up space-y-5 text-center"
      >
        <img
          src="/logo-transparent-cropped.png"
          alt="ScrapYard"
          className="mx-auto mb-2 w-36"
          draggable={false}
        />
        <div>
          <h1 className="text-lg font-bold tracking-tight">Welcome</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter your name to get started
          </p>
        </div>
        <Input
          autoFocus
          placeholder="Your name"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="text-center text-base"
          maxLength={30}
        />
        <Button
          type="submit"
          disabled={!value.trim()}
          className="w-full py-5 text-base font-bold"
        >
          Continue
        </Button>
      </form>
    </div>
  )
}
