"use client";

import { useState, useTransition } from "react";
import type {
  SyncPilotAgentResult,
  SyncPilotWorkflow,
} from "@/features/ai/syncpilot-agent";
import { ConsoleForm } from "./console-form";
import { ConsoleResult } from "./console-result";
import { ConsoleHistory } from "./console-history";
import type { AgentRunRecord } from "./types";

type AgentConsoleProps = {
  isConfigured: boolean;
  modelName: string;
};

export function AgentConsole({ isConfigured, modelName }: AgentConsoleProps) {
  const [workflow, setWorkflow] = useState<SyncPilotWorkflow>("operations_copilot");
  const [task, setTask] = useState(
    "Summarize the situation, identify the highest-priority next steps, and draft a response I can review.",
  );
  const [context, setContext] = useState(
    "Sender: Alex from vendor partnerships\nThread summary: They want confirmation on launch timeline, contract signature status, and whether we can join a coordination call next week.\nConstraints: We have not approved final pricing yet, and legal review is still pending.",
  );
  const [history, setHistory] = useState<AgentRunRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const latestRun = history[0] ?? null;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isConfigured) {
      setError("Add GROQ_API_KEY before running the agent.");
      return;
    }

    setError(null);

    startTransition(() => {
      void runAgent();
    });
  }

  async function runAgent() {
    try {
      const response = await fetch("/api/agent/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workflow,
          task,
          context,
        }),
      });

      const data = (await response.json()) as
        | {
            error?: string;
            result?: SyncPilotAgentResult;
            usage?: AgentRunRecord["usage"];
            workflow?: SyncPilotWorkflow;
          }
        | undefined;

      if (!response.ok || !data?.result || !data.workflow) {
        throw new Error(data?.error || "The agent run did not succeed.");
      }

      const workflowResult = data.workflow;
      const agentResult = data.result;

      setHistory((current) => [
        {
          id: `${Date.now()}`,
          workflow: workflowResult,
          task,
          context,
          result: agentResult,
          usage: data.usage ?? null,
        },
        ...current,
      ]);
    } catch (runError) {
      setError(
        runError instanceof Error ? runError.message : "The agent run failed.",
      );
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <ConsoleForm
        isConfigured={isConfigured}
        modelName={modelName}
        workflow={workflow}
        setWorkflow={setWorkflow}
        task={task}
        setTask={setTask}
        context={context}
        setContext={setContext}
        error={error}
        isPending={isPending}
        onSubmit={handleSubmit}
      />
      <div className="space-y-6">
        <ConsoleResult latestRun={latestRun} isPending={isPending} />
        <ConsoleHistory history={history} />
      </div>
    </div>
  );
}
