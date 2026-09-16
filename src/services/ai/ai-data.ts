import { createClient } from "@/lib/supabase/server";

import type {
  AIConversation,
  AIConversationWithMessages,
} from "@/types/ai";

export async function getAIData(): Promise<{
  conversations: AIConversation[];
  activeConversation:
    | AIConversationWithMessages
    | null;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error(
      "You must be logged in.",
    );
  }

  const {
    data: conversations,
    error: conversationsError,
  } = await supabase
    .from("ai_conversations")
    .select(
      "id, title, created_at, updated_at",
    )
    .eq(
      "profile_id",
      user.id,
    )
    .order("updated_at", {
      ascending: false,
    })
    .limit(30);

  if (conversationsError) {
    console.error(
      "Failed to load AI conversations:",
      conversationsError,
    );

    throw new Error(
      "Failed to load AI conversations.",
    );
  }

  const firstConversation =
    conversations?.[0] ?? null;

  let activeConversation:
    | AIConversationWithMessages
    | null = null;

  if (firstConversation) {
    const {
      data: messages,
      error: messagesError,
    } = await supabase
      .from("ai_messages")
      .select(
        `
          id,
          conversation_id,
          role,
          content,
          created_at
        `,
      )
      .eq(
        "conversation_id",
        firstConversation.id,
      )
      .order("created_at", {
        ascending: true,
      });

    if (messagesError) {
      console.error(
        "Failed to load AI messages:",
        messagesError,
      );

      throw new Error(
        "Failed to load AI messages.",
      );
    }

    activeConversation = {
      id: firstConversation.id,

      title:
        firstConversation.title ??
        "New conversation",

      createdAt:
        firstConversation.created_at,

      updatedAt:
        firstConversation.updated_at,

      messages: (messages ?? []).map(
        (message) => ({
          id: message.id,

          conversationId:
            message.conversation_id,

          role: message.role as
            | "user"
            | "assistant"
            | "system",

          content:
            message.content,

          createdAt:
            message.created_at,
        }),
      ),
    };
  }

  const mappedConversations: AIConversation[] =
    (conversations ?? []).map(
      (conversation) => ({
        id: conversation.id,

        title:
          conversation.title ??
          "New conversation",

        createdAt:
          conversation.created_at,

        updatedAt:
          conversation.updated_at,
      }),
    );

  return {
    conversations:
      mappedConversations,

    activeConversation,
  };
}