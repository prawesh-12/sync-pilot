import { Check } from "lucide-react";
import {
  SIGNAL_MESSAGES,
  type SignalMessage,
} from "@/components/landing/landing-content";
import { Meta, Panel, RefCode } from "@/components/landing/product-surface";

const CHECK_SIZE = 13;

function Outgoing({ message }: { message: SignalMessage }) {
  return (
    <li className="flex flex-col items-end">
      <p className="rounded-[14px] rounded-br-[4px] bg-sp-cobalt px-3.5 py-2 font-mono-tech text-sm text-white">
        {message.text}
      </p>
      <Meta className="mt-1.5 text-xs">{message.time}</Meta>
    </li>
  );
}

function Incoming({ message }: { message: SignalMessage }) {
  return (
    <li className="flex flex-col items-start">
      <div className="max-w-[86%] rounded-[14px] rounded-bl-[4px] bg-white/7 px-3.5 py-2.5">
        <p className="flex items-start gap-2 text-sm leading-snug text-sp-text/90">
          {message.confirmed ? (
            <Check
              size={CHECK_SIZE}
              strokeWidth={2.6}
              aria-hidden="true"
              className="mt-[3px] shrink-0 text-sp-sage"
            />
          ) : null}
          {message.text}
        </p>
        {message.code ? (
          <p className="mt-2">
            <RefCode>{message.code}</RefCode>
          </p>
        ) : null}
      </div>
      <Meta className="mt-1.5 text-xs">{message.time}</Meta>
    </li>
  );
}

export function SignalThread() {
  return (
    <Panel edge className="w-full max-w-[380px] overflow-hidden">
      <div className="flex items-center gap-3 border-b border-white/7 px-4 py-3">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-sp-cobalt/85 font-display text-xs font-semibold text-white">
          S
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-sp-text">SyncPilot</p>
          <Meta className="text-xs">Signal · encrypted</Meta>
        </div>
      </div>
      <ul className="space-y-4 px-4 py-5">
        {SIGNAL_MESSAGES.map((message) =>
          message.author === "user" ? (
            <Outgoing key={message.id} message={message} />
          ) : (
            <Incoming key={message.id} message={message} />
          ),
        )}
      </ul>
    </Panel>
  );
}
