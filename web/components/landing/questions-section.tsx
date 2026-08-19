import { FAQS } from "@/components/landing/landing-content";
import { LandingFaq } from "@/components/landing/landing-faq";

export function QuestionsSection() {
  return (
    <section className="px-5 py-16 sm:px-6 md:py-24">
      <div className="mx-auto w-full max-w-3xl">
        <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          Before you connect anything
        </h2>
        <div className="mt-8">
          <LandingFaq items={FAQS} />
        </div>
      </div>
    </section>
  );
}
