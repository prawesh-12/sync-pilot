import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createStructuredCompletion } from "@/lib/ai/cerebras";
import {
  buildSyncPilotSystemPrompt,
  buildSyncPilotUserPrompt,
  isSyncPilotAgentResult,
  isSyncPilotWorkflow,
  syncPilotAgentSchema,
  type SyncPilotWorkflow,
} from "@/lib/ai/syncpilot-agent";

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

    const completion = await createStructuredCompletion({
      schemaName: "syncpilot_agent_run",
      schema: syncPilotAgentSchema as Record<string, unknown>,
      messages: [
        {
          role: "system",
          content: buildSyncPilotSystemPrompt(workflow),
        },
        {
          role: "user",
          content: buildSyncPilotUserPrompt({ workflow, task, context }),
        },
      ],
      user: userId,
    });

    const parsed = JSON.parse(completion.text) as unknown;

    if (!isSyncPilotAgentResult(parsed)) {
      throw new Error("Cerebras returned JSON that did not match the expected schema.");
    }

    return NextResponse.json({
      result: parsed,
      usage: completion.usage,
      workflow,
      provider: "cerebras",
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
