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
  MapPin,
} from "lucide-react";
import { getPhotoUrl, type Photo } from "@/services/photos.service";
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
}: PhotoGalleryProps): React.ReactElement {
  const filteredPhotos = photos.filter(
    (photo) =>
      photo.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      photo.alt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      photo.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      photo.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                View, edit, and delete your uploaded photos
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
            onEdit={onEdit}
            onDelete={onDelete}
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
  onEdit: (photo: Photo) => void;
  onDelete: (photoId: number) => void;
}

function PhotoGridContent({
  photos,
  totalPhotos,
  isLoading,
  deletingPhotoId,
  onEdit,
  onDelete,
}: PhotoGridContentProps): React.ReactElement {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>{totalPhotos === 0 ? "No photos uploaded yet" : "No photos found"}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {photos.map((photo) => (
        <PhotoCard
          key={photo.id}
          photo={photo}
          isDeleting={deletingPhotoId === photo.id}
          onEdit={() => onEdit(photo)}
          onDelete={() => onDelete(photo.id)}
        />
      ))}
    </div>
  );
}

interface PhotoCardProps {
  photo: Photo;
  isDeleting: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

function PhotoCard({
  photo,
  isDeleting,
  onEdit,
  onDelete,
}: PhotoCardProps): React.ReactElement {
  return (
    <div className="group relative bg-background/50 rounded-lg overflow-hidden border border-border/50 hover:border-accent/50 transition-colors">
      <div className="aspect-square overflow-hidden">
        <img
          src={getPhotoUrl(photo.filename, "thumb")}
          alt={photo.alt || photo.title}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
        />
      </div>
      <div className="p-3">
        <h4 className="font-medium text-sm truncate">{photo.title}</h4>
        <p className="text-xs text-muted-foreground truncate">
          {photo.category} {photo.location && `• ${photo.location}`}
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
  const selectedCategory = categories.find((c) => c.id === form.categoryId);

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
            <FormField id="edit-title" label="Title" required>
              <Input
                id="edit-title"
                value={form.title}
                onChange={(e) => onFormChange({ ...form, title: e.target.value })}
                className="bg-background/50"
                placeholder="Enter photo title"
              />
            </FormField>

            {/* Alt Text */}
            <FormField id="edit-alt" label="Alt Text" required>
              <Input
                id="edit-alt"
                value={form.alt}
                onChange={(e) => onFormChange({ ...form, alt: e.target.value })}
                className="bg-background/50"
                placeholder="Describe the image for accessibility"
              />
            </FormField>

            {/* Category */}
            <FormField
              id="edit-category"
              label="Category"
              required
              icon={<Tag className="w-4 h-4 text-muted-foreground" />}
            >
              <select
                id="edit-category"
                value={form.categoryId || ""}
                onChange={(e) => {
                  const categoryId = e.target.value ? Number(e.target.value) : null;
                  onFormChange({ ...form, categoryId, subcategoryIds: [] });
                }}
                className={cn(
                  "w-full h-10 px-3 rounded-md border bg-background/50",
                  "text-sm text-foreground cursor-pointer",
                  "focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background",
                  "border-input"
                )}
              >
                <option value="">Select a category...</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </FormField>

            {/* Subcategories */}
            {selectedCategory && (
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Tag className="w-4 h-4 text-muted-foreground" />
                  Subcategories
                </label>
                <div className="flex flex-wrap gap-2">
                  {selectedCategory.subcategories.map((sub) => (
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
                    >
                      {sub.name}
                    </button>
                  ))}
                </div>
                {selectedCategory.subcategories.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    No subcategories available for this category
                  </p>
                )}
              </div>
            )}

            {/* Location */}
            <FormField
              id="edit-location"
              label="Location"
              icon={<MapPin className="w-4 h-4 text-muted-foreground" />}
            >
              <Input
                id="edit-location"
                value={form.location}
                onChange={(e) =>
                  onFormChange({ ...form, location: e.target.value })
                }
                className="bg-background/50"
                placeholder="e.g., Tokyo, Japan"
              />
            </FormField>

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
                disabled={!form.title || !form.alt || !form.categoryId}
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
