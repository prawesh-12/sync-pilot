import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AgentRunRecord } from "./types";

type ConsoleHistoryProps = {
  history: AgentRunRecord[];
};

export function ConsoleHistory({ history }: ConsoleHistoryProps) {
  return (
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
  );
}
