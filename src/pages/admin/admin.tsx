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
  AlertCircle
} from "lucide-react";

// Types
interface BlogFormData {
  title: string;
  excerpt: string;
  content: string;
  tags: string;
  readTime: string;
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
type TabType = "blog" | "photo";

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
  const [activeTab, setActiveTab] = useState<TabType>("blog");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Blog form state
  const [blogForm, setBlogForm] = useState<BlogFormData>({
    title: "",
    excerpt: "",
    content: "",
    tags: "",
    readTime: "5 min read"
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
  const [blogErrors, setBlogErrors] = useState<Partial<BlogFormData>>({});
  const [photoErrors, setPhotoErrors] = useState<Partial<PhotoFormData>>({});

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Validate blog form
  const validateBlogForm = (): boolean => {
    const errors: Partial<BlogFormData> = {};
    
    if (!blogForm.title.trim()) {
      errors.title = "Title is required";
    }
    if (!blogForm.excerpt.trim()) {
      errors.excerpt = "Excerpt is required";
    }
    if (!blogForm.content.trim()) {
      errors.content = "Content is required";
    }
    if (!blogForm.tags.trim()) {
      errors.tags = "At least one tag is required";
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
  const handleBlogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateBlogForm()) {
      setToast({ message: "Please fill in all required fields", type: "error" });
      return;
    }

    // Create blog post object
    const newPost = {
      id: Date.now(),
      title: blogForm.title,
      excerpt: blogForm.excerpt,
      content: blogForm.content,
      date: new Date().toISOString().split("T")[0],
      readTime: blogForm.readTime,
      tags: blogForm.tags.split(",").map(t => t.trim()),
      slug: blogForm.title.toLowerCase().replace(/\s+/g, "-")
    };

    console.log("New blog post:", newPost);
    
    // Reset form
    setBlogForm({
      title: "",
      excerpt: "",
      content: "",
      tags: "",
      readTime: "5 min read"
    });
    setBlogErrors({});
    
    setToast({ message: "Blog post created successfully!", type: "success" });
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

  const tabs = [
    { id: "blog" as const, label: "Create Blog", icon: FileText },
    { id: "photo" as const, label: "Add Photo", icon: ImageIcon },
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
                  Manage your blog posts and photos
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
            {/* Blog Form */}
            {activeTab === "blog" && (
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5 text-accent" />
                    Create New Blog Post
                  </CardTitle>
                  <CardDescription>
                    Write and publish a new article to your blog
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
                        Title <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="blog-title"
                        type="text"
                        placeholder="Enter blog post title"
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

                    {/* Excerpt */}
                    <div className="space-y-2">
                      <label 
                        htmlFor="blog-excerpt" 
                        className="text-sm font-medium text-foreground"
                      >
                        Excerpt <span className="text-red-500">*</span>
                      </label>
                      <Textarea
                        id="blog-excerpt"
                        placeholder="A brief summary of the article (shown in blog cards)"
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
                        Content <span className="text-red-500">*</span>
                      </label>
                      <Textarea
                        id="blog-content"
                        placeholder="Write your blog post content here... (Markdown supported)"
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
                          placeholder="React, Web Dev, Tutorial"
                          value={blogForm.tags}
                          onChange={(e) => setBlogForm({ ...blogForm, tags: e.target.value })}
                          className={cn(
                            "bg-background/50",
                            blogErrors.tags && "border-red-500 focus-visible:ring-red-500"
                          )}
                        />
                        <p className="text-xs text-muted-foreground">Separate tags with commas</p>
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
                          Read Time
                        </label>
                        <Input
                          id="blog-readtime"
                          type="text"
                          placeholder="5 min read"
                          value={blogForm.readTime}
                          onChange={(e) => setBlogForm({ ...blogForm, readTime: e.target.value })}
                          className="bg-background/50"
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setBlogForm({
                            title: "",
                            excerpt: "",
                            content: "",
                            tags: "",
                            readTime: "5 min read"
                          });
                          setBlogErrors({});
                        }}
                        className="cursor-pointer"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Clear
                      </Button>
                      <Button type="submit" className="cursor-pointer">
                        <Save className="w-4 h-4 mr-2" />
                        Publish Post
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Photo Form */}
            {activeTab === "photo" && (
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
