import { createGroq } from "@ai-sdk/groq";
import { generateText } from "ai";

// The SDK doesn't re-export its ProviderOptions type; derive it from the call.
type ProviderOptions = NonNullable<
  Parameters<typeof generateText>[0]["providerOptions"]
>;

// Bound Groq calls so one hung request can't consume the whole cron window.
const GROQ_TIMEOUT_MS = 30_000;
const GROQ_MAX_RETRIES = 2;

// Exported so tool-calling callers (triage) can apply the same timeout.
export { GROQ_TIMEOUT_MS, GROQ_MAX_RETRIES };
import { getGroqConfig, isGroqConfigured } from "@/config/env";

type TextCompletionParams = {
  system: string;
  prompt: string;
  maxOutputTokens?: number;
  temperature?: number;
  providerOptions?: ProviderOptions;
};

type TextCompletionResult = {
  text: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  } | null;
};

// Shared Groq model handle for tool-calling agents (e.g. the triage loop).
export function getGroqModel() {
  if (!isGroqConfigured()) {
    throw new Error("GROQ_API_KEY is not configured.");
  }

  const config = getGroqConfig();
  const groq = createGroq({
    apiKey: config.apiKey,
  });

  return groq(config.model);
}

export async function createTextCompletion({
  system,
  prompt,
  maxOutputTokens,
  temperature,
  providerOptions,
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
    providerOptions,
    // Bound the call and let the SDK retry transient (429/5xx) failures; text
    // generation is safe to retry. Prevents one hung call stalling the run.
    abortSignal: AbortSignal.timeout(GROQ_TIMEOUT_MS),
    maxRetries: GROQ_MAX_RETRIES,
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
