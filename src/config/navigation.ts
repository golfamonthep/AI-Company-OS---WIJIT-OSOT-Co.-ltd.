import { Bot, Building2, ClipboardList, Database, FileText, Network, PenLine, ScrollText, Settings, Workflow, Zap } from "lucide-react";
import { th } from "@/i18n/th";

export const appNavigation = [
  { href: "/dashboard", label: th.nav.command, icon: Bot },
  { href: "/agents", label: th.nav.agents, icon: Network },
  { href: "/content", label: "Content Creator AI", icon: PenLine },
  { href: "/departments", label: th.nav.departments, icon: Building2 },
  { href: "/tasks", label: th.nav.tasks, icon: ClipboardList },
  { href: "/memory", label: th.nav.memory, icon: Database },
  { href: "/sop", label: th.nav.sop, icon: ScrollText },
  { href: "/skills", label: "คลังทักษะ", icon: Zap },
  { href: "/workflows", label: "Workflow", icon: Workflow },
  { href: "/reports", label: th.nav.reports, icon: FileText },
  { href: "/settings", label: "ตั้งค่า", icon: Settings }
];
