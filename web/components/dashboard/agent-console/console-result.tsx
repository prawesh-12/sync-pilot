import { Bot } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AgentConsoleSkeleton } from "./console-skeleton";
import type { AgentRunRecord } from "./types";

type ConsoleResultProps = {
  latestRun: AgentRunRecord | null;
  isPending: boolean;
};

export function ConsoleResult({ latestRun, isPending }: ConsoleResultProps) {
  return (
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
  );
}
