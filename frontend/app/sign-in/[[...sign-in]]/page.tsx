import { SignIn } from "@clerk/nextjs";

export default function SingInPage() {
  return (
    // Component from Clerk that handles the sign-in process. It will redirect to the dashboard after a successful sign-in.
    <SignIn
      fallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
    />
  );
}
