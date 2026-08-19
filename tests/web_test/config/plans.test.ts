import { describe, expect, it } from "vitest";
import {
  FREE_MONTHLY_TOKEN_LIMIT,
  PRO_PLAN_PRICE_INR,
  PRO_PLAN_TOTAL_BILLING_CYCLES,
} from "@/config/plans";
import { PLANS } from "@/components/landing/landing-content";

describe("plan constants", () => {
  it("keeps the free token limit a positive whole number", () => {
    expect(Number.isInteger(FREE_MONTHLY_TOKEN_LIMIT)).toBe(true);
    expect(FREE_MONTHLY_TOKEN_LIMIT).toBeGreaterThan(0);
  });

  it("keeps the Pro price a positive whole number of rupees", () => {
    expect(Number.isInteger(PRO_PLAN_PRICE_INR)).toBe(true);
    expect(PRO_PLAN_PRICE_INR).toBeGreaterThan(0);
  });

  it("charges twelve billing cycles", () => {
    expect(PRO_PLAN_TOTAL_BILLING_CYCLES).toBe(12);
  });
});

// The public page and the checkout call must never quote different numbers, so
// the marketing copy is asserted against the same constants checkout uses.
describe("landing pricing copy", () => {
  const free = PLANS.find((plan) => plan.name === "Free");
  const pro = PLANS.find((plan) => plan.name === "Pro");

  it("lists exactly the free and pro plans", () => {
    expect(PLANS.map((plan) => plan.name)).toEqual(["Free", "Pro"]);
  });

  it("quotes the Pro price from the constant checkout uses", () => {
    expect(pro?.price).toBe(`₹${PRO_PLAN_PRICE_INR}`);
  });

  it("states the free token allowance from the enforced limit", () => {
    const tokensFeature = free?.features.find((feature) =>
      feature.includes("AI tokens"),
    );
    const quoted = Number(tokensFeature?.replace(/[^0-9]/g, ""));

    expect(quoted).toBe(FREE_MONTHLY_TOKEN_LIMIT);
  });

  it("features only the Pro card", () => {
    expect(PLANS.filter((plan) => plan.featured)).toHaveLength(1);
    expect(pro?.featured).toBe(true);
  });
});
