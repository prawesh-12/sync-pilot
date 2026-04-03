import { getCerebrasConfig, isCerebrasConfigured } from "@/lib/env";

type CerebrasMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type StructuredCompletionParams = {
  messages: CerebrasMessage[];
  schema: Record<string, unknown>;
  schemaName: string;
  maxCompletionTokens?: number;
  temperature?: number;
  reasoningEffort?: "low" | "medium" | "high";
  user?: string;
};

type StructuredCompletionResult = {
  text: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  } | null;
};

type CerebrasChatResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
  error?: {
    message?: string;
  };
};

export async function createStructuredCompletion(
  params: StructuredCompletionParams,
): Promise<StructuredCompletionResult> {
  if (!isCerebrasConfigured()) {
    throw new Error("CEREBRAS_API_KEY is not configured.");
  }

  const config = getCerebrasConfig();
  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.model,
      messages: params.messages,
      temperature: params.temperature ?? 0.2,
      max_completion_tokens: params.maxCompletionTokens ?? 900,
      reasoning_effort: params.reasoningEffort ?? "medium",
      response_format: {
        type: "json_schema",
        json_schema: {
          name: params.schemaName,
          strict: true,
          schema: params.schema,
        },
      },
      user: params.user,
    }),
    cache: "no-store",
  });

  const data = (await response.json().catch(() => null)) as CerebrasChatResponse | null;

  if (!response.ok) {
    const message =
      data?.error?.message ||
      `Cerebras request failed with status ${response.status}.`;
    throw new Error(message);
  }

  const content = data?.choices?.[0]?.message?.content;

  if (typeof content !== "string" || !content.trim()) {
    throw new Error("Cerebras returned an empty completion.");
  }

  return {
    text: content,
    usage: data?.usage
      ? {
          promptTokens: data.usage.prompt_tokens ?? 0,
          completionTokens: data.usage.completion_tokens ?? 0,
          totalTokens: data.usage.total_tokens ?? 0,
        }
      : null,
  };
}
