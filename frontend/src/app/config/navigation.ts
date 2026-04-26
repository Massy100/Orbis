import {
  LayoutDashboard,
  Users,
  Calendar,
  ClipboardCheck,
  FileText,
  BarChart,
  Pencil,
  Settings,
  BookOpenCheck,
  Sparkles
} from "lucide-react";

export interface NavItem {
  name: string;
  href?: string;
  icon: React.ElementType;
  children?: NavItem[];
}

export const NAV_ITEMS: NavItem[] = [
  { name: "Panel", href: "/dashboard", icon: LayoutDashboard },
  { name: "Maestros", href: "/teachers-management", icon: Users },
  { name: "Disponibilidad", href: "/availability", icon: Calendar },
  {
    name: "Evaluaciones",
    icon: ClipboardCheck,
    children: [
      {
        name: "Comprensiva",
        href: "/evaluations/comprensive",
        icon: BookOpenCheck,
      },
      {
        name: "Especial",
        href: "/evaluations/special",
        icon: Pencil,
      },
    ],
  },
  { name: "Grupos", href: "/groups", icon: FileText },
  { name: "Carga de Datos", href: "/data-upload", icon: FileText },
  { name: "Resultados e informes", href: "/result-reports", icon: BarChart },
  { name: "Ajustes", href: "/settings", icon: Settings },
];