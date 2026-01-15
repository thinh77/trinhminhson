import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Upload, X, Tag, Calendar, AlertCircle } from "lucide-react";
import type { Category } from "@/services/categories.service";
import type { PhotoFormData } from "../types";

interface SinglePhotoUploadProps {
  form: PhotoFormData;
  errors: Partial<Record<string, string>>;
  preview: string | null;
  isSubmitting: boolean;
  categories: Category[];
  onFormChange: (form: PhotoFormData) => void;
  onPreviewChange: (url: string | null) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClear: () => void;
}

export function SinglePhotoUpload({
  form,
  errors,
  preview,
  isSubmitting,
  categories,
  onFormChange,
  onPreviewChange,
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

  function handleFileChange(file: File): void {
    const previewUrl = URL.createObjectURL(file);
    onPreviewChange(previewUrl);

    const title = form.title || file.name.replace(/\.[^/.]+$/, "");
    onFormChange({ ...form, file, title });
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
          Add Single Photo
        </CardTitle>
        <CardDescription>
          Add a single photo with custom title and alt text
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Title */}
          <FormField
            id="photo-title"
            label="Description"
            required
            error={errors.title}
          >
            <Input
              id="photo-title"
              type="text"
              placeholder="Mountain Sunset"
              value={form.title}
              onChange={(e) => onFormChange({ ...form, title: e.target.value })}
              className={cn(
                "bg-background/50",
                errors.title && "border-red-500 focus-visible:ring-red-500"
              )}
            />
          </FormField>

          {/* Image Upload */}
          <FormField
            id="photo-file"
            label="Image File"
            required
            icon={<Upload className="w-4 h-4 text-muted-foreground" />}
            error={errors.file}
          >
            <ImageDropZone
              file={form.file}
              preview={preview}
              hasError={!!errors.file}
              onFileChange={handleFileChange}
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
            <Input
              id="photo-date"
              type="date"
              value={form.date}
              onChange={(e) => onFormChange({ ...form, date: e.target.value })}
              className="bg-background/50 w-full sm:w-auto"
            />
          </FormField>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClear}
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
  );
}

interface ImageDropZoneProps {
  file: File | null;
  preview: string | null;
  hasError: boolean;
  onFileChange: (file: File) => void;
}

function ImageDropZone({
  file,
  preview,
  hasError,
  onFileChange,
}: ImageDropZoneProps): React.ReactElement {
  const borderColor = hasError
    ? "border-red-500"
    : file
    ? "border-accent bg-accent/5"
    : "border-border";

  return (
    <div
      className={cn(
        "relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer",
        "hover:border-accent/50 hover:bg-accent/5",
        borderColor
      )}
      onClick={() => document.getElementById("photo-file")?.click()}
    >
      <input
        id="photo-file"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const selectedFile = e.target.files?.[0];
          if (selectedFile) {
            onFileChange(selectedFile);
          }
        }}
      />
      {preview ? (
        <div className="space-y-3">
          <img
            src={preview}
            alt="Preview"
            className="max-h-48 w-auto rounded-lg mx-auto"
          />
          <p className="text-sm text-muted-foreground">
            {file?.name} ({((file?.size || 0) / 1024 / 1024).toFixed(2)} MB)
          </p>
          <p className="text-xs text-accent">Click to change image</p>
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
