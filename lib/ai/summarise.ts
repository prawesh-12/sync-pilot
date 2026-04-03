import { createGroq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { z } from "zod";
import { getGroqConfig, isGroqConfigured } from "@/lib/env";

const SUMMARY_MAX_TOKENS = 180;
const SUMMARY_TEMPERATURE = 0.2;
const SUMMARY_MAX_BODY_CHARACTERS = 8000;
const SUMMARY_BODY_HEAD_CHARACTERS = 5000;
const SUMMARY_BODY_TAIL_CHARACTERS = 2500;
const TRUNCATED_BODY_MARKER =
  "\n\n[... email body truncated to stay within model limits ...]\n\n";

const emailContentSchema = z.object({
  subject: z.string().trim().min(1),
  from: z.string().trim().min(1),
  body: z.string().trim().min(1),
});

type EmailContent = z.infer<typeof emailContentSchema>;

function buildSummaryPrompt(emailContent: EmailContent) {
  const body = getSummaryBody(emailContent.body);

  return [
    "You are an email assistant. Summarise this email in 3-5 bullet points.",
    "Be concise. Focus on key information and any action items.",
    "",
    `From: ${emailContent.from}`,
    `Subject: ${emailContent.subject}`,
    `Body: ${body}`,
  ].join("\n");
}

export async function summariseEmail(emailContent: EmailContent): Promise<string> {
  if (!isGroqConfigured()) {
    throw new Error("GROQ_API_KEY is not configured.");
  }

  const parsedEmailContent = emailContentSchema.parse(emailContent);
  const config = getGroqConfig();
  const groq = createGroq({
    apiKey: config.apiKey,
  });
  const result = await generateText({
    model: groq(config.model),
    prompt: buildSummaryPrompt(parsedEmailContent),
    temperature: SUMMARY_TEMPERATURE,
    maxOutputTokens: SUMMARY_MAX_TOKENS,
  });

  return result.text;
}

function getSummaryBody(body: string) {
  const normalizedBody = normalizeWhitespace(body);

  if (normalizedBody.length <= SUMMARY_MAX_BODY_CHARACTERS) {
    return normalizedBody;
  }

  const head = normalizedBody.slice(0, SUMMARY_BODY_HEAD_CHARACTERS).trimEnd();
  const tail = normalizedBody
    .slice(normalizedBody.length - SUMMARY_BODY_TAIL_CHARACTERS)
    .trimStart();

  return `${head}${TRUNCATED_BODY_MARKER}${tail}`;
}

function normalizeWhitespace(value: string) {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
