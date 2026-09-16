"use client";

import type { AIConversation } from "@/types/ai";

type ConversationListProps = {
  conversations: AIConversation[];
  activeConversationId: string | null;
  onSelect: (id: string) => void;
};

export function ConversationList({
  conversations,
  activeConversationId,
  onSelect,
}: ConversationListProps) {
  return (
    <div className="space-y-2">
      {conversations.length === 0 ? (
        <p className="rounded-xl bg-muted p-3 text-xs text-muted-foreground">
          No previous conversations.
        </p>
      ) : (
        conversations.map(
          (conversation) => (
            <button
              key={conversation.id}
              type="button"
              onClick={() =>
                onSelect(
                  conversation.id,
                )
              }
              className={`w-full rounded-xl px-3 py-3 text-left text-sm transition ${
                activeConversationId ===
                conversation.id
                  ? "bg-brand-100 text-brand-700"
                  : "hover:bg-muted"
              }`}
            >
              <span className="line-clamp-2 font-medium">
                {conversation.title}
              </span>

              <span className="mt-1 block text-xs text-muted-foreground">
                {new Intl.DateTimeFormat(
                  "en-IN",
                  {
                    dateStyle: "medium",
                  },
                ).format(
                  new Date(
                    conversation.updatedAt,
                  ),
                )}
              </span>
            </button>
          ),
        )
      )}
    </div>
  );
}