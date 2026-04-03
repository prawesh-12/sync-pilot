import { z } from "zod";
import { getCerebrasConfig, isCerebrasConfigured } from "@/lib/env";

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

const cerebrasResponseSchema = z.object({
  choices: z
    .array(
      z.object({
        message: z.object({
          content: z.string().trim().min(1),
        }),
      }),
    )
    .min(1),
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
  if (!isCerebrasConfigured()) {
    throw new Error("CEREBRAS_API_KEY is not configured.");
  }

  const parsedEmailContent = emailContentSchema.parse(emailContent);
  const config = getCerebrasConfig();
  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        {
          role: "user",
          content: buildSummaryPrompt(parsedEmailContent),
        },
      ],
      max_tokens: SUMMARY_MAX_TOKENS,
      temperature: SUMMARY_TEMPERATURE,
    }),
    cache: "no-store",
  });
  const data = (await response.json().catch(() => null)) as unknown;

  if (!response.ok) {
    const errorMessage =
      data && typeof data === "object" && "error" in data
        ? getApiErrorMessage(data.error)
        : "";

    throw new Error(
      errorMessage || `Cerebras request failed with status ${response.status}.`,
    );
  }

  const parsedResponse = cerebrasResponseSchema.parse(data);

  return parsedResponse.choices[0].message.content;
}

function getApiErrorMessage(error: unknown) {
  if (!error || typeof error !== "object" || !("message" in error)) {
    return "";
  }

  return typeof error.message === "string" ? error.message : "";
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
