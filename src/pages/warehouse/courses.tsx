import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Search, Star, Users, Clock, BookOpen, PlayCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

export const WarehouseCoursesPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("all");

  // Sample courses data
  const courses = [
    {
      id: 1,
      title: "Full Stack Web Development 2024",
      level: "intermediate",
      description: "Learn React, Node.js, PostgreSQL and build real-world applications",
      instructor: "Nguyễn Văn A",
      duration: "42 hours",
      lessons: 156,
      students: 12450,
      rating: 4.8,
      thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=250&fit=crop",
      price: "Free",
      tags: ["React", "Node.js", "PostgreSQL"]
    },
    {
      id: 2,
      title: "UI/UX Design Masterclass",
      level: "beginner",
      description: "Master Figma and design principles for modern interfaces",
      instructor: "Trần Thị B",
      duration: "28 hours",
      lessons: 98,
      students: 8920,
      rating: 4.9,
      thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=250&fit=crop",
      price: "Free",
      tags: ["Figma", "Design", "UX"]
    },
    {
      id: 3,
      title: "Advanced Python Programming",
      level: "advanced",
      description: "Deep dive into Python: OOP, async, testing, and best practices",
      instructor: "Lê Văn C",
      duration: "35 hours",
      lessons: 124,
      students: 6780,
      rating: 4.7,
      thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=250&fit=crop",
      price: "Free",
      tags: ["Python", "OOP", "Testing"]
    },
    {
      id: 4,
      title: "Digital Marketing Fundamentals",
      level: "beginner",
      description: "SEO, social media marketing, and content strategy",
      instructor: "Phạm Thị D",
      duration: "24 hours",
      lessons: 86,
      students: 15670,
      rating: 4.6,
      thumbnail: "https://images.unsplash.com/photo-1432888622747-4eb9a8f2c2b4?w=400&h=250&fit=crop",
      price: "Free",
      tags: ["SEO", "Marketing", "Social Media"]
    },
    {
      id: 5,
      title: "Data Science with Python",
      level: "intermediate",
      description: "Pandas, NumPy, machine learning, and data visualization",
      instructor: "Hoàng Văn E",
      duration: "48 hours",
      lessons: 178,
      students: 10240,
      rating: 4.8,
      thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop",
      price: "Free",
      tags: ["Python", "Data Science", "ML"]
    },
    {
      id: 6,
      title: "Mobile App Development",
      level: "intermediate",
      description: "Build cross-platform apps with React Native",
      instructor: "Vũ Thị F",
      duration: "36 hours",
      lessons: 132,
      students: 7560,
      rating: 4.7,
      thumbnail: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=250&fit=crop",
      price: "Free",
      tags: ["React Native", "Mobile", "iOS/Android"]
    }
  ];

  const levels = [
    { value: "all", label: "Tất cả cấp độ" },
    { value: "beginner", label: "Người mới" },
    { value: "intermediate", label: "Trung cấp" },
    { value: "advanced", label: "Nâng cao" }
  ];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesLevel = selectedLevel === "all" || course.level === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  const getLevelBadge = (level: string) => {
    const badges = {
      beginner: "bg-green-100 text-green-700",
      intermediate: "bg-blue-100 text-blue-700",
      advanced: "bg-purple-100 text-purple-700"
    };
    const labels = {
      beginner: "Người mới",
      intermediate: "Trung cấp",
      advanced: "Nâng cao"
    };
    return { class: badges[level as keyof typeof badges], label: labels[level as keyof typeof labels] };
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
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Kho giáo trình</h1>
                <p className="text-sm text-slate-600">Khóa học chất lượng cao miễn phí</p>
              </div>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm khóa học..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 cursor-text"
                aria-label="Tìm kiếm khóa học"
              />
            </div>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 cursor-pointer"
              aria-label="Chọn cấp độ"
            >
              {levels.map(level => (
                <option key={level.value} value={level.value}>{level.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Không tìm thấy khóa học</h3>
            <p className="text-slate-600">Thử tìm kiếm với từ khóa khác</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              const levelBadge = getLevelBadge(course.level);
              return (
                <Card 
                  key={course.id} 
                  className="overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-slate-200 cursor-pointer group"
                >
                  {/* Thumbnail */}
                  <div className="relative h-40 overflow-hidden bg-slate-100">
                    <img 
                      src={course.thumbnail} 
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <PlayCircle className="w-12 h-12 text-white" />
                    </div>
                    <div className={`absolute top-3 right-3 px-2 py-1 ${levelBadge.class} rounded-md text-xs font-medium`}>
                      {levelBadge.label}
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-amber-600 transition-colors duration-200 line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-sm text-slate-600 mb-3 line-clamp-2">{course.description}</p>
                    <p className="text-sm text-slate-500 mb-4">Giảng viên: {course.instructor}</p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {course.tags.map((tag) => (
                        <span 
                          key={tag}
                          className="px-2 py-1 text-xs bg-amber-100 text-amber-700 rounded-md"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 mb-4 pb-4 border-b border-slate-200 text-xs text-slate-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{course.duration}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <PlayCircle className="w-3.5 h-3.5" />
                        <span>{course.lessons} bài</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        <span>{(course.students / 1000).toFixed(1)}k</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="font-medium text-slate-900 text-sm">{course.rating}</span>
                      </div>
                      <span className="text-lg font-bold text-amber-600">{course.price}</span>
                    </div>

                    {/* Action */}
                    <button
                      className="w-full px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all duration-200 font-medium text-sm cursor-pointer"
                      aria-label={`Học khóa ${course.title}`}
                    >
                      Học ngay
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
