import { getActiveGmailAccounts } from "@/db/queries";

type DashboardIntegrationStatusProps = {
  userId: string;
};

export async function DashboardIntegrationStatus({
  userId,
}: DashboardIntegrationStatusProps) {
  const accounts = await getActiveGmailAccounts(userId);
  const activeCount = accounts.length;
  const isConnected = activeCount > 0;

  return (
    <div className="shrink-0 flex flex-col gap-2 rounded-2xl border border-[#A089E6]/15 bg-white/4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5 sm:py-3">
      <div>
        <h2 className="text-lg font-semibold text-white">Integration</h2>
        {isConnected ? (
          <p className="mt-0.5 text-xs text-gray-400">
            {activeCount} Gmail{" "}
            {activeCount === 1 ? "account is" : "accounts are"} linked. Cron jobs
            can now fetch unread emails.
          </p>
        ) : (
          <p className="mt-0.5 text-xs text-gray-400">
            Connect a Google account to start the email summary pipeline.
          </p>
        )}
      </div>
      <span
        className={
          isConnected
            ? "self-start shrink-0 rounded-lg border border-[#A089E6]/30 bg-[#A089E6]/15 px-3 py-1 text-xs text-[#A089E6] sm:self-auto"
            : "self-start shrink-0 rounded-lg border border-white/10 bg-white/3 px-3 py-1 text-xs text-gray-400 sm:self-auto"
        }
      >
        {isConnected ? `${activeCount} connected` : "Not connected"}
      </span>
    </div>
  );
}
