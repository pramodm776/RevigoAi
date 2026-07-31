import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RevigoAI — AI-Powered Review Management for Local Businesses",
  description:
    "Turn happy customers into 5-star reviews. RevigoAI helps local businesses collect, manage, and respond to Google reviews automatically.",
};

const FEATURES = [
  {
    icon: "⭐",
    title: "Collect More Reviews",
    desc: "Send automated review requests via SMS and email after every customer visit",
  },
  {
    icon: "🤖",
    title: "AI-Powered Responses",
    desc: "Respond to all your reviews instantly with context-aware AI replies",
  },
  {
    icon: "📊",
    title: "Analytics Dashboard",
    desc: "Track your reputation score, review trends, and competitor insights",
  },
  {
    icon: "🔗",
    title: "Unique Review Links",
    desc: "Get a custom review link that makes it effortless for customers to leave feedback",
  },
  {
    icon: "🛡️",
    title: "Negative Review Filtering",
    desc: "Catch unhappy customers privately before they post a negative review",
  },
  {
    icon: "📱",
    title: "QR Code Generator",
    desc: "Print your review QR code on receipts, tables, or windows",
  },
];

export default async function HomePage() {
  const { userId } = await auth();

  return (
    <div className="home">
      {/* Nav */}
      <nav className="home-nav">
        <div className="home-nav-brand">
          <div className="home-nav-logo">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="16" fill="url(#homeGrad)" />
              <path d="M10 16l4 4 8-8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <defs>
                <linearGradient id="homeGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#6366f1" />
                  <stop offset="1" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="home-nav-name">RevigoAI</span>
        </div>
        <div className="home-nav-actions">
          {userId ? (
            <>
              <Link href="/dashboard" className="home-nav-signin">Dashboard</Link>
              <UserButton />
            </>
          ) : (
            <>
              <Link href="/sign-in" className="home-nav-signin">Sign In</Link>
              <Link href="/sign-up" className="home-nav-signup">Get Started Free</Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="home-hero">
        <div className="home-hero-orbs">
          <div className="home-orb home-orb-1" />
          <div className="home-orb home-orb-2" />
          <div className="home-orb home-orb-3" />
        </div>
        <div className="home-hero-content">
          <div className="home-hero-badge">🏆 Trusted by 1,000+ Local Businesses</div>
          <h1 className="home-hero-title">
            Turn Every Customer Into
            <span className="home-hero-gradient"> a 5-Star Review</span>
          </h1>
          <p className="home-hero-desc">
            RevigoAI automates your Google review collection, responds with AI, and
            gives you real-time reputation analytics — so you can focus on running
            your business.
          </p>
          <div className="home-hero-cta">
            <Link href={userId ? "/dashboard" : "/sign-up"} className="home-cta-primary">
              {userId ? "Go to Dashboard →" : "Start Free Trial →"}
            </Link>
            <Link href="#features" className="home-cta-secondary">
              See How It Works
            </Link>
          </div>
          <div className="home-hero-social">
            <div className="home-stars">
              {[1, 2, 3, 4, 5].map((i) => (
                <span key={i} className="home-star">⭐</span>
              ))}
            </div>
            <span className="home-social-text">4.9/5 from 500+ reviews</span>
          </div>
        </div>

        {/* Hero Dashboard Mockup */}
        <div className="home-hero-mockup">
          <div className="home-mockup-card">
            <div className="home-mockup-header">
              <div className="home-mockup-dots">
                <span /><span /><span />
              </div>
              <span className="home-mockup-title">RevigoAI Dashboard</span>
            </div>
            <div className="home-mockup-stats">
              {[
                { label: "Reviews This Month", value: "47", trend: "+23%" },
                { label: "Avg Rating", value: "4.9", trend: "+0.3" },
                { label: "Response Rate", value: "98%", trend: "+12%" },
              ].map((s) => (
                <div key={s.label} className="home-mockup-stat">
                  <div className="home-mockup-stat-value">{s.value}</div>
                  <div className="home-mockup-stat-label">{s.label}</div>
                  <div className="home-mockup-stat-trend">↑ {s.trend}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="home-features">
        <h2 className="home-section-title">Everything you need to dominate local search</h2>
        <p className="home-section-subtitle">
          A complete reputation management platform built for local business owners
        </p>
        <div className="home-features-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="home-feature-card">
              <div className="home-feature-icon">{f.icon}</div>
              <h3 className="home-feature-title">{f.title}</h3>
              <p className="home-feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="home-final-cta">
        <div className="home-final-orb" />
        <h2 className="home-final-title">Ready to grow your reputation?</h2>
        <p className="home-final-desc">
          Join thousands of local businesses using RevigoAI to collect more reviews and grow their online presence.
        </p>
        <Link href={userId ? "/dashboard" : "/sign-up"} className="home-cta-primary home-cta-large">
          {userId ? "Go to Dashboard →" : "Register Your Business Free →"}
        </Link>
        <p className="home-final-note">No credit card required · 14-day free trial</p>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="home-footer-brand">
          <span className="home-nav-name">RevigoAI</span>
        </div>
        <p className="home-footer-copy">© {new Date().getFullYear()} RevigoAI. All rights reserved.</p>
      </footer>
    </div>
  );
}
