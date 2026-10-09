import { SyncPilotMark } from "@/components/landing/brand-marks";
import { HERO_EXAMPLE, REF_CODE } from "@/components/landing/landing-content";
import { StatusDot } from "@/components/landing/landing-ui";

const AVATAR_MARK_SIZE = 16;

function DraftBubble() {
  return (
    <div className="max-w-[400px] rounded-2xl rounded-tl-md bg-q-raised px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <p className="q-medium text-sm text-q-fg">Draft ready for: {HERO_EXAMPLE.subject}</p>
      <p className="mt-0.5 text-xs text-q-fg-4">
        From {HERO_EXAMPLE.sender} at {HERO_EXAMPLE.receivedAt}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-q-fg-2">{HERO_EXAMPLE.draft}</p>
      <p className="mt-3 flex items-center gap-2 text-xs text-q-fg-4">
        <span className="q-mono rounded-[5px] bg-q-active px-1.5 text-q-fg-2">{REF_CODE}</span>
        Reply with the code and a word
      </p>
    </div>
  );
}

export function SignalThread() {
  return (
    <div className="q-surface flex flex-col overflow-hidden rounded-2xl">
      <div className="flex h-12 items-center justify-between gap-3 border-b border-q-line px-4">
        <span className="flex items-center gap-2.5">
          <span className="flex size-7 items-center justify-center rounded-full bg-q-raised">
            <SyncPilotMark size={AVATAR_MARK_SIZE} />
          </span>
          <span className="q-medium text-sm text-q-fg">SyncPilot</span>
        </span>
        <span className="text-xs text-q-fg-4">Signal</span>
      </div>

      <div className="flex flex-col gap-3 bg-q-sunken/60 px-4 py-6">
        <DraftBubble />
        <div className="flex flex-col items-end gap-1 self-end">
          <p className="q-mono rounded-2xl rounded-tr-md bg-q-brand px-4 py-2.5 text-white">
            {REF_CODE} send
          </p>
          <span className="q-tnum text-xs text-q-fg-4">{HERO_EXAMPLE.repliedAt}</span>
        </div>
        <p className="flex items-center gap-2 text-[13px] text-q-fg-3">
          <StatusDot tone="success" />
          Sent. The reply was added to the thread.
        </p>
      </div>
    </div>
  );
}
