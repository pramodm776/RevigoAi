import { SignUp } from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account — RevigoAI",
  description: "Create your RevigoAI business account and start managing reviews",
};

export default function SignUpPage() {
  return (
    <div className="auth-form-wrapper">
      <SignUp />
    </div>
  );
}
