"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUp, Check } from "lucide-react";
import { SyncPilotMark } from "@/components/landing/brand-marks";
import { REF_CODE, SAMPLE_DRAFT, SAMPLE_EMAIL } from "@/components/landing/landing-content";
import { Label, RefCode } from "@/components/landing/layout-primitives";

const REPLY_DELAY_MS = 600;
const CHECK_SIZE = 14;
const SEND_ICON_SIZE = 15;
// The panel never scrolls, so it holds only what the demo needs: the draft,
// your command, and the result.
const MAX_BUBBLES = 3;

// Mirrors features/signal/parse-reply.ts: first token is the ref code, the rest
// is the command. Only the demo's own code is accepted here.
const SEND_WORDS = new Set(["send", "yes"]);
const DISCARD_WORDS = new Set(["no", "discard"]);

type Bubble = {
  id: number;
  author: "syncpilot" | "user";
  text: string;
  body?: string;
  code?: string;
  confirmed?: boolean;
  time: string;
};

const OPENING_MESSAGE: Bubble = {
  id: 0,
  author: "syncpilot",
  text: `Draft ready for: ${SAMPLE_EMAIL.subject}`,
  body: SAMPLE_DRAFT.body,
  code: REF_CODE,
  time: SAMPLE_EMAIL.receivedAt,
};

const CHIPS = ["send", "no", "make it shorter"];

function classify(raw: string) {
  const text = raw.trim();
  const [first, ...rest] = text.split(/\s+/);

  if ((first ?? "").toUpperCase() !== REF_CODE) {
    return { kind: "no-code" as const };
  }

  const command = rest.join(" ").trim();
  const normalized = command.toLowerCase();

  if (!command) {
    return { kind: "usage" as const };
  }

  if (SEND_WORDS.has(normalized)) {
    return { kind: "send" as const };
  }

  if (DISCARD_WORDS.has(normalized)) {
    return { kind: "discard" as const };
  }

  return { kind: "revise" as const };
}

// `replace` flows clear the thread and start again from the bubble they return,
// so the panel never has to render more bubbles than it can fit.
function replyFor(
  kind: ReturnType<typeof classify>["kind"],
  id: number,
): { bubbles: Bubble[]; replace: boolean } {
  const time = "09:15";

  switch (kind) {
    case "send":
      return {
        replace: false,
        bubbles: [
          {
            id,
            author: "syncpilot",
            text: `Sent your reply for: ${SAMPLE_EMAIL.subject}`,
            confirmed: true,
            time,
          },
        ],
      };
    case "discard":
      return {
        replace: false,
        bubbles: [
          {
            id,
            author: "syncpilot",
            text: `Discarded the draft for: ${SAMPLE_EMAIL.subject}`,
            time,
          },
        ],
      };
    case "revise":
      // Rewriting starts a fresh thread on the new draft. Keeping the old draft
      // and the command above it would need a fourth bubble the panel cannot show.
      return {
        replace: true,
        bubbles: [
          {
            id,
            author: "syncpilot",
            text: `Draft ready for: ${SAMPLE_EMAIL.subject}`,
            body: SAMPLE_DRAFT.shortBody,
            code: REF_CODE,
            time,
          },
        ],
      };
    case "usage":
      return {
        replace: false,
        bubbles: [
          {
            id,
            author: "syncpilot",
            text: `Reply "${REF_CODE} send" to send, "${REF_CODE} no" to discard, or tell me what to change.`,
            time,
          },
        ],
      };
    default:
      return {
        replace: false,
        bubbles: [
          {
            id,
            author: "syncpilot",
            text: `I did not catch a ref code. Try ${REF_CODE} send.`,
            time,
          },
        ],
      };
  }
}

/** `isOpen` gates the draft until the hero's cold open has delivered it. */
export function HeroTerminal({ isOpen }: { isOpen: boolean }) {
  const [bubbles, setBubbles] = useState<Bubble[]>([OPENING_MESSAGE]);
  const [value, setValue] = useState("");
  const [isPending, setIsPending] = useState(false);
  const nextId = useRef(1);
  const timers = useRef<number[]>([]);
  // Bumped on reset so a reply already in flight cannot land in a fresh thread.
  const generation = useRef(0);

  const submit = useCallback(
    (raw: string) => {
      const text = raw.trim();

      if (!text || isPending) {
        return;
      }

      const userId = nextId.current;
      nextId.current += 3;
      const era = generation.current;

      setBubbles((current) =>
        [...current, { id: userId, author: "user" as const, text, time: "09:15" }].slice(
          -MAX_BUBBLES,
        ),
      );
      setValue("");
      setIsPending(true);

      const { kind } = classify(text);

      timers.current.push(
        window.setTimeout(() => {
          if (generation.current !== era) {
            return;
          }

          const reply = replyFor(kind, userId + 1);

          setBubbles((current) =>
            (reply.replace ? reply.bubbles : [...current, ...reply.bubbles]).slice(
              -MAX_BUBBLES,
            ),
          );
          setIsPending(false);
        }, REPLY_DELAY_MS),
      );
    },
    [isPending],
  );

  // Clears any reply still in flight when the panel unmounts.
  useEffect(() => {
    return () => {
      timers.current.forEach(window.clearTimeout);
      timers.current = [];
    };
  }, []);

  return (
    <div className="sp-surface-2 flex w-full flex-col overflow-hidden">
      <header className="flex items-center gap-3 border-b border-white/8 px-4 py-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-white/8">
          <SyncPilotMark size={20} />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-sp-text">SyncPilot</p>
          <Label className="text-[0.6875rem]">Signal · encrypted</Label>
        </div>
      </header>

      <div
        role="log"
        aria-live="polite"
        aria-label="SyncPilot conversation"
        className="flex h-[300px] flex-col justify-end gap-4 overflow-hidden px-4 py-6"
      >
        {(isOpen ? bubbles : []).map((bubble) =>
          bubble.author === "user" ? (
            <div
              key={bubble.id}
              className="sp-bubble-in flex shrink-0 flex-col items-end overflow-hidden"
            >
              <p className="sp-code max-w-[80%] rounded-[14px] rounded-br-[4px] bg-sp-cobalt px-3 py-2 text-white">
                {bubble.text}
              </p>
              <Label className="mt-1 text-[0.6875rem]">{bubble.time}</Label>
            </div>
          ) : (
            <div
              key={bubble.id}
              className="sp-bubble-in flex shrink-0 flex-col items-start overflow-hidden"
            >
              <div className="max-w-[88%] rounded-[14px] rounded-bl-[4px] bg-white/8 px-3 py-3">
                <p className="flex items-start gap-2 text-sm leading-snug text-sp-text/90">
                  {bubble.confirmed ? (
                    <Check
                      size={CHECK_SIZE}
                      strokeWidth={2.6}
                      aria-hidden="true"
                      className="mt-0.5 shrink-0 text-sp-sage"
                    />
                  ) : null}
                  {bubble.text}
                </p>
                {bubble.body ? (
                  <p className="mt-3 text-sm leading-relaxed text-sp-muted">
                    {bubble.body}
                  </p>
                ) : null}
                {bubble.code ? (
                  <p className="mt-3">
                    <RefCode>{bubble.code}</RefCode>
                  </p>
                ) : null}
              </div>
              <Label className="mt-1 text-[0.6875rem]">{bubble.time}</Label>
            </div>
          ),
        )}
      </div>

      <div className="border-t border-white/8 px-4 py-4">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            submit(value);
          }}
          className="flex items-center gap-2"
        >
          <label htmlFor="hero-reply" className="sr-only">
            Reply to SyncPilot
          </label>
          <input
            id="hero-reply"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            autoComplete="off"
            spellCheck={false}
            disabled={isPending || !isOpen}
            placeholder={`${REF_CODE} send`}
            className="sp-code sp-focus min-w-0 flex-1 rounded-full bg-white/6 px-4 py-2 text-sp-text placeholder:text-sp-muted/70 disabled:opacity-60"
          />
          <button
            type="submit"
            aria-label="Send reply"
            disabled={isPending || !isOpen}
            className="sp-focus flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-sp-cobalt text-white transition-transform duration-150 hover:scale-105 active:scale-95 disabled:cursor-default disabled:opacity-60 disabled:hover:scale-100"
          >
            <ArrowUp size={SEND_ICON_SIZE} strokeWidth={2.4} aria-hidden="true" />
          </button>
        </form>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              disabled={isPending || !isOpen}
              onClick={() => submit(`${REF_CODE} ${chip}`)}
              className="sp-code sp-focus cursor-pointer rounded-full border border-white/10 bg-white/4 px-3 py-1 text-sp-muted transition-colors duration-150 hover:border-white/20 hover:text-sp-text disabled:cursor-default disabled:opacity-60 disabled:hover:border-white/10 disabled:hover:text-sp-muted"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
