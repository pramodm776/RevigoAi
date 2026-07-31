import type { Metadata } from "next";
import { Suspense } from "react";
import SubscriptionPlans from "@/components/SubscriptionPlans";

export const metadata: Metadata = {
  title: "Choose Your Plan — RevigoAI",
  description: "Select the perfect subscription plan for your business",
};

export default function SubscriptionPage() {
  return (
    <main className="sub-page">
      <Suspense fallback={<div className="sub-loading">Loading plans...</div>}>
        <SubscriptionPlans />
      </Suspense>
    </main>
  );
}
