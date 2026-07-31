import { SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In — RevigoAI",
  description: "Sign in to your RevigoAI business dashboard",
};

export default function SignInPage() {
  return (
    <div className="auth-form-wrapper">
      <SignIn />
    </div>
  );
}
