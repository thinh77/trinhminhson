import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  Star,
  ExternalLink,
  Download,
  Heart,
  ArrowLeft,
  Smartphone
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type App = {
  id: string;
  name: string;
  description: string;
  category: string;
  url: string;
  rating: number;
  reviews: number;
  icon?: string;
  isFavorite?: boolean;
  tags: string[];
};

const apps: App[] = [
  {
    id: "1",
    name: "Notion",
    description: "Không gian làm việc tất cả trong một cho ghi chú, dự án và cộng tác",
    category: "Năng suất",
    url: "https://notion.so",
    rating: 4.8,
    reviews: 15420,
    tags: ["Productivity", "Notes", "Free"]
  },
  {
    id: "2",
    name: "Figma",
    description: "Công cụ thiết kế giao diện và tạo mẫu trực tuyến cộng tác",
    category: "Thiết kế",
    url: "https://figma.com",
    rating: 4.9,
    reviews: 12340,
    tags: ["Design", "UI/UX", "Free"]
  },
  {
    id: "3",
    name: "Canva",
    description: "Nền tảng thiết kế đồ họa trực tuyến dễ sử dụng",
    category: "Thiết kế",
    url: "https://canva.com",
    rating: 4.7,
    reviews: 28900,
    tags: ["Design", "Graphics", "Free"]
  },
  {
    id: "4",
    name: "VS Code Web",
    description: "Trình soạn thảo code chạy trên trình duyệt",
    category: "Lập trình",
    url: "https://vscode.dev",
    rating: 4.9,
    reviews: 8750,
    tags: ["Code", "Editor", "Free"]
  }
];

export function WarehouseAppsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = ["all", "Năng suất", "Thiết kế", "Lập trình", "Marketing"];

  const filteredApps = apps.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || app.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            to="/warehouse"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Quay lại Nhà kho</span>
          </Link>

          <div className="flex items-center gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-3 rounded-xl">
              <Smartphone className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Kho App Online</h1>
              <p className="text-slate-600 mt-1">
                {filteredApps.length} ứng dụng web và công cụ trực tuyến
              </p>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Tìm kiếm ứng dụng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white border-slate-200"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-slate-500" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-slate-200 rounded-lg bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === "all" ? "Tất cả danh mục" : cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Apps Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApps.map((app) => (
            <Card
              key={app.id}
              className="group relative bg-white border-slate-200 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 cursor-pointer hover:-translate-y-1"
            >
              <div className="p-6 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                      {app.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {app.name}
                      </h3>
                      <span className="text-xs text-slate-500">{app.category}</span>
                    </div>
                  </div>
                  <button className="text-slate-400 hover:text-pink-500 transition-colors">
                    <Heart className={`w-5 h-5 ${app.isFavorite ? 'fill-pink-500 text-pink-500' : ''}`} />
                  </button>
                </div>

                {/* Description */}
                <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">
                  {app.description}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-slate-900">{app.rating}</span>
                  </div>
                  <span className="text-sm text-slate-500">
                    ({app.reviews.toLocaleString()} đánh giá)
                  </span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {app.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    asChild
                    className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                  >
                    <a
                      href={app.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Truy cập
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-slate-200 hover:bg-slate-50"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredApps.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Không tìm thấy ứng dụng
            </h3>
            <p className="text-slate-600">
              Thử tìm kiếm với từ khóa khác hoặc thay đổi bộ lọc
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
