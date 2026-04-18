"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, NavItem } from "../config/navigation"
import { LogOut, GraduationCap } from "lucide-react";
import { SignOutButton } from "@clerk/nextjs";
import "../styles/Sidebar.css";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      
      {/* LOGO */}
      <div className="logoContainer">
        <div className="logoIcon">
          <GraduationCap size={28} strokeWidth={2} />
        </div>
        <span className="logoText">ORBIS</span>
      </div>

      {/* NAV */}
      <nav className="nav">
        {NAV_ITEMS.map((item: NavItem) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`navItem ${isActive ? "active" : ""}`}
            >
              <Icon size={18} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* FOOTER */}
      <div className="footer">
        {/* 2. Envolvemos la sección de logout con SignOutButton */}
        <SignOutButton redirectUrl="/">
          <div className="logout" style={{ cursor: 'pointer' }}>
            <LogOut size={15} />
            <span>Finalizar la sesión</span>
          </div>
        </SignOutButton>
      </div>
    </aside>
  );
}