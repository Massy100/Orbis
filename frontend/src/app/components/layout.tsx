"use client";

import Sidebar from "./sidebar";
import "../styles/layout.css";
import { useUser, useOrganizationList } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import { NAV_ITEMS } from "../config/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  
  // Obtenemos los datos del usuario
  const { user, isLoaded: userLoaded } = useUser();
  
  // Obtenemos el rol
  const { userMemberships, isLoaded: orgLoaded } = useOrganizationList({
    userMemberships: true,
  });

  const roleName = userMemberships?.data?.[0]?.role === "org:admin" 
    ? "Administrador" 
    : "Personal";

  const activeItem = NAV_ITEMS.find(item => pathname.startsWith(item.href));

  // Función para navegar directamente a configuraciones al hacer clic en la foto
  const goToSettings = () => {
    router.push("/dashboard/settings"); // Ajusta esta ruta a tu página de configuración
  };

  return (
    <div className="dashboard-layout text-gray-900">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Area */}
      <div className="dashboard-main">
        {/* Topbar */}
        <header className="dashboard-header flex justify-between items-center px-6 py-4 bg-white border-b border-gray-100">
          <h1 className="section-title text-xl font-bold">
            {activeItem ? activeItem.name : "Panel"}
          </h1>

        </header>

        {/* Content Area */}
        <main className="dashboard-content">
          {children}
        </main>
      </div>
    </div>
  );
}