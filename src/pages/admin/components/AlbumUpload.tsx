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
import {
  Image as ImageIcon,
  Upload,
  X,
  Tag,
  Calendar,
  MapPin,
  AlertCircle,
} from "lucide-react";
import type { Category } from "@/services/categories.service";
import type { AlbumFormData, AlbumUploadProgress } from "../types";

interface AlbumUploadProps {
  files: File[];
  previews: string[];
  form: AlbumFormData;
  errors: Partial<Record<string, string>>;
  progress: AlbumUploadProgress;
  categories: Category[];
  onFilesChange: (files: FileList | null) => void;
  onRemoveFile: (index: number) => void;
  onClearAll: () => void;
  onFormChange: (form: AlbumFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function AlbumUpload({
  files,
  previews,
  form,
  errors,
  progress,
  categories,
  onFilesChange,
  onRemoveFile,
  onClearAll,
  onFormChange,
  onSubmit,
}: AlbumUploadProps): React.ReactElement {
  const selectedCategory = categories.find((c) => c.id === form.categoryId);

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50 mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-accent" />
          Album Upload
        </CardTitle>
        <CardDescription>
          Upload multiple photos with the same category and subcategory
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          <DropZone
            files={files}
            hasError={!!errors.files}
            onFilesChange={onFilesChange}
          />
          {errors.files && <ErrorText message={errors.files} />}

          {files.length > 0 && (
            <PreviewGrid
              previews={previews}
              files={files}
              onRemove={onRemoveFile}
            />
          )}

          <CategorySection
            form={form}
            categories={categories}
            selectedCategory={selectedCategory}
            error={errors.categoryId}
            onFormChange={onFormChange}
          />

          <LocationDateFields form={form} onFormChange={onFormChange} />

          {progress.uploading && <ProgressBar progress={progress} />}

          {progress.errors.length > 0 && (
            <ErrorList errors={progress.errors} />
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClearAll}
              className="cursor-pointer"
              disabled={progress.uploading}
            >
              <X className="w-4 h-4 mr-2" />
              Clear All
            </Button>
            <Button
              type="submit"
              className="cursor-pointer"
              disabled={progress.uploading || files.length === 0}
            >
              <Upload className="w-4 h-4 mr-2" />
              {progress.uploading
                ? "Uploading..."
                : `Upload ${files.length} Photo${files.length !== 1 ? "s" : ""}`}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

interface DropZoneProps {
  files: File[];
  hasError: boolean;
  onFilesChange: (files: FileList | null) => void;
}

function DropZone({ files, hasError, onFilesChange }: DropZoneProps): React.ReactElement {
  function handleDragOver(e: React.DragEvent): void {
    e.preventDefault();
    e.currentTarget.classList.add("border-accent", "bg-accent/10");
  }

  function handleDragLeave(e: React.DragEvent): void {
    e.preventDefault();
    e.currentTarget.classList.remove("border-accent", "bg-accent/10");
  }

  function handleDrop(e: React.DragEvent): void {
    e.preventDefault();
    e.currentTarget.classList.remove("border-accent", "bg-accent/10");
    onFilesChange(e.dataTransfer.files);
  }

  const borderColor = hasError
    ? "border-red-500"
    : files.length > 0
    ? "border-accent bg-accent/5"
    : "border-border";

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground flex items-center gap-2">
        <Upload className="w-4 h-4 text-muted-foreground" />
        Select Images <span className="text-red-500">*</span>
      </label>
      <div
        className={cn(
          "relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer",
          "hover:border-accent/50 hover:bg-accent/5",
          borderColor
        )}
        onClick={() => document.getElementById("album-files")?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          id="album-files"
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => onFilesChange(e.target.files)}
        />
        <div className="space-y-2">
          <Upload className="w-10 h-10 mx-auto text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">
            Click to upload or drag and drop multiple images
          </p>
          <p className="text-xs text-muted-foreground">
            PNG, JPG, GIF up to 10MB each • Max 50 files
          </p>
          {files.length > 0 && (
            <p className="text-sm text-accent font-medium">
              {files.length} file(s) selected
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

interface PreviewGridProps {
  previews: string[];
  files: File[];
  onRemove: (index: number) => void;
}

function PreviewGrid({ previews, files, onRemove }: PreviewGridProps): React.ReactElement {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">Selected Images</label>
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
        {previews.map((preview, index) => (
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
                onRemove(index);
              }}
              className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[8px] px-1 py-0.5 truncate">
              {files[index]?.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface CategorySectionProps {
  form: AlbumFormData;
  categories: Category[];
  selectedCategory: Category | undefined;
  error: string | undefined;
  onFormChange: (form: AlbumFormData) => void;
}

function CategorySection({
  form,
  categories,
  selectedCategory,
  error,
  onFormChange,
}: CategorySectionProps): React.ReactElement {
  return (
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
          value={form.categoryId || ""}
          onChange={(e) => {
            const categoryId = e.target.value ? Number(e.target.value) : null;
            onFormChange({ ...form, categoryId, subcategoryIds: [] });
          }}
          className={cn(
            "w-full h-10 px-3 rounded-md border bg-background/50",
            "text-sm text-foreground",
            "focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background",
            error ? "border-red-500 focus:ring-red-500" : "border-input"
          )}
        >
          <option value="">Select a category...</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {error && <ErrorText message={error} />}
      </div>

      {selectedCategory && (
        <SubcategorySelector
          subcategories={selectedCategory.subcategories}
          selectedIds={form.subcategoryIds}
          onChange={(subcategoryIds) => onFormChange({ ...form, subcategoryIds })}
        />
      )}
    </div>
  );
}

interface SubcategorySelectorProps {
  subcategories: Array<{ id: number; name: string }>;
  selectedIds: number[];
  onChange: (ids: number[]) => void;
}

function SubcategorySelector({
  subcategories,
  selectedIds,
  onChange,
}: SubcategorySelectorProps): React.ReactElement {
  function toggleSubcategory(id: number): void {
    const isSelected = selectedIds.includes(id);
    onChange(
      isSelected ? selectedIds.filter((sid) => sid !== id) : [...selectedIds, id]
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground flex items-center gap-2">
        <Tag className="w-4 h-4 text-muted-foreground" />
        Subcategories
      </label>
      <div className="flex flex-wrap gap-2">
        {subcategories.map((sub) => (
          <button
            key={sub.id}
            type="button"
            onClick={() => toggleSubcategory(sub.id)}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium",
              "transition-all duration-200 cursor-pointer border",
              selectedIds.includes(sub.id)
                ? "bg-accent text-accent-foreground border-accent"
                : "bg-background/50 text-muted-foreground border-border hover:border-accent/50 hover:text-foreground"
            )}
          >
            {sub.name}
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        All photos will be tagged with selected subcategories
      </p>
    </div>
  );
}

interface LocationDateFieldsProps {
  form: AlbumFormData;
  onFormChange: (form: AlbumFormData) => void;
}

function LocationDateFields({
  form,
  onFormChange,
}: LocationDateFieldsProps): React.ReactElement {
  return (
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
          value={form.location}
          onChange={(e) => onFormChange({ ...form, location: e.target.value })}
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
          value={form.date}
          onChange={(e) => onFormChange({ ...form, date: e.target.value })}
          className="bg-background/50"
        />
      </div>
    </div>
  );
}

interface ProgressBarProps {
  progress: AlbumUploadProgress;
}

function ProgressBar({ progress }: ProgressBarProps): React.ReactElement {
  const percentage = (progress.uploaded / progress.total) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Uploading...</span>
        <span className="text-foreground font-medium">
          {progress.uploaded} / {progress.total}
        </span>
      </div>
      <div className="w-full bg-secondary/50 rounded-full h-2 overflow-hidden">
        <div
          className="bg-accent h-full rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

interface ErrorListProps {
  errors: Array<{ filename: string; error: string }>;
}

function ErrorList({ errors }: ErrorListProps): React.ReactElement {
  return (
    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
      <p className="text-sm font-medium text-red-500 mb-2">
        Failed to upload {errors.length} file(s):
      </p>
      <ul className="text-xs text-red-400 space-y-1">
        {errors.map((err, idx) => (
          <li key={idx}>
            • {err.filename}: {err.error}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ErrorText({ message }: { message: string }): React.ReactElement {
  return (
    <p className="text-red-500 text-xs flex items-center gap-1">
      <AlertCircle className="w-3 h-3" />
      {message}
    </p>
  );
}
