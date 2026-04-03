import { createGroq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { getGroqConfig, isGroqConfigured } from "@/lib/env";

type TextCompletionParams = {
  system: string;
  prompt: string;
  maxOutputTokens?: number;
  temperature?: number;
};

type TextCompletionResult = {
  text: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  } | null;
};

export async function createTextCompletion({
  system,
  prompt,
  maxOutputTokens,
  temperature,
}: TextCompletionParams): Promise<TextCompletionResult> {
  if (!isGroqConfigured()) {
    throw new Error("GROQ_API_KEY is not configured.");
  }

  const config = getGroqConfig();
  const groq = createGroq({
    apiKey: config.apiKey,
  });
  const result = await generateText({
    model: groq(config.model),
    system,
    prompt,
    temperature: temperature ?? 0.2,
    maxOutputTokens: maxOutputTokens ?? 500,
  });

  return {
    text: result.text,
    usage: result.usage
      ? {
          promptTokens: result.usage.inputTokens ?? 0,
          completionTokens: result.usage.outputTokens ?? 0,
          totalTokens: result.usage.totalTokens ?? 0,
        }
      : null,
  };
}
