import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Search, Download, Star, ExternalLink, HardDrive } from "lucide-react";
import { Card } from "@/components/ui/card";

export const WarehouseSoftwarePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Sample software data
  const software = [
    {
      id: 1,
      name: "Adobe Photoshop 2024",
      category: "design",
      description: "Industry-leading image editing and graphic design software",
      version: "25.0",
      size: "2.8 GB",
      downloads: 12450,
      rating: 4.8,
      platform: ["Windows", "macOS"],
      link: "#"
    },
    {
      id: 2,
      name: "Visual Studio Code",
      category: "development",
      description: "Free code editor with support for debugging and Git",
      version: "1.85",
      size: "95 MB",
      downloads: 45320,
      rating: 4.9,
      platform: ["Windows", "macOS", "Linux"],
      link: "#"
    },
    {
      id: 3,
      name: "AutoCAD 2024",
      category: "engineering",
      description: "Professional CAD software for 2D and 3D design",
      version: "2024.1",
      size: "3.5 GB",
      downloads: 8920,
      rating: 4.7,
      platform: ["Windows", "macOS"],
      link: "#"
    },
    {
      id: 4,
      name: "Microsoft Office 365",
      category: "productivity",
      description: "Complete office suite with Word, Excel, PowerPoint",
      version: "2024",
      size: "4.2 GB",
      downloads: 34200,
      rating: 4.6,
      platform: ["Windows", "macOS"],
      link: "#"
    },
    {
      id: 5,
      name: "Premiere Pro 2024",
      category: "video",
      description: "Professional video editing software",
      version: "24.0",
      size: "2.1 GB",
      downloads: 15670,
      rating: 4.8,
      platform: ["Windows", "macOS"],
      link: "#"
    },
    {
      id: 6,
      name: "Python 3.12",
      category: "development",
      description: "Latest version of the Python programming language",
      version: "3.12.0",
      size: "28 MB",
      downloads: 52100,
      rating: 4.9,
      platform: ["Windows", "macOS", "Linux"],
      link: "#"
    }
  ];

  const categories = [
    { value: "all", label: "Tất cả" },
    { value: "design", label: "Thiết kế" },
    { value: "development", label: "Lập trình" },
    { value: "engineering", label: "Kỹ thuật" },
    { value: "productivity", label: "Văn phòng" },
    { value: "video", label: "Video" }
  ];

  const filteredSoftware = software.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link 
              to="/warehouse" 
              className="text-slate-600 hover:text-slate-900 transition-colors duration-200 cursor-pointer"
              aria-label="Quay lại Nhà kho"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                <HardDrive className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Kho phần mềm</h1>
                <p className="text-sm text-slate-600">Tải các phần mềm chuyên nghiệp</p>
              </div>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm phần mềm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 cursor-text"
                aria-label="Tìm kiếm phần mềm"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 cursor-pointer"
              aria-label="Chọn danh mục"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredSoftware.length === 0 ? (
          <div className="text-center py-12">
            <HardDrive className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Không tìm thấy phần mềm</h3>
            <p className="text-slate-600">Thử tìm kiếm với từ khóa khác</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSoftware.map((item) => (
              <Card 
                key={item.id} 
                className="p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-slate-200 cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 mb-1 group-hover:text-purple-600 transition-colors duration-200">
                      {item.name}
                    </h3>
                    <p className="text-sm text-slate-600 mb-2">{item.description}</p>
                    <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                      <span className="px-2 py-1 bg-slate-100 rounded">v{item.version}</span>
                      <span className="px-2 py-1 bg-slate-100 rounded">{item.size}</span>
                    </div>
                  </div>
                </div>

                {/* Platform Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {item.platform.map((platform) => (
                    <span 
                      key={platform}
                      className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-md"
                    >
                      {platform}
                    </span>
                  ))}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200">
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="font-medium text-slate-900">{item.rating}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-slate-600">
                    <Download className="w-4 h-4" />
                    <span>{item.downloads.toLocaleString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <a
                    href={item.link}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all duration-200 text-center font-medium text-sm cursor-pointer"
                    aria-label={`Tải xuống ${item.name}`}
                  >
                    Tải xuống
                  </a>
                  <a
                    href={item.link}
                    className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors duration-200 cursor-pointer"
                    aria-label={`Chi tiết ${item.name}`}
                  >
                    <ExternalLink className="w-4 h-4 text-slate-600" />
                  </a>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
