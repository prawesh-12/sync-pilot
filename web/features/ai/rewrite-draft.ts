import { createTextCompletion } from "@/features/ai/groq";

// gpt-oss is a reasoning model: hidden reasoning tokens count against this
// budget and are stripped from the visible text. Keep it high enough that the
// revised body still fits after reasoning, or result.text comes back empty.
const REWRITE_MAX_TOKENS = 2500;
const REWRITE_SYSTEM = [
  "You revise email reply drafts.",
  "Apply the user's instructions to the current draft.",
  "Return only the revised reply body as plain text, with no preamble or quotes.",
].join(" ");

type RewriteInput = {
  original: string;
  instructions: string;
};

// Turns "make it shorter" style Signal feedback into a new draft body. Returns
// null when the model yields no usable text so callers can keep the original
// draft instead of failing the whole Signal reply.
export async function rewriteDraftBody(
  input: RewriteInput,
): Promise<string | null> {
  const prompt = [
    "Current draft reply:",
    input.original,
    "",
    "Revision instructions:",
    input.instructions,
    "",
    "Return only the revised reply body.",
  ].join("\n");

  const result = await createTextCompletion({
    system: REWRITE_SYSTEM,
    prompt,
    maxOutputTokens: REWRITE_MAX_TOKENS,
    // Keep reasoning short so it doesn't consume the whole output budget and
    // leave the visible revised body empty.
    providerOptions: { groq: { reasoningEffort: "low" } },
  });
  const revised = result.text.trim();

  return revised || null;
}
