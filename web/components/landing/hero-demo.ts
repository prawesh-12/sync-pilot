import { REF_CODE, SAMPLE_DRAFT, SAMPLE_EMAIL } from "@/components/landing/landing-content";

/**
 * The attract-mode script for the hero panel. Three passes of 7 seconds, one
 * per command, derived from a single elapsed value so nothing can desync.
 */

export const PASS_MS = 7000;
export const DEMO_CYCLE_MS = PASS_MS * 3;

// Beats within one pass.
const CHIP_LIT = 400;
const TYPE_START = 800;
const INPUT_CLEAR = 1500;
const SENT_BUBBLE = 1700;
const TYPING_DOTS = 2100;
const RESULT = 2900;
const CHIP_REST = 3200;
const FADE_OUT = 6600;

const TYPE_CHAR_MS = 45;
/** Typing has to finish before the input clears, so long commands go quicker. */
const TYPE_WINDOW_MS = INPUT_CLEAR - TYPE_START;

export type DemoResult = {
  tone: "sent" | "discarded" | "revised";
  text: string;
};

export type DemoPass = {
  chip: string;
  command: string;
  result: DemoResult;
  /** Set when this pass rewrites the draft card in place. */
  rewriteTo?: string;
};

export const DEMO_PASSES: DemoPass[] = [
  {
    chip: "send",
    command: `${REF_CODE} send`,
    result: { tone: "sent", text: `Sent your reply for: ${SAMPLE_EMAIL.subject}` },
  },
  {
    chip: "no",
    command: `${REF_CODE} no`,
    result: { tone: "discarded", text: "Draft discarded. Nothing was sent." },
  },
  {
    chip: "make it shorter",
    command: `${REF_CODE} make it shorter`,
    result: { tone: "revised", text: "Rewritten. Here is the shorter draft." },
    rewriteTo: SAMPLE_DRAFT.shortBody,
  },
];

export type DemoFrame = {
  pass: DemoPass;
  /** Which chip is lit, or null when all are at rest. */
  litChip: string | null;
  /** What the composer shows. */
  typed: string;
  isCaretOn: boolean;
  isButtonPulsing: boolean;
  /** The draft card's body, which the rewrite pass swaps mid-pass. */
  draftBody: string;
  showSent: boolean;
  showTyping: boolean;
  showResult: boolean;
  /** Fades the pass's own messages out before the next one begins. */
  isClearing: boolean;
};

/** The whole panel state as a pure function of elapsed milliseconds. */
export function demoFrameAt(elapsed: number): DemoFrame {
  const index = Math.floor(elapsed / PASS_MS) % DEMO_PASSES.length;
  const pass = DEMO_PASSES[index];
  const t = elapsed % PASS_MS;

  const perChar = Math.min(TYPE_CHAR_MS, TYPE_WINDOW_MS / pass.command.length);
  const typedCount =
    t < TYPE_START || t >= INPUT_CLEAR
      ? 0
      : Math.min(pass.command.length, Math.floor((t - TYPE_START) / perChar));

  const isRewritten = Boolean(pass.rewriteTo) && t >= RESULT && t < FADE_OUT;

  return {
    pass,
    litChip: t >= CHIP_LIT && t < CHIP_REST ? pass.chip : null,
    typed: pass.command.slice(0, typedCount),
    isCaretOn: t >= TYPE_START && t < INPUT_CLEAR,
    isButtonPulsing: t >= INPUT_CLEAR && t < SENT_BUBBLE,
    draftBody: isRewritten ? pass.rewriteTo! : SAMPLE_DRAFT.body,
    showSent: t >= SENT_BUBBLE && t < FADE_OUT,
    showTyping: t >= TYPING_DOTS && t < RESULT,
    showResult: t >= RESULT && t < FADE_OUT,
    isClearing: t >= FADE_OUT,
  };
}
