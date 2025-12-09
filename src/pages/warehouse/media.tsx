import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Search, Download, Eye, Image as ImageIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

export const WarehouseMediaPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");

  // Sample media data
  const mediaItems = [
    {
      id: 1,
      title: "Business Stock Photos Pack",
      type: "images",
      description: "Professional stock photos for business and corporate use",
      count: 500,
      size: "2.1 GB",
      downloads: 8540,
      preview: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop",
      link: "#"
    },
    {
      id: 2,
      title: "Motion Graphics Templates",
      type: "video",
      description: "After Effects and Premiere Pro motion templates",
      count: 150,
      size: "1.8 GB",
      downloads: 4320,
      preview: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=300&fit=crop",
      link: "#"
    },
    {
      id: 3,
      title: "Royalty Free Music Library",
      type: "audio",
      description: "Background music for videos and presentations",
      count: 200,
      size: "850 MB",
      downloads: 12450,
      preview: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=300&fit=crop",
      link: "#"
    },
    {
      id: 4,
      title: "UI/UX Design Assets",
      type: "images",
      description: "Icons, illustrations, and design elements",
      count: 1000,
      size: "680 MB",
      downloads: 15670,
      preview: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop",
      link: "#"
    },
    {
      id: 5,
      title: "4K Nature Footage",
      type: "video",
      description: "High-quality 4K nature and landscape videos",
      count: 80,
      size: "12 GB",
      downloads: 3210,
      preview: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
      link: "#"
    },
    {
      id: 6,
      title: "Sound Effects Collection",
      type: "audio",
      description: "Professional sound effects for video production",
      count: 500,
      size: "1.2 GB",
      downloads: 6780,
      preview: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&h=300&fit=crop",
      link: "#"
    }
  ];

  const types = [
    { value: "all", label: "Tất cả" },
    { value: "images", label: "Hình ảnh" },
    { value: "video", label: "Video" },
    { value: "audio", label: "Âm thanh" }
  ];

  const filteredMedia = mediaItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "all" || item.type === selectedType;
    return matchesSearch && matchesType;
  });

  const getTypeIcon = (type: string) => {
    switch(type) {
      case "images": return "🖼️";
      case "video": return "🎬";
      case "audio": return "🎵";
      default: return "📁";
    }
  };

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
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Kho Media</h1>
                <p className="text-sm text-slate-600">Hình ảnh, video và âm thanh chất lượng cao</p>
              </div>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm media..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 cursor-text"
                aria-label="Tìm kiếm media"
              />
            </div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 cursor-pointer"
              aria-label="Chọn loại media"
            >
              {types.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredMedia.length === 0 ? (
          <div className="text-center py-12">
            <ImageIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Không tìm thấy media</h3>
            <p className="text-slate-600">Thử tìm kiếm với từ khóa khác</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMedia.map((item) => (
              <Card 
                key={item.id} 
                className="overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-slate-200 cursor-pointer group"
              >
                {/* Preview Image */}
                <div className="relative h-48 overflow-hidden bg-slate-100">
                  <img 
                    src={item.preview} 
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                    <div className="flex gap-2">
                      <button className="px-3 py-1.5 bg-white/90 rounded-lg text-sm font-medium flex items-center gap-1 hover:bg-white transition-colors duration-200 cursor-pointer">
                        <Eye className="w-4 h-4" />
                        Xem trước
                      </button>
                    </div>
                  </div>
                  <div className="absolute top-3 right-3 px-2 py-1 bg-white/90 rounded-md text-xs font-medium">
                    {getTypeIcon(item.type)}
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-pink-600 transition-colors duration-200">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600 mb-4">{item.description}</p>

                  {/* Stats */}
                  <div className="flex flex-wrap gap-2 text-xs text-slate-500 mb-4">
                    <span className="px-2 py-1 bg-slate-100 rounded">{item.count} files</span>
                    <span className="px-2 py-1 bg-slate-100 rounded">{item.size}</span>
                  </div>

                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200">
                    <div className="flex items-center gap-1 text-sm text-slate-600">
                      <Download className="w-4 h-4" />
                      <span>{item.downloads.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Action */}
                  <a
                    href={item.link}
                    className="w-full px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-lg hover:from-pink-600 hover:to-rose-700 transition-all duration-200 text-center font-medium text-sm cursor-pointer block"
                    aria-label={`Tải xuống ${item.title}`}
                  >
                    Tải xuống
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
