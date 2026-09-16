import OpenAI from "openai";

let openAIClient: OpenAI | null = null;

export function getOpenAIClient() {
  if (openAIClient) {
    return openAIClient;
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is not configured. Add it to .env.local.",
    );
  }

  openAIClient = new OpenAI({
    apiKey,
  });

  return openAIClient;
}

export function getOpenAIModel() {
  return process.env.OPENAI_MODEL || "gpt-5.6-luna";
}