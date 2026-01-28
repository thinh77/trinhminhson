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
import { Edit, Save, Tag, Calendar } from "lucide-react";
import { getPhotoUrl, type Photo } from "@/services/photos.service";
import type { Category } from "@/services/categories.service";
import type { EditPhotoFormData } from "../hooks/usePhotoAdmin";

interface EditPhotoModalProps {
  photo: Photo;
  form: EditPhotoFormData;
  categories: Category[];
  onFormChange: (form: EditPhotoFormData) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function EditPhotoModal({
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
