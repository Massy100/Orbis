import { SignUp } from "@clerk/nextjs";

export default function SingUpPage() {
    // Component from Clerk that handles the sign-up process. It will redirect to the dashboard after a successful sign-up.
    return <SignUp fallbackRedirectUrl="/dashboard"
    forceRedirectUrl="/dashboard"/>
}