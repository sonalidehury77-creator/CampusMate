"use client";

import { useState, useTransition } from "react";

import { sendAIMessage } from "@/app/(app)/ai/actions";
import { aiQuickPrompts } from "@/config/ai-prompts";

import type {
  AIConversationWithMessages,
} from "@/types/ai";

type AIChatProps = {
  initialConversation:
    | AIConversationWithMessages
    | null;
};

export function AIChat({
  initialConversation,
}: AIChatProps) {
  const [conversationId, setConversationId] =
    useState<string | null>(
      initialConversation?.id ?? null,
    );

  const [messages, setMessages] = useState(
    initialConversation?.messages ?? [],
  );

  const [input, setInput] = useState("");

  const [isPending, startTransition] =
    useTransition();

  function submitMessage(message: string) {
    const trimmed = message.trim();

    if (!trimmed || isPending) {
      return;
    }

    setInput("");

    const optimisticMessage = {
      id: `temp-${crypto.randomUUID()}`,
      conversationId: conversationId ?? "",
      role: "user" as const,
      content: trimmed,
      createdAt: new Date().toISOString(),
    };

    setMessages((current) => [
      ...current,
      optimisticMessage,
    ]);

    startTransition(() => {
      void sendAIMessage({
        conversationId,
        message: trimmed,
      })
        .then((result) => {
          setConversationId(
            result.conversationId,
          );

          setMessages((current) => [
            ...current.filter(
              (message) =>
                message.id !==
                optimisticMessage.id,
            ),
            optimisticMessage,
            {
              id: result.message.id,
              conversationId:
                result.message
                  .conversation_id,
              role: "assistant",
              content:
                result.message.content,
              createdAt:
                result.message
                  .created_at,
            },
          ]);
        })
        .catch((error) => {
          console.error(
            "AI message failed:",
            error,
          );

          setMessages((current) =>
            current.filter(
              (message) =>
                message.id !==
                optimisticMessage.id,
            ),
          );

          setInput(trimmed);
        });
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
      {/* Quick prompts */}
      <aside className="rounded-2xl border border-border bg-card p-4">
        <h2 className="font-semibold">
          Quick help
        </h2>

        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          Ask CampusMate about your real academic
          data.
        </p>

        <div className="mt-4 space-y-2">
          {aiQuickPrompts.map(
            (prompt) => (
              <button
                key={prompt.id}
                type="button"
                disabled={isPending}
                onClick={() =>
                  submitMessage(
                    prompt.prompt,
                  )
                }
                className="w-full rounded-xl border border-border p-3 text-left text-sm transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="font-medium">
                  {prompt.title}
                </span>

                <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                  {prompt.prompt}
                </span>
              </button>
            ),
          )}
        </div>
      </aside>

      {/* Chat */}
      <section className="flex min-h-[42rem] flex-col overflow-hidden rounded-2xl border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <p className="text-sm font-semibold">
            CampusMate AI
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Your personalized academic assistant
          </p>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          {messages.length === 0 ? (
            <div className="mx-auto flex max-w-xl flex-col items-center justify-center py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100 text-2xl">
                ✦
              </div>

              <h2 className="mt-5 text-xl font-bold">
                How can I help you today?
              </h2>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                I can understand your CampusMate
                academic information and help you
                study, plan, prepare for exams and
                manage your workload.
              </p>
            </div>
          ) : (
            messages.map(
              (message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role ===
                    "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-7 ${
                      message.role ===
                      "user"
                        ? "bg-brand-600 text-white"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">
                      {message.content}
                    </div>
                  </div>
                </div>
              ),
            )
          )}

          {isPending && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground">
                CampusMate AI is thinking...
              </div>
            </div>
          )}
        </div>

        {/* Message input */}
        <form
          onSubmit={(event) => {
            event.preventDefault();
            submitMessage(input);
          }}
          className="border-t border-border p-4"
        >
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(event) =>
                setInput(event.target.value)
              }
              placeholder="Ask CampusMate anything about your studies..."
              rows={3}
              maxLength={6000}
              disabled={isPending}
              className="min-h-20 flex-1 resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50"
            />

            <button
              type="submit"
              disabled={
                isPending ||
                !input.trim()
              }
              className="self-end rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Send
            </button>
          </div>

          <p className="mt-2 text-xs text-muted-foreground">
            CampusMate AI uses your academic context
            to provide personalized guidance.
          </p>
        </form>
      </section>
    </div>
  );
}