import { createTextCompletion } from "@/features/ai/groq";

const REWRITE_MAX_TOKENS = 600;
const REWRITE_SYSTEM = [
  "You revise email reply drafts.",
  "Apply the user's instructions to the current draft.",
  "Return only the revised reply body as plain text, with no preamble or quotes.",
].join(" ");

type RewriteInput = {
  original: string;
  instructions: string;
};

// Turns "make it shorter" style Signal feedback into a new draft body.
export async function rewriteDraftBody(input: RewriteInput): Promise<string> {
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
  });
  const revised = result.text.trim();

  if (!revised) {
    throw new Error("Draft revision produced empty output.");
  }

  return revised;
}
