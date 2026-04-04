"use client";

import { useState, useTransition } from "react";
import { AlertCircle, Bot, LoaderCircle, Send, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type {
  SyncPilotAgentResult,
  SyncPilotWorkflow,
} from "@/lib/ai/syncpilot-agent";

type AgentConsoleProps = {
  isConfigured: boolean;
  modelName: string;
};

type AgentRunRecord = {
  id: string;
  workflow: SyncPilotWorkflow;
  task: string;
  context: string;
  result: SyncPilotAgentResult;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  } | null;
};

const workflowOptions: Array<{
  value: SyncPilotWorkflow;
  label: string;
  description: string;
}> = [
  {
    value: "operations_copilot",
    label: "Operations copilot",
    description: "Turn unstructured operating work into a reviewable action plan.",
  },
  {
    value: "email_triage",
    label: "Email triage",
    description: "Classify urgency, propose tags, and draft a safe response.",
  },
  {
    value: "calendar_brief",
    label: "Calendar brief",
    description: "Summarize blockers, scheduling risks, and follow-up owners.",
  },
];

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
      <Card className="border-border/80 bg-card/80 shadow-2xl shadow-black/10">
        <CardHeader className="gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={isConfigured ? "default" : "destructive"}>
              {isConfigured ? "Groq connected" : "Missing API key"}
            </Badge>
            <Badge variant="outline">{modelName}</Badge>
          </div>
          <CardTitle className="text-xl">Run the SyncPilot agent</CardTitle>
          <CardDescription>
            Send a task plus operating context and get back a structured brief
            that is safe to review before taking action.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-3 sm:grid-cols-3">
              {workflowOptions.map((option) => {
                const isActive = workflow === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setWorkflow(option.value)}
                    className={cn(
                      "rounded-2xl border p-4 text-left transition-colors",
                      isActive
                        ? "border-primary bg-primary/10"
                        : "border-border bg-background hover:bg-muted/50",
                    )}
                  >
                    <p className="font-medium">{option.label}</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {option.description}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="task">
                Task
              </label>
              <Input
                id="task"
                value={task}
                onChange={(event) => setTask(event.target.value)}
                placeholder="What should the agent do?"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="context">
                Context
              </label>
              <textarea
                id="context"
                value={context}
                onChange={(event) => setContext(event.target.value)}
                placeholder="Paste the email thread, meeting notes, or raw operating context."
                className="min-h-48 w-full rounded-2xl border border-input bg-transparent px-3 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              />
            </div>

            {error ? (
              <div className="flex items-start gap-2 rounded-2xl border border-destructive/40 bg-destructive/10 px-3 py-3 text-sm text-destructive">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <p>{error}</p>
              </div>
            ) : null}

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-muted/30 px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="size-4" />
                Protected route + server-side provider key
              </div>
              <Button type="submit" size="lg" disabled={isPending || !isConfigured}>
                {isPending ? (
                  <>
                    <LoaderCircle className="size-4 animate-spin" />
                    Running
                  </>
                ) : (
                  <>
                    Run agent
                    <Send className="size-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card className="border-border/80 bg-card/80 shadow-2xl shadow-black/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Bot className="size-5" />
              Latest run
            </CardTitle>
            <CardDescription>
              Structured output from the most recent agent execution.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isPending ? (
              <AgentConsoleSkeleton />
            ) : latestRun ? (
              <div className="space-y-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>{latestRun.workflow.replaceAll("_", " ")}</Badge>
                  <Badge variant="outline">
                    Risk {latestRun.result.riskLevel}
                  </Badge>
                  <Badge variant="outline">
                    {latestRun.result.automationReadiness.replaceAll("_", " ")}
                  </Badge>
                  <Badge variant="outline">
                    Confidence {latestRun.result.confidence}%
                  </Badge>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
                    Headline
                  </p>
                  <p className="mt-2 text-lg font-medium">
                    {latestRun.result.headline}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
                    Summary
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {latestRun.result.summary}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
                    Recommended actions
                  </p>
                  <div className="mt-3 space-y-3">
                    {latestRun.result.recommendedActions.map((item) => (
                      <div
                        key={`${item.action}-${item.owner}`}
                        className="rounded-2xl border border-border/70 bg-muted/30 p-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-medium">{item.action}</p>
                          <Badge variant="outline">{item.owner}</Badge>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {item.detail}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
                    Draft reply
                  </p>
                  <div className="mt-3 rounded-2xl border border-border/70 bg-background p-4 text-sm leading-6 text-muted-foreground">
                    {latestRun.result.draftReply}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
                      Suggested tags
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {latestRun.result.suggestedTags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
                      Missing information
                    </p>
                    <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                      {latestRun.result.missingInformation.length ? (
                        latestRun.result.missingInformation.map((item) => (
                          <p key={item}>{item}</p>
                        ))
                      ) : (
                        <p>No blockers called out.</p>
                      )}
                    </div>
                  </div>
                </div>

                {latestRun.usage ? (
                  <div className="rounded-2xl border border-border/70 bg-muted/30 p-3 text-sm text-muted-foreground">
                    Prompt {latestRun.usage.promptTokens} tokens, completion{" "}
                    {latestRun.usage.completionTokens} tokens, total{" "}
                    {latestRun.usage.totalTokens} tokens.
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border/70 px-4 py-10 text-center text-sm text-muted-foreground">
                Run the agent once to populate the operator brief.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/80 shadow-2xl shadow-black/10">
          <CardHeader>
            <CardTitle>Recent requests</CardTitle>
            <CardDescription>
              Local session history for the runs you trigger from this dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {history.length ? (
              history.slice(0, 4).map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-2xl border border-border/70 bg-muted/25 p-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium">{entry.result.headline}</p>
                    <Badge variant="outline">
                      {entry.workflow.replaceAll("_", " ")}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {entry.task}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No local runs yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AgentConsoleSkeleton() {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <Skeleton width="80px" height="1.5rem" rounded="rounded-full" />
        <Skeleton width="100px" height="1.5rem" rounded="rounded-full" />
        <Skeleton width="120px" height="1.5rem" rounded="rounded-full" />
        <Skeleton width="90px" height="1.5rem" rounded="rounded-full" />
      </div>

      <div>
        <Skeleton width="100px" height="16px" className="mb-2" />
        <Skeleton width="100%" height="1.5rem" className="mt-2" />
        <Skeleton width="75%" height="1.5rem" className="mt-2" />
      </div>

      <div>
        <Skeleton width="80px" height="16px" className="mb-2" />
        <div className="mt-2 space-y-2">
          <Skeleton width="100%" height="1rem" />
          <Skeleton width="100%" height="1rem" />
          <Skeleton width="80%" height="1rem" />
        </div>
      </div>

      <div>
        <Skeleton width="150px" height="16px" className="mb-2" />
        <div className="mt-3 space-y-3">
          <Skeleton width="100%" height="4.5rem" rounded="rounded-2xl" />
          <Skeleton width="100%" height="4.5rem" rounded="rounded-2xl" />
          <Skeleton width="100%" height="4.5rem" rounded="rounded-2xl" />
        </div>
      </div>

      <div>
        <Skeleton width="100px" height="16px" className="mb-2" />
        <div className="mt-3">
          <Skeleton width="100%" height="7rem" rounded="rounded-2xl" />
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Skeleton width="120px" height="16px" className="mb-2" />
          <div className="mt-3 flex flex-wrap gap-2">
            <Skeleton width="60px" height="1.5rem" rounded="rounded-full" />
            <Skeleton width="80px" height="1.5rem" rounded="rounded-full" />
            <Skeleton width="70px" height="1.5rem" rounded="rounded-full" />
          </div>
        </div>
        <div>
          <Skeleton width="150px" height="16px" className="mb-2" />
          <div className="mt-3">
             <Skeleton width="80%" height="1rem" />
          </div>
        </div>
      </div>
    </div>
  );
}
