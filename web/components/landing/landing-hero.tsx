"use client";

import { Fragment, useCallback, useState } from "react";
import { PendingLink } from "@/components/pending-link";
import { HERO_PROOF, HERO_SUMMARY } from "@/components/landing/landing-content";
import { HeroPipeline } from "@/components/landing/hero-pipeline";
import { HeroTerminal } from "@/components/landing/hero-terminal";
import { Container, Panel, Section } from "@/components/landing/layout-primitives";
import {
  landingPrimaryButton,
  landingSecondaryButton,
} from "@/components/landing/landing-button";

export function LandingHero() {
  const [isDraftReady, setIsDraftReady] = useState(false);
  const onDraftReady = useCallback(() => setIsDraftReady(true), []);

  return (
    <Section>
      <Panel label="Reply send">
        <Container>
          <div className="grid items-center gap-16 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-7">
              <h1 className="sp-display text-sp-text">
                Reply <span className="text-sp-amber">&ldquo;send.&rdquo;</span>
                <br />
                That&rsquo;s the whole interface.
              </h1>

              <p className="sp-lead sp-measure mt-6 text-sp-muted">
                {HERO_SUMMARY}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <PendingLink href="/dashboard" className={landingPrimaryButton}>
                  Get started
                </PendingLink>
                <a href="#how-it-works" className={landingSecondaryButton}>
                  Watch it decide
                </a>
              </div>

              <ul className="sp-label mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 normal-case tracking-[0.04em] text-sp-muted">
                {HERO_PROOF.map((proof, index) => (
                  <Fragment key={proof}>
                    {index > 0 ? (
                      <li aria-hidden="true" className="text-sp-muted/40">
                        &middot;
                      </li>
                    ) : null}
                    <li>{proof}</li>
                  </Fragment>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-8 lg:col-span-5">
              <HeroPipeline onDraftReady={onDraftReady} />
              <HeroTerminal isOpen={isDraftReady} />
            </div>
          </div>
        </Container>
      </Panel>
    </Section>
  );
}
