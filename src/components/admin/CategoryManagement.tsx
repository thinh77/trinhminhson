/**
 * Category Management Component
 * Admin UI for managing photo categories and subcategories
 */

import { useState, useEffect } from "react";
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
  FolderTree,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  ChevronDown,
  ChevronRight,
  Tag,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useConfirm } from "@/hooks/useConfirm";
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
  initializeCategories,
  type Category,
  type Subcategory,
} from "@/services/categories.service";

interface CategoryManagementProps {
  onToast: (message: string, type: "success" | "error") => void;
}

interface EditingState {
  type: "category" | "subcategory";
  id: number | null; // null for new item
  categoryId?: number; // parent category ID for new subcategory
  name: string;
}

export function CategoryManagement({ onToast }: CategoryManagementProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(
    new Set()
  );
  const [editing, setEditing] = useState<EditingState | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const confirm = useConfirm();

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const data = await getAllCategories(true);
      setCategories(data);
      // Expand all categories by default
      setExpandedCategories(new Set(data.map((c) => c.id)));
    } catch (error) {
      console.error("Failed to load categories:", error);
      onToast("Failed to load categories", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitialize = async () => {
    const confirmed = await confirm({
      title: "Initialize Categories",
      message: "This will create default categories if none exist. Continue?",
      confirmText: "Initialize",
      cancelText: "Cancel",
      type: "warning",
    });
    if (!confirmed) return;

    setIsLoading(true);
    try {
      await initializeCategories();
      await loadCategories();
      onToast("Categories initialized successfully!", "success");
    } catch (error) {
      console.error("Failed to initialize categories:", error);
      onToast("Failed to initialize categories", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCategory = (categoryId: number) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  // Start editing
  const startEditCategory = (category: Category) => {
    setEditing({
      type: "category",
      id: category.id,
      name: category.name,
    });
  };

  const startEditSubcategory = (subcategory: Subcategory) => {
    setEditing({
      type: "subcategory",
      id: subcategory.id,
      categoryId: subcategory.categoryId,
      name: subcategory.name,
    });
  };

  const startAddCategory = () => {
    setEditing({
      type: "category",
      id: null,
      name: "",
    });
  };

  const startAddSubcategory = (categoryId: number) => {
    setEditing({
      type: "subcategory",
      id: null,
      categoryId,
      name: "",
    });
    // Expand the category
    setExpandedCategories((prev) => new Set(prev).add(categoryId));
  };

  const cancelEditing = () => {
    setEditing(null);
  };

  // Save category/subcategory
  const handleSave = async () => {
    if (!editing || !editing.name.trim()) {
      onToast("Name is required", "error");
      return;
    }

    setIsSaving(true);
    try {
      if (editing.type === "category") {
        if (editing.id) {
          // Update existing category
          await updateCategory(editing.id, { name: editing.name.trim() });
          onToast("Category updated successfully!", "success");
        } else {
          // Create new category
          await createCategory({ name: editing.name.trim() });
          onToast("Category created successfully!", "success");
        }
      } else {
        if (editing.id) {
          // Update existing subcategory
          await updateSubcategory(editing.id, { name: editing.name.trim() });
          onToast("Subcategory updated successfully!", "success");
        } else if (editing.categoryId) {
          // Create new subcategory
          await createSubcategory({
            categoryId: editing.categoryId,
            name: editing.name.trim(),
          });
          onToast("Subcategory created successfully!", "success");
        }
      }

      setEditing(null);
      await loadCategories();
    } catch (error) {
      console.error("Failed to save:", error);
      onToast("Failed to save changes", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete category/subcategory
  const handleDeleteCategory = async (category: Category) => {
    const confirmed = await confirm({
      title: "Delete Category",
      message: `Delete "${category.name}" and all its subcategories? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      type: "danger",
    });
    if (!confirmed) return;

    setDeletingId(`category-${category.id}`);
    try {
      await deleteCategory(category.id);
      await loadCategories();
      onToast("Category deleted successfully!", "success");
    } catch (error) {
      console.error("Failed to delete category:", error);
      onToast("Failed to delete category", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteSubcategory = async (subcategory: Subcategory) => {
    const confirmed = await confirm({
      title: "Delete Subcategory",
      message: `Delete "${subcategory.name}"? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      type: "danger",
    });
    if (!confirmed) return;

    setDeletingId(`subcategory-${subcategory.id}`);
    try {
      await deleteSubcategory(subcategory.id);
      await loadCategories();
      onToast("Subcategory deleted successfully!", "success");
    } catch (error) {
      console.error("Failed to delete subcategory:", error);
      onToast("Failed to delete subcategory", "error");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FolderTree className="w-5 h-5 text-accent" />
              Category Management
            </CardTitle>
            <CardDescription>
              Manage photo categories and subcategories
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadCategories}
              disabled={isLoading}
              className="cursor-pointer"
            >
              <RefreshCw
                className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")}
              />
              Refresh
            </Button>
            {categories.length === 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleInitialize}
                disabled={isLoading}
                className="cursor-pointer"
              >
                <Plus className="w-4 h-4 mr-2" />
                Initialize Default
              </Button>
            )}
            <Button
              size="sm"
              onClick={startAddCategory}
              disabled={isLoading || !!editing}
              className="cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && categories.length === 0 ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <FolderTree className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No categories yet</p>
            <p className="text-sm mt-2">
              Click "Initialize Default" to create default categories or "Add
              Category" to create your own
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* New Category Form */}
            {editing && editing.type === "category" && editing.id === null && (
              <div className="flex items-center gap-2 p-3 bg-accent/10 rounded-lg border border-accent/30">
                <Input
                  autoFocus
                  placeholder="New category name"
                  value={editing.name}
                  onChange={(e) =>
                    setEditing({ ...editing, name: e.target.value })
                  }
                  className="flex-1 bg-background/50"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSave();
                    if (e.key === "Escape") cancelEditing();
                  }}
                />
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving || !editing.name.trim()}
                  className="cursor-pointer"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={cancelEditing}
                  disabled={isSaving}
                  className="cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Categories List */}
            {categories.map((category) => (
              <div
                key={category.id}
                className="border border-border/50 rounded-lg overflow-hidden"
              >
                {/* Category Header */}
                <div
                  className={cn(
                    "flex items-center gap-2 p-3 bg-secondary/30 hover:bg-secondary/50 transition-colors",
                    !category.isActive && "opacity-60"
                  )}
                >
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="p-1 hover:bg-background/50 rounded cursor-pointer"
                  >
                    {expandedCategories.has(category.id) ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>

                  {editing &&
                  editing.type === "category" &&
                  editing.id === category.id ? (
                    <>
                      <Input
                        autoFocus
                        value={editing.name}
                        onChange={(e) =>
                          setEditing({ ...editing, name: e.target.value })
                        }
                        className="flex-1 h-8 bg-background/50"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSave();
                          if (e.key === "Escape") cancelEditing();
                        }}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleSave}
                        disabled={isSaving || !editing.name.trim()}
                        className="cursor-pointer h-8 w-8 p-0"
                      >
                        {isSaving ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={cancelEditing}
                        disabled={isSaving}
                        className="cursor-pointer h-8 w-8 p-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 font-medium">
                        {category.name}
                      </span>
                      <span className="text-xs text-muted-foreground bg-background/50 px-2 py-1 rounded">
                        {category.subcategories.length} subcategories
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => startAddSubcategory(category.id)}
                        disabled={!!editing}
                        className="cursor-pointer h-8 w-8 p-0"
                        title="Add subcategory"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => startEditCategory(category)}
                        disabled={!!editing}
                        className="cursor-pointer h-8 w-8 p-0"
                        title="Edit category"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteCategory(category)}
                        disabled={
                          !!editing || deletingId === `category-${category.id}`
                        }
                        className="cursor-pointer h-8 w-8 p-0 text-destructive hover:text-destructive"
                        title="Delete category"
                      >
                        {deletingId === `category-${category.id}` ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </>
                  )}
                </div>

                {/* Subcategories */}
                {expandedCategories.has(category.id) && (
                  <div className="border-t border-border/30">
                    {/* New Subcategory Form */}
                    {editing &&
                      editing.type === "subcategory" &&
                      editing.id === null &&
                      editing.categoryId === category.id && (
                        <div className="flex items-center gap-2 p-3 pl-10 bg-accent/5 border-b border-border/30">
                          <Tag className="w-4 h-4 text-muted-foreground" />
                          <Input
                            autoFocus
                            placeholder="New subcategory name"
                            value={editing.name}
                            onChange={(e) =>
                              setEditing({ ...editing, name: e.target.value })
                            }
                            className="flex-1 h-8 bg-background/50"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSave();
                              if (e.key === "Escape") cancelEditing();
                            }}
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleSave}
                            disabled={isSaving || !editing.name.trim()}
                            className="cursor-pointer h-8 w-8 p-0"
                          >
                            {isSaving ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Save className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={cancelEditing}
                            disabled={isSaving}
                            className="cursor-pointer h-8 w-8 p-0"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}

                    {/* Subcategories List */}
                    {category.subcategories.length === 0 &&
                      !(
                        editing &&
                        editing.type === "subcategory" &&
                        editing.id === null &&
                        editing.categoryId === category.id
                      ) && (
                        <div className="p-3 pl-10 text-sm text-muted-foreground italic">
                          No subcategories
                        </div>
                      )}
                    {category.subcategories.map((subcategory) => (
                      <div
                        key={subcategory.id}
                        className={cn(
                          "flex items-center gap-2 p-3 pl-10 hover:bg-background/50 transition-colors border-b border-border/30 last:border-b-0",
                          !subcategory.isActive && "opacity-60"
                        )}
                      >
                        <Tag className="w-4 h-4 text-muted-foreground" />

                        {editing &&
                        editing.type === "subcategory" &&
                        editing.id === subcategory.id ? (
                          <>
                            <Input
                              autoFocus
                              value={editing.name}
                              onChange={(e) =>
                                setEditing({ ...editing, name: e.target.value })
                              }
                              className="flex-1 h-8 bg-background/50"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleSave();
                                if (e.key === "Escape") cancelEditing();
                              }}
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleSave}
                              disabled={isSaving || !editing.name.trim()}
                              className="cursor-pointer h-8 w-8 p-0"
                            >
                              {isSaving ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Save className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={cancelEditing}
                              disabled={isSaving}
                              className="cursor-pointer h-8 w-8 p-0"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <span className="flex-1 text-sm">
                              {subcategory.name}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => startEditSubcategory(subcategory)}
                              disabled={!!editing}
                              className="cursor-pointer h-7 w-7 p-0"
                              title="Edit subcategory"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                handleDeleteSubcategory(subcategory)
                              }
                              disabled={
                                !!editing ||
                                deletingId === `subcategory-${subcategory.id}`
                              }
                              className="cursor-pointer h-7 w-7 p-0 text-destructive hover:text-destructive"
                              title="Delete subcategory"
                            >
                              {deletingId ===
                              `subcategory-${subcategory.id}` ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Trash2 className="w-3 h-3" />
                              )}
                            </Button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
