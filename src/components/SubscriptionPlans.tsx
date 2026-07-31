"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

// Declare Razorpay on window interface
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

const PLANS = [
  {
    id: "STARTER",
    name: "Starter",
    price: "₹499",
    period: "/month",
    amountInRupees: 499,
    description: "Perfect for single-location businesses starting their review journey",
    color: "plan-blue",
    icon: "🚀",
    features: [
      "Up to 50 review requests/month",
      "Google Reviews integration",
      "AI response suggestions",
      "Basic analytics dashboard",
      "Email & WhatsApp support",
    ],
    cta: "Subscribe to Starter",
    popular: false,
  },
  {
    id: "PRO",
    name: "Pro",
    price: "₹999",
    period: "/month",
    amountInRupees: 999,
    description: "For growing businesses that want to dominate local search",
    color: "plan-purple",
    icon: "⭐",
    features: [
      "Unlimited review requests",
      "Multi-platform (Google, Yelp, TripAdvisor)",
      "AI-powered review auto-responses",
      "Advanced analytics & trend reports",
      "SMS + Email campaign manager",
      "Custom QR code generator",
      "Priority 24/7 support",
    ],
    cta: "Subscribe to Pro",
    popular: true,
  },
  {
    id: "AGENCY",
    name: "Agency",
    price: "₹2,999",
    period: "/month",
    amountInRupees: 2999,
    description: "For multi-location brands and reputation management agencies",
    color: "plan-gold",
    icon: "👑",
    features: [
      "Everything in Pro",
      "Manage up to 20 business locations",
      "White-label client PDF reports",
      "Custom API access & webhooks",
      "Dedicated account manager",
      "SLA 99.9% uptime guarantee",
      "Team permission management",
    ],
    cta: "Subscribe to Agency",
    popular: false,
  },
];

export default function SubscriptionPlans() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const businessSlug = searchParams.get("business");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Helper to load Razorpay Checkout SDK dynamically
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubscribe = async (planId: string) => {
    setLoadingPlan(planId);
    setErrorMsg("");

    try {
      // 1. Ensure Razorpay Checkout script is loaded
      const resScript = await loadRazorpayScript();
      if (!resScript) {
        throw new Error("Failed to load Razorpay SDK. Please check your internet connection.");
      }

      // 2. Create Razorpay order on server
      const orderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        throw new Error(orderData.error || "Failed to initiate payment");
      }

      // 3. Configure Razorpay modal options
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "RevigoAI",
        description: `${planId} Subscription Payment`,
        order_id: orderData.orderId,
        prefill: {
          name: orderData.ownerName || orderData.businessName,
          email: orderData.ownerEmail,
          contact: orderData.ownerPhone,
        },
        theme: {
          color: "#6366f1",
        },
        handler: async function (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) {
          // 4. Verify payment on server
          try {
            const verifyRes = await fetch("/api/razorpay/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...response,
                plan: planId,
                amount: orderData.amount,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyData.redirectUrl) {
              router.push(verifyData.redirectUrl);
            } else {
              router.push("/payment/success");
            }
          } catch (verifyErr) {
            console.error("Verification failed:", verifyErr);
            router.push("/payment/failure");
          }
        },
        modal: {
          ondismiss: function () {
            setLoadingPlan(null);
          },
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.on("payment.failed", function (response: { error: { description: string } }) {
        console.error("Razorpay Payment Failed:", response.error);
        router.push("/payment/failure");
      });

      paymentObject.open();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="sub-container">
      <div className="sub-header">
        <div className="sub-badge">💳 Instant Razorpay Checkout</div>
        <h1 className="sub-title">Choose the right plan for your business</h1>
        <p className="sub-subtitle">
          Unlock 5-star Google review growth with flexible Indian Rupee (₹) pricing
        </p>
      </div>

      {errorMsg && (
        <div className="sub-error-banner">
          <span>⚠️</span> {errorMsg}
        </div>
      )}

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
              onClick={() => handleSubscribe(plan.id)}
              disabled={loadingPlan === plan.id}
            >
              {loadingPlan === plan.id ? (
                <span className="reg-btn-loading">
                  <span className="reg-spinner" />
                  Opening Checkout...
                </span>
              ) : (
                plan.cta
              )}
            </button>
          </div>
        ))}
      </div>

      <div className="sub-footer">
        <button
          className="sub-skip"
          onClick={() => router.push("/dashboard")}
        >
          {businessSlug ? "Continue to Dashboard (Free Trial)" : "Skip for now — Explore Dashboard"}
        </button>
        <p className="sub-guarantee">
          🔒 Secured by Razorpay · UPI, Cards, NetBanking & Wallets accepted · Instant Activation
        </p>
      </div>
    </div>
  );
}
