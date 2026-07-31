"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { UploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

const BUSINESS_CATEGORIES = [
  { value: "RESTAURANT", label: "🍽️ Restaurant & Food" },
  { value: "RETAIL", label: "🛍️ Retail & Shopping" },
  { value: "HEALTHCARE", label: "🏥 Healthcare & Medical" },
  { value: "BEAUTY", label: "💅 Beauty & Wellness" },
  { value: "FITNESS", label: "💪 Fitness & Sports" },
  { value: "HOTEL", label: "🏨 Hotel & Hospitality" },
  { value: "AUTO", label: "🚗 Auto & Automotive" },
  { value: "EDUCATION", label: "📚 Education & Training" },
  { value: "FINANCE", label: "💰 Finance & Insurance" },
  { value: "TECHNOLOGY", label: "💻 Technology & IT" },
  { value: "OTHER", label: "📦 Other" },
];

const formSchema = z.object({
  businessName: z.string().min(2, "Business name must be at least 2 characters"),
  ownerName: z.string().min(2, "Owner name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(7, "Invalid phone number"),
  googleReviewUrl: z.string().url("Must be a valid URL (e.g. https://g.page/...)"),
  category: z.string().min(1, "Please select a category"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type FormData = z.infer<typeof formSchema>;

const STEPS = [
  { id: 1, title: "Business Info", icon: "🏢" },
  { id: 2, title: "Contact Details", icon: "📞" },
  { id: 3, title: "Online Presence", icon: "🌐" },
  { id: 4, title: "Branding", icon: "🎨" },
];

export default function BusinessRegistrationForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [logoName, setLogoName] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>("");

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
  });

  const stepFields: Record<number, (keyof FormData)[]> = {
    1: ["businessName", "ownerName", "category"],
    2: ["email", "phone", "address"],
    3: ["googleReviewUrl", "website"],
    4: [],
  };

  const nextStep = async () => {
    const valid = await trigger(stepFields[step]);
    if (valid) setStep((s) => Math.min(s + 1, 4));
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const res = await fetch("/api/business/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, logoUrl }),
      });

      const result = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          router.push("/dashboard");
          return;
        }
        throw new Error(result.error || "Registration failed");
      }

      router.push(result.subscriptionUrl);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="reg-container">
      {/* Header */}
      <div className="reg-header">
        <div className="reg-logo">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="16" fill="url(#regGrad)" />
            <path d="M10 16l4 4 8-8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <defs>
              <linearGradient id="regGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                <stop stopColor="#6366f1" />
                <stop offset="1" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>
          <span className="reg-logo-text">RevigoAI</span>
        </div>
        <h1 className="reg-title">Register Your Business</h1>
        <p className="reg-subtitle">Set up your account in just a few steps</p>
      </div>

      {/* Step Indicator */}
      <div className="reg-steps">
        {STEPS.map((s, i) => (
          <div key={s.id} className="reg-step-item">
            <div className={`reg-step-circle ${step >= s.id ? "active" : ""} ${step > s.id ? "done" : ""}`}>
              {step > s.id ? (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2.5 7l3 3 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <span>{s.icon}</span>
              )}
            </div>
            <span className={`reg-step-label ${step >= s.id ? "active" : ""}`}>{s.title}</span>
            {i < STEPS.length - 1 && <div className={`reg-step-line ${step > s.id ? "done" : ""}`} />}
          </div>
        ))}
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit(onSubmit)} className="reg-card">
        {/* Step 1: Business Info */}
        {step === 1 && (
          <div className="reg-fields">
            <h2 className="reg-step-title">Business Information</h2>
            <div className="reg-field">
              <label className="reg-label" htmlFor="businessName">Business Name *</label>
              <input
                id="businessName"
                className={`reg-input ${errors.businessName ? "error" : ""}`}
                placeholder="e.g. The Coffee Corner"
                {...register("businessName")}
              />
              {errors.businessName && <p className="reg-error">{errors.businessName.message}</p>}
            </div>
            <div className="reg-field">
              <label className="reg-label" htmlFor="ownerName">Owner Name *</label>
              <input
                id="ownerName"
                className={`reg-input ${errors.ownerName ? "error" : ""}`}
                placeholder="e.g. John Smith"
                {...register("ownerName")}
              />
              {errors.ownerName && <p className="reg-error">{errors.ownerName.message}</p>}
            </div>
            <div className="reg-field">
              <label className="reg-label" htmlFor="category">Business Category *</label>
              <select
                id="category"
                className={`reg-input reg-select ${errors.category ? "error" : ""}`}
                {...register("category")}
              >
                <option value="">Select a category...</option>
                {BUSINESS_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              {errors.category && <p className="reg-error">{errors.category.message}</p>}
            </div>
          </div>
        )}

        {/* Step 2: Contact Details */}
        {step === 2 && (
          <div className="reg-fields">
            <h2 className="reg-step-title">Contact Details</h2>
            <div className="reg-field">
              <label className="reg-label" htmlFor="email">Email Address *</label>
              <input
                id="email"
                type="email"
                className={`reg-input ${errors.email ? "error" : ""}`}
                placeholder="owner@business.com"
                {...register("email")}
              />
              {errors.email && <p className="reg-error">{errors.email.message}</p>}
            </div>
            <div className="reg-field">
              <label className="reg-label" htmlFor="phone">Phone Number *</label>
              <input
                id="phone"
                type="tel"
                className={`reg-input ${errors.phone ? "error" : ""}`}
                placeholder="+1 (555) 000-0000"
                {...register("phone")}
              />
              {errors.phone && <p className="reg-error">{errors.phone.message}</p>}
            </div>
            <div className="reg-field">
              <label className="reg-label" htmlFor="address">Business Address *</label>
              <textarea
                id="address"
                className={`reg-input reg-textarea ${errors.address ? "error" : ""}`}
                placeholder="123 Main Street, City, State, ZIP"
                rows={3}
                {...register("address")}
              />
              {errors.address && <p className="reg-error">{errors.address.message}</p>}
            </div>
          </div>
        )}

        {/* Step 3: Online Presence */}
        {step === 3 && (
          <div className="reg-fields">
            <h2 className="reg-step-title">Online Presence</h2>
            <div className="reg-field">
              <label className="reg-label" htmlFor="googleReviewUrl">Google Review URL *</label>
              <div className="reg-input-hint">
                Find this in your Google Business Profile → Share review form
              </div>
              <input
                id="googleReviewUrl"
                type="url"
                className={`reg-input ${errors.googleReviewUrl ? "error" : ""}`}
                placeholder="https://g.page/r/YOUR_BUSINESS/review"
                {...register("googleReviewUrl")}
              />
              {errors.googleReviewUrl && <p className="reg-error">{errors.googleReviewUrl.message}</p>}
            </div>
            <div className="reg-field">
              <label className="reg-label" htmlFor="website">
                Website <span className="reg-optional">(Optional)</span>
              </label>
              <input
                id="website"
                type="url"
                className={`reg-input ${errors.website ? "error" : ""}`}
                placeholder="https://www.yourbusiness.com"
                {...register("website")}
              />
              {errors.website && <p className="reg-error">{errors.website.message}</p>}
            </div>
          </div>
        )}

        {/* Step 4: Branding / Logo Upload */}
        {step === 4 && (
          <div className="reg-fields">
            <h2 className="reg-step-title">Business Branding</h2>
            <div className="reg-field">
              <label className="reg-label">
                Business Logo <span className="reg-optional">(Optional)</span>
              </label>
              <div className="reg-upload-area">
                {logoUrl ? (
                  <div className="reg-logo-preview">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logoUrl} alt="Business logo" className="reg-logo-img" />
                    <div className="reg-logo-info">
                      <p className="reg-logo-filename">{logoName}</p>
                      <button
                        type="button"
                        className="reg-logo-remove"
                        onClick={() => { setLogoUrl(""); setLogoName(""); }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="reg-upload-inner">
                    <div className="reg-upload-icon">📸</div>
                    <p className="reg-upload-text">Upload your business logo</p>
                    <p className="reg-upload-hint">PNG, JPG, WebP — Max 4MB</p>
                    <UploadButton<OurFileRouter, "logoUploader">
                      endpoint="logoUploader"
                      onClientUploadComplete={(res) => {
                        if (res?.[0]) {
                          setLogoUrl(res[0].url);
                          setLogoName(res[0].name);
                        }
                      }}
                      onUploadError={(error) => {
                        console.error("Upload error:", error);
                      }}
                      appearance={{
                        button: "reg-upload-btn",
                        allowedContent: "hidden",
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {submitError && (
              <div className="reg-submit-error">
                <span>⚠️</span> {submitError}
              </div>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="reg-nav">
          {step > 1 && (
            <button type="button" className="reg-btn-secondary" onClick={prevStep}>
              ← Back
            </button>
          )}
          {step < 4 ? (
            <button type="button" className="reg-btn-primary" onClick={nextStep}>
              Continue →
            </button>
          ) : (
            <button
              type="submit"
              className="reg-btn-primary reg-btn-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="reg-btn-loading">
                  <span className="reg-spinner" />
                  Creating your account...
                </span>
              ) : (
                "🚀 Create My Dashboard"
              )}
            </button>
          )}
        </div>

        {/* Progress */}
        <div className="reg-progress">
          <div className="reg-progress-bar" style={{ width: `${(step / 4) * 100}%` }} />
        </div>
        <p className="reg-progress-text">Step {step} of 4</p>
      </form>
    </div>
  );
}
