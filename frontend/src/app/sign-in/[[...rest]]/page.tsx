"use client";

import { SignIn } from "@clerk/nextjs";
import { clerkAppearance } from "@/src/lib/clerkAppearance";

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F6F6F8]">
      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        forceRedirectUrl="/dashboard"
        appearance={clerkAppearance}
        />
    </div>
  );
}