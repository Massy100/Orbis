"use client";
import { UserButton, useUser } from "@clerk/nextjs";

export default function DashboardPage() {
  const { user } = useUser();
  console.log(user);
  return (
    <div>
      <h1>Dashboard page</h1>
      {/* This component displays the user´s profile information and the function
      aferSwitchSessionurl is when the user logs out and the aplication send the user to
      home page  */}
      <UserButton afterSwitchSessionUrl="/" />
    </div>
  );
}
