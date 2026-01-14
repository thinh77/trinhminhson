import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
  FileText,
  Plus,
  Save,
  X,
  Tag,
  Clock,
  AlertCircle,
  Link as LinkIcon,
  Edit,
} from "lucide-react";
import type { AdminBlogFormData } from "../types";

interface BlogPostFormProps {
  form: AdminBlogFormData;
  errors: Partial<AdminBlogFormData>;
  isSubmitting: boolean;
  editingPostId: string | null;
  onFormChange: (form: AdminBlogFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  onClear: () => void;
}

export function BlogPostForm({
  form,
  errors,
  isSubmitting,
  editingPostId,
  onFormChange,
  onSubmit,
  onCancel,
  onClear,
}: BlogPostFormProps): React.ReactElement {
  function handleFieldChange<K extends keyof AdminBlogFormData>(
    field: K,
    value: AdminBlogFormData[K]
  ): void {
    onFormChange({ ...form, [field]: value });
  }

  return (
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
        <form onSubmit={onSubmit} className="space-y-6">
          <FormField
            id="blog-title"
            label="Tiêu đề"
            required
            error={errors.title}
          >
            <Input
              id="blog-title"
              type="text"
              placeholder="Nhập tiêu đề bài viết"
              value={form.title}
              onChange={(e) => handleFieldChange("title", e.target.value)}
              className={cn(
                "bg-background/50",
                errors.title && "border-red-500 focus-visible:ring-red-500"
              )}
            />
          </FormField>

          <FormField
            id="blog-image"
            label="URL Hình ảnh bìa"
            required
            icon={<LinkIcon className="w-4 h-4 text-muted-foreground" />}
            error={errors.image}
          >
            <Input
              id="blog-image"
              type="url"
              placeholder="https://images.unsplash.com/photo-..."
              value={form.image}
              onChange={(e) => handleFieldChange("image", e.target.value)}
              className={cn(
                "bg-background/50",
                errors.image && "border-red-500 focus-visible:ring-red-500"
              )}
            />
            {form.image && (
              <div className="mt-2 rounded-lg overflow-hidden bg-secondary/30 p-2">
                <img
                  src={form.image}
                  alt="Preview"
                  className="max-h-48 w-auto rounded-lg mx-auto"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            )}
          </FormField>

          <FormField
            id="blog-excerpt"
            label="Mô tả ngắn"
            required
            error={errors.excerpt}
          >
            <Textarea
              id="blog-excerpt"
              placeholder="Mô tả ngắn gọn về bài viết (hiển thị trên card)"
              rows={2}
              value={form.excerpt}
              onChange={(e) => handleFieldChange("excerpt", e.target.value)}
              className={cn(
                "bg-background/50 resize-none",
                errors.excerpt && "border-red-500 focus-visible:ring-red-500"
              )}
            />
          </FormField>

          <FormField
            id="blog-content"
            label="Nội dung"
            required
            icon={<FileText className="w-4 h-4 text-muted-foreground" />}
            error={errors.content}
            description="Sử dụng trình soạn thảo để định dạng nội dung bài viết"
          >
            <RichTextEditor
              id="blog-content"
              value={form.content}
              onChange={(content) => handleFieldChange("content", content)}
              placeholder="Viết nội dung bài viết của bạn ở đây..."
              minHeight="450px"
              disabled={isSubmitting}
              error={!!errors.content}
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              id="blog-tags"
              label="Tags"
              required
              icon={<Tag className="w-4 h-4 text-muted-foreground" />}
              error={errors.tags}
              description="Phân cách các tag bằng dấu phẩy"
            >
              <Input
                id="blog-tags"
                type="text"
                placeholder="Kiến trúc, Du lịch, Nhật Bản"
                value={form.tags}
                onChange={(e) => handleFieldChange("tags", e.target.value)}
                className={cn(
                  "bg-background/50",
                  errors.tags && "border-red-500 focus-visible:ring-red-500"
                )}
              />
            </FormField>

            <FormField
              id="blog-readtime"
              label="Thời gian đọc"
              icon={<Clock className="w-4 h-4 text-muted-foreground" />}
            >
              <Input
                id="blog-readtime"
                type="text"
                placeholder="5 phút đọc"
                value={form.readTime}
                onChange={(e) => handleFieldChange("readTime", e.target.value)}
                className="bg-background/50"
              />
            </FormField>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            {editingPostId && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="cursor-pointer"
              >
                <X className="w-4 h-4 mr-2" />
                Hủy chỉnh sửa
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={onClear}
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
              {getSubmitButtonText(isSubmitting, !!editingPostId)}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function getSubmitButtonText(isSubmitting: boolean, isEditing: boolean): string {
  if (isSubmitting) {
    return isEditing ? "Đang cập nhật..." : "Đang đăng...";
  }
  return isEditing ? "Cập nhật" : "Đăng bài";
}

interface FormFieldProps {
  id: string;
  label: string;
  required?: boolean;
  icon?: React.ReactNode;
  error?: string;
  description?: string;
  children: React.ReactNode;
}

function FormField({
  id,
  label,
  required,
  icon,
  error,
  description,
  children,
}: FormFieldProps): React.ReactElement {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="text-sm font-medium text-foreground flex items-center gap-2"
      >
        {icon}
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {description && (
        <p className="text-xs text-muted-foreground mb-2">{description}</p>
      )}
      {children}
      {error && (
        <p className="text-red-500 text-xs flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
}
