import type { LanguageModelUsage } from "ai";

export type TokenUsage = {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
};

export const EMPTY_TOKEN_USAGE: TokenUsage = {
  promptTokens: 0,
  completionTokens: 0,
  totalTokens: 0,
};

export type UsageCollector = {
  add(usage: LanguageModelUsage | undefined): void;
  snapshot(): TokenUsage;
};

// Sums token usage across every Groq call made during one agent run.
export function createUsageCollector(): UsageCollector {
  const totals: TokenUsage = { ...EMPTY_TOKEN_USAGE };

  return {
    add(usage) {
      if (!usage) {
        return;
      }

      totals.promptTokens += usage.inputTokens ?? 0;
      totals.completionTokens += usage.outputTokens ?? 0;
      totals.totalTokens += usage.totalTokens ?? 0;
    },
    snapshot() {
      return { ...totals };
    },
  };
}

// Calendar month bucket (UTC) used to aggregate per-user usage, e.g. "2026-06".
export function getUsageMonth(date: Date): string {
  return date.toISOString().slice(0, 7);
}
