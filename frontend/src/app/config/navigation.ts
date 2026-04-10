import {
  LayoutDashboard,
  Users,
  Calendar,
  ClipboardCheck,
  FileText,
  BarChart,
  MessageSquare,
  Settings,
} from "lucide-react";

export interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

export const NAV_ITEMS: NavItem[] = [
  { name: "Panel", href: "/dashboard", icon: LayoutDashboard },
  { name: "Maestros", href: "/teachers", icon: Users },
  { name: "Disponibilidad", href: "/availability", icon: Calendar },
  { name: "Evaluaciones", href: "/evaluations", icon: ClipboardCheck },
  { name: "Documentos", href: "/documents", icon: FileText },
  { name: "Resultados e informes", href: "/reports", icon: BarChart },
  { name: "Ajustes", href: "/settings", icon: Settings },
];