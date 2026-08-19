import { Check } from "lucide-react";
import { SAMPLE_DRAFT, SAMPLE_EMAIL } from "@/components/landing/landing-content";
import { Meta, Panel, RefCode, Status } from "@/components/landing/product-surface";

const CHECK_SIZE = 13;
const TRAVEL_DISTANCE = "44px";

// A pulse running the connector is the only motion; the fragments never hide.
function Connector() {
  return (
    <div
      aria-hidden="true"
      className="relative ml-8 h-11 w-px self-start bg-white/12 sm:ml-12"
    >
      <span
        style={{ "--sp-travel-distance": TRAVEL_DISTANCE } as React.CSSProperties}
        className="sp-travel absolute -left-[1.5px] top-0 size-1 rounded-full bg-sp-cobalt"
      />
    </div>
  );
}

function GmailFragment() {
  return (
    <Panel edge className="w-full p-4">
      <Meta>Gmail</Meta>
      <p className="mt-2.5 text-sm font-medium text-sp-text">
        {SAMPLE_EMAIL.subject}
      </p>
      <p className="mt-1 text-xs text-sp-muted">
        {SAMPLE_EMAIL.sender} · {SAMPLE_EMAIL.receivedAt}
      </p>
    </Panel>
  );
}

function DecisionFragment() {
  return (
    <Panel className="w-full px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-sp-text">Draft reply</span>
        <RefCode>{SAMPLE_DRAFT.refCode}</RefCode>
      </div>
      <Status tone="waiting">Awaiting approval</Status>
    </Panel>
  );
}

function SignalFragment() {
  return (
    <Panel edge className="w-full p-4">
      <Meta>Signal</Meta>
      <p className="mt-3 w-fit rounded-[10px] rounded-br-[3px] bg-sp-cobalt px-3 py-1.5 font-mono-tech text-xs text-white">
        {SAMPLE_DRAFT.refCode} send
      </p>
      <p className="mt-3 flex items-center gap-2 text-xs text-sp-text/85">
        <Check
          size={CHECK_SIZE}
          strokeWidth={2.6}
          aria-hidden="true"
          className="shrink-0 text-sp-sage"
        />
        Sent your reply
      </p>
    </Panel>
  );
}

// Indents overlap in x so one rail touches all three fragments.
export function HeroScene() {
  return (
    <div className="mx-auto flex w-full max-w-[340px] flex-col sm:max-w-[400px]">
      <div className="w-full">
        <GmailFragment />
      </div>
      <Connector />
      <div className="w-[86%] self-end">
        <DecisionFragment />
      </div>
      <Connector />
      <div className="w-[94%]">
        <SignalFragment />
      </div>
    </div>
  );
}
