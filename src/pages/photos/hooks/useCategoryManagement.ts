/**
 * Hook for managing photo categories and subcategories
 * Extracted from CategoryManagement component for reusability
 */

import { useState, useEffect, useCallback } from 'react';
import { useConfirm } from '@/hooks/useConfirm';
import { useToast } from '@/contexts/ToastContext';
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
} from '@/services/categories.service';

export interface EditingState {
  type: 'category' | 'subcategory';
  id: number | null; // null for new item
  categoryId?: number; // parent category ID for new subcategory
  name: string;
}

export interface UseCategoryManagementOptions {
  onCategoriesChange?: (categories: Category[]) => void;
}

export interface UseCategoryManagementReturn {
  categories: Category[];
  isLoading: boolean;
  expandedCategories: Set<number>;
  editing: EditingState | null;
  isSaving: boolean;
  deletingId: string | null;
  loadCategories: () => Promise<void>;
  toggleCategory: (categoryId: number) => void;
  startEditCategory: (category: Category) => void;
  startAddCategory: () => void;
  startEditSubcategory: (subcategory: Subcategory) => void;
  startAddSubcategory: (categoryId: number) => void;
  cancelEditing: () => void;
  setEditingName: (name: string) => void;
  handleSave: () => Promise<void>;
  handleDeleteCategory: (category: Category) => Promise<void>;
  handleDeleteSubcategory: (subcategory: Subcategory) => Promise<void>;
  handleInitialize: () => Promise<void>;
}

export function useCategoryManagement(
  options?: UseCategoryManagementOptions
): UseCategoryManagementReturn {
  const { onCategoriesChange } = options || {};
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [editing, setEditing] = useState<EditingState | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const confirm = useConfirm();
  const { showToast } = useToast();

  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAllCategories(true);
      setCategories(data);
      setExpandedCategories(new Set(data.map((c) => c.id)));
      onCategoriesChange?.(data);
    } catch (error) {
      showToast('Failed to load categories', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast, onCategoriesChange]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const toggleCategory = useCallback((categoryId: number) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  }, []);

  const startEditCategory = useCallback((category: Category) => {
    setEditing({
      type: 'category',
      id: category.id,
      name: category.name,
    });
  }, []);

  const startAddCategory = useCallback(() => {
    setEditing({
      type: 'category',
      id: null,
      name: '',
    });
  }, []);

  const startEditSubcategory = useCallback((subcategory: Subcategory) => {
    setEditing({
      type: 'subcategory',
      id: subcategory.id,
      categoryId: subcategory.categoryId,
      name: subcategory.name,
    });
  }, []);

  const startAddSubcategory = useCallback((categoryId: number) => {
    setEditing({
      type: 'subcategory',
      id: null,
      categoryId,
      name: '',
    });
    setExpandedCategories((prev) => new Set(prev).add(categoryId));
  }, []);

  const cancelEditing = useCallback(() => {
    setEditing(null);
  }, []);

  const setEditingName = useCallback((name: string) => {
    setEditing((prev) => (prev ? { ...prev, name } : null));
  }, []);

  const handleSave = useCallback(async () => {
    if (!editing || !editing.name.trim()) {
      showToast('Name is required', 'error');
      return;
    }

    setIsSaving(true);
    try {
      if (editing.type === 'category') {
        if (editing.id) {
          await updateCategory(editing.id, { name: editing.name.trim() });
          showToast('Category updated successfully!', 'success');
        } else {
          await createCategory({ name: editing.name.trim() });
          showToast('Category created successfully!', 'success');
        }
      } else {
        if (editing.id) {
          await updateSubcategory(editing.id, { name: editing.name.trim() });
          showToast('Subcategory updated successfully!', 'success');
        } else if (editing.categoryId) {
          await createSubcategory({
            categoryId: editing.categoryId,
            name: editing.name.trim(),
          });
          showToast('Subcategory created successfully!', 'success');
        }
      }

      setEditing(null);
      await loadCategories();
    } catch (error) {
      showToast('Failed to save changes', 'error');
    } finally {
      setIsSaving(false);
    }
  }, [editing, showToast, loadCategories]);

  const handleDeleteCategory = useCallback(
    async (category: Category) => {
      const confirmed = await confirm({
        title: 'Delete Category',
        message: `Delete "${category.name}" and all its subcategories? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        type: 'danger',
      });
      if (!confirmed) return;

      setDeletingId(`category-${category.id}`);
      try {
        await deleteCategory(category.id);
        await loadCategories();
        showToast('Category deleted successfully!', 'success');
      } catch (error) {
        showToast('Failed to delete category', 'error');
      } finally {
        setDeletingId(null);
      }
    },
    [confirm, loadCategories, showToast]
  );

  const handleDeleteSubcategory = useCallback(
    async (subcategory: Subcategory) => {
      const confirmed = await confirm({
        title: 'Delete Subcategory',
        message: `Delete "${subcategory.name}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        type: 'danger',
      });
      if (!confirmed) return;

      setDeletingId(`subcategory-${subcategory.id}`);
      try {
        await deleteSubcategory(subcategory.id);
        await loadCategories();
        showToast('Subcategory deleted successfully!', 'success');
      } catch (error) {
        showToast('Failed to delete subcategory', 'error');
      } finally {
        setDeletingId(null);
      }
    },
    [confirm, loadCategories, showToast]
  );

  const handleInitialize = useCallback(async () => {
    const confirmed = await confirm({
      title: 'Initialize Categories',
      message: 'This will create default categories if none exist. Continue?',
      confirmText: 'Initialize',
      cancelText: 'Cancel',
      type: 'warning',
    });
    if (!confirmed) return;

    setIsLoading(true);
    try {
      await initializeCategories();
      await loadCategories();
      showToast('Categories initialized successfully!', 'success');
    } catch (error) {
      showToast('Failed to initialize categories', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [confirm, loadCategories, showToast]);

  return {
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
  };
}
