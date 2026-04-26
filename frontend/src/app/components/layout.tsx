"use client";

import Sidebar from "./sidebar";
import "../styles/layout.css";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "../config/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const cleanPath = pathname.replace(/\/$/, "");

  const activeParent = NAV_ITEMS.find((item) => {
    if (item.href && item.href === cleanPath) {
      return true;
    }

    if (item.children) {
      return item.children.some(
        (child) => child.href === cleanPath
      );
    }

    return false;
  });

  const activeChild = NAV_ITEMS
    .flatMap((item) => item.children ?? [])
    .find((child) => child.href === cleanPath);

  return (
    <div className="dashboard-layout text-gray-900">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Area */}
      <div className="dashboard-main">
        {/* Topbar */}
        <header className="dashboard-header flex justify-between items-center px-6 py-4 bg-white border-b border-gray-100">
          <h1 className="section-title text-xl font-bold">
            {(activeChild?.name ?? activeParent?.name) ?? "Panel"}
          </h1>
        </header>

        {/* Content Area */}
        <main className="dashboard-content">{children}</main>
      </div>
    </div>
  );
}