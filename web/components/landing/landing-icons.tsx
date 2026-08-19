import { createElement } from "react";
import {
  AlarmClock,
  Archive,
  CircleSlash,
  FileText,
  Mail,
  PenLine,
  RefreshCw,
  Search,
  Send,
  Tag,
  TriangleAlert,
  X,
  type LucideIcon,
} from "lucide-react";
import type { DecisionValue } from "@/db/schema";
import type { ActionKey, ActivityKind } from "@/components/landing/landing-content";

// Lucide only, stroke 1.5, never filled. One set for the whole page.
export const ICON_STROKE = 1.5;
export const ICON_SIZE_SM = 16;
export const ICON_SIZE_MD = 20;

const ACTION_ICONS: Record<ActionKey, LucideIcon> = {
  draft_reply: PenLine,
  summarize_notify: FileText,
  escalate: TriangleAlert,
  apply_label: Tag,
  archive: Archive,
  snooze: AlarmClock,
  ignore: CircleSlash,
};

export function actionIcon(key: ActionKey): LucideIcon {
  return ACTION_ICONS[key];
}

// Decision values and action keys share a vocabulary, so they share icons.
export function decisionIcon(decision: DecisionValue): LucideIcon {
  return ACTION_ICONS[decision as ActionKey];
}

const ACTIVITY_ICONS: Record<ActivityKind, LucideIcon> = {
  check: Search,
  draft: PenLine,
  sent: Send,
  archive: Archive,
  summarize: FileText,
  snooze: AlarmClock,
};

export function activityIcon(kind: ActivityKind): LucideIcon {
  return ACTIVITY_ICONS[kind];
}

export const OutcomeIcons = {
  sent: Send,
  discarded: X,
  revised: RefreshCw,
} as const;

export { Mail, RefreshCw };

/**
 * Renders one icon from the set. Resolving the component through createElement
 * keeps callers from assigning a component to a local during render.
 */
export function Glyph({
  icon,
  size = ICON_SIZE_SM,
  className,
}: {
  icon: LucideIcon;
  size?: number;
  className?: string;
}) {
  return createElement(icon, {
    size,
    strokeWidth: ICON_STROKE,
    "aria-hidden": true,
    className,
  });
}
