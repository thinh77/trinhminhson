import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useCategoryManagement } from './useCategoryManagement';

// Mock the categories service
vi.mock('@/services/categories.service', () => ({
  getAllCategories: vi.fn(),
  createCategory: vi.fn(),
  updateCategory: vi.fn(),
  deleteCategory: vi.fn(),
  createSubcategory: vi.fn(),
  updateSubcategory: vi.fn(),
  deleteSubcategory: vi.fn(),
  initializeCategories: vi.fn(),
}));

// Mock useConfirm hook
const mockConfirm = vi.fn(() => Promise.resolve(true));
vi.mock('@/hooks/useConfirm', () => ({
  useConfirm: () => mockConfirm,
}));

// Mock useToast hook
const mockShowToast = vi.fn();
vi.mock('@/contexts/ToastContext', () => ({
  useToast: () => ({ showToast: mockShowToast }),
}));

import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
  initializeCategories,
} from '@/services/categories.service';

const mockGetAllCategories = vi.mocked(getAllCategories);
const mockCreateCategory = vi.mocked(createCategory);
const mockUpdateCategory = vi.mocked(updateCategory);
const mockDeleteCategory = vi.mocked(deleteCategory);
const mockCreateSubcategory = vi.mocked(createSubcategory);
const mockUpdateSubcategory = vi.mocked(updateSubcategory);
const mockDeleteSubcategory = vi.mocked(deleteSubcategory);
const mockInitializeCategories = vi.mocked(initializeCategories);

const mockCategories = [
  {
    id: 1,
    name: 'Nature',
    slug: 'nature',
    description: null,
    displayOrder: 1,
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    subcategories: [
      {
        id: 10,
        name: 'Mountains',
        slug: 'mountains',
        categoryId: 1,
        description: null,
        displayOrder: 1,
        isActive: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
      {
        id: 11,
        name: 'Beaches',
        slug: 'beaches',
        categoryId: 1,
        description: null,
        displayOrder: 2,
        isActive: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
    ],
  },
  {
    id: 2,
    name: 'Urban',
    slug: 'urban',
    description: null,
    displayOrder: 2,
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    subcategories: [
      {
        id: 20,
        name: 'Streets',
        slug: 'streets',
        categoryId: 2,
        description: null,
        displayOrder: 1,
        isActive: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
    ],
  },
];

describe('useCategoryManagement hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAllCategories.mockResolvedValue(mockCategories);
  });

  describe('initialization', () => {
    it('loads categories on mount', async () => {
      const { result } = renderHook(() => useCategoryManagement());

      await waitFor(() => {
        expect(result.current.categories).toEqual(mockCategories);
      });
      expect(mockGetAllCategories).toHaveBeenCalledWith(true);
    });

    it('sets isLoading to true while loading', async () => {
      mockGetAllCategories.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockCategories), 100))
      );

      const { result } = renderHook(() => useCategoryManagement());

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('expands all categories by default', async () => {
      const { result } = renderHook(() => useCategoryManagement());

      await waitFor(() => {
        expect(result.current.expandedCategories.has(1)).toBe(true);
        expect(result.current.expandedCategories.has(2)).toBe(true);
      });
    });

    it('shows error toast when loading fails', async () => {
      mockGetAllCategories.mockRejectedValue(new Error('Network error'));

      renderHook(() => useCategoryManagement());

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith('Failed to load categories', 'error');
      });
    });

    it('initializes with no editing state', async () => {
      const { result } = renderHook(() => useCategoryManagement());

      await waitFor(() => {
        expect(result.current.categories).toEqual(mockCategories);
      });

      expect(result.current.editing).toBeNull();
      expect(result.current.isSaving).toBe(false);
      expect(result.current.deletingId).toBeNull();
    });
  });

  describe('toggleCategory', () => {
    it('collapses expanded category', async () => {
      const { result } = renderHook(() => useCategoryManagement());

      await waitFor(() => {
        expect(result.current.expandedCategories.has(1)).toBe(true);
      });

      act(() => {
        result.current.toggleCategory(1);
      });

      expect(result.current.expandedCategories.has(1)).toBe(false);
    });

    it('expands collapsed category', async () => {
      const { result } = renderHook(() => useCategoryManagement());

      await waitFor(() => {
        expect(result.current.expandedCategories.has(1)).toBe(true);
      });

      // First collapse it
      act(() => {
        result.current.toggleCategory(1);
      });

      expect(result.current.expandedCategories.has(1)).toBe(false);

      // Then expand it again
      act(() => {
        result.current.toggleCategory(1);
      });

      expect(result.current.expandedCategories.has(1)).toBe(true);
    });
  });

  describe('startEditCategory', () => {
    it('sets editing state for existing category', async () => {
      const { result } = renderHook(() => useCategoryManagement());

      await waitFor(() => {
        expect(result.current.categories).toEqual(mockCategories);
      });

      act(() => {
        result.current.startEditCategory(mockCategories[0]);
      });

      expect(result.current.editing).toEqual({
        type: 'category',
        id: 1,
        name: 'Nature',
      });
    });
  });

  describe('startAddCategory', () => {
    it('sets editing state for new category', async () => {
      const { result } = renderHook(() => useCategoryManagement());

      await waitFor(() => {
        expect(result.current.categories).toEqual(mockCategories);
      });

      act(() => {
        result.current.startAddCategory();
      });

      expect(result.current.editing).toEqual({
        type: 'category',
        id: null,
        name: '',
      });
    });
  });

  describe('startEditSubcategory', () => {
    it('sets editing state for existing subcategory', async () => {
      const { result } = renderHook(() => useCategoryManagement());

      await waitFor(() => {
        expect(result.current.categories).toEqual(mockCategories);
      });

      const subcategory = mockCategories[0].subcategories[0];

      act(() => {
        result.current.startEditSubcategory(subcategory);
      });

      expect(result.current.editing).toEqual({
        type: 'subcategory',
        id: 10,
        categoryId: 1,
        name: 'Mountains',
      });
    });
  });

  describe('startAddSubcategory', () => {
    it('sets editing state for new subcategory and expands category', async () => {
      const { result } = renderHook(() => useCategoryManagement());

      await waitFor(() => {
        expect(result.current.categories).toEqual(mockCategories);
      });

      // First collapse category
      act(() => {
        result.current.toggleCategory(1);
      });

      expect(result.current.expandedCategories.has(1)).toBe(false);

      // Start adding subcategory
      act(() => {
        result.current.startAddSubcategory(1);
      });

      expect(result.current.editing).toEqual({
        type: 'subcategory',
        id: null,
        categoryId: 1,
        name: '',
      });
      expect(result.current.expandedCategories.has(1)).toBe(true);
    });
  });

  describe('cancelEditing', () => {
    it('clears editing state', async () => {
      const { result } = renderHook(() => useCategoryManagement());

      await waitFor(() => {
        expect(result.current.categories).toEqual(mockCategories);
      });

      act(() => {
        result.current.startAddCategory();
      });

      expect(result.current.editing).not.toBeNull();

      act(() => {
        result.current.cancelEditing();
      });

      expect(result.current.editing).toBeNull();
    });
  });

  describe('setEditingName', () => {
    it('updates editing name', async () => {
      const { result } = renderHook(() => useCategoryManagement());

      await waitFor(() => {
        expect(result.current.categories).toEqual(mockCategories);
      });

      act(() => {
        result.current.startAddCategory();
      });

      act(() => {
        result.current.setEditingName('New Category');
      });

      expect(result.current.editing?.name).toBe('New Category');
    });
  });

  describe('handleSave', () => {
    it('shows error when name is empty', async () => {
      const { result } = renderHook(() => useCategoryManagement());

      await waitFor(() => {
        expect(result.current.categories).toEqual(mockCategories);
      });

      act(() => {
        result.current.startAddCategory();
      });

      await act(async () => {
        await result.current.handleSave();
      });

      expect(mockShowToast).toHaveBeenCalledWith('Name is required', 'error');
    });

    it('creates new category successfully', async () => {
      const newCategory = {
        id: 3,
        name: 'Wildlife',
        slug: 'wildlife',
        description: null,
        displayOrder: 3,
        isActive: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        subcategories: [],
      };
      mockCreateCategory.mockResolvedValue(newCategory);

      const { result } = renderHook(() => useCategoryManagement());

      await waitFor(() => {
        expect(result.current.categories).toEqual(mockCategories);
      });

      // Set up the mock for categories after save (includes new category)
      mockGetAllCategories.mockResolvedValue([...mockCategories, newCategory]);

      act(() => {
        result.current.startAddCategory();
      });

      act(() => {
        result.current.setEditingName('Wildlife');
      });

      await act(async () => {
        await result.current.handleSave();
      });

      expect(mockCreateCategory).toHaveBeenCalledWith({ name: 'Wildlife' });
      expect(mockShowToast).toHaveBeenCalledWith('Category created successfully!', 'success');
      expect(result.current.editing).toBeNull();
    });

    it('updates existing category successfully', async () => {
      mockUpdateCategory.mockResolvedValue({ ...mockCategories[0], name: 'Updated Nature' });

      const { result } = renderHook(() => useCategoryManagement());

      await waitFor(() => {
        expect(result.current.categories).toEqual(mockCategories);
      });

      act(() => {
        result.current.startEditCategory(mockCategories[0]);
      });

      act(() => {
        result.current.setEditingName('Updated Nature');
      });

      await act(async () => {
        await result.current.handleSave();
      });

      expect(mockUpdateCategory).toHaveBeenCalledWith(1, { name: 'Updated Nature' });
      expect(mockShowToast).toHaveBeenCalledWith('Category updated successfully!', 'success');
    });

    it('creates new subcategory successfully', async () => {
      const newSubcategory = {
        id: 12,
        name: 'Forests',
        slug: 'forests',
        categoryId: 1,
        description: null,
        displayOrder: 3,
        isActive: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };
      mockCreateSubcategory.mockResolvedValue(newSubcategory);

      const { result } = renderHook(() => useCategoryManagement());

      await waitFor(() => {
        expect(result.current.categories).toEqual(mockCategories);
      });

      act(() => {
        result.current.startAddSubcategory(1);
      });

      act(() => {
        result.current.setEditingName('Forests');
      });

      await act(async () => {
        await result.current.handleSave();
      });

      expect(mockCreateSubcategory).toHaveBeenCalledWith({ categoryId: 1, name: 'Forests' });
      expect(mockShowToast).toHaveBeenCalledWith('Subcategory created successfully!', 'success');
    });

    it('updates existing subcategory successfully', async () => {
      mockUpdateSubcategory.mockResolvedValue({ ...mockCategories[0].subcategories[0], name: 'Updated Mountains' });

      const { result } = renderHook(() => useCategoryManagement());

      await waitFor(() => {
        expect(result.current.categories).toEqual(mockCategories);
      });

      act(() => {
        result.current.startEditSubcategory(mockCategories[0].subcategories[0]);
      });

      act(() => {
        result.current.setEditingName('Updated Mountains');
      });

      await act(async () => {
        await result.current.handleSave();
      });

      expect(mockUpdateSubcategory).toHaveBeenCalledWith(10, { name: 'Updated Mountains' });
      expect(mockShowToast).toHaveBeenCalledWith('Subcategory updated successfully!', 'success');
    });

    it('shows error toast on save failure', async () => {
      mockCreateCategory.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useCategoryManagement());

      await waitFor(() => {
        expect(result.current.categories).toEqual(mockCategories);
      });

      act(() => {
        result.current.startAddCategory();
      });

      act(() => {
        result.current.setEditingName('New Category');
      });

      await act(async () => {
        await result.current.handleSave();
      });

      expect(mockShowToast).toHaveBeenCalledWith('Failed to save changes', 'error');
    });
  });

  describe('handleDeleteCategory', () => {
    it('does not delete when user cancels confirmation', async () => {
      mockConfirm.mockResolvedValueOnce(false);

      const { result } = renderHook(() => useCategoryManagement());

      await waitFor(() => {
        expect(result.current.categories).toEqual(mockCategories);
      });

      await act(async () => {
        await result.current.handleDeleteCategory(mockCategories[0]);
      });

      expect(mockDeleteCategory).not.toHaveBeenCalled();
    });

    it('deletes category after confirmation', async () => {
      mockDeleteCategory.mockResolvedValue(undefined);

      const { result } = renderHook(() => useCategoryManagement());

      await waitFor(() => {
        expect(result.current.categories).toEqual(mockCategories);
      });

      // Set up the mock for categories after delete (without deleted category)
      mockGetAllCategories.mockResolvedValue([mockCategories[1]]);

      await act(async () => {
        await result.current.handleDeleteCategory(mockCategories[0]);
      });

      expect(mockDeleteCategory).toHaveBeenCalledWith(1);
      expect(mockShowToast).toHaveBeenCalledWith('Category deleted successfully!', 'success');
    });

    it('clears deletingId after deletion', async () => {
      mockDeleteCategory.mockResolvedValue(undefined);

      const { result } = renderHook(() => useCategoryManagement());

      await waitFor(() => {
        expect(result.current.categories).toEqual(mockCategories);
      });

      await act(async () => {
        await result.current.handleDeleteCategory(mockCategories[0]);
      });

      expect(result.current.deletingId).toBeNull();
    });

    it('shows error toast on delete failure', async () => {
      mockDeleteCategory.mockRejectedValue(new Error('Delete failed'));

      const { result } = renderHook(() => useCategoryManagement());

      await waitFor(() => {
        expect(result.current.categories).toEqual(mockCategories);
      });

      await act(async () => {
        await result.current.handleDeleteCategory(mockCategories[0]);
      });

      expect(mockShowToast).toHaveBeenCalledWith('Failed to delete category', 'error');
    });
  });

  describe('handleDeleteSubcategory', () => {
    it('does not delete when user cancels confirmation', async () => {
      mockConfirm.mockResolvedValueOnce(false);

      const { result } = renderHook(() => useCategoryManagement());

      await waitFor(() => {
        expect(result.current.categories).toEqual(mockCategories);
      });

      await act(async () => {
        await result.current.handleDeleteSubcategory(mockCategories[0].subcategories[0]);
      });

      expect(mockDeleteSubcategory).not.toHaveBeenCalled();
    });

    it('deletes subcategory after confirmation', async () => {
      mockDeleteSubcategory.mockResolvedValue(undefined);

      const { result } = renderHook(() => useCategoryManagement());

      await waitFor(() => {
        expect(result.current.categories).toEqual(mockCategories);
      });

      await act(async () => {
        await result.current.handleDeleteSubcategory(mockCategories[0].subcategories[0]);
      });

      expect(mockDeleteSubcategory).toHaveBeenCalledWith(10);
      expect(mockShowToast).toHaveBeenCalledWith('Subcategory deleted successfully!', 'success');
    });

    it('shows error toast on subcategory delete failure', async () => {
      mockDeleteSubcategory.mockRejectedValue(new Error('Delete failed'));

      const { result } = renderHook(() => useCategoryManagement());

      await waitFor(() => {
        expect(result.current.categories).toEqual(mockCategories);
      });

      await act(async () => {
        await result.current.handleDeleteSubcategory(mockCategories[0].subcategories[0]);
      });

      expect(mockShowToast).toHaveBeenCalledWith('Failed to delete subcategory', 'error');
    });
  });

  describe('handleInitialize', () => {
    it('initializes default categories after confirmation', async () => {
      mockInitializeCategories.mockResolvedValue(undefined);
      mockGetAllCategories.mockResolvedValue(mockCategories);

      const { result } = renderHook(() => useCategoryManagement());

      await waitFor(() => {
        expect(result.current.categories).toEqual(mockCategories);
      });

      // Clear categories first to simulate empty state
      mockGetAllCategories.mockResolvedValue([]);
      await act(async () => {
        await result.current.loadCategories();
      });

      mockGetAllCategories.mockResolvedValue(mockCategories);
      await act(async () => {
        await result.current.handleInitialize();
      });

      expect(mockInitializeCategories).toHaveBeenCalled();
      expect(mockShowToast).toHaveBeenCalledWith('Categories initialized successfully!', 'success');
    });

    it('shows error toast on initialization failure', async () => {
      mockInitializeCategories.mockRejectedValue(new Error('Init failed'));

      const { result } = renderHook(() => useCategoryManagement());

      await waitFor(() => {
        expect(result.current.categories).toEqual(mockCategories);
      });

      await act(async () => {
        await result.current.handleInitialize();
      });

      expect(mockShowToast).toHaveBeenCalledWith('Failed to initialize categories', 'error');
    });
  });

  describe('loadCategories', () => {
    it('reloads categories from API', async () => {
      const { result } = renderHook(() => useCategoryManagement());

      await waitFor(() => {
        expect(result.current.categories).toEqual(mockCategories);
      });

      const newCategories = [mockCategories[0]];
      mockGetAllCategories.mockResolvedValue(newCategories);

      await act(async () => {
        await result.current.loadCategories();
      });

      expect(result.current.categories).toEqual(newCategories);
      expect(mockGetAllCategories).toHaveBeenCalledTimes(2);
    });
  });
});
