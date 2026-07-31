import type { Metadata } from "next";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dashboard — RevigoAI",
  description: "Manage your business reviews and reputation",
};

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();

  const business = await prisma.business.findUnique({
    where: { clerkUserId: userId },
    include: { subscription: true },
  });

  if (!business) {
    redirect("/register-business");
  }

  const stats = [
    { label: "Total Reviews", value: "0", icon: "⭐", color: "stat-yellow" },
    { label: "Avg. Rating", value: "—", icon: "📊", color: "stat-blue" },
    { label: "Review Requests Sent", value: "0", icon: "📨", color: "stat-green" },
    { label: "Response Rate", value: "0%", icon: "💬", color: "stat-purple" },
  ];

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
            {business.subscription?.plan ?? "FREE"} Plan
          </div>
        </div>

        <nav className="dash-nav">
          {[
            { href: "/dashboard", icon: "🏠", label: "Overview", active: true },
            { href: "/dashboard/reviews", icon: "⭐", label: "Reviews" },
            { href: "/dashboard/requests", icon: "📨", label: "Review Requests" },
            { href: "/dashboard/billing", icon: "💳", label: "Billing & Plans" },
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
        {/* Top Bar */}
        <div className="dash-topbar">
          <div>
            <h1 className="dash-welcome">
              Welcome back, {user?.firstName ?? business.ownerName.split(" ")[0]}! 👋
            </h1>
            <p className="dash-date">
              {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <div className="dash-topbar-actions">
            <a
              href={business.googleReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="dash-review-link"
            >
              🔗 My Google Review Link
            </a>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="dash-stats">
          {stats.map((stat) => (
            <div key={stat.label} className={`dash-stat ${stat.color}`}>
              <div className="dash-stat-icon">{stat.icon}</div>
              <div className="dash-stat-value">{stat.value}</div>
              <div className="dash-stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Business Details Card */}
        <div className="dash-cards">
          <div className="dash-card">
            <h2 className="dash-card-title">Business Profile</h2>
            <div className="dash-profile-grid">
              {[
                { label: "Business Name", value: business.businessName },
                { label: "Owner", value: business.ownerName },
                { label: "Email", value: business.email },
                { label: "Phone", value: business.phone },
                { label: "Address", value: business.address },
                { label: "Unique Slug", value: `revigo.ai/${business.slug}` },
                { label: "Website", value: business.website ?? "—" },
              ].map((row) => (
                <div key={row.label} className="dash-profile-row">
                  <span className="dash-profile-label">{row.label}</span>
                  <span className="dash-profile-value">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Getting Started Card */}
          <div className="dash-card dash-card-start">
            <h2 className="dash-card-title">🚀 Getting Started</h2>
            <div className="dash-checklist">
              {[
                { done: true, task: "Create your account" },
                { done: true, task: "Register your business" },
                { done: business.subscription?.status === "ACTIVE", task: "Choose a subscription plan" },
                { done: false, task: "Send your first review request" },
                { done: false, task: "Set up AI auto-responses" },
              ].map((item, i) => (
                <div key={i} className={`dash-check-item ${item.done ? "done" : ""}`}>
                  <div className="dash-check-circle">
                    {item.done ? "✓" : i + 1}
                  </div>
                  <span>{item.task}</span>
                </div>
              ))}
            </div>
            <Link href="/subscription" className="dash-start-btn">
              {business.subscription?.status === "ACTIVE" ? "Manage Subscription →" : "Choose a Plan →"}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
