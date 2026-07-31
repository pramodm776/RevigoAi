import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payment Successful — RevigoAI",
  description: "Your subscription payment was processed successfully",
};

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ payment_id?: string; plan?: string; order_id?: string }>;
}) {
  const params = await searchParams;
  const paymentId = params.payment_id || "pay_demo_123456";
  const plan = params.plan || "PRO";

  return (
    <main className="pay-status-page">
      <div className="pay-card pay-success-card">
        <div className="pay-icon-circle success">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path
              d="M8 16l6 6 10-10"
              stroke="#10b981"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className="pay-badge success">Payment Verified</div>
        <h1 className="pay-title">Subscription Activated! 🎉</h1>
        <p className="pay-subtitle">
          Thank you for subscribing to RevigoAI. Your account has been upgraded to the{" "}
          <strong>{plan} Plan</strong>.
        </p>

        <div className="pay-details">
          <div className="pay-detail-row">
            <span>Payment ID</span>
            <code className="pay-code">{paymentId}</code>
          </div>
          {params.order_id && (
            <div className="pay-detail-row">
              <span>Order ID</span>
              <code className="pay-code">{params.order_id}</code>
            </div>
          )}
          <div className="pay-detail-row">
            <span>Status</span>
            <span className="pay-status-active">Active ✅</span>
          </div>
          <div className="pay-detail-row">
            <span>Billing Cycle</span>
            <span>Monthly Auto-Renew</span>
          </div>
        </div>

        <div className="pay-actions">
          <Link href="/dashboard" className="pay-btn-primary">
            🚀 Access My Dashboard
          </Link>
          <Link href="/dashboard/billing" className="pay-btn-secondary">
            📄 View Billing & Invoices
          </Link>
        </div>
      </div>
    </main>
  );
}
