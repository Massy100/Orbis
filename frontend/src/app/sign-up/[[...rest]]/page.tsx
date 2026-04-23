"use client";

import { SignUp } from "@clerk/nextjs";
import { clerkAppearance } from "@/src/lib/clerkAppearance";

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F6F6F8]">
      <SignUp
        routing="path"
        path="/sign-up"
        forceRedirectUrl="/sign-in"
        appearance={clerkAppearance}
      />
    </div>
  );
}