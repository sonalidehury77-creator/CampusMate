"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { getAIContext } from "@/services/ai/ai-context";
import {
  generateCampusMateResponse,
} from "@/services/ai/ai-service";

const messageSchema = z.object({
  conversationId: z
    .string()
    .uuid()
    .nullable(),

  message: z
    .string()
    .trim()
    .min(1, "Message cannot be empty.")
    .max(
      6000,
      "Message is too long.",
    ),
});

const conversationSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1)
    .max(120),
});

async function getAuthenticatedUser() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be logged in.");
  }

  return {
    supabase,
    user,
  };
}

async function getStudentId(
  supabase: Awaited<
    ReturnType<typeof createClient>
  >,
  profileId: string,
) {
  const { data: student } = await supabase
    .from("students")
    .select("id")
    .eq("profile_id", profileId)
    .maybeSingle();

  if (!student) {
    throw new Error(
      "Student profile not found.",
    );
  }

  return student.id;
}

export async function createAIConversation(
  title: string,
) {
  const parsed =
    conversationSchema.parse({
      title,
    });

  const { supabase, user } =
    await getAuthenticatedUser();

  const { data, error } = await supabase
    .from("ai_conversations")
    .insert({
      profile_id: user.id,
      title: parsed.title,
    })
    .select(
      "id, title, created_at, updated_at",
    )
    .single();

  if (error || !data) {
    console.error(
      "Failed to create AI conversation:",
      error,
    );

    throw new Error(
      "Unable to create AI conversation.",
    );
  }

  revalidatePath("/ai");

  return data;
}

export async function sendAIMessage(
  input: {
    conversationId: string | null;
    message: string;
  },
) {
  const parsed =
    messageSchema.parse(input);

  const { supabase, user } =
    await getAuthenticatedUser();

  const studentId =
    await getStudentId(
      supabase,
      user.id,
    );

  let conversationId =
    parsed.conversationId;

  if (!conversationId) {
    const title =
      parsed.message.length > 80
        ? `${parsed.message.slice(0, 77)}...`
        : parsed.message;

    const { data: conversation, error } =
      await supabase
        .from("ai_conversations")
        .insert({
          profile_id: user.id,
          title,
        })
        .select("id")
        .single();

    if (
      error ||
      !conversation
    ) {
      console.error(
        "Failed to create conversation:",
        error,
      );

      throw new Error(
        "Unable to create conversation.",
      );
    }

    conversationId =
      conversation.id;
  } else {
    const { data: conversation } =
      await supabase
        .from("ai_conversations")
        .select("id")
        .eq("id", conversationId)
        .eq("profile_id", user.id)
        .maybeSingle();

    if (!conversation) {
      throw new Error(
        "Conversation not found.",
      );
    }
  }

  const { data: previousMessages } =
    await supabase
      .from("ai_messages")
      .select(
        "role, content, created_at",
      )
      .eq(
        "conversation_id",
        conversationId,
      )
      .order("created_at", {
        ascending: true,
      })
      .limit(20);

  const { error: userMessageError } =
    await supabase
      .from("ai_messages")
      .insert({
        conversation_id:
          conversationId,
        role: "user",
        content: parsed.message,
      });

  if (userMessageError) {
    console.error(
      "Failed to save user message:",
      userMessageError,
    );

    throw new Error(
      "Unable to save your message.",
    );
  }

  const context =
    await getAIContext();

  const conversationHistory =
    (previousMessages ?? [])
      .filter(
        (message) =>
          message.role ===
            "user" ||
          message.role ===
            "assistant",
      )
      .map((message) => ({
        role: message.role as
          | "user"
          | "assistant",
        content: message.content,
      }));

  let aiResult;

  try {
    aiResult =
      await generateCampusMateResponse({
        context,
        conversation:
          conversationHistory,
        message:
          parsed.message,
      });
  } catch (error) {
    console.error(
      "CampusMate AI error:",
      error,
    );

    throw new Error(
      "CampusMate AI could not respond right now. Please try again.",
    );
  }

  const { data: assistantMessage, error: assistantError } =
    await supabase
      .from("ai_messages")
      .insert({
        conversation_id:
          conversationId,
        role: "assistant",
        content:
          aiResult.content,
      })
      .select(
        "id, conversation_id, role, content, created_at",
      )
      .single();

  if (
    assistantError ||
    !assistantMessage
  ) {
    console.error(
      "Failed to save AI message:",
      assistantError,
    );

    throw new Error(
      "AI responded, but the response could not be saved.",
    );
  }

  const { error: usageError } =
    await supabase
      .from("ai_usage")
      .insert({
        profile_id: user.id,
        feature: "campusmate_ai_chat",
        request_count: 1,
        tokens_used:
          aiResult.totalTokens,
      });

  if (usageError) {
    console.error(
      "Failed to record AI usage:",
      usageError,
    );
  }

  revalidatePath("/ai");

  return {
    conversationId,
    message: assistantMessage,
    studentId,
  };
}

export async function deleteAIConversation(
  conversationId: string,
) {
  const parsedId =
    z.string().uuid().parse(
      conversationId,
    );

  const { supabase, user } =
    await getAuthenticatedUser();

  const { error } = await supabase
    .from("ai_conversations")
    .delete()
    .eq("id", parsedId)
    .eq(
      "profile_id",
      user.id,
    );

  if (error) {
    console.error(
      "Failed to delete AI conversation:",
      error,
    );

    throw new Error(
      "Unable to delete conversation.",
    );
  }

  revalidatePath("/ai");

  return {
    success: true,
  };
}