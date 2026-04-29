"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { NAV_ITEMS, NavItem } from "../config/navigation"
import { LogOut, GraduationCap, ChevronDown  } from "lucide-react";
import { SignOutButton } from "@clerk/nextjs";
import "../styles/Sidebar.css";

export default function Sidebar() {
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const toggleMenu = (name: string) => {
    setOpenMenu((prev) => (prev === name ? null : name));
  };

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
          const isActive = item.href && pathname.startsWith(item.href);
          const isOpen = openMenu === item.name;

          if (item.children) {
            return (
              <div key={`group-${item.name}`} className="navGroup">
                <button
                  className={`navItem ${isOpen ? "active" : ""}`}
                  onClick={() => toggleMenu(item.name)}
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                  <ChevronDown
                    size={16}
                    className={`chevron ${isOpen ? "rotated" : ""}`}
                  />
                </button>

                {isOpen && (
                  <div className="submenu">
                    {item.children.map((child) => {
                      const ChildIcon = child.icon;
                      const isChildActive = pathname === child.href;

                      return (
                        <Link
                          key={child.name}
                          href={child.href!}
                          className={`navItem child ${
                            isChildActive ? "active" : ""
                          }`}
                        >
                          <ChildIcon size={16} />
                          <span>{child.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={`item-${item.href ?? item.name}`}
              href={item.href!}
              className="navItem"
            >
              <Icon size={18} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* FOOTER */}
      <div className="footer">
        <SignOutButton redirectUrl="/sign-in">
          <div className="logout" style={{ cursor: "pointer" }}>
            <LogOut size={15} />
            <span>Finalizar la sesión</span>
          </div>
        </SignOutButton>
      </div>
    </aside>
  );
}