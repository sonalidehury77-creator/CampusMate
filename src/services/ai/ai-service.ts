import { getOpenAIClient, getOpenAIModel } from "@/lib/openai/client";

import {
  buildCampusMateSystemPrompt,
} from "@/services/ai/ai-prompt";

import type { AIContext } from "@/types/ai";

type GenerateAIResponseInput = {
  context: AIContext;
  conversation: {
    role: "user" | "assistant";
    content: string;
  }[];
  message: string;
};

export async function generateCampusMateResponse({
  context,
  conversation,
  message,
}: GenerateAIResponseInput) {
  const client = getOpenAIClient();

  const systemPrompt =
    buildCampusMateSystemPrompt(context);

  const history = conversation
    .slice(-20)
    .map((item) => ({
      role: item.role,
      content: item.content,
    }));

  const response = await client.responses.create({
    model: getOpenAIModel(),

    instructions: systemPrompt,

    input: [
      ...history,
      {
        role: "user",
        content: message,
      },
    ],

    max_output_tokens: 2000,
  });

  const output =
    response.output_text?.trim();

  if (!output) {
    throw new Error(
      "CampusMate AI returned an empty response.",
    );
  }

  const usage = response.usage;

  return {
    content: output,
    inputTokens:
      usage?.input_tokens ?? 0,
    outputTokens:
      usage?.output_tokens ?? 0,
    totalTokens:
      usage?.total_tokens ?? 0,
  };
}