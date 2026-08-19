import { Check } from "lucide-react";

// Staggered in CSS rather than JS so this can stay a server component.

function RefCode({ children }: { children: React.ReactNode }) {
  return (
    <span className="mx-0.5 inline-block rounded-[5px] border border-sp-amber/35 bg-sp-amber/12 px-1.5 py-px font-mono-tech text-[0.85em] font-medium tracking-wide text-sp-amber">
      {children}
    </span>
  );
}

function Timestamp({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <span
      className={`mt-1 block font-mono-tech text-[11px] text-sp-muted ${
        align === "right" ? "text-right" : ""
      }`}
    >
      {children}
    </span>
  );
}

export function SignalThread() {
  return (
    <div className="w-full max-w-[400px] rounded-[14px] border border-sp-text/10 bg-sp-raised/40 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.8)]">
      <div className="flex items-center gap-3 border-b border-sp-text/8 px-4 py-3.5">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-[9px] bg-sp-cobalt font-display text-sm font-bold text-sp-text">
          S
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-sp-text">SyncPilot</p>
          <p className="font-mono-tech text-[11px] text-sp-muted">
            Signal &middot; end-to-end encrypted
          </p>
        </div>
        <span
          aria-hidden="true"
          className="ml-auto size-1.5 shrink-0 rounded-full bg-sp-sage"
        />
      </div>

      <div className="flex flex-col gap-3 px-4 py-5">
        <div className="sp-bubble sp-bubble-1 max-w-[86%] self-start">
          <div className="rounded-[18px] rounded-bl-[6px] bg-sp-raised px-4 py-3">
            <p className="text-[13.5px] leading-relaxed text-sp-text">
              Priya asked about the Q3 deck &mdash; wants it by Friday. Draft
              ready: <RefCode>A3X9</RefCode>
            </p>
          </div>
          <Timestamp>9:14</Timestamp>
        </div>

        <div className="sp-bubble sp-bubble-2 max-w-[86%] self-end">
          <div className="rounded-[18px] rounded-br-[6px] bg-sp-cobalt px-4 py-2.5">
            <p className="text-[13.5px] leading-relaxed text-sp-text">
              <span className="font-mono-tech tracking-wide">A3X9</span> send
            </p>
          </div>
          <Timestamp align="right">9:14</Timestamp>
        </div>

        {/* Confirmation copy is verbatim from features/signal/handle-reply.ts. */}
        <div className="sp-bubble sp-bubble-3 max-w-[86%] self-start">
          <div className="rounded-[18px] rounded-bl-[6px] bg-sp-raised px-4 py-3">
            <p className="flex items-start gap-2 text-[13.5px] leading-relaxed text-sp-text">
              <Check
                size={15}
                strokeWidth={2.5}
                aria-hidden="true"
                className="mt-[3px] shrink-0 text-sp-sage"
              />
              <span>Sent your reply for: Q3 deck timeline</span>
            </p>
          </div>
          <Timestamp>9:15</Timestamp>
        </div>
      </div>

      <div className="border-t border-sp-text/8 px-4 py-3">
        <p className="font-mono-tech text-[11px] leading-relaxed text-sp-muted">
          <span className="text-sp-muted/70">also works &rarr;</span>{" "}
          <span className="text-sp-text/70">A3X9 no</span>
          <span className="px-1.5 text-sp-muted/50">&middot;</span>
          <span className="text-sp-text/70">A3X9 make it shorter</span>
        </p>
      </div>
    </div>
  );
}
