import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { WarehouseCategory } from "@/types/warehouse";

interface CategoryCardProps {
  category: WarehouseCategory;
}

export function CategoryCard({ category }: CategoryCardProps) {
  const Icon = category.icon;
  
  return (
    <Link 
      to={category.href} 
      className="group block h-full cursor-pointer"
    >
      <div className="h-full bg-white border border-slate-200 rounded-lg p-6 transition-all duration-200 hover:shadow-lg hover:border-slate-300">
        {/* Header with Icon and Count */}
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-lg bg-gradient-to-br ${category.color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          
          {category.count && (
            <div className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-xs font-medium">
              {category.count}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-2 mb-4">
          <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors duration-200">
            {category.title}
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">
            {category.description}
          </p>
        </div>

        {/* Arrow - Inline with transition */}
        <div className="flex items-center text-sm font-medium text-slate-500 group-hover:text-blue-600 transition-colors duration-200">
          <span>Xem thêm</span>
          <ArrowRight className="w-4 h-4 ml-1 transition-transform duration-200 group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}
