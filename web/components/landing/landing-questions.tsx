import { FAQS } from "@/components/landing/landing-content";
import { LandingFaq } from "@/components/landing/landing-faq";

export function LandingQuestions() {
  return (
    <section className="border-t border-sp-text/8 bg-[#A089E6]/[0.05]">
      <div className="mx-auto w-full max-w-3xl px-5 py-16 sm:px-6 md:py-24">
        <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Questions
        </h2>
        <div className="mt-8">
          <LandingFaq items={FAQS} />
        </div>
      </div>
    </section>
  );
}
