import { Link } from "react-router-dom";
import {
  Smartphone,
  HardDrive,
  Image as ImageIcon,
  GraduationCap,
  BookOpen,
  ArrowRight,
  Package
} from "lucide-react";
import { Card } from "@/components/ui/card";

type WarehouseCategory = {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  count?: number;
  color: string;
};

const categories: WarehouseCategory[] = [
  {
    id: "apps",
    title: "Kho App Online",
    description: "Ứng dụng web, công cụ trực tuyến và dịch vụ SaaS hữu ích",
    icon: Smartphone,
    href: "/warehouse/apps",
    count: 42,
    color: "from-blue-500 to-cyan-500"
  },
  {
    id: "software",
    title: "Kho phần mềm",
    description: "Phần mềm máy tính, công cụ phát triển và tiện ích hệ thống",
    icon: HardDrive,
    href: "/warehouse/software",
    count: 38,
    color: "from-purple-500 to-pink-500"
  },
  {
    id: "media",
    title: "Kho Media",
    description: "Hình ảnh, video, âm thanh và tài nguyên đa phương tiện",
    icon: ImageIcon,
    href: "/warehouse/media",
    count: 156,
    color: "from-orange-500 to-red-500"
  },
  {
    id: "courses",
    title: "Kho giáo trình",
    description: "Khóa học, tài liệu học tập và hướng dẫn chuyên sâu",
    icon: GraduationCap,
    href: "/warehouse/courses",
    count: 24,
    color: "from-green-500 to-emerald-500"
  },
  {
    id: "books",
    title: "Kho sách",
    description: "Sách điện tử, tài liệu nghiên cứu và tủ sách cá nhân",
    icon: BookOpen,
    href: "/books",
    count: 67,
    color: "from-indigo-500 to-blue-500"
  }
];

export function WarehousePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Hero Section */}
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
                <div className="text-2xl font-bold text-slate-900">5</div>
                <div className="text-sm text-slate-600">Danh mục</div>
              </div>
              <div className="w-px h-8 bg-slate-300" />
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">327+</div>
                <div className="text-sm text-slate-600">Tài nguyên</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const Icon = category.icon;
            
            return (
              <Link
                key={category.id}
                to={category.href}
                className="group"
              >
                <Card className="relative overflow-hidden h-full border-slate-200 bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 cursor-pointer hover:-translate-y-1">
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                  
                  <div className="relative p-6 sm:p-8 space-y-4">
                    {/* Icon */}
                    <div className="flex items-start justify-between">
                      <div className="relative">
                        <div className={`absolute inset-0 bg-gradient-to-br ${category.color} rounded-xl blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-300`} />
                        <div className={`relative bg-gradient-to-br ${category.color} p-3 rounded-xl`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      
                      {/* Count Badge */}
                      {category.count && (
                        <div className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm font-semibold">
                          {category.count}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-slate-900 group-hover:to-slate-600 transition-all duration-300">
                        {category.title}
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {category.description}
                      </p>
                    </div>

                    {/* Arrow */}
                    <div className="flex items-center text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors duration-300">
                      <span>Khám phá</span>
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </div>

                  {/* Hover Border Effect */}
                  <div className={`absolute inset-0 border-2 border-transparent group-hover:bg-gradient-to-br group-hover:${category.color} rounded-lg opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Info Banner */}
        <div className="mt-12 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 sm:p-10 text-center">
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Không tìm thấy những gì bạn cần?
            </h2>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto">
              Gửi yêu cầu hoặc đề xuất tài nguyên mới để chúng tôi bổ sung vào kho
            </p>
            <div className="pt-4">
              <Link
                to="/board"
                className="inline-flex items-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-xl font-semibold hover:bg-slate-100 transition-colors duration-200"
              >
                Gửi yêu cầu
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
