import {
  OVERHEAD_POINTS,
  WHY_HEADING,
  WHY_SUMMARY,
  type OverheadPoint,
} from "@/components/landing/landing-content";
import { DecisionCollapse } from "@/components/landing/decision-collapse";
import { DrawOnView } from "@/components/landing/draw-on-view";
import { EyeIcon, NibIcon, ScalesIcon } from "@/components/landing/flow-icons";
import {
  Container,
  Label,
  Panel,
  Section,
} from "@/components/landing/layout-primitives";
import { cn } from "@/lib/utils";

/** What the product is for, before any of the mechanism. */

const POINT_ICONS = {
  triage: EyeIcon,
  drafting: NibIcon,
  control: ScalesIcon,
} satisfies Record<OverheadPoint["key"], unknown>;

/* Matched to the flow above: whichever hue an icon wears there, it wears here. */
const POINT_TONES = {
  triage: "text-sp-sky",
  drafting: "text-sp-lilac",
  control: "text-sp-sage",
} satisfies Record<OverheadPoint["key"], string>;

const CARD_STAGGER_MS = 120;
const CARD_ICON_SIZE = 32;

export function WhySection() {
  return (
    <Section id="why">
      <Panel label="Why it exists">
        <Container>
          {/* The three
              things that stop being your job underneath. Stacked instead, this
              panel runs past a 900px viewport. */}
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-12">
            <div className="min-w-0 lg:col-span-5">
              <Label>Why it exists</Label>
              <h2 className="sp-h2 mt-3 text-sp-text">{WHY_HEADING}</h2>
              <p className="sp-body mt-6 text-sp-muted">{WHY_SUMMARY}</p>
            </div>

            <div className="min-w-0 lg:col-span-7">
              <DecisionCollapse />
            </div>
          </div>

          {/* No circles, no boxed corner glyphs: the icon sits on the
              heading's own line at the size of a heading, drawn from the same
              set as the flow above so the two read as one drawing. */}
          <DrawOnView className="mt-12 grid gap-x-6 gap-y-8 md:grid-cols-3">
            {OVERHEAD_POINTS.map((point, index) => {
              const PointIcon = POINT_ICONS[point.key];

              return (
                <div
                  key={point.key}
                  className="min-w-0 border-t border-white/8 pt-6"
                >
                  <div className="flex items-start gap-3">
                    <PointIcon
                      size={CARD_ICON_SIZE}
                      delayMs={index * CARD_STAGGER_MS}
                      className={cn("mt-0.5", POINT_TONES[point.key])}
                    />
                    <div className="min-w-0">
                      <Label className={POINT_TONES[point.key]}>{point.label}</Label>
                      <p className="sp-h3 mt-2 text-sp-text">{point.title}</p>
                    </div>
                  </div>
                  <p className="sp-body mt-3 text-sp-muted">{point.detail}</p>
                </div>
              );
            })}
          </DrawOnView>
        </Container>
      </Panel>
    </Section>
  );
}
