import { Package } from "lucide-react";
import type { WarehouseStats } from "@/types/warehouse";

interface WarehouseHeroProps {
  stats: WarehouseStats;
}

export function WarehouseHero({ stats }: WarehouseHeroProps) {
  return (
    <div className="relative overflow-hidden bg-white border-b border-slate-200">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/5 via-transparent to-blue-500/5" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="text-center space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl blur-xl opacity-20 animate-pulse" />
              <div className="relative bg-gradient-to-br from-blue-500 to-purple-500 p-4 rounded-2xl">
                <Package className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight">
              Nhà kho
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
              Khám phá bộ sưu tập tài nguyên, công cụ và tài liệu được tuyển chọn
            </p>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-6 pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">{stats.totalCategories}</div>
              <div className="text-sm text-slate-600">Danh mục</div>
            </div>
            <div className="w-px h-8 bg-slate-300" />
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">{stats.totalResources}+</div>
              <div className="text-sm text-slate-600">Tài nguyên</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
