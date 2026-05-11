import type { LucideIcon } from 'lucide-react'
import {
  BriefcaseBusiness,
  Building2,
  Calculator,
  FileText,
  Folders,
  LayoutDashboard,
  LineChart,
  Scale,
  Settings,
  ShieldCheck,
  Users,
} from 'lucide-react'
import type { WorkspaceIconName } from '@/lib/workspaces'

export const workspaceIcons: Record<WorkspaceIconName, LucideIcon> = {
  'briefcase-business': BriefcaseBusiness,
  'building-2': Building2,
  calculator: Calculator,
  'file-text': FileText,
  folders: Folders,
  'layout-dashboard': LayoutDashboard,
  'line-chart': LineChart,
  scale: Scale,
  settings: Settings,
  'shield-check': ShieldCheck,
  users: Users,
}
