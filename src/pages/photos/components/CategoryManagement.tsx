/**
 * Category Management Component for Photos Page
 * Admin UI for managing photo categories and subcategories
 * Uses useCategoryManagement hook and ToastContext
 */

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
import { useCategoryManagement, type EditingState } from "../hooks/useCategoryManagement";
import type { Category, Subcategory } from "@/services/categories.service";

interface CategoryManagementProps {
  onCategoriesChange?: (categories: Category[]) => void;
}

export function CategoryManagement({ onCategoriesChange }: CategoryManagementProps) {
  const {
    categories,
    isLoading,
    expandedCategories,
    editing,
    isSaving,
    deletingId,
    loadCategories,
    toggleCategory,
    startEditCategory,
    startAddCategory,
    startEditSubcategory,
    startAddSubcategory,
    cancelEditing,
    setEditingName,
    handleSave,
    handleDeleteCategory,
    handleDeleteSubcategory,
    handleInitialize,
  } = useCategoryManagement({ onCategoriesChange });

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
              <NewCategoryForm
                name={editing.name}
                isSaving={isSaving}
                onNameChange={setEditingName}
                onSave={handleSave}
                onCancel={cancelEditing}
              />
            )}

            {/* Categories List */}
            {categories.map((category) => (
              <CategoryItem
                key={category.id}
                category={category}
                isExpanded={expandedCategories.has(category.id)}
                editing={editing}
                isSaving={isSaving}
                deletingId={deletingId}
                onToggle={() => toggleCategory(category.id)}
                onEdit={() => startEditCategory(category)}
                onDelete={() => handleDeleteCategory(category)}
                onAddSubcategory={() => startAddSubcategory(category.id)}
                onEditSubcategory={startEditSubcategory}
                onDeleteSubcategory={handleDeleteSubcategory}
                onNameChange={setEditingName}
                onSave={handleSave}
                onCancel={cancelEditing}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface NewCategoryFormProps {
  name: string;
  isSaving: boolean;
  onNameChange: (name: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

function NewCategoryForm({
  name,
  isSaving,
  onNameChange,
  onSave,
  onCancel,
}: NewCategoryFormProps) {
  return (
    <div className="flex items-center gap-2 p-3 bg-accent/10 rounded-lg border border-accent/30">
      <Input
        autoFocus
        placeholder="New category name"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        className="flex-1 bg-background/50"
        onKeyDown={(e) => {
          if (e.key === "Enter") onSave();
          if (e.key === "Escape") onCancel();
        }}
      />
      <Button
        size="sm"
        onClick={onSave}
        disabled={isSaving || !name.trim()}
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
        onClick={onCancel}
        disabled={isSaving}
        className="cursor-pointer"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}

interface CategoryItemProps {
  category: Category;
  isExpanded: boolean;
  editing: EditingState | null;
  isSaving: boolean;
  deletingId: string | null;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddSubcategory: () => void;
  onEditSubcategory: (subcategory: Subcategory) => void;
  onDeleteSubcategory: (subcategory: Subcategory) => void;
  onNameChange: (name: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

function CategoryItem({
  category,
  isExpanded,
  editing,
  isSaving,
  deletingId,
  onToggle,
  onEdit,
  onDelete,
  onAddSubcategory,
  onEditSubcategory,
  onDeleteSubcategory,
  onNameChange,
  onSave,
  onCancel,
}: CategoryItemProps) {
  const isEditing = editing?.type === "category" && editing?.id === category.id;
  const isDeleting = deletingId === `category-${category.id}`;

  return (
    <div className="border border-border/50 rounded-lg overflow-hidden">
      {/* Category Header */}
      <div
        className={cn(
          "flex items-center gap-2 p-3 bg-secondary/30 hover:bg-secondary/50 transition-colors",
          !category.isActive && "opacity-60"
        )}
      >
        <button
          onClick={onToggle}
          className="p-1 hover:bg-background/50 rounded cursor-pointer"
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>

        {isEditing ? (
          <>
            <Input
              autoFocus
              value={editing.name}
              onChange={(e) => onNameChange(e.target.value)}
              className="flex-1 h-8 bg-background/50"
              onKeyDown={(e) => {
                if (e.key === "Enter") onSave();
                if (e.key === "Escape") onCancel();
              }}
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={onSave}
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
              onClick={onCancel}
              disabled={isSaving}
              className="cursor-pointer h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </>
        ) : (
          <>
            <span className="flex-1 font-medium">{category.name}</span>
            <span className="text-xs text-muted-foreground bg-background/50 px-2 py-1 rounded">
              {category.subcategories.length} subcategories
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={onAddSubcategory}
              disabled={!!editing}
              className="cursor-pointer h-8 w-8 p-0"
              title="Add subcategory"
            >
              <Plus className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onEdit}
              disabled={!!editing}
              className="cursor-pointer h-8 w-8 p-0"
              title="Edit category"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onDelete}
              disabled={!!editing || isDeleting}
              className="cursor-pointer h-8 w-8 p-0 text-destructive hover:text-destructive"
              title="Delete category"
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </Button>
          </>
        )}
      </div>

      {/* Subcategories */}
      {isExpanded && (
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
                  onChange={(e) => onNameChange(e.target.value)}
                  className="flex-1 h-8 bg-background/50"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") onSave();
                    if (e.key === "Escape") onCancel();
                  }}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onSave}
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
                  onClick={onCancel}
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
            <SubcategoryItem
              key={subcategory.id}
              subcategory={subcategory}
              editing={editing}
              isSaving={isSaving}
              deletingId={deletingId}
              onEdit={() => onEditSubcategory(subcategory)}
              onDelete={() => onDeleteSubcategory(subcategory)}
              onNameChange={onNameChange}
              onSave={onSave}
              onCancel={onCancel}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface SubcategoryItemProps {
  subcategory: Subcategory;
  editing: EditingState | null;
  isSaving: boolean;
  deletingId: string | null;
  onEdit: () => void;
  onDelete: () => void;
  onNameChange: (name: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

function SubcategoryItem({
  subcategory,
  editing,
  isSaving,
  deletingId,
  onEdit,
  onDelete,
  onNameChange,
  onSave,
  onCancel,
}: SubcategoryItemProps) {
  const isEditing = editing?.type === "subcategory" && editing?.id === subcategory.id;
  const isDeleting = deletingId === `subcategory-${subcategory.id}`;

  return (
    <div
      className={cn(
        "flex items-center gap-2 p-3 pl-10 hover:bg-background/50 transition-colors border-b border-border/30 last:border-b-0",
        !subcategory.isActive && "opacity-60"
      )}
    >
      <Tag className="w-4 h-4 text-muted-foreground" />

      {isEditing ? (
        <>
          <Input
            autoFocus
            value={editing.name}
            onChange={(e) => onNameChange(e.target.value)}
            className="flex-1 h-8 bg-background/50"
            onKeyDown={(e) => {
              if (e.key === "Enter") onSave();
              if (e.key === "Escape") onCancel();
            }}
          />
          <Button
            size="sm"
            variant="ghost"
            onClick={onSave}
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
            onClick={onCancel}
            disabled={isSaving}
            className="cursor-pointer h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </>
      ) : (
        <>
          <span className="flex-1 text-sm">{subcategory.name}</span>
          <Button
            size="sm"
            variant="ghost"
            onClick={onEdit}
            disabled={!!editing}
            className="cursor-pointer h-7 w-7 p-0"
            title="Edit subcategory"
          >
            <Edit className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onDelete}
            disabled={!!editing || isDeleting}
            className="cursor-pointer h-7 w-7 p-0 text-destructive hover:text-destructive"
            title="Delete subcategory"
          >
            {isDeleting ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Trash2 className="w-3 h-3" />
            )}
          </Button>
        </>
      )}
    </div>
  );
}
