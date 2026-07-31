import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payment Failed — RevigoAI",
  description: "Your payment attempt could not be processed",
};

export default function PaymentFailurePage() {
  return (
    <main className="pay-status-page">
      <div className="pay-card pay-failure-card">
        <div className="pay-icon-circle failure">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path
              d="M10 10l12 12M22 10L10 22"
              stroke="#ef4444"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className="pay-badge failure">Payment Unsuccessful</div>
        <h1 className="pay-title">Transaction Failed ⚠️</h1>
        <p className="pay-subtitle">
          We couldn&apos;t complete your subscription payment. No funds were debited, or any deducted amount will be automatically refunded by your bank within 3–5 days.
        </p>

        <div className="pay-details failure-details">
          <p className="pay-reason-title">Possible Reasons:</p>
          <ul className="pay-reasons">
            <li>Payment was cancelled or closed by user</li>
            <li>Insufficient balance or card limit exceeded</li>
            <li>Bank OTP authentication timed out</li>
            <li>Network interruption during checkout</li>
          </ul>
        </div>

        <div className="pay-actions">
          <Link href="/subscription" className="pay-btn-primary retry">
            🔄 Try Payment Again
          </Link>
          <Link href="/dashboard" className="pay-btn-secondary">
            🏠 Return to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
