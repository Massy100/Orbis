"use client";

import { SignIn } from "@clerk/nextjs";
import "./page.css";

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F6F6F8]">

      <SignIn
        routing="hash"
        fallbackRedirectUrl="/dashboard"
        appearance={{
          variables: {
            colorPrimary: "#1A57DB",
            colorBackground: "#ffffff",
            colorText: "#1f2937",
            colorInputBackground: "#ffffff",
            colorInputText: "#1f2937",
          },
          elements: {
            card: "shadow-xl rounded-2xl border border-blue-100",

            headerSubtitle: "hidden",
            footer: "hidden",
            developmentBadge: "hidden",

            formButtonPrimary:
              "bg-blue-600 hover:bg-blue-700 text-white",

            footerActionLink:
              "text-blue-600 hover:text-blue-700",

            socialButtonsBlockButton:
              "border border-blue-200 hover:bg-blue-50",

            formFieldInput:
              "border border-blue-200 focus:border-blue-500 focus:ring-blue-500",
          },
        }}
      />
    </div>
  );
}