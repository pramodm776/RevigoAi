import Razorpay from "razorpay";

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_dummy",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "dummy_secret",
});

export const PLAN_PRICES: Record<string, { amount: number; name: string; currency: string }> = {
  STARTER: {
    amount: 49900, // ₹499 in paise
    name: "Starter Plan (Monthly)",
    currency: "INR",
  },
  PRO: {
    amount: 99900, // ₹999 in paise
    name: "Pro Plan (Monthly)",
    currency: "INR",
  },
  AGENCY: {
    amount: 299900, // ₹2999 in paise
    name: "Agency Plan (Monthly)",
    currency: "INR",
  },
};
