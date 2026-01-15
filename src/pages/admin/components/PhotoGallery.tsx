import { useState, useEffect, useRef } from "react";
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
  Search,
  Edit,
  Trash2,
  Save,
  Tag,
  Calendar,
  GripVertical,
} from "lucide-react";
import {
  getPhotoUrl,
  reorderPhotos,
  type Photo,
} from "@/services/photos.service";
import type { Category } from "@/services/categories.service";
import type { EditPhotoFormData } from "../types";

interface PhotoGalleryProps {
  photos: Photo[];
  isLoading: boolean;
  searchQuery: string;
  editingPhoto: Photo | null;
  editForm: EditPhotoFormData;
  categories: Category[];
  deletingPhotoId: number | null;
  onSearchChange: (query: string) => void;
  onEdit: (photo: Photo) => void;
  onDelete: (photoId: number) => void;
  onSave: (photoId: number) => void;
  onCancelEdit: () => void;
  onEditFormChange: (form: EditPhotoFormData) => void;
  onPhotosReordered?: () => void;
}

export function PhotoGallery({
  photos,
  isLoading,
  searchQuery,
  editingPhoto,
  editForm,
  categories,
  deletingPhotoId,
  onSearchChange,
  onEdit,
  onDelete,
  onSave,
  onCancelEdit,
  onEditFormChange,
  onPhotosReordered,
}: PhotoGalleryProps): React.ReactElement {
  const filteredPhotos = photos.filter(
    (photo) =>
      photo.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      photo.alt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      photo.categories?.some((cat) =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      photo.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Disable drag when searching
  const isDragEnabled = !searchQuery;

  return (
    <>
      <Card className="bg-card/50 backdrop-blur-sm border-border/50 mt-6">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-accent" />
                Manage Photos
              </CardTitle>
              <CardDescription>
                {isDragEnabled
                  ? "Drag photos to reorder. View, edit, and delete your uploaded photos"
                  : "View, edit, and delete your uploaded photos"}
              </CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search photos..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9 w-full sm:w-64 bg-background/50"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <PhotoGridContent
            photos={filteredPhotos}
            totalPhotos={photos.length}
            isLoading={isLoading}
            deletingPhotoId={deletingPhotoId}
            isDragEnabled={isDragEnabled}
            onEdit={onEdit}
            onDelete={onDelete}
            onReorder={onPhotosReordered}
          />
        </CardContent>
      </Card>

      {editingPhoto && (
        <EditPhotoModal
          photo={editingPhoto}
          form={editForm}
          categories={categories}
          onFormChange={onEditFormChange}
          onSave={() => onSave(editingPhoto.id)}
          onCancel={onCancelEdit}
        />
      )}
    </>
  );
}

interface PhotoGridContentProps {
  photos: Photo[];
  totalPhotos: number;
  isLoading: boolean;
  deletingPhotoId: number | null;
  isDragEnabled: boolean;
  onEdit: (photo: Photo) => void;
  onDelete: (photoId: number) => void;
  onReorder?: () => void;
}

function PhotoGridContent({
  photos,
  totalPhotos,
  isLoading,
  deletingPhotoId,
  isDragEnabled,
  onEdit,
  onDelete,
}: PhotoGridContentProps): React.ReactElement {
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [dragOverId, setDragOverId] = useState<number | null>(null);
  const [localPhotos, setLocalPhotos] = useState<Photo[]>(photos);
  const [isSaving, setIsSaving] = useState(false);
  const isReorderingRef = useRef(false);
  const localIdsRef = useRef<string>(photos.map((p) => p.id).join(","));

  // Sync local state with props only when photos actually change (by comparing IDs)
  useEffect(() => {
    if (isReorderingRef.current) return;

    const propsIds = photos.map((p) => p.id).join(",");

    // Only update if the photo list actually changed (new photos added/removed)
    if (localIdsRef.current !== propsIds) {
      localIdsRef.current = propsIds;
      setLocalPhotos(photos);
    }
  }, [photos]);

  function handleDragStart(e: React.DragEvent, photoId: number): void {
    setDraggedId(photoId);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(e: React.DragEvent, photoId: number): void {
    e.preventDefault();
    if (draggedId === photoId) return;
    setDragOverId(photoId);
  }

  function handleDragLeave(): void {
    setDragOverId(null);
  }

  async function handleDrop(
    e: React.DragEvent,
    targetId: number
  ): Promise<void> {
    e.preventDefault();

    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    const draggedIndex = localPhotos.findIndex((p) => p.id === draggedId);
    const targetIndex = localPhotos.findIndex((p) => p.id === targetId);
    if (draggedIndex === -1 || targetIndex === -1) return;

    // Reorder locally
    const newPhotos = [...localPhotos];
    const [removed] = newPhotos.splice(draggedIndex, 1);
    newPhotos.splice(targetIndex, 0, removed);

    // Update local state and ref to prevent re-sync from props
    setLocalPhotos(newPhotos);
    localIdsRef.current = newPhotos.map((p) => p.id).join(",");

    // Save to backend
    isReorderingRef.current = true;
    setIsSaving(true);
    try {
      const orderedPhotos = newPhotos.map((photo, index) => ({
        id: photo.id,
        displayOrder: index,
      }));
      await reorderPhotos(orderedPhotos);
      // Don't call onReorder - local state is already correct
    } catch (error) {
      console.error("Failed to reorder photos:", error);
      isReorderingRef.current = false;
      setLocalPhotos(photos); // Revert on error
    } finally {
      setIsSaving(false);
      setDraggedId(null);
      setDragOverId(null);
      // Allow sync after a longer delay to prevent immediate overwrite from parent refresh
      setTimeout(() => {
        isReorderingRef.current = false;
      }, 500);
    }
  }

  function handleDragEnd(): void {
    setDraggedId(null);
    setDragOverId(null);
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
      </div>
    );
  }

  if (localPhotos.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>
          {totalPhotos === 0 ? "No photos uploaded yet" : "No photos found"}
        </p>
      </div>
    );
  }

  return (
    <>
      {isSaving && (
        <div className="mb-4 p-2 bg-accent/10 rounded-lg text-center text-sm text-accent">
          Saving new order...
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {localPhotos.map((photo) => (
          <PhotoCard
            key={photo.id}
            photo={photo}
            isDeleting={deletingPhotoId === photo.id}
            isDragging={draggedId === photo.id}
            isDragOver={dragOverId === photo.id}
            isDragEnabled={isDragEnabled}
            onEdit={() => onEdit(photo)}
            onDelete={() => onDelete(photo.id)}
            onDragStart={(e) => handleDragStart(e, photo.id)}
            onDragOver={(e) => handleDragOver(e, photo.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, photo.id)}
            onDragEnd={handleDragEnd}
          />
        ))}
      </div>
    </>
  );
}

interface PhotoCardProps {
  photo: Photo;
  isDeleting: boolean;
  isDragging: boolean;
  isDragOver: boolean;
  isDragEnabled: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}

function PhotoCard({
  photo,
  isDeleting,
  isDragging,
  isDragOver,
  isDragEnabled,
  onEdit,
  onDelete,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
}: PhotoCardProps): React.ReactElement {
  return (
    <div
      draggable={isDragEnabled}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={cn(
        "group relative bg-background/50 rounded-lg overflow-hidden border transition-all",
        isDragging && "opacity-50 scale-95",
        isDragOver && "border-accent border-2 scale-105",
        !isDragging && !isDragOver && "border-border/50 hover:border-accent/50"
      )}
    >
      {isDragEnabled && (
        <div className="absolute top-2 left-2 z-10 p-1 rounded bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
          <GripVertical className="w-4 h-4" />
        </div>
      )}
      <div className="aspect-square overflow-hidden">
        <img
          src={getPhotoUrl(photo.filename, "thumb")}
          alt={photo.alt || photo.title}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
          draggable={false}
        />
      </div>
      <div className="p-3">
        <h4 className="font-medium text-sm truncate">{photo.title}</h4>
        <p className="text-xs text-muted-foreground truncate">
          {photo.categories?.map((c) => c.name).join(", ") || "No category"}{" "}
          {photo.location && `• ${photo.location}`}
        </p>
      </div>
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={onEdit}
          className="cursor-pointer"
        >
          <Edit className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={onDelete}
          disabled={isDeleting}
          className="cursor-pointer"
        >
          {isDeleting ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
}

interface EditPhotoModalProps {
  photo: Photo;
  form: EditPhotoFormData;
  categories: Category[];
  onFormChange: (form: EditPhotoFormData) => void;
  onSave: () => void;
  onCancel: () => void;
}

function EditPhotoModal({
  photo,
  form,
  categories,
  onFormChange,
  onSave,
  onCancel,
}: EditPhotoModalProps): React.ReactElement {
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

    onFormChange({ ...form, categoryIds, subcategoryIds });
  }

  function toggleSubcategory(id: number): void {
    const isSelected = form.subcategoryIds.includes(id);
    onFormChange({
      ...form,
      subcategoryIds: isSelected
        ? form.subcategoryIds.filter((sid) => sid !== id)
        : [...form.subcategoryIds, id],
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <Card className="w-full max-w-lg bg-card border-border max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5 text-accent" />
            Edit Photo
          </CardTitle>
          <CardDescription>Update photo information</CardDescription>
        </CardHeader>
        <CardContent className="overflow-y-auto flex-1">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSave();
            }}
            className="space-y-4"
          >
            {/* Photo Preview */}
            <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
              <img
                src={getPhotoUrl(photo.filename, "medium")}
                alt={photo.alt || photo.title}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Title */}
            <FormField id="edit-title" label="Description" required>
              <Input
                id="edit-title"
                value={form.title}
                onChange={(e) =>
                  onFormChange({ ...form, title: e.target.value })
                }
                className="bg-background/50"
                placeholder="Enter photo title"
              />
            </FormField>

            {/* Category */}
            <FormField
              id="edit-category"
              label="Categories"
              required
              icon={<Tag className="w-4 h-4 text-muted-foreground" />}
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
              <p className="text-xs text-muted-foreground mt-1">
                Click to select/deselect categories (at least one required)
              </p>
            </FormField>

            {/* Subcategories */}
            {availableSubcategories.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Tag className="w-4 h-4 text-muted-foreground" />
                  Subcategories
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableSubcategories.map((sub) => (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => toggleSubcategory(sub.id)}
                      title={`Category: ${sub.categoryName}`}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-sm font-medium",
                        "transition-all duration-200 cursor-pointer border",
                        form.subcategoryIds.includes(sub.id)
                          ? "bg-accent text-accent-foreground border-accent"
                          : "bg-background/50 text-muted-foreground border-border hover:border-accent/50 hover:text-foreground"
                      )}
                    >
                      {sub.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Date Taken */}
            <FormField
              id="edit-date"
              label="Date Taken"
              icon={<Calendar className="w-4 h-4 text-muted-foreground" />}
            >
              <Input
                id="edit-date"
                type="date"
                value={form.dateTaken}
                onChange={(e) =>
                  onFormChange({ ...form, dateTaken: e.target.value })
                }
                className="bg-background/50"
              />
            </FormField>

            {/* Current Subcategories Summary */}
            {(photo.subcategories?.length || 0) > 0 && (
              <div className="p-3 rounded-lg bg-secondary/30 border border-border/50">
                <p className="text-xs text-muted-foreground mb-2">
                  Current subcategories:
                </p>
                <div className="flex flex-wrap gap-1">
                  {photo.subcategories?.map((sub) => (
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
                onClick={onCancel}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="cursor-pointer"
                disabled={!form.title || form.categoryIds.length === 0}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

interface FormFieldProps {
  id: string;
  label: string;
  required?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

function FormField({
  id,
  label,
  required,
  icon,
  children,
}: FormFieldProps): React.ReactElement {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="text-sm font-medium flex items-center gap-2"
      >
        {icon}
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}
