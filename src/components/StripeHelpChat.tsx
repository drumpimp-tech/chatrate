"use client"

import { useState, useRef, useEffect } from "react"

type Message = { role: "user" | "assistant"; content: string }

export function StripeHelpChat() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Greet on first open
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content:
            "Hey! I can help you grab your Stripe API keys in 2 minutes. Do you already have a Stripe account, or do you need to create one?",
        },
      ])
    }
  }, [open, messages.length])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput("")

    const next: Message[] = [...messages, { role: "user", content: text }]
    setMessages(next)
    setLoading(true)

    try {
      const res = await fetch("/api/ai/stripe-help", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      })
      const data = await res.json()
      setMessages([...next, { role: "assistant", content: data.message || "Sorry, try again." }])
    } catch {
      setMessages([...next, { role: "assistant", content: "Connection error — please try again." }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors mt-1"
      >
        <span className="text-lg">🤖</span>
        {open ? "Close assistant" : "Need help finding your Stripe keys?"}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="mt-3 bg-[#0e0e1a] border border-purple-500/20 rounded-2xl overflow-hidden flex flex-col"
          style={{ height: 340 }}>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-purple-600 text-white"
                      : "bg-white/[0.06] text-gray-200"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white/[0.06] rounded-xl px-4 py-2 text-gray-400 text-sm">
                  <span className="animate-pulse">···</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Warning */}
          <div className="px-4 py-1.5 bg-yellow-900/20 border-t border-yellow-500/20 text-yellow-500/80 text-xs">
            ⚠️ Never paste your Stripe keys here — enter them in the form above.
          </div>

          {/* Input */}
          <div className="border-t border-white/[0.06] px-3 py-2 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Type a message..."
              className="flex-1 bg-white/[0.04] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 outline-none border border-white/10 focus:border-purple-500/50"
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              className="bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-sm font-bold px-4 rounded-lg transition-all"
            >
              →
            </button>
          </div>
        </div>
      )}
    </>
  )
}
