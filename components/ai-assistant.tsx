"use client"

import { FormEvent, useMemo, useRef, useState } from "react"
import { Bot, ChevronRight, Loader2, MessageSquareText, Send, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"

type AssistantMessage = {
  id: string
  role: "user" | "assistant"
  content: string
}

const QUICK_QUESTIONS = [
  "当前我的卡片总额度多少？",
  "哪些卡还没有免年费？",
  "我一共有多少张卡？",
  "哪张卡额度最高？",
]

function createMessage(role: AssistantMessage["role"], content: string): AssistantMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    role,
    content,
  }
}

export function AIAssistant() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<AssistantMessage[]>([
    createMessage("assistant", "可以问我卡片总额度、未免年费卡片、卡片数量等问题。"),
  ])
  const [loading, setLoading] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const apiHistory = useMemo(
    () =>
      messages
        .filter((message) => message.role === "user" || message.role === "assistant")
        .slice(-8)
        .map((message) => ({ role: message.role, content: message.content })),
    [messages],
  )

  async function sendMessage(nextInput?: string) {
    const content = (nextInput ?? input).trim()
    if (!content || loading) return

    const userMessage = createMessage("user", content)
    setMessages((current) => [...current, userMessage])
    setInput("")
    setLoading(true)

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: content,
          history: apiHistory,
        }),
      })

      const result = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(result?.error || "AI 助手请求失败")
      }

      setMessages((current) => [...current, createMessage("assistant", result.answer)])
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "AI 助手请求失败"
      setMessages((current) => [...current, createMessage("assistant", errorMessage)])
    } finally {
      setLoading(false)
      requestAnimationFrame(() => textareaRef.current?.focus())
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    sendMessage()
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 md:bottom-6 md:right-6">
      {!open && (
        <Button
          type="button"
          onClick={() => setOpen(true)}
          className="h-12 rounded-full bg-gradient-to-r from-rose-500 to-fuchsia-500 px-4 text-white shadow-lg hover:opacity-95"
        >
          <Bot className="size-5" />
          AI 助手
        </Button>
      )}

      {open && (
        <aside className="flex h-[min(680px,calc(100dvh-32px))] w-[calc(100vw-32px)] max-w-[390px] flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl md:w-[390px]">
          <div className="flex h-14 shrink-0 items-center justify-between border-b px-4">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-fuchsia-500 text-white">
                <Bot className="size-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold leading-none">AI 助手</h2>
                <p className="mt-1 text-xs text-muted-foreground">基于全部卡片数据回答</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={() => {
                  setMessages([createMessage("assistant", "当前会话已清空。")])
                }}
                title="清空会话"
              >
                <Trash2 className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={() => setOpen(false)}
                title="收起"
              >
                <ChevronRight className="hidden size-4 md:block" />
                <X className="size-4 md:hidden" />
              </Button>
            </div>
          </div>

          <ScrollArea className="min-h-0 flex-1">
            <div className="space-y-3 p-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={message.role === "user" ? "flex justify-end" : "flex justify-start"}
                >
                  <div
                    className={
                      message.role === "user"
                        ? "max-w-[82%] rounded-2xl rounded-br-md bg-gradient-to-r from-rose-500 to-fuchsia-500 px-3 py-2 text-sm leading-6 text-white"
                        : "max-w-[82%] rounded-2xl rounded-bl-md border bg-muted/60 px-3 py-2 text-sm leading-6 text-foreground"
                    }
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border bg-muted/60 px-3 py-2 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" />
                    正在回答
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="shrink-0 border-t p-3">
            <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
              {QUICK_QUESTIONS.map((question) => (
                <button
                  key={question}
                  type="button"
                  disabled={loading}
                  onClick={() => sendMessage(question)}
                  className="shrink-0 rounded-full border bg-background px-3 py-1.5 text-xs text-muted-foreground transition hover:bg-muted disabled:opacity-50"
                >
                  {question}
                </button>
              ))}
            </div>
            <form onSubmit={handleSubmit} className="flex items-end gap-2">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault()
                    sendMessage()
                  }
                }}
                placeholder="问问你的卡片数据"
                className="max-h-28 min-h-10 resize-none text-sm"
                disabled={loading}
              />
              <Button
                type="submit"
                size="icon"
                disabled={loading || !input.trim()}
                className="size-10 bg-gradient-to-r from-rose-500 to-fuchsia-500 text-white hover:opacity-95"
                title="发送"
              >
                {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              </Button>
            </form>
            <div className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
              <MessageSquareText className="size-3" />
              不会保存聊天历史
            </div>
          </div>
        </aside>
      )}
    </div>
  )
}
