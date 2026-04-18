"use client";

import Sidebar from "./sidebar";
import "../styles/layout.css";
import { User } from "lucide-react";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "../config/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const pathname = usePathname();

  const activeItem =
    NAV_ITEMS.find(item => pathname.startsWith(item.href));

  return (
    <div className="dashboard-layout text-gray-900">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Area */}
      <div className="dashboard-main">

        {/* Topbar */}
        <header className="dashboard-header">
          <h1 className="section-title">
            {activeItem ? activeItem.name : "Panel"}
          </h1>

          <div className="header-user">
            <span>Administrador: [nombre]</span>
            <div className="avatar">
              <User size={18} />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="dashboard-content">
          {children}
        </main>
      </div>
    </div>
  );
}