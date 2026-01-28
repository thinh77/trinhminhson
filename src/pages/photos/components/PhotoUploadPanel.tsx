import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Upload, X, Tag, Calendar, AlertCircle, ChevronDown, Plus } from "lucide-react";
import { usePhotoUpload } from "../hooks/usePhotoUpload";

interface PhotoUploadPanelProps {
  onUploadComplete: () => void;
}

const MAX_FILES = 10;

export function PhotoUploadPanel({
  onUploadComplete,
}: PhotoUploadPanelProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);

  const {
    form,
    previews,
    errors,
    isSubmitting,
    categories,
    handleFilesChange,
    handleRemoveFile,
    handleFormChange,
    handleSubmit,
    clearForm,
  } = usePhotoUpload(onUploadComplete);

  // Get all selected categories
  const selectedCategories = categories.filter((c) =>
    form.categoryIds.includes(c.id)
  );

  // Get all available subcategories from selected categories
  const availableSubcategories = selectedCategories.flatMap((cat) =>
    cat.subcategories.map((sub) => ({ ...sub, categoryName: cat.name }))
  );

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

    handleFormChange({ ...form, categoryIds, subcategoryIds });
  }

  function toggleSubcategory(id: number): void {
    const isSelected = form.subcategoryIds.includes(id);
    const subcategoryIds = isSelected
      ? form.subcategoryIds.filter((sid) => sid !== id)
      : [...form.subcategoryIds, id];
    handleFormChange({ ...form, subcategoryIds });
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleFilesChange(e.dataTransfer.files);
  };

  const borderColor = errors.files
    ? "border-red-500"
    : form.files.length > 0
    ? "border-accent bg-accent/5"
    : "border-border";

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-accent/5 transition-colors rounded-t-lg">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-accent" />
                Upload Photos
              </span>
              <ChevronDown
                className={cn(
                  "w-5 h-5 text-muted-foreground transition-transform",
                  isOpen && "rotate-180"
                )}
              />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image Upload */}
              <div className="space-y-2">
                <label
                  htmlFor="photo-files"
                  className="text-sm font-medium text-foreground flex items-center gap-2"
                >
                  <Upload className="w-4 h-4 text-muted-foreground" />
                  Image Files <span className="text-red-500">*</span>
                </label>

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
                    onChange={(e) => handleFilesChange(e.target.files)}
                  />
                  <div className="space-y-2">
                    <Upload className="w-10 h-10 mx-auto text-muted-foreground" />
                    <p className="text-sm font-medium text-foreground">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG up to 15MB each • Max {MAX_FILES} files
                    </p>
                    {form.files.length > 0 && (
                      <p className="text-xs text-accent">
                        {form.files.length} / {MAX_FILES} files selected
                      </p>
                    )}
                  </div>
                </div>

                {/* Preview grid */}
                {previews.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
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
                            handleRemoveFile(index);
                          }}
                          className="absolute top-1 right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
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

                {errors.files && (
                  <p className="text-red-500 text-xs flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.files}
                  </p>
                )}
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Tag className="w-4 h-4 text-muted-foreground" />
                  Categories <span className="text-red-500">*</span>
                </label>
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
                {errors.categoryIds && (
                  <p className="text-red-500 text-xs flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.categoryIds}
                  </p>
                )}
              </div>

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
              <div className="space-y-2">
                <label
                  htmlFor="photo-date"
                  className="text-sm font-medium text-foreground flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  Date Taken <span className="text-red-500">*</span>
                </label>
                <input
                  id="photo-date"
                  type="date"
                  value={form.date}
                  onChange={(e) =>
                    handleFormChange({ ...form, date: e.target.value })
                  }
                  className="flex h-9 w-full sm:w-auto rounded-md border border-input bg-background/50 px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    clearForm();
                    setIsOpen(false);
                  }}
                  className="cursor-pointer"
                  disabled={isSubmitting}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
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
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
