import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Upload, X, Tag, Calendar, AlertCircle } from "lucide-react";
import type { Category } from "@/services/categories.service";
import type { PhotoFormData, PhotoPreview } from "../types";

interface SinglePhotoUploadProps {
  form: PhotoFormData;
  errors: Partial<Record<string, string>>;
  previews: PhotoPreview[];
  isSubmitting: boolean;
  categories: Category[];
  onFormChange: (form: PhotoFormData) => void;
  onPreviewsChange: (previews: PhotoPreview[]) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClear: () => void;
}

const MAX_FILES = 10;

export function SinglePhotoUpload({
  form,
  errors,
  previews,
  isSubmitting,
  categories,
  onFormChange,
  onPreviewsChange,
  onSubmit,
  onClear,
}: SinglePhotoUploadProps): React.ReactElement {
  // Get all selected categories
  const selectedCategories = categories.filter((c) =>
    form.categoryIds.includes(c.id)
  );

  // Get all available subcategories from selected categories
  const availableSubcategories = selectedCategories.flatMap((cat) =>
    cat.subcategories.map((sub) => ({ ...sub, categoryName: cat.name }))
  );

  function handleFilesChange(fileList: FileList | null): void {
    if (!fileList) return;

    const newFiles = Array.from(fileList);

    // Determine if we should replace or append
    // Single file selection should replace existing files
    // Multiple file selection should append
    const shouldReplace = newFiles.length === 1 && form.files.length > 0;

    const existingFiles = shouldReplace ? [] : form.files;
    const existingPreviews = shouldReplace ? [] : previews;

    const totalFiles = existingFiles.length + newFiles.length;

    if (totalFiles > MAX_FILES) {
      alert(
        `Chỉ được upload tối đa ${MAX_FILES} ảnh. Bạn đã chọn ${existingFiles.length} ảnh.`
      );
      return;
    }

    // Revoke URLs for replaced previews to free memory
    if (shouldReplace) {
      previews.forEach((preview) => {
        if (preview.url) {
          URL.revokeObjectURL(preview.url);
        }
      });
    }

    // Create previews for new files
    const newPreviews: PhotoPreview[] = newFiles.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      title: file.name.replace(/\.[^/.]+$/, ""), // Auto-generate title from filename
    }));

    onFormChange({ ...form, files: [...existingFiles, ...newFiles] });
    onPreviewsChange([...existingPreviews, ...newPreviews]);
  }

  function handleRemoveFile(index: number): void {
    // Revoke the URL to free memory
    if (previews[index]?.url) {
      URL.revokeObjectURL(previews[index].url);
    }

    const newFiles = form.files.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);

    onFormChange({ ...form, files: newFiles });
    onPreviewsChange(newPreviews);
  }

  function toggleCategory(id: number): void {
    const isSelected = form.categoryIds.includes(id);
    const categoryIds = isSelected
      ? form.categoryIds.filter((cid) => cid !== id)
      : [...form.categoryIds, id];

    // Filter out subcategories that no longer belong to selected categories
    const selectedCats = categories.filter((c) => categoryIds.includes(c.id));
    const validSubcategoryIds = selectedCats.flatMap((cat) =>
      cat.subcategories.map((s) => s.id)
    );
    const subcategoryIds = form.subcategoryIds.filter((sid) =>
      validSubcategoryIds.includes(sid)
    );

    onFormChange({ ...form, categoryIds, subcategoryIds });
  }

  function toggleSubcategory(id: number): void {
    const isSelected = form.subcategoryIds.includes(id);
    const subcategoryIds = isSelected
      ? form.subcategoryIds.filter((sid) => sid !== id)
      : [...form.subcategoryIds, id];
    onFormChange({ ...form, subcategoryIds });
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5 text-accent" />
          Upload Photos
        </CardTitle>
        <CardDescription>
          Upload tối đa {MAX_FILES} ảnh. Description sẽ tự động lấy theo tên
          file (có thể edit lại sau).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Image Upload */}
          <FormField
            id="photo-files"
            label="Image Files"
            required
            icon={<Upload className="w-4 h-4 text-muted-foreground" />}
            error={errors.files}
          >
            <ImageDropZone
              files={form.files}
              previews={previews}
              hasError={!!errors.files}
              onFilesChange={handleFilesChange}
              onRemoveFile={handleRemoveFile}
            />
          </FormField>

          {/* Category */}
          <FormField
            id="photo-category"
            label="Categories"
            required
            icon={<Tag className="w-4 h-4 text-muted-foreground" />}
            error={errors.categoryIds}
          >
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => toggleCategory(category.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-sm font-medium",
                    "transition-all duration-200 cursor-pointer border",
                    form.categoryIds.includes(category.id)
                      ? "bg-accent text-accent-foreground border-accent"
                      : "bg-background/50 text-muted-foreground border-border hover:border-accent/50 hover:text-foreground"
                  )}
                >
                  {category.name}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Click to select/deselect categories (at least one required)
            </p>
          </FormField>

          {/* Subcategories */}
          {availableSubcategories.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Tag className="w-4 h-4 text-muted-foreground" />
                Subcategories
              </label>
              <div className="flex flex-wrap gap-2">
                {availableSubcategories.map((sub) => (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => toggleSubcategory(sub.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm font-medium",
                      "transition-all duration-200 cursor-pointer border",
                      form.subcategoryIds.includes(sub.id)
                        ? "bg-accent text-accent-foreground border-accent"
                        : "bg-background/50 text-muted-foreground border-border hover:border-accent/50 hover:text-foreground"
                    )}
                    title={`Category: ${sub.categoryName}`}
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

          {/* Date */}
          <FormField
            id="photo-date"
            label="Date Taken"
            required
            icon={<Calendar className="w-4 h-4 text-muted-foreground" />}
          >
            <input
              id="photo-date"
              type="date"
              value={form.date}
              onChange={(e) => onFormChange({ ...form, date: e.target.value })}
              className="flex h-9 w-full sm:w-auto rounded-md border border-input bg-background/50 px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </FormField>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClear}
              className="cursor-pointer"
              disabled={isSubmitting}
            >
              <X className="w-4 h-4 mr-2" />
              Clear All
            </Button>
            <Button
              type="submit"
              className="cursor-pointer"
              disabled={isSubmitting || form.files.length === 0}
            >
              <Upload className="w-4 h-4 mr-2" />
              {isSubmitting
                ? "Uploading..."
                : `Upload ${form.files.length} Photo${
                    form.files.length !== 1 ? "s" : ""
                  }`}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

interface ImageDropZoneProps {
  files: File[];
  previews: PhotoPreview[];
  hasError: boolean;
  onFilesChange: (files: FileList | null) => void;
  onRemoveFile: (index: number) => void;
}

function ImageDropZone({
  files,
  previews,
  hasError,
  onFilesChange,
  onRemoveFile,
}: ImageDropZoneProps): React.ReactElement {
  const borderColor = hasError
    ? "border-red-500"
    : files.length > 0
    ? "border-accent bg-accent/5"
    : "border-border";

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFilesChange(e.dataTransfer.files);
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        className={cn(
          "relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer",
          "hover:border-accent/50 hover:bg-accent/5",
          borderColor
        )}
        onClick={() => document.getElementById("photo-files")?.click()}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          id="photo-files"
          type="file"
          accept="image/jpeg,image/jpg,image/png"
          multiple
          className="hidden"
          onChange={(e) => onFilesChange(e.target.files)}
        />
        <div className="space-y-2">
          <Upload className="w-10 h-10 mx-auto text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-muted-foreground">
            PNG, JPG up to 15MB each • Max {MAX_FILES} files
          </p>
          {files.length > 0 && (
            <p className="text-xs text-accent">
              {files.length} / {MAX_FILES} files selected
            </p>
          )}
        </div>
      </div>

      {/* Preview grid */}
      {previews.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {previews.map((preview, index) => (
            <div
              key={index}
              className="relative group rounded-lg overflow-hidden bg-muted aspect-square"
            >
              <img
                src={preview.url}
                alt={preview.title}
                className="w-full h-full object-cover"
              />
              {/* Overlay with file info */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2">
                <p className="text-white text-xs text-center truncate w-full">
                  {preview.title}
                </p>
                <p className="text-white/70 text-xs">
                  {(preview.file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              {/* Remove button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveFile(index);
                }}
                className="absolute top-1 right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
              {/* File index */}
              <div className="absolute bottom-1 left-1 w-5 h-5 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-xs font-medium">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface FormFieldProps {
  id: string;
  label: string;
  required?: boolean;
  icon?: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}

function FormField({
  id,
  label,
  required,
  icon,
  error,
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
