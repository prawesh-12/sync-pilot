import { AlertCircle, LoaderCircle, Send, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { SyncPilotWorkflow } from "@/features/ai/syncpilot-agent";

export const workflowOptions: Array<{
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

type ConsoleFormProps = {
  isConfigured: boolean;
  modelName: string;
  workflow: SyncPilotWorkflow;
  setWorkflow: (workflow: SyncPilotWorkflow) => void;
  task: string;
  setTask: (task: string) => void;
  context: string;
  setContext: (context: string) => void;
  error: string | null;
  isPending: boolean;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export function ConsoleForm({
  isConfigured,
  modelName,
  workflow,
  setWorkflow,
  task,
  setTask,
  context,
  setContext,
  error,
  isPending,
  onSubmit,
}: ConsoleFormProps) {
  return (
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
        <form className="space-y-5" onSubmit={onSubmit}>
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
  );
}
