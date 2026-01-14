import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { cn } from "@/lib/utils";
import { useConfirm } from "@/hooks/useConfirm";
import {
  Settings,
  FileText,
  Image as ImageIcon,
  Plus,
  Users,
  FolderTree,
} from "lucide-react";
import { useBlog } from "@/stores/blog-store";
import { useAuth } from "@/contexts/AuthContext";
import { postsApi } from "@/services/posts.service";
import {
  uploadPhoto,
  getPhotos,
  updatePhoto,
  deletePhoto,
  type Photo,
} from "@/services/photos.service";
import { CategoryManagement } from "@/components/admin/CategoryManagement";
import { getAllCategories, type Category } from "@/services/categories.service";
import {
  Toast,
  PostManagement,
  UserManagement,
  BlogPostForm,
  SinglePhotoUpload,
  PhotoGallery,
} from "./components";
import type { TabType, AdminBlogFormData, PhotoFormData } from "./types";

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
    } else {
      const MAX_SIZE = 15 * 1024 * 1024; // 15MB in bytes
      const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png"];

      if (!ALLOWED_TYPES.includes(photoForm.file.type)) {
        errors.file = "Only JPG and PNG images are allowed";
      } else if (photoForm.file.size > MAX_SIZE) {
        errors.file = "Image size must be less than 15MB";
      }
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

    const selectedCategory = categoriesData.find(
      (c) => c.id === photoForm.categoryId
    );
    if (!selectedCategory) {
      setToast({ message: "Please select a valid category", type: "error" });
      return;
    }

    setIsSubmitting(true);
    try {
      await uploadPhoto(photoForm.file, {
        title: photoForm.title,
        category: selectedCategory.name,
        subcategoryIds:
          photoForm.subcategoryIds.length > 0
            ? photoForm.subcategoryIds
            : undefined,
        dateTaken: photoForm.date,
        isPublic: true,
      });

      setPhotoForm({
        title: "",
        file: null,
        categoryId: null,
        subcategoryIds: [],
        date: new Date().toISOString().split("T")[0],
      });
      setPhotoPreview(null);
      setPhotoErrors({});

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
            {activeTab === "posts" && (
              <PostManagement
                posts={posts}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onCreateNew={() => {
                  handleCancelEdit();
                  setActiveTab("create-post");
                }}
                onEdit={handleEditPost}
                onDelete={handleDeletePost}
                deletingPostId={deletingPostId}
              />
            )}

            {activeTab === "users" && <UserManagement />}

            {activeTab === "create-post" && (
              <BlogPostForm
                form={blogForm}
                errors={blogErrors}
                isSubmitting={isSubmitting}
                editingPostId={editingPostId}
                onFormChange={setBlogForm}
                onSubmit={handleBlogSubmit}
                onCancel={handleCancelEdit}
                onClear={() => {
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
              />
            )}

            {activeTab === "photos" && (
              <>
                <SinglePhotoUpload
                  form={photoForm}
                  errors={photoErrors}
                  preview={photoPreview}
                  isSubmitting={isSubmitting}
                  categories={categoriesData}
                  onFormChange={setPhotoForm}
                  onPreviewChange={setPhotoPreview}
                  onSubmit={handlePhotoSubmit}
                  onClear={() => {
                    setPhotoForm({
                      title: "",
                      file: null,
                      categoryId: null,
                      subcategoryIds: [],
                      date: new Date().toISOString().split("T")[0],
                    });
                    setPhotoPreview(null);
                    setPhotoErrors({});
                  }}
                />

                <PhotoGallery
                  photos={photos}
                  isLoading={isLoadingPhotos}
                  searchQuery={photoSearchQuery}
                  editingPhoto={editingPhoto}
                  editForm={editPhotoForm}
                  categories={categoriesData}
                  deletingPhotoId={deletingPhotoId}
                  onSearchChange={setPhotoSearchQuery}
                  onEdit={handleEditPhoto}
                  onDelete={handleDeletePhoto}
                  onSave={handleSavePhoto}
                  onCancelEdit={handleCancelEditPhoto}
                  onEditFormChange={setEditPhotoForm}
                />
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
