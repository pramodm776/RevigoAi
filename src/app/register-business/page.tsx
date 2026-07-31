import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import BusinessRegistrationForm from "@/components/BusinessRegistrationForm";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Register Your Business — RevigoAI",
  description: "Register your business on RevigoAI to start managing and boosting your Google reviews",
};

export default async function RegisterBusinessPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // If user already has a business, go to dashboard
  const existing = await prisma.business.findUnique({
    where: { clerkUserId: userId },
  });

  if (existing) {
    redirect("/dashboard");
  }

  return (
    <main className="reg-page">
      <BusinessRegistrationForm />
    </main>
  );
}
