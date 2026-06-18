import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { type getGmailAccounts } from "@/db/queries";

type GmailAccount = Awaited<ReturnType<typeof getGmailAccounts>>[number];

type GmailAccountsCardProps = {
  accounts: GmailAccount[];
  returnTo: string;
  toggleAction: (formData: FormData) => Promise<void>;
  removeAction: (formData: FormData) => Promise<void>;
};

export function GmailAccountsCard({
  accounts,
  returnTo,
  toggleAction,
  removeAction,
}: GmailAccountsCardProps) {
  const activeCount = accounts.filter((account) => account.isActive).length;

  return (
    <Card className="border-emerald-500/20 bg-emerald-500/3">
      <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <CardTitle className="text-base">Connected Gmail Accounts</CardTitle>
        <Badge variant={activeCount > 0 ? "default" : "outline"}>
          {activeCount} active
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {accounts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No Gmail accounts connected yet.
          </p>
        ) : (
          <ul className="space-y-3">
            {accounts.map((account) => (
              <GmailAccountRow
                key={account.id}
                account={account}
                toggleAction={toggleAction}
                removeAction={removeAction}
              />
            ))}
          </ul>
        )}

        <AddGmailForm returnTo={returnTo} />
      </CardContent>
    </Card>
  );
}

function GmailAccountRow({
  account,
  toggleAction,
  removeAction,
}: {
  account: GmailAccount;
  toggleAction: (formData: FormData) => Promise<void>;
  removeAction: (formData: FormData) => Promise<void>;
}) {
  const label = account.label || account.emailAddress || "Gmail account";
  const email = account.emailAddress || "Address unavailable";

  return (
    <li className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{label}</span>
          <Badge variant={account.isActive ? "default" : "outline"}>
            {account.isActive ? "On" : "Off"}
          </Badge>
        </div>
        <p className="break-all text-xs text-muted-foreground">{email}</p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <form action={toggleAction}>
          <input type="hidden" name="integrationId" value={account.id} />
          <input
            type="hidden"
            name="nextActive"
            value={account.isActive ? "false" : "true"}
          />
          <Button type="submit" variant="outline" size="sm">
            {account.isActive ? "Disable" : "Enable"}
          </Button>
        </form>

        <form action={removeAction}>
          <input type="hidden" name="integrationId" value={account.id} />
          <Button type="submit" variant="destructive" size="sm">
            Remove
          </Button>
        </form>
      </div>
    </li>
  );
}

function AddGmailForm({ returnTo }: { returnTo: string }) {
  return (
    <form
      method="get"
      action="/api/auth/composio"
      className="flex flex-col gap-2 border-t border-white/10 pt-4 sm:flex-row sm:items-end"
    >
      <input type="hidden" name="returnTo" value={returnTo} />
      <div className="flex-1 space-y-1">
        <label htmlFor="gmailLabel" className="text-xs text-muted-foreground">
          Label (optional)
        </label>
        <Input
          id="gmailLabel"
          name="label"
          placeholder="Work Gmail"
          maxLength={40}
        />
      </div>
      <Button type="submit" className="w-full sm:w-auto">
        Add Gmail account
      </Button>
    </form>
  );
}
