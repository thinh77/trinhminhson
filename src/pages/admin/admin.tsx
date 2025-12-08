import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Settings, 
  FileText, 
  Image as ImageIcon, 
  Plus,
  Save,
  X,
  Upload,
  Calendar,
  MapPin,
  Tag,
  Clock,
  CheckCircle2,
  AlertCircle,
  Link as LinkIcon,
  Users,
  Edit,
  Trash2,
  Search
} from "lucide-react";
import { useBlog } from "@/stores/blog-store";
import { useAuth } from "@/contexts/AuthContext";
import { BlogFormData } from "@/types/blog";
import { postsApi } from "@/services/posts.service";

// Extended form type with image
interface AdminBlogFormData extends BlogFormData {
  // Already includes: title, excerpt, content, image, tags, readTime
}

interface PhotoFormData {
  title: string;
  src: string;
  alt: string;
  location: string;
  category: string;
  date: string;
}

// Tab type
type TabType = "posts" | "users" | "create-post" | "photos";

// Toast notification component
function Toast({ 
  message, 
  type, 
  onClose 
}: { 
  message: string; 
  type: "success" | "error"; 
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div 
      className={cn(
        "fixed bottom-6 right-6 z-50",
        "flex items-center gap-3 px-4 py-3 rounded-xl",
        "shadow-lg shadow-black/20 backdrop-blur-xl",
        "animate-fade-in-up",
        type === "success" 
          ? "bg-green-500/90 text-white" 
          : "bg-red-500/90 text-white"
      )}
    >
      {type === "success" ? (
        <CheckCircle2 className="w-5 h-5" />
      ) : (
        <AlertCircle className="w-5 h-5" />
      )}
      <span className="font-medium">{message}</span>
      <button 
        onClick={onClose}
        className="ml-2 p-1 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function AdminPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("posts");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const { posts, addPost, fetchPosts } = useBlog();
  const { user } = useAuth();

  // Blog form state
  const [blogForm, setBlogForm] = useState<AdminBlogFormData>({
    title: "",
    excerpt: "",
    content: "",
    image: "",
    tags: "",
    readTime: "5 phút đọc"
  });

  // Photo form state
  const [photoForm, setPhotoForm] = useState<PhotoFormData>({
    title: "",
    src: "",
    alt: "",
    location: "",
    category: "",
    date: new Date().toISOString().split("T")[0]
  });

  // Form errors
  const [blogErrors, setBlogErrors] = useState<Partial<AdminBlogFormData>>({});
  const [photoErrors, setPhotoErrors] = useState<Partial<PhotoFormData>>({});

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Validate blog form
  const validateBlogForm = (): boolean => {
    const errors: Partial<AdminBlogFormData> = {};
    
    if (!blogForm.title.trim()) {
      errors.title = "Tiêu đề là bắt buộc";
    }
    if (!blogForm.excerpt.trim()) {
      errors.excerpt = "Mô tả ngắn là bắt buộc";
    }
    if (!blogForm.content.trim()) {
      errors.content = "Nội dung là bắt buộc";
    }
    if (!blogForm.image.trim()) {
      errors.image = "URL hình ảnh là bắt buộc";
    }
    if (!blogForm.tags.trim()) {
      errors.tags = "Ít nhất một tag là bắt buộc";
    }

    setBlogErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validate photo form
  const validatePhotoForm = (): boolean => {
    const errors: Partial<PhotoFormData> = {};
    
    if (!photoForm.title.trim()) {
      errors.title = "Title is required";
    }
    if (!photoForm.src.trim()) {
      errors.src = "Image URL is required";
    }
    if (!photoForm.alt.trim()) {
      errors.alt = "Alt text is required";
    }
    if (!photoForm.category.trim()) {
      errors.category = "Category is required";
    }

    setPhotoErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle blog form submission
  const handleBlogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateBlogForm()) {
      setToast({ message: "Vui lòng điền đầy đủ các trường bắt buộc", type: "error" });
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingPostId) {
        // Update existing post
        await postsApi.update(Number(editingPostId), {
          title: blogForm.title,
          excerpt: blogForm.excerpt,
          content: blogForm.content,
          image: blogForm.image,
          readTime: blogForm.readTime,
          tags: blogForm.tags,
        });
        await fetchPosts();
        setToast({ message: "Bài viết đã được cập nhật thành công!", type: "success" });
        setEditingPostId(null);
      } else {
        // Add new blog post using store (which calls the API)
        await addPost({
          title: blogForm.title,
          excerpt: blogForm.excerpt,
          content: blogForm.content,
          image: blogForm.image,
          readTime: blogForm.readTime,
          tags: blogForm.tags.split(",").map(t => t.trim()),
        }, user?.id); // Pass the authenticated user's ID
        
        setToast({ message: "Bài viết đã được tạo thành công!", type: "success" });
      }
      
      // Reset form
      setBlogForm({
        title: "",
        excerpt: "",
        content: "",
        image: "",
        tags: "",
        readTime: "5 phút đọc"
      });
      setBlogErrors({});
    } catch (error) {
      console.error("Failed to save post:", error);
      setToast({ 
        message: error instanceof Error ? error.message : "Không thể lưu bài viết. Vui lòng thử lại.", 
        type: "error" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle photo form submission
  const handlePhotoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePhotoForm()) {
      setToast({ message: "Please fill in all required fields", type: "error" });
      return;
    }

    // Create photo object
    const newPhoto = {
      id: String(Date.now()),
      title: photoForm.title,
      src: photoForm.src,
      alt: photoForm.alt,
      location: photoForm.location || undefined,
      category: photoForm.category,
      date: photoForm.date,
      aspectRatio: "landscape" as const
    };

    console.log("New photo:", newPhoto);
    
    // Reset form
    setPhotoForm({
      title: "",
      src: "",
      alt: "",
      location: "",
      category: "",
      date: new Date().toISOString().split("T")[0]
    });
    setPhotoErrors({});
    
    setToast({ message: "Photo added successfully!", type: "success" });
  };

  // Handle edit post
  const handleEditPost = (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      setBlogForm({
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        image: post.image,
        tags: post.tags.join(", "),
        readTime: post.readTime
      });
      setEditingPostId(postId);
      setActiveTab("create-post");
    }
  };

  // Handle delete post
  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) {
      return;
    }

    setDeletingPostId(postId);
    try {
      await postsApi.delete(Number(postId));
      await fetchPosts();
      setToast({ message: "Post deleted successfully!", type: "success" });
    } catch (error) {
      console.error("Failed to delete post:", error);
      setToast({ message: "Failed to delete post", type: "error" });
    } finally {
      setDeletingPostId(null);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingPostId(null);
    setBlogForm({
      title: "",
      excerpt: "",
      content: "",
      image: "",
      tags: "",
      readTime: "5 phút đọc"
    });
    setBlogErrors({});
  };

  // Filter posts by search query
  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tabs = [
    { id: "posts" as const, label: "Post Management", icon: FileText },
    { id: "users" as const, label: "User Management", icon: Users },
    { id: "create-post" as const, label: "Create Post", icon: Plus },
    { id: "photos" as const, label: "Photo Gallery", icon: ImageIcon },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <Navbar className="fixed top-0 left-0 right-0 z-50 shadow-lg shadow-black/5" />

      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-accent/5 pointer-events-none" />

      {/* Main content */}
      <main className="relative pt-28 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div 
            className={cn(
              "mb-8 transition-all duration-700 ease-out",
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <Settings className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h1 
                  className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  Admin
                </h1>
                <p className="text-muted-foreground text-sm">
                  Manage posts, users, and content
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div 
            className={cn(
              "mb-8 transition-all duration-700 delay-100 ease-out",
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
          >
            <div className="flex gap-2 p-1 bg-secondary/50 rounded-xl w-fit">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium",
                      "transition-all duration-200 ease-out",
                      "cursor-pointer",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                      activeTab === tab.id
                        ? "bg-card text-foreground shadow-md"
                        : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div 
            className={cn(
              "transition-all duration-700 delay-200 ease-out",
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
          >
            {/* Post Management */}
            {activeTab === "posts" && (
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-accent" />
                    Post Management
                  </CardTitle>
                  <CardDescription>
                    View, edit, and manage all blog posts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Search posts..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                      <Button
                        onClick={() => {
                          handleCancelEdit();
                          setActiveTab("create-post");
                        }}
                        className="cursor-pointer"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create New Post
                      </Button>
                    </div>

                    {/* Posts list */}
                    {filteredPosts.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>{searchQuery ? "No posts found" : "No posts yet"}</p>
                        <p className="text-sm mt-2">
                          {searchQuery ? "Try a different search term" : "Create your first post to get started"}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filteredPosts.map((post) => (
                          <Card key={post.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start gap-3">
                                    {post.image && (
                                      <img
                                        src={post.image}
                                        alt={post.title}
                                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                                      />
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <h3 className="font-semibold text-foreground truncate">
                                        {post.title}
                                      </h3>
                                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                        {post.excerpt}
                                      </p>
                                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                          <Calendar className="w-3 h-3" />
                                          {post.date}
                                        </span>
                                        <span className="flex items-center gap-1">
                                          <Clock className="w-3 h-3" />
                                          {post.readTime}
                                        </span>
                                        <span className="flex items-center gap-1">
                                          <Tag className="w-3 h-3" />
                                          {post.tags.length} tags
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEditPost(post.id)}
                                    className="cursor-pointer"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeletePost(post.id)}
                                    disabled={deletingPostId === post.id}
                                    className="cursor-pointer text-destructive hover:text-destructive"
                                  >
                                    {deletingPostId === post.id ? (
                                      <Clock className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="w-4 h-4" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* User Management */}
            {activeTab === "users" && (
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-accent" />
                    User Management
                  </CardTitle>
                  <CardDescription>
                    Manage user accounts and permissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Input
                        placeholder="Search users..."
                        className="max-w-sm"
                      />
                      <Button className="cursor-pointer">
                        <Plus className="w-4 h-4 mr-2" />
                        Add User
                      </Button>
                    </div>
                    <div className="text-center py-12 text-muted-foreground">
                      <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>User list will be displayed here</p>
                      <p className="text-sm mt-2">Feature coming soon...</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Create Post Form */}
            {activeTab === "create-post" && (
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {editingPostId ? (
                      <>
                        <Edit className="w-5 h-5 text-accent" />
                        Edit Blog Post
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5 text-accent" />
                        Create New Blog Post
                      </>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {editingPostId 
                      ? "Update your blog post" 
                      : "Write and publish a new article to your blog"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleBlogSubmit} className="space-y-6">
                    {/* Title */}
                    <div className="space-y-2">
                      <label 
                        htmlFor="blog-title" 
                        className="text-sm font-medium text-foreground"
                      >
                        Tiêu đề <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="blog-title"
                        type="text"
                        placeholder="Nhập tiêu đề bài viết"
                        value={blogForm.title}
                        onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                        className={cn(
                          "bg-background/50",
                          blogErrors.title && "border-red-500 focus-visible:ring-red-500"
                        )}
                      />
                      {blogErrors.title && (
                        <p className="text-red-500 text-xs flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {blogErrors.title}
                        </p>
                      )}
                    </div>

                    {/* Cover Image URL */}
                    <div className="space-y-2">
                      <label 
                        htmlFor="blog-image" 
                        className="text-sm font-medium text-foreground flex items-center gap-2"
                      >
                        <LinkIcon className="w-4 h-4 text-muted-foreground" />
                        URL Hình ảnh bìa <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="blog-image"
                        type="url"
                        placeholder="https://images.unsplash.com/photo-..."
                        value={blogForm.image}
                        onChange={(e) => setBlogForm({ ...blogForm, image: e.target.value })}
                        className={cn(
                          "bg-background/50",
                          blogErrors.image && "border-red-500 focus-visible:ring-red-500"
                        )}
                      />
                      {blogErrors.image && (
                        <p className="text-red-500 text-xs flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {blogErrors.image}
                        </p>
                      )}
                      {/* Image Preview */}
                      {blogForm.image && (
                        <div className="mt-2 rounded-lg overflow-hidden bg-secondary/30 p-2">
                          <img
                            src={blogForm.image}
                            alt="Preview"
                            className="max-h-48 w-auto rounded-lg mx-auto"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Excerpt */}
                    <div className="space-y-2">
                      <label 
                        htmlFor="blog-excerpt" 
                        className="text-sm font-medium text-foreground"
                      >
                        Mô tả ngắn <span className="text-red-500">*</span>
                      </label>
                      <Textarea
                        id="blog-excerpt"
                        placeholder="Mô tả ngắn gọn về bài viết (hiển thị trên card)"
                        rows={2}
                        value={blogForm.excerpt}
                        onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })}
                        className={cn(
                          "bg-background/50 resize-none",
                          blogErrors.excerpt && "border-red-500 focus-visible:ring-red-500"
                        )}
                      />
                      {blogErrors.excerpt && (
                        <p className="text-red-500 text-xs flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {blogErrors.excerpt}
                        </p>
                      )}
                    </div>

                    {/* Content */}
                    <div className="space-y-2">
                      <label 
                        htmlFor="blog-content" 
                        className="text-sm font-medium text-foreground"
                      >
                        Nội dung <span className="text-red-500">*</span>
                      </label>
                      <Textarea
                        id="blog-content"
                        placeholder="Viết nội dung bài viết ở đây... (Hỗ trợ HTML)"
                        rows={10}
                        value={blogForm.content}
                        onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                        className={cn(
                          "bg-background/50 resize-none font-mono text-sm",
                          blogErrors.content && "border-red-500 focus-visible:ring-red-500"
                        )}
                      />
                      {blogErrors.content && (
                        <p className="text-red-500 text-xs flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {blogErrors.content}
                        </p>
                      )}
                    </div>

                    {/* Tags and Read Time */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label 
                          htmlFor="blog-tags" 
                          className="text-sm font-medium text-foreground flex items-center gap-2"
                        >
                          <Tag className="w-4 h-4 text-muted-foreground" />
                          Tags <span className="text-red-500">*</span>
                        </label>
                        <Input
                          id="blog-tags"
                          type="text"
                          placeholder="Kiến trúc, Du lịch, Nhật Bản"
                          value={blogForm.tags}
                          onChange={(e) => setBlogForm({ ...blogForm, tags: e.target.value })}
                          className={cn(
                            "bg-background/50",
                            blogErrors.tags && "border-red-500 focus-visible:ring-red-500"
                          )}
                        />
                        <p className="text-xs text-muted-foreground">Phân cách các tag bằng dấu phẩy</p>
                        {blogErrors.tags && (
                          <p className="text-red-500 text-xs flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {blogErrors.tags}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label 
                          htmlFor="blog-readtime" 
                          className="text-sm font-medium text-foreground flex items-center gap-2"
                        >
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          Thời gian đọc
                        </label>
                        <Input
                          id="blog-readtime"
                          type="text"
                          placeholder="5 phút đọc"
                          value={blogForm.readTime}
                          onChange={(e) => setBlogForm({ ...blogForm, readTime: e.target.value })}
                          className="bg-background/50"
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end gap-3 pt-4">
                      {editingPostId && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCancelEdit}
                          className="cursor-pointer"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Hủy chỉnh sửa
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setBlogForm({
                            title: "",
                            excerpt: "",
                            content: "",
                            image: "",
                            tags: "",
                            readTime: "5 phút đọc"
                          });
                          setBlogErrors({});
                        }}
                        className="cursor-pointer"
                        disabled={isSubmitting}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Xóa nội dung
                      </Button>
                      <Button type="submit" className="cursor-pointer" disabled={isSubmitting}>
                        <Save className="w-4 h-4 mr-2" />
                        {isSubmitting ? (editingPostId ? "Đang cập nhật..." : "Đang đăng...") : (editingPostId ? "Cập nhật" : "Đăng bài")}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Photo Form */}
            {activeTab === "photos" && (
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5 text-accent" />
                    Add New Photo
                  </CardTitle>
                  <CardDescription>
                    Add a new photo to your gallery
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePhotoSubmit} className="space-y-6">
                    {/* Title */}
                    <div className="space-y-2">
                      <label 
                        htmlFor="photo-title" 
                        className="text-sm font-medium text-foreground"
                      >
                        Title <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="photo-title"
                        type="text"
                        placeholder="Mountain Sunset"
                        value={photoForm.title}
                        onChange={(e) => setPhotoForm({ ...photoForm, title: e.target.value })}
                        className={cn(
                          "bg-background/50",
                          photoErrors.title && "border-red-500 focus-visible:ring-red-500"
                        )}
                      />
                      {photoErrors.title && (
                        <p className="text-red-500 text-xs flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {photoErrors.title}
                        </p>
                      )}
                    </div>

                    {/* Image URL */}
                    <div className="space-y-2">
                      <label 
                        htmlFor="photo-src" 
                        className="text-sm font-medium text-foreground"
                      >
                        Image URL <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="photo-src"
                        type="url"
                        placeholder="https://example.com/image.jpg"
                        value={photoForm.src}
                        onChange={(e) => setPhotoForm({ ...photoForm, src: e.target.value })}
                        className={cn(
                          "bg-background/50",
                          photoErrors.src && "border-red-500 focus-visible:ring-red-500"
                        )}
                      />
                      {photoErrors.src && (
                        <p className="text-red-500 text-xs flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {photoErrors.src}
                        </p>
                      )}
                      {/* Preview */}
                      {photoForm.src && (
                        <div className="mt-2 rounded-lg overflow-hidden bg-secondary/30 p-2">
                          <img
                            src={photoForm.src}
                            alt="Preview"
                            className="max-h-48 w-auto rounded-lg mx-auto"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Alt Text */}
                    <div className="space-y-2">
                      <label 
                        htmlFor="photo-alt" 
                        className="text-sm font-medium text-foreground"
                      >
                        Alt Text <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="photo-alt"
                        type="text"
                        placeholder="A beautiful mountain landscape at sunset"
                        value={photoForm.alt}
                        onChange={(e) => setPhotoForm({ ...photoForm, alt: e.target.value })}
                        className={cn(
                          "bg-background/50",
                          photoErrors.alt && "border-red-500 focus-visible:ring-red-500"
                        )}
                      />
                      <p className="text-xs text-muted-foreground">
                        Describe the image for accessibility
                      </p>
                      {photoErrors.alt && (
                        <p className="text-red-500 text-xs flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {photoErrors.alt}
                        </p>
                      )}
                    </div>

                    {/* Category and Location */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label 
                          htmlFor="photo-category" 
                          className="text-sm font-medium text-foreground flex items-center gap-2"
                        >
                          <Tag className="w-4 h-4 text-muted-foreground" />
                          Category <span className="text-red-500">*</span>
                        </label>
                        <Input
                          id="photo-category"
                          type="text"
                          placeholder="Nature, Urban, Portrait..."
                          value={photoForm.category}
                          onChange={(e) => setPhotoForm({ ...photoForm, category: e.target.value })}
                          className={cn(
                            "bg-background/50",
                            photoErrors.category && "border-red-500 focus-visible:ring-red-500"
                          )}
                        />
                        {photoErrors.category && (
                          <p className="text-red-500 text-xs flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {photoErrors.category}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label 
                          htmlFor="photo-location" 
                          className="text-sm font-medium text-foreground flex items-center gap-2"
                        >
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          Location
                        </label>
                        <Input
                          id="photo-location"
                          type="text"
                          placeholder="Swiss Alps"
                          value={photoForm.location}
                          onChange={(e) => setPhotoForm({ ...photoForm, location: e.target.value })}
                          className="bg-background/50"
                        />
                      </div>
                    </div>

                    {/* Date */}
                    <div className="space-y-2">
                      <label 
                        htmlFor="photo-date" 
                        className="text-sm font-medium text-foreground flex items-center gap-2"
                      >
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        Date Taken
                      </label>
                      <Input
                        id="photo-date"
                        type="date"
                        value={photoForm.date}
                        onChange={(e) => setPhotoForm({ ...photoForm, date: e.target.value })}
                        className="bg-background/50 w-full sm:w-auto"
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setPhotoForm({
                            title: "",
                            src: "",
                            alt: "",
                            location: "",
                            category: "",
                            date: new Date().toISOString().split("T")[0]
                          });
                          setPhotoErrors({});
                        }}
                        className="cursor-pointer"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Clear
                      </Button>
                      <Button type="submit" className="cursor-pointer">
                        <Upload className="w-4 h-4 mr-2" />
                        Add Photo
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Toast notification */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  );
}
