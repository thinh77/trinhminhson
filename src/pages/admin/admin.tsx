import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/hooks/useConfirm";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
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
  Search,
  FolderTree,
} from "lucide-react";
import { useBlog } from "@/stores/blog-store";
import { useAuth } from "@/contexts/AuthContext";
import { BlogFormData } from "@/types/blog";
import { postsApi } from "@/services/posts.service";
import {
  uploadPhoto,
  uploadMultiplePhotos,
  getPhotos,
  updatePhoto,
  deletePhoto,
  getPhotoUrl,
  type Photo,
} from "@/services/photos.service";
import { CategoryManagement } from "@/components/admin/CategoryManagement";
import { getAllCategories, type Category } from "@/services/categories.service";

// Use BlogFormData directly for the admin form (already includes: title, excerpt, content, image, tags, readTime)
type AdminBlogFormData = BlogFormData;

interface PhotoFormData {
  title: string;
  file: File | null;
  alt: string;
  location: string;
  categoryId: number | null;
  subcategoryIds: number[];
  date: string;
}

interface AlbumFormData {
  categoryId: number | null;
  subcategoryIds: number[];
  location: string;
  date: string;
}

interface AlbumUploadProgress {
  uploading: boolean;
  uploaded: number;
  total: number;
  errors: Array<{ filename: string; error: string }>;
}

// Tab type
type TabType = "posts" | "users" | "create-post" | "photos" | "categories";

// Toast notification component
function Toast({
  message,
  type,
  onClose,
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
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const { posts, addPost, fetchPosts } = useBlog();
  const { user } = useAuth();
  const confirm = useConfirm();

  // Blog form state
  const [blogForm, setBlogForm] = useState<AdminBlogFormData>({
    title: "",
    excerpt: "",
    content: "",
    image: "",
    tags: "",
    readTime: "5 phút đọc",
  });

  // Photo form state
  const [photoForm, setPhotoForm] = useState<PhotoFormData>({
    title: "",
    file: null,
    alt: "",
    location: "",
    categoryId: null,
    subcategoryIds: [],
    date: new Date().toISOString().split("T")[0],
  });

  // Photo preview URL
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Photo management state
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
  const [editPhotoForm, setEditPhotoForm] = useState<{
    title: string;
    alt: string;
    location: string;
    categoryId: number | null;
    subcategoryIds: number[];
    dateTaken: string;
  }>({
    title: "",
    alt: "",
    location: "",
    categoryId: null,
    subcategoryIds: [],
    dateTaken: "",
  });
  const [deletingPhotoId, setDeletingPhotoId] = useState<number | null>(null);
  const [photoSearchQuery, setPhotoSearchQuery] = useState("");

  // Album upload state
  const [albumFiles, setAlbumFiles] = useState<File[]>([]);
  const [albumPreviews, setAlbumPreviews] = useState<string[]>([]);
  const [albumForm, setAlbumForm] = useState<AlbumFormData>({
    categoryId: null,
    subcategoryIds: [],
    location: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [albumUploadProgress, setAlbumUploadProgress] =
    useState<AlbumUploadProgress>({
      uploading: false,
      uploaded: 0,
      total: 0,
      errors: [],
    });
  const [albumErrors, setAlbumErrors] = useState<
    Partial<Record<string, string>>
  >({});

  // Categories state for photo upload
  const [categoriesData, setCategoriesData] = useState<Category[]>([]);

  // Form errors
  const [blogErrors, setBlogErrors] = useState<Partial<AdminBlogFormData>>({});
  const [photoErrors, setPhotoErrors] = useState<
    Partial<Record<string, string>>
  >({});

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Load photos when switching to photos tab
  useEffect(() => {
    if (activeTab === "photos") {
      loadPhotos();
      loadCategoriesData();
    }
  }, [activeTab]);

  // Load categories data for dropdowns
  const loadCategoriesData = async () => {
    try {
      const data = await getAllCategories(false);
      setCategoriesData(data);
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  // Load photos function
  const loadPhotos = async () => {
    setIsLoadingPhotos(true);
    try {
      const data = await getPhotos();
      setPhotos(data);
    } catch (error) {
      console.error("Failed to load photos:", error);
      setToast({ message: "Failed to load photos", type: "error" });
    } finally {
      setIsLoadingPhotos(false);
    }
  };

  // Handle delete photo
  const handleDeletePhoto = async (photoId: number) => {
    const confirmed = await confirm({
      title: "Xóa ảnh",
      message: "Bạn có chắc muốn xóa ảnh này?",
      confirmText: "Xóa",
      cancelText: "Hủy",
      type: "danger",
    });
    if (!confirmed) return;

    setDeletingPhotoId(photoId);
    try {
      await deletePhoto(photoId);
      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
      setToast({ message: "Photo deleted successfully!", type: "success" });
    } catch (error) {
      console.error("Failed to delete photo:", error);
      setToast({ message: "Failed to delete photo", type: "error" });
    } finally {
      setDeletingPhotoId(null);
    }
  };

  // Handle edit photo
  const handleEditPhoto = (photo: Photo) => {
    // Find category ID from category name
    const category = categoriesData.find((c) => c.name === photo.category);
    const categoryId = category?.id || null;

    // Get subcategory IDs from photo's subcategories
    const subcategoryIds = photo.subcategories?.map((sub) => sub.id) || [];

    setEditPhotoForm({
      title: photo.title || "",
      alt: photo.alt || "",
      location: photo.location || "",
      categoryId,
      subcategoryIds,
      dateTaken: photo.date_taken ? photo.date_taken.split("T")[0] : "",
    });
    setEditingPhoto(photo);
  };

  // Handle save edited photo
  const handleSavePhoto = async (photoId: number) => {
    try {
      // Find category name from categoryId
      const category = categoriesData.find(
        (c) => c.id === editPhotoForm.categoryId
      );

      const updatedPhoto = await updatePhoto(photoId, {
        title: editPhotoForm.title,
        alt: editPhotoForm.alt,
        location: editPhotoForm.location || undefined,
        category: category?.name,
        subcategoryIds:
          editPhotoForm.subcategoryIds.length > 0
            ? editPhotoForm.subcategoryIds
            : undefined,
        dateTaken: editPhotoForm.dateTaken || undefined,
      });
      setPhotos((prev) =>
        prev.map((p) => (p.id === photoId ? updatedPhoto : p))
      );
      setEditingPhoto(null);
      setToast({ message: "Photo updated successfully!", type: "success" });
    } catch (error) {
      console.error("Failed to update photo:", error);
      setToast({ message: "Failed to update photo", type: "error" });
    }
  };

  // Handle cancel edit photo
  const handleCancelEditPhoto = () => {
    setEditingPhoto(null);
  };

  // Filter photos by search query
  const filteredPhotos = photos.filter(
    (photo) =>
      photo.title?.toLowerCase().includes(photoSearchQuery.toLowerCase()) ||
      photo.alt?.toLowerCase().includes(photoSearchQuery.toLowerCase()) ||
      photo.category?.toLowerCase().includes(photoSearchQuery.toLowerCase()) ||
      photo.location?.toLowerCase().includes(photoSearchQuery.toLowerCase())
  );

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
    const errors: Partial<Record<string, string>> = {};

    if (!photoForm.title.trim()) {
      errors.title = "Title is required";
    }
    if (!photoForm.file) {
      errors.file = "Image file is required";
    }
    if (!photoForm.alt.trim()) {
      errors.alt = "Alt text is required";
    }
    if (!photoForm.categoryId) {
      errors.categoryId = "Category is required";
    }

    setPhotoErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle blog form submission
  const handleBlogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateBlogForm()) {
      setToast({
        message: "Vui lòng điền đầy đủ các trường bắt buộc",
        type: "error",
      });
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
        setToast({
          message: "Bài viết đã được cập nhật thành công!",
          type: "success",
        });
        setEditingPostId(null);
      } else {
        // Add new blog post using store (which calls the API)
        await addPost(
          {
            title: blogForm.title,
            excerpt: blogForm.excerpt,
            content: blogForm.content,
            image: blogForm.image,
            readTime: blogForm.readTime,
            tags: blogForm.tags.split(",").map((t) => t.trim()),
          },
          user?.id
        ); // Pass the authenticated user's ID

        setToast({
          message: "Bài viết đã được tạo thành công!",
          type: "success",
        });
      }

      // Reset form
      setBlogForm({
        title: "",
        excerpt: "",
        content: "",
        image: "",
        tags: "",
        readTime: "5 phút đọc",
      });
      setBlogErrors({});
    } catch (error) {
      console.error("Failed to save post:", error);
      setToast({
        message:
          error instanceof Error
            ? error.message
            : "Không thể lưu bài viết. Vui lòng thử lại.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle photo form submission
  const handlePhotoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePhotoForm()) {
      setToast({
        message: "Please fill in all required fields",
        type: "error",
      });
      return;
    }

    if (!photoForm.file) {
      setToast({ message: "Please select an image file", type: "error" });
      return;
    }

    // Get category name from selected category
    const selectedCategory = categoriesData.find(
      (c) => c.id === photoForm.categoryId
    );
    if (!selectedCategory) {
      setToast({ message: "Please select a valid category", type: "error" });
      return;
    }

    setIsSubmitting(true);
    try {
      // Upload photo to server
      await uploadPhoto(photoForm.file, {
        title: photoForm.title,
        alt: photoForm.alt,
        location: photoForm.location || undefined,
        category: selectedCategory.name,
        subcategoryIds:
          photoForm.subcategoryIds.length > 0
            ? photoForm.subcategoryIds
            : undefined,
        dateTaken: photoForm.date,
        isPublic: true,
      });

      // Reset form
      setPhotoForm({
        title: "",
        file: null,
        alt: "",
        location: "",
        categoryId: null,
        subcategoryIds: [],
        date: new Date().toISOString().split("T")[0],
      });
      setPhotoPreview(null);
      setPhotoErrors({});

      // Reload photos list
      await loadPhotos();

      setToast({ message: "Photo uploaded successfully!", type: "success" });
    } catch (error) {
      console.error("Failed to upload photo:", error);
      setToast({
        message:
          error instanceof Error
            ? error.message
            : "Failed to upload photo. Please try again.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle album files change
  const handleAlbumFilesChange = (newFiles: FileList | null) => {
    if (!newFiles) return;

    const filesArray = Array.from(newFiles);
    // Filter only image files
    const imageFiles = filesArray.filter((file) =>
      file.type.startsWith("image/")
    );

    // Add to existing files
    const updatedFiles = [...albumFiles, ...imageFiles];
    setAlbumFiles(updatedFiles);

    // Create preview URLs for new files
    const newPreviews = imageFiles.map((file) => URL.createObjectURL(file));
    setAlbumPreviews((prev) => [...prev, ...newPreviews]);
  };

  // Remove a file from album
  const removeAlbumFile = (index: number) => {
    setAlbumFiles((prev) => prev.filter((_, i) => i !== index));
    // Revoke the object URL to free memory
    URL.revokeObjectURL(albumPreviews[index]);
    setAlbumPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Clear all album files
  const clearAlbumFiles = () => {
    albumPreviews.forEach((url) => URL.revokeObjectURL(url));
    setAlbumFiles([]);
    setAlbumPreviews([]);
    setAlbumForm({
      categoryId: null,
      subcategoryIds: [],
      location: "",
      date: new Date().toISOString().split("T")[0],
    });
    setAlbumErrors({});
    setAlbumUploadProgress({
      uploading: false,
      uploaded: 0,
      total: 0,
      errors: [],
    });
  };

  // Validate album form
  const validateAlbumForm = (): boolean => {
    const errors: Partial<Record<string, string>> = {};

    if (albumFiles.length === 0) {
      errors.files = "Please select at least one image";
    }
    if (!albumForm.categoryId) {
      errors.categoryId = "Category is required";
    }

    setAlbumErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle album upload
  const handleAlbumSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateAlbumForm()) {
      setToast({
        message: "Please fill in all required fields",
        type: "error",
      });
      return;
    }

    // Get category name from selected category
    const selectedCategory = categoriesData.find(
      (c) => c.id === albumForm.categoryId
    );
    if (!selectedCategory) {
      setToast({ message: "Please select a valid category", type: "error" });
      return;
    }

    setAlbumUploadProgress({
      uploading: true,
      uploaded: 0,
      total: albumFiles.length,
      errors: [],
    });

    try {
      const result = await uploadMultiplePhotos(albumFiles, {
        category: selectedCategory.name,
        subcategoryIds:
          albumForm.subcategoryIds.length > 0
            ? albumForm.subcategoryIds
            : undefined,
        location: albumForm.location || undefined,
        dateTaken: albumForm.date,
        isPublic: true,
      });

      setAlbumUploadProgress({
        uploading: false,
        uploaded: result.uploaded.length,
        total: result.total,
        errors: result.errors,
      });

      // Clear form on success
      if (result.errors.length === 0) {
        clearAlbumFiles();
        setToast({
          message: `Successfully uploaded ${result.uploaded.length} photos!`,
          type: "success",
        });
      } else {
        setToast({
          message: `Uploaded ${result.uploaded.length}/${result.total} photos. ${result.errors.length} failed.`,
          type: result.uploaded.length > 0 ? "success" : "error",
        });
      }

      // Reload photos list
      await loadPhotos();
    } catch (error) {
      console.error("Failed to upload album:", error);
      setAlbumUploadProgress((prev) => ({
        ...prev,
        uploading: false,
      }));
      setToast({
        message:
          error instanceof Error
            ? error.message
            : "Failed to upload album. Please try again.",
        type: "error",
      });
    }
  };

  // Handle edit post
  const handleEditPost = (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (post) {
      setBlogForm({
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        image: post.image,
        tags: post.tags.join(", "),
        readTime: post.readTime,
      });
      setEditingPostId(postId);
      setActiveTab("create-post");
    }
  };

  // Handle delete post
  const handleDeletePost = async (postId: string) => {
    const confirmed = await confirm({
      title: "Xóa bài viết",
      message: "Bạn có chắc muốn xóa bài viết này?",
      confirmText: "Xóa",
      cancelText: "Hủy",
      type: "danger",
    });
    if (!confirmed) return;

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
      readTime: "5 phút đọc",
    });
    setBlogErrors({});
  };

  // Filter posts by search query
  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tabs = [
    { id: "posts" as const, label: "Post Management", icon: FileText },
    { id: "users" as const, label: "User Management", icon: Users },
    { id: "create-post" as const, label: "Create Post", icon: Plus },
    { id: "photos" as const, label: "Photo Gallery", icon: ImageIcon },
    { id: "categories" as const, label: "Categories", icon: FolderTree },
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
                          {searchQuery
                            ? "Try a different search term"
                            : "Create your first post to get started"}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filteredPosts.map((post) => (
                          <Card
                            key={post.id}
                            className="hover:shadow-md transition-shadow"
                          >
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
                        onChange={(e) =>
                          setBlogForm({ ...blogForm, title: e.target.value })
                        }
                        className={cn(
                          "bg-background/50",
                          blogErrors.title &&
                            "border-red-500 focus-visible:ring-red-500"
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
                        onChange={(e) =>
                          setBlogForm({ ...blogForm, image: e.target.value })
                        }
                        className={cn(
                          "bg-background/50",
                          blogErrors.image &&
                            "border-red-500 focus-visible:ring-red-500"
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
                              (e.target as HTMLImageElement).style.display =
                                "none";
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
                        onChange={(e) =>
                          setBlogForm({ ...blogForm, excerpt: e.target.value })
                        }
                        className={cn(
                          "bg-background/50 resize-none",
                          blogErrors.excerpt &&
                            "border-red-500 focus-visible:ring-red-500"
                        )}
                      />
                      {blogErrors.excerpt && (
                        <p className="text-red-500 text-xs flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {blogErrors.excerpt}
                        </p>
                      )}
                    </div>

                    {/* Content - CKEditor 5 Rich Text Editor */}
                    <div className="space-y-2">
                      <label
                        htmlFor="blog-content"
                        className="text-sm font-medium text-foreground flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        Nội dung <span className="text-red-500">*</span>
                      </label>
                      <p className="text-xs text-muted-foreground mb-2">
                        Sử dụng trình soạn thảo để định dạng nội dung bài viết
                      </p>
                      <RichTextEditor
                        id="blog-content"
                        value={blogForm.content}
                        onChange={(content) =>
                          setBlogForm({ ...blogForm, content })
                        }
                        placeholder="Viết nội dung bài viết của bạn ở đây..."
                        minHeight="450px"
                        disabled={isSubmitting}
                        error={!!blogErrors.content}
                      />
                      {blogErrors.content && (
                        <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
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
                          onChange={(e) =>
                            setBlogForm({ ...blogForm, tags: e.target.value })
                          }
                          className={cn(
                            "bg-background/50",
                            blogErrors.tags &&
                              "border-red-500 focus-visible:ring-red-500"
                          )}
                        />
                        <p className="text-xs text-muted-foreground">
                          Phân cách các tag bằng dấu phẩy
                        </p>
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
                          onChange={(e) =>
                            setBlogForm({
                              ...blogForm,
                              readTime: e.target.value,
                            })
                          }
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
                            readTime: "5 phút đọc",
                          });
                          setBlogErrors({});
                        }}
                        className="cursor-pointer"
                        disabled={isSubmitting}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Xóa nội dung
                      </Button>
                      <Button
                        type="submit"
                        className="cursor-pointer"
                        disabled={isSubmitting}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {isSubmitting
                          ? editingPostId
                            ? "Đang cập nhật..."
                            : "Đang đăng..."
                          : editingPostId
                          ? "Cập nhật"
                          : "Đăng bài"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Photo Form */}
            {activeTab === "photos" && (
              <>
                {/* Album Upload Section */}
                <Card className="bg-card/50 backdrop-blur-sm border-border/50 mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-accent" />
                      Album Upload
                    </CardTitle>
                    <CardDescription>
                      Upload multiple photos with the same category and
                      subcategory
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleAlbumSubmit} className="space-y-6">
                      {/* Multi-file Drop Zone */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground flex items-center gap-2">
                          <Upload className="w-4 h-4 text-muted-foreground" />
                          Select Images <span className="text-red-500">*</span>
                        </label>
                        <div
                          className={cn(
                            "relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer",
                            "hover:border-accent/50 hover:bg-accent/5",
                            albumErrors.files
                              ? "border-red-500"
                              : albumFiles.length > 0
                              ? "border-accent bg-accent/5"
                              : "border-border"
                          )}
                          onClick={() =>
                            document.getElementById("album-files")?.click()
                          }
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.currentTarget.classList.add(
                              "border-accent",
                              "bg-accent/10"
                            );
                          }}
                          onDragLeave={(e) => {
                            e.preventDefault();
                            e.currentTarget.classList.remove(
                              "border-accent",
                              "bg-accent/10"
                            );
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.currentTarget.classList.remove(
                              "border-accent",
                              "bg-accent/10"
                            );
                            handleAlbumFilesChange(e.dataTransfer.files);
                          }}
                        >
                          <input
                            id="album-files"
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) =>
                              handleAlbumFilesChange(e.target.files)
                            }
                          />
                          <div className="space-y-2">
                            <Upload className="w-10 h-10 mx-auto text-muted-foreground" />
                            <p className="text-sm font-medium text-foreground">
                              Click to upload or drag and drop multiple images
                            </p>
                            <p className="text-xs text-muted-foreground">
                              PNG, JPG, GIF up to 10MB each • Max 50 files
                            </p>
                            {albumFiles.length > 0 && (
                              <p className="text-sm text-accent font-medium">
                                {albumFiles.length} file(s) selected
                              </p>
                            )}
                          </div>
                        </div>
                        {albumErrors.files && (
                          <p className="text-red-500 text-xs flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {albumErrors.files}
                          </p>
                        )}
                      </div>

                      {/* Preview Grid */}
                      {albumFiles.length > 0 && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">
                            Selected Images
                          </label>
                          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                            {albumPreviews.map((preview, index) => (
                              <div
                                key={index}
                                className="relative aspect-square rounded-lg overflow-hidden bg-secondary/30 group"
                              >
                                <img
                                  src={preview}
                                  alt={`Preview ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeAlbumFile(index);
                                  }}
                                  className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[8px] px-1 py-0.5 truncate">
                                  {albumFiles[index]?.name}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Category Selection */}
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label
                            htmlFor="album-category"
                            className="text-sm font-medium text-foreground flex items-center gap-2"
                          >
                            <Tag className="w-4 h-4 text-muted-foreground" />
                            Category <span className="text-red-500">*</span>
                          </label>
                          <select
                            id="album-category"
                            value={albumForm.categoryId || ""}
                            onChange={(e) => {
                              const categoryId = e.target.value
                                ? Number(e.target.value)
                                : null;
                              setAlbumForm({
                                ...albumForm,
                                categoryId,
                                subcategoryIds: [],
                              });
                            }}
                            className={cn(
                              "w-full h-10 px-3 rounded-md border bg-background/50",
                              "text-sm text-foreground",
                              "focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background",
                              albumErrors.categoryId
                                ? "border-red-500 focus:ring-red-500"
                                : "border-input"
                            )}
                          >
                            <option value="">Select a category...</option>
                            {categoriesData.map((category) => (
                              <option key={category.id} value={category.id}>
                                {category.name}
                              </option>
                            ))}
                          </select>
                          {albumErrors.categoryId && (
                            <p className="text-red-500 text-xs flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {albumErrors.categoryId}
                            </p>
                          )}
                        </div>

                        {/* Subcategories */}
                        {albumForm.categoryId && (
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground flex items-center gap-2">
                              <Tag className="w-4 h-4 text-muted-foreground" />
                              Subcategories
                            </label>
                            <div className="flex flex-wrap gap-2">
                              {categoriesData
                                .find((c) => c.id === albumForm.categoryId)
                                ?.subcategories.map((sub) => (
                                  <button
                                    key={sub.id}
                                    type="button"
                                    onClick={() => {
                                      const isSelected =
                                        albumForm.subcategoryIds.includes(
                                          sub.id
                                        );
                                      setAlbumForm({
                                        ...albumForm,
                                        subcategoryIds: isSelected
                                          ? albumForm.subcategoryIds.filter(
                                              (id) => id !== sub.id
                                            )
                                          : [
                                              ...albumForm.subcategoryIds,
                                              sub.id,
                                            ],
                                      });
                                    }}
                                    className={cn(
                                      "px-3 py-1.5 rounded-full text-sm font-medium",
                                      "transition-all duration-200",
                                      "cursor-pointer",
                                      "border",
                                      albumForm.subcategoryIds.includes(sub.id)
                                        ? "bg-accent text-accent-foreground border-accent"
                                        : "bg-background/50 text-muted-foreground border-border hover:border-accent/50 hover:text-foreground"
                                    )}
                                  >
                                    {sub.name}
                                  </button>
                                ))}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              All photos will be tagged with selected
                              subcategories
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Location and Date */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label
                            htmlFor="album-location"
                            className="text-sm font-medium text-foreground flex items-center gap-2"
                          >
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            Location
                          </label>
                          <Input
                            id="album-location"
                            type="text"
                            placeholder="e.g., Tokyo, Japan"
                            value={albumForm.location}
                            onChange={(e) =>
                              setAlbumForm({
                                ...albumForm,
                                location: e.target.value,
                              })
                            }
                            className="bg-background/50"
                          />
                        </div>
                        <div className="space-y-2">
                          <label
                            htmlFor="album-date"
                            className="text-sm font-medium text-foreground flex items-center gap-2"
                          >
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            Date Taken
                          </label>
                          <Input
                            id="album-date"
                            type="date"
                            value={albumForm.date}
                            onChange={(e) =>
                              setAlbumForm({
                                ...albumForm,
                                date: e.target.value,
                              })
                            }
                            className="bg-background/50"
                          />
                        </div>
                      </div>

                      {/* Upload Progress */}
                      {albumUploadProgress.uploading && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              Uploading...
                            </span>
                            <span className="text-foreground font-medium">
                              {albumUploadProgress.uploaded} /{" "}
                              {albumUploadProgress.total}
                            </span>
                          </div>
                          <div className="w-full bg-secondary/50 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-accent h-full rounded-full transition-all duration-300"
                              style={{
                                width: `${
                                  (albumUploadProgress.uploaded /
                                    albumUploadProgress.total) *
                                  100
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Error List */}
                      {albumUploadProgress.errors.length > 0 && (
                        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                          <p className="text-sm font-medium text-red-500 mb-2">
                            Failed to upload {albumUploadProgress.errors.length}{" "}
                            file(s):
                          </p>
                          <ul className="text-xs text-red-400 space-y-1">
                            {albumUploadProgress.errors.map((err, idx) => (
                              <li key={idx}>
                                • {err.filename}: {err.error}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Submit Button */}
                      <div className="flex justify-end gap-3 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={clearAlbumFiles}
                          className="cursor-pointer"
                          disabled={albumUploadProgress.uploading}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Clear All
                        </Button>
                        <Button
                          type="submit"
                          className="cursor-pointer"
                          disabled={
                            albumUploadProgress.uploading ||
                            albumFiles.length === 0
                          }
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {albumUploadProgress.uploading
                            ? "Uploading..."
                            : `Upload ${albumFiles.length} Photo${
                                albumFiles.length !== 1 ? "s" : ""
                              }`}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>

                {/* Single Photo Upload */}
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="w-5 h-5 text-accent" />
                      Add Single Photo
                    </CardTitle>
                    <CardDescription>
                      Add a single photo with custom title and alt text
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
                          onChange={(e) =>
                            setPhotoForm({
                              ...photoForm,
                              title: e.target.value,
                            })
                          }
                          className={cn(
                            "bg-background/50",
                            photoErrors.title &&
                              "border-red-500 focus-visible:ring-red-500"
                          )}
                        />
                        {photoErrors.title && (
                          <p className="text-red-500 text-xs flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {photoErrors.title}
                          </p>
                        )}
                      </div>

                      {/* Image Upload */}
                      <div className="space-y-2">
                        <label
                          htmlFor="photo-file"
                          className="text-sm font-medium text-foreground flex items-center gap-2"
                        >
                          <Upload className="w-4 h-4 text-muted-foreground" />
                          Image File <span className="text-red-500">*</span>
                        </label>
                        <div
                          className={cn(
                            "relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer",
                            "hover:border-accent/50 hover:bg-accent/5",
                            photoErrors.file
                              ? "border-red-500"
                              : "border-border",
                            photoForm.file && "border-accent bg-accent/5"
                          )}
                          onClick={() =>
                            document.getElementById("photo-file")?.click()
                          }
                        >
                          <input
                            id="photo-file"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setPhotoForm({ ...photoForm, file });
                                // Create preview URL
                                const previewUrl = URL.createObjectURL(file);
                                setPhotoPreview(previewUrl);
                                // Auto-fill title from filename if empty
                                if (!photoForm.title) {
                                  const nameWithoutExt = file.name.replace(
                                    /\.[^/.]+$/,
                                    ""
                                  );
                                  setPhotoForm((prev) => ({
                                    ...prev,
                                    file,
                                    title: nameWithoutExt,
                                  }));
                                }
                              }
                            }}
                          />
                          {photoPreview ? (
                            <div className="space-y-3">
                              <img
                                src={photoPreview}
                                alt="Preview"
                                className="max-h-48 w-auto rounded-lg mx-auto"
                              />
                              <p className="text-sm text-muted-foreground">
                                {photoForm.file?.name} (
                                {(
                                  photoForm.file?.size || 0 / 1024 / 1024
                                ).toFixed(2)}{" "}
                                MB)
                              </p>
                              <p className="text-xs text-accent">
                                Click to change image
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <Upload className="w-10 h-10 mx-auto text-muted-foreground" />
                              <p className="text-sm font-medium text-foreground">
                                Click to upload or drag and drop
                              </p>
                              <p className="text-xs text-muted-foreground">
                                PNG, JPG, GIF up to 10MB
                              </p>
                            </div>
                          )}
                        </div>
                        {photoErrors.file && (
                          <p className="text-red-500 text-xs flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {photoErrors.file}
                          </p>
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
                          onChange={(e) =>
                            setPhotoForm({ ...photoForm, alt: e.target.value })
                          }
                          className={cn(
                            "bg-background/50",
                            photoErrors.alt &&
                              "border-red-500 focus-visible:ring-red-500"
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

                      {/* Category and Subcategory */}
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label
                            htmlFor="photo-category"
                            className="text-sm font-medium text-foreground flex items-center gap-2"
                          >
                            <Tag className="w-4 h-4 text-muted-foreground" />
                            Category <span className="text-red-500">*</span>
                          </label>
                          <select
                            id="photo-category"
                            value={photoForm.categoryId || ""}
                            onChange={(e) => {
                              const categoryId = e.target.value
                                ? Number(e.target.value)
                                : null;
                              setPhotoForm({
                                ...photoForm,
                                categoryId,
                                subcategoryIds: [], // Reset subcategories when category changes
                              });
                            }}
                            className={cn(
                              "w-full h-10 px-3 rounded-md border bg-background/50",
                              "text-sm text-foreground",
                              "focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background",
                              photoErrors.categoryId
                                ? "border-red-500 focus:ring-red-500"
                                : "border-input"
                            )}
                          >
                            <option value="">Select a category...</option>
                            {categoriesData.map((category) => (
                              <option key={category.id} value={category.id}>
                                {category.name}
                              </option>
                            ))}
                          </select>
                          {photoErrors.categoryId && (
                            <p className="text-red-500 text-xs flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {photoErrors.categoryId}
                            </p>
                          )}
                        </div>

                        {/* Subcategories - shown when category is selected */}
                        {photoForm.categoryId && (
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground flex items-center gap-2">
                              <Tag className="w-4 h-4 text-muted-foreground" />
                              Subcategories
                            </label>
                            <div className="flex flex-wrap gap-2">
                              {categoriesData
                                .find((c) => c.id === photoForm.categoryId)
                                ?.subcategories.map((sub) => (
                                  <button
                                    key={sub.id}
                                    type="button"
                                    onClick={() => {
                                      const isSelected =
                                        photoForm.subcategoryIds.includes(
                                          sub.id
                                        );
                                      setPhotoForm({
                                        ...photoForm,
                                        subcategoryIds: isSelected
                                          ? photoForm.subcategoryIds.filter(
                                              (id) => id !== sub.id
                                            )
                                          : [
                                              ...photoForm.subcategoryIds,
                                              sub.id,
                                            ],
                                      });
                                    }}
                                    className={cn(
                                      "px-3 py-1.5 rounded-full text-sm font-medium",
                                      "transition-all duration-200",
                                      "cursor-pointer",
                                      "border",
                                      photoForm.subcategoryIds.includes(sub.id)
                                        ? "bg-accent text-accent-foreground border-accent"
                                        : "bg-background/50 text-muted-foreground border-border hover:border-accent/50 hover:text-foreground"
                                    )}
                                  >
                                    {sub.name}
                                  </button>
                                ))}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Click to select/deselect subcategories (optional)
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Location */}
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
                          onChange={(e) =>
                            setPhotoForm({
                              ...photoForm,
                              location: e.target.value,
                            })
                          }
                          className="bg-background/50"
                        />
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
                          onChange={(e) =>
                            setPhotoForm({ ...photoForm, date: e.target.value })
                          }
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
                              file: null,
                              alt: "",
                              location: "",
                              categoryId: null,
                              subcategoryIds: [],
                              date: new Date().toISOString().split("T")[0],
                            });
                            setPhotoPreview(null);
                            setPhotoErrors({});
                          }}
                          className="cursor-pointer"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Clear
                        </Button>
                        <Button
                          type="submit"
                          className="cursor-pointer"
                          disabled={isSubmitting}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {isSubmitting ? "Uploading..." : "Add Photo"}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>

                {/* Photo Management Section */}
                <Card className="bg-card/50 backdrop-blur-sm border-border/50 mt-6">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <ImageIcon className="w-5 h-5 text-accent" />
                          Manage Photos
                        </CardTitle>
                        <CardDescription>
                          View, edit, and delete your uploaded photos
                        </CardDescription>
                      </div>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Search photos..."
                          value={photoSearchQuery}
                          onChange={(e) => setPhotoSearchQuery(e.target.value)}
                          className="pl-9 w-full sm:w-64 bg-background/50"
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoadingPhotos ? (
                      <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
                      </div>
                    ) : filteredPhotos.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>
                          {photos.length === 0
                            ? "No photos uploaded yet"
                            : "No photos found"}
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredPhotos.map((photo) => (
                          <div
                            key={photo.id}
                            className="group relative bg-background/50 rounded-lg overflow-hidden border border-border/50 hover:border-accent/50 transition-colors"
                          >
                            {/* Photo Image */}
                            <div className="aspect-square overflow-hidden">
                              <img
                                src={getPhotoUrl(photo.filename, "thumb")}
                                alt={photo.alt || photo.title}
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              />
                            </div>

                            {/* Photo Info */}
                            <div className="p-3">
                              <h4 className="font-medium text-sm truncate">
                                {photo.title}
                              </h4>
                              <p className="text-xs text-muted-foreground truncate">
                                {photo.category}{" "}
                                {photo.location && `• ${photo.location}`}
                              </p>
                            </div>

                            {/* Overlay Actions */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleEditPhoto(photo)}
                                className="cursor-pointer"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeletePhoto(photo.id)}
                                disabled={deletingPhotoId === photo.id}
                                className="cursor-pointer"
                              >
                                {deletingPhotoId === photo.id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Edit Photo Modal */}
                {editingPhoto && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <Card className="w-full max-w-lg bg-card border-border max-h-[90vh] overflow-hidden flex flex-col">
                      <CardHeader className="flex-shrink-0">
                        <CardTitle className="flex items-center gap-2">
                          <Edit className="w-5 h-5 text-accent" />
                          Edit Photo
                        </CardTitle>
                        <CardDescription>
                          Update photo information
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="overflow-y-auto flex-1">
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleSavePhoto(editingPhoto.id);
                          }}
                          className="space-y-4"
                        >
                          {/* Photo Preview */}
                          <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
                            <img
                              src={getPhotoUrl(editingPhoto.filename, "medium")}
                              alt={editingPhoto.alt || editingPhoto.title}
                              className="w-full h-full object-contain"
                            />
                          </div>

                          {/* Title */}
                          <div className="space-y-2">
                            <label
                              htmlFor="edit-title"
                              className="text-sm font-medium flex items-center gap-2"
                            >
                              Title <span className="text-red-500">*</span>
                            </label>
                            <Input
                              id="edit-title"
                              name="title"
                              value={editPhotoForm.title}
                              onChange={(e) =>
                                setEditPhotoForm({
                                  ...editPhotoForm,
                                  title: e.target.value,
                                })
                              }
                              className="bg-background/50"
                              placeholder="Enter photo title"
                            />
                          </div>

                          {/* Alt Text */}
                          <div className="space-y-2">
                            <label
                              htmlFor="edit-alt"
                              className="text-sm font-medium flex items-center gap-2"
                            >
                              Alt Text <span className="text-red-500">*</span>
                            </label>
                            <Input
                              id="edit-alt"
                              name="alt"
                              value={editPhotoForm.alt}
                              onChange={(e) =>
                                setEditPhotoForm({
                                  ...editPhotoForm,
                                  alt: e.target.value,
                                })
                              }
                              className="bg-background/50"
                              placeholder="Describe the image for accessibility"
                            />
                          </div>

                          {/* Category Selection */}
                          <div className="space-y-2">
                            <label
                              htmlFor="edit-category"
                              className="text-sm font-medium flex items-center gap-2"
                            >
                              <Tag className="w-4 h-4 text-muted-foreground" />
                              Category <span className="text-red-500">*</span>
                            </label>
                            <select
                              id="edit-category"
                              value={editPhotoForm.categoryId || ""}
                              onChange={(e) => {
                                const categoryId = e.target.value
                                  ? Number(e.target.value)
                                  : null;
                                setEditPhotoForm({
                                  ...editPhotoForm,
                                  categoryId,
                                  subcategoryIds: [],
                                });
                              }}
                              className={cn(
                                "w-full h-10 px-3 rounded-md border bg-background/50",
                                "text-sm text-foreground",
                                "focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background",
                                "border-input cursor-pointer"
                              )}
                            >
                              <option value="">Select a category...</option>
                              {categoriesData.map((category) => (
                                <option key={category.id} value={category.id}>
                                  {category.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Subcategories */}
                          {editPhotoForm.categoryId && (
                            <div className="space-y-2">
                              <label className="text-sm font-medium flex items-center gap-2">
                                <Tag className="w-4 h-4 text-muted-foreground" />
                                Subcategories
                              </label>
                              <div className="flex flex-wrap gap-2">
                                {categoriesData
                                  .find(
                                    (c) => c.id === editPhotoForm.categoryId
                                  )
                                  ?.subcategories.map((sub) => {
                                    const isSelected =
                                      editPhotoForm.subcategoryIds.includes(
                                        sub.id
                                      );
                                    return (
                                      <button
                                        key={sub.id}
                                        type="button"
                                        onClick={() => {
                                          setEditPhotoForm({
                                            ...editPhotoForm,
                                            subcategoryIds: isSelected
                                              ? editPhotoForm.subcategoryIds.filter(
                                                  (id) => id !== sub.id
                                                )
                                              : [
                                                  ...editPhotoForm.subcategoryIds,
                                                  sub.id,
                                                ],
                                          });
                                        }}
                                        className={cn(
                                          "px-3 py-1.5 rounded-full text-sm font-medium",
                                          "transition-all duration-200",
                                          "cursor-pointer",
                                          "border",
                                          isSelected
                                            ? "bg-accent text-accent-foreground border-accent"
                                            : "bg-background/50 text-muted-foreground border-border hover:border-accent/50 hover:text-foreground"
                                        )}
                                      >
                                        {sub.name}
                                      </button>
                                    );
                                  })}
                              </div>
                              {categoriesData.find(
                                (c) => c.id === editPhotoForm.categoryId
                              )?.subcategories.length === 0 && (
                                <p className="text-xs text-muted-foreground">
                                  No subcategories available for this category
                                </p>
                              )}
                            </div>
                          )}

                          {/* Location */}
                          <div className="space-y-2">
                            <label
                              htmlFor="edit-location"
                              className="text-sm font-medium flex items-center gap-2"
                            >
                              <MapPin className="w-4 h-4 text-muted-foreground" />
                              Location
                            </label>
                            <Input
                              id="edit-location"
                              name="location"
                              value={editPhotoForm.location}
                              onChange={(e) =>
                                setEditPhotoForm({
                                  ...editPhotoForm,
                                  location: e.target.value,
                                })
                              }
                              className="bg-background/50"
                              placeholder="e.g., Tokyo, Japan"
                            />
                          </div>

                          {/* Date Taken */}
                          <div className="space-y-2">
                            <label
                              htmlFor="edit-date"
                              className="text-sm font-medium flex items-center gap-2"
                            >
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              Date Taken
                            </label>
                            <Input
                              id="edit-date"
                              name="dateTaken"
                              type="date"
                              value={editPhotoForm.dateTaken}
                              onChange={(e) =>
                                setEditPhotoForm({
                                  ...editPhotoForm,
                                  dateTaken: e.target.value,
                                })
                              }
                              className="bg-background/50"
                            />
                          </div>

                          {/* Current Info Summary */}
                          {(editingPhoto.subcategories?.length || 0) > 0 && (
                            <div className="p-3 rounded-lg bg-secondary/30 border border-border/50">
                              <p className="text-xs text-muted-foreground mb-2">
                                Current subcategories:
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {editingPhoto.subcategories?.map((sub) => (
                                  <span
                                    key={sub.id}
                                    className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs"
                                  >
                                    {sub.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handleCancelEditPhoto}
                              className="cursor-pointer"
                            >
                              Cancel
                            </Button>
                            <Button
                              type="submit"
                              className="cursor-pointer"
                              disabled={
                                !editPhotoForm.title ||
                                !editPhotoForm.alt ||
                                !editPhotoForm.categoryId
                              }
                            >
                              <Save className="w-4 h-4 mr-2" />
                              Save Changes
                            </Button>
                          </div>
                        </form>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </>
            )}

            {/* Categories Management */}
            {activeTab === "categories" && (
              <CategoryManagement
                onToast={(message, type) => setToast({ message, type })}
              />
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
