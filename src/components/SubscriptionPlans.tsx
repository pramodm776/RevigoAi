"use client";

import { useSearchParams, useRouter } from "next/navigation";

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: "$19",
    period: "/month",
    description: "Perfect for single-location businesses just getting started",
    color: "plan-blue",
    icon: "🚀",
    features: [
      "Up to 50 review requests/month",
      "Google Reviews integration",
      "AI response suggestions",
      "Basic analytics dashboard",
      "Email support",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    id: "professional",
    name: "Professional",
    price: "$49",
    period: "/month",
    description: "For growing businesses that want to dominate local search",
    color: "plan-purple",
    icon: "⭐",
    features: [
      "Unlimited review requests",
      "Multi-platform (Google, Yelp, TripAdvisor)",
      "AI-powered review responses",
      "Advanced analytics & reports",
      "SMS + Email campaigns",
      "QR code generator",
      "Priority support",
    ],
    cta: "Get Started",
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "$149",
    period: "/month",
    description: "For multi-location businesses and agencies",
    color: "plan-gold",
    icon: "👑",
    features: [
      "Everything in Professional",
      "Up to 20 locations",
      "White-label reports",
      "Custom integrations (API)",
      "Dedicated account manager",
      "SLA guarantee",
      "Team collaboration tools",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

export default function SubscriptionPlans() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const businessSlug = searchParams.get("business");

  const handleSelect = (planId: string) => {
    // In production this would initiate Stripe checkout
    // For now, redirect to dashboard
    console.log(`Selected plan: ${planId} for business: ${businessSlug}`);
    router.push("/dashboard");
  };

  return (
    <div className="sub-container">
      <div className="sub-header">
        <div className="sub-badge">Choose Your Plan</div>
        <h1 className="sub-title">Start growing your reputation today</h1>
        <p className="sub-subtitle">
          All plans include a 14-day free trial. No credit card required.
        </p>
      </div>

      <div className="sub-plans">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`sub-plan ${plan.color} ${plan.popular ? "popular" : ""}`}
          >
            {plan.popular && <div className="sub-popular-badge">Most Popular</div>}
            <div className="sub-plan-header">
              <span className="sub-plan-icon">{plan.icon}</span>
              <h2 className="sub-plan-name">{plan.name}</h2>
              <div className="sub-plan-price">
                <span className="sub-price-amount">{plan.price}</span>
                <span className="sub-price-period">{plan.period}</span>
              </div>
              <p className="sub-plan-desc">{plan.description}</p>
            </div>
            <ul className="sub-features">
              {plan.features.map((f, i) => (
                <li key={i} className="sub-feature">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="sub-check">
                    <circle cx="8" cy="8" r="8" fill="currentColor" fillOpacity="0.15" />
                    <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <button
              className={`sub-cta ${plan.popular ? "sub-cta-primary" : "sub-cta-secondary"}`}
              onClick={() => handleSelect(plan.id)}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>

      <div className="sub-footer">
        <button className="sub-skip" onClick={() => router.push("/dashboard")}>
          Skip for now — I&apos;ll choose later
        </button>
        <p className="sub-guarantee">
          🔒 Secure payment · Cancel anytime · 30-day money-back guarantee
        </p>
      </div>
    </div>
  );
}
