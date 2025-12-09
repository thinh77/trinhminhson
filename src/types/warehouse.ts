import { type LucideIcon } from "lucide-react";

export interface WarehouseCategory {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  count?: number;
  color: string;
}

export interface WarehouseStats {
  totalCategories: number;
  totalResources: number;
}
