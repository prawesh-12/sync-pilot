import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createTextCompletion } from "@/features/ai/groq";
import {
  buildSyncPilotSystemPrompt,
  buildSyncPilotUserPrompt,
  isSyncPilotWorkflow,
  type SyncPilotAgentResult,
  type SyncPilotWorkflow,
} from "@/features/ai/syncpilot-agent";
import { parseAgentResult } from "@/features/agent/result-parser";

type AgentRunRequest = {
  workflow?: unknown;
  task?: unknown;
  context?: unknown;
};

function parseRequestBody(body: AgentRunRequest) {
  const workflow: SyncPilotWorkflow = isSyncPilotWorkflow(body.workflow)
    ? body.workflow
    : "operations_copilot";
  const task = typeof body.task === "string" ? body.task.trim() : "";
  const context = typeof body.context === "string" ? body.context.trim() : "";

  return { workflow, task, context };
}

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as AgentRunRequest;
    const { workflow, task, context } = parseRequestBody(body);

    if (task.length < 12) {
      return NextResponse.json(
        { error: "Task must be at least 12 characters long." },
        { status: 400 },
      );
    }

    if (task.length > 4000 || context.length > 12000) {
      return NextResponse.json(
        { error: "Task or context is too large for a single run." },
        { status: 400 },
      );
    }

    const completion = await createTextCompletion({
      system: buildSyncPilotSystemPrompt(workflow),
      prompt: buildSyncPilotUserPrompt({ workflow, task, context }),
      maxOutputTokens: 500,
    });
    const parsed = await parseAgentResult(completion.text, { task, context });

    return NextResponse.json({
      result: parsed,
      usage: completion.usage,
      workflow,
      provider: "groq",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Agent execution failed.";

    return NextResponse.json(
      {
        error: message,
      },
      { status: 500 },
    );
  }
}
