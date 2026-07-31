import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Billing & Subscriptions — RevigoAI",
  description: "Manage your subscription plan, view payment history and invoices",
};

export default async function BillingPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const business = await prisma.business.findUnique({
    where: { clerkUserId: userId },
    include: {
      subscription: {
        include: {
          payments: {
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
  });

  if (!business) {
    redirect("/register-business");
  }

  const subscription = business.subscription;
  const currentPlan = subscription?.plan || "FREE";
  const status = subscription?.status || "INACTIVE";
  const payments = subscription?.payments || [];

  const planPrices: Record<string, string> = {
    FREE: "₹0 / month",
    STARTER: "₹499 / month",
    PRO: "₹999 / month",
    AGENCY: "₹2,999 / month",
  };

  return (
    <div className="dash-layout">
      {/* Sidebar */}
      <aside className="dash-sidebar">
        <div className="dash-brand">
          <div className="dash-brand-logo">
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="16" fill="url(#dashGrad)" />
              <path d="M10 16l4 4 8-8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <defs>
                <linearGradient id="dashGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#6366f1" />
                  <stop offset="1" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="dash-brand-name">RevigoAI</span>
        </div>

        {business.logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <div className="dash-biz-logo">
            <img src={business.logoUrl} alt={business.businessName} />
          </div>
        )}

        <div className="dash-biz-info">
          <p className="dash-biz-name">{business.businessName}</p>
          <p className="dash-biz-category">{business.category.charAt(0) + business.category.slice(1).toLowerCase()}</p>
          <div className="dash-plan-badge">
            {currentPlan} Plan
          </div>
        </div>

        <nav className="dash-nav">
          {[
            { href: "/dashboard", icon: "🏠", label: "Overview" },
            { href: "/dashboard/reviews", icon: "⭐", label: "Reviews" },
            { href: "/dashboard/requests", icon: "📨", label: "Review Requests" },
            { href: "/dashboard/billing", icon: "💳", label: "Billing & Plans", active: true },
            { href: "/dashboard/analytics", icon: "📊", label: "Analytics" },
            { href: "/dashboard/settings", icon: "⚙️", label: "Settings" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`dash-nav-item ${item.active ? "active" : ""}`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="dash-sidebar-footer">
          <Link href="/subscription" className="dash-upgrade-btn">
            ⚡ Upgrade Plan
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dash-main">
        <div className="dash-topbar">
          <div>
            <h1 className="dash-welcome">Billing & Subscriptions</h1>
            <p className="dash-date">Manage your Razorpay payments and active subscription plan</p>
          </div>
          <div className="dash-topbar-actions">
            <Link href="/subscription" className="dash-start-btn">
              Change / Upgrade Plan →
            </Link>
          </div>
        </div>

        {/* Current Plan Overview Card */}
        <div className="billing-active-card">
          <div className="billing-active-header">
            <div>
              <span className="billing-plan-label">Active Plan</span>
              <h2 className="billing-plan-name">{currentPlan} Plan</h2>
              <p className="billing-plan-price">{planPrices[currentPlan]}</p>
            </div>
            <div className={`billing-status-pill ${status.toLowerCase()}`}>
              {status === "ACTIVE" ? "🟢 Active" : "🟡 Free / Inactive"}
            </div>
          </div>

          <div className="billing-active-details">
            <div className="billing-detail">
              <span className="billing-detail-label">Billing Cycle</span>
              <span className="billing-detail-val">Monthly</span>
            </div>
            <div className="billing-detail">
              <span className="billing-detail-label">Started On</span>
              <span className="billing-detail-val">
                {subscription?.startedAt
                  ? new Date(subscription.startedAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "—"}
              </span>
            </div>
            <div className="billing-detail">
              <span className="billing-detail-label">Renews / Expires On</span>
              <span className="billing-detail-val">
                {subscription?.expiresAt
                  ? new Date(subscription.expiresAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "—"}
              </span>
            </div>
            <div className="billing-detail">
              <span className="billing-detail-label">Payment Gateway</span>
              <span className="billing-detail-val">Razorpay (UPI / Card / NetBanking)</span>
            </div>
          </div>
        </div>

        {/* Payment History Section */}
        <div className="billing-history-section">
          <h2 className="dash-card-title">📜 Payment History</h2>
          {payments.length === 0 ? (
            <div className="billing-empty">
              <div className="billing-empty-icon">💳</div>
              <p className="billing-empty-text">No payment records found yet.</p>
              <p className="billing-empty-sub">
                Once you make a subscription payment via Razorpay, transaction history will appear here.
              </p>
              <Link href="/subscription" className="dash-start-btn" style={{ marginTop: "1rem" }}>
                Choose a Subscription Plan
              </Link>
            </div>
          ) : (
            <div className="billing-table-wrapper">
              <table className="billing-table">
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>Payment ID</th>
                    <th>Order ID</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((pay) => (
                    <tr key={pay.id}>
                      <td>
                        {new Date(pay.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td>
                        <code className="pay-code">{pay.razorpayPaymentId}</code>
                      </td>
                      <td>
                        <code className="pay-code">{pay.razorpayOrderId ?? "—"}</code>
                      </td>
                      <td className="billing-amount">
                        ₹{(pay.amount / 100).toLocaleString("en-IN")}
                      </td>
                      <td>
                        <span className={`billing-status-badge ${pay.status.toLowerCase()}`}>
                          {pay.status === "SUCCESS" ? "✓ Success" : pay.status === "FAILED" ? "✕ Failed" : "⏳ Pending"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
