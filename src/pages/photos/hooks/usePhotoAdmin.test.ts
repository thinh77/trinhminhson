import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { usePhotoAdmin } from './usePhotoAdmin';
import type { Photo as ApiPhoto } from '@/services/photos.service';

// Mock the photos service
vi.mock('@/services/photos.service', () => ({
  updatePhoto: vi.fn(),
  deletePhoto: vi.fn(),
  reorderPhotos: vi.fn(),
  getPhotoUrl: vi.fn((filename: string, size: string) => `/uploads/${size}/${filename}`),
}));

// Mock the categories service
vi.mock('@/services/categories.service', () => ({
  getAllCategories: vi.fn(),
}));

// Mock useConfirm hook
vi.mock('@/hooks/useConfirm', () => ({
  useConfirm: () => vi.fn(() => Promise.resolve(true)),
}));

import { updatePhoto, deletePhoto, reorderPhotos } from '@/services/photos.service';
import { getAllCategories } from '@/services/categories.service';

const mockUpdatePhoto = vi.mocked(updatePhoto);
const mockDeletePhoto = vi.mocked(deletePhoto);
const mockReorderPhotos = vi.mocked(reorderPhotos);
const mockGetAllCategories = vi.mocked(getAllCategories);

const createMockApiPhoto = (id: number, title: string): ApiPhoto => ({
  id,
  filename: `photo_${id}.jpg`,
  original_name: `original_${id}.jpg`,
  title,
  alt: title,
  location: 'Test Location',
  date_taken: '2024-01-15T00:00:00.000Z',
  is_public: true,
  display_order: id,
  aspect_ratio: 'landscape',
  created_at: '2024-01-15T00:00:00.000Z',
  updated_at: '2024-01-15T00:00:00.000Z',
  categories: [{ id: 1, name: 'Nature', slug: 'nature' }],
  subcategories: [{ id: 10, name: 'Mountains', slug: 'mountains' }],
});

describe('usePhotoAdmin hook', () => {
  const mockPhotos: ApiPhoto[] = [
    createMockApiPhoto(1, 'Mountain Sunset'),
    createMockApiPhoto(2, 'Ocean Wave'),
    createMockApiPhoto(3, 'Forest Path'),
  ];

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
        { id: 10, name: 'Mountains', slug: 'mountains', categoryId: 1, description: null, displayOrder: 1, isActive: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
        { id: 11, name: 'Beaches', slug: 'beaches', categoryId: 1, description: null, displayOrder: 2, isActive: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
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
        { id: 20, name: 'Streets', slug: 'streets', categoryId: 2, description: null, displayOrder: 1, isActive: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
      ],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAllCategories.mockResolvedValue(mockCategories);
  });

  describe('initialization', () => {
    it('initializes with no editing photo', () => {
      const { result } = renderHook(() => usePhotoAdmin(mockPhotos, vi.fn()));

      expect(result.current.editingPhoto).toBeNull();
      expect(result.current.deletingPhotoId).toBeNull();
    });

    it('loads categories on mount', async () => {
      const { result } = renderHook(() => usePhotoAdmin(mockPhotos, vi.fn()));

      await waitFor(() => {
        expect(result.current.categories).toEqual(mockCategories);
      });
      expect(mockGetAllCategories).toHaveBeenCalledTimes(1);
    });
  });

  describe('handleEditPhoto', () => {
    it('sets editingPhoto and populates editForm with photo data', () => {
      const { result } = renderHook(() => usePhotoAdmin(mockPhotos, vi.fn()));

      act(() => {
        result.current.handleEditPhoto(mockPhotos[0]);
      });

      expect(result.current.editingPhoto).toEqual(mockPhotos[0]);
      expect(result.current.editForm).toEqual({
        title: 'Mountain Sunset',
        alt: 'Mountain Sunset',
        location: 'Test Location',
        categoryIds: [1],
        subcategoryIds: [10],
        dateTaken: '2024-01-15',
      });
    });

    it('handles photo with no categories gracefully', () => {
      const photoWithNoCategories: ApiPhoto = {
        ...createMockApiPhoto(99, 'No Categories'),
        categories: undefined,
        subcategories: undefined,
      };

      const { result } = renderHook(() =>
        usePhotoAdmin([photoWithNoCategories], vi.fn())
      );

      act(() => {
        result.current.handleEditPhoto(photoWithNoCategories);
      });

      expect(result.current.editForm.categoryIds).toEqual([]);
      expect(result.current.editForm.subcategoryIds).toEqual([]);
    });
  });

  describe('handleSavePhoto', () => {
    it('calls updatePhoto API with correct data', async () => {
      const onPhotosChange = vi.fn();
      mockUpdatePhoto.mockResolvedValue({
        ...mockPhotos[0],
        title: 'Updated Title',
      });

      const { result } = renderHook(() =>
        usePhotoAdmin(mockPhotos, onPhotosChange)
      );

      // Start editing
      act(() => {
        result.current.handleEditPhoto(mockPhotos[0]);
      });

      // Update the form
      act(() => {
        result.current.setEditForm({
          title: 'Updated Title',
          alt: 'Updated Alt',
          location: 'New Location',
          categoryIds: [1, 2],
          subcategoryIds: [10, 20],
          dateTaken: '2024-02-20',
        });
      });

      // Save
      await act(async () => {
        await result.current.handleSavePhoto(1);
      });

      expect(mockUpdatePhoto).toHaveBeenCalledWith(1, {
        title: 'Updated Title',
        alt: 'Updated Alt',
        location: 'New Location',
        categoryIds: [1, 2],
        subcategoryIds: [10, 20],
        dateTaken: '2024-02-20',
      });
    });

    it('clears editingPhoto after successful save', async () => {
      mockUpdatePhoto.mockResolvedValue(mockPhotos[0]);
      const { result } = renderHook(() => usePhotoAdmin(mockPhotos, vi.fn()));

      act(() => {
        result.current.handleEditPhoto(mockPhotos[0]);
      });

      await act(async () => {
        await result.current.handleSavePhoto(1);
      });

      expect(result.current.editingPhoto).toBeNull();
    });

    it('calls onPhotosChange callback after successful save', async () => {
      const onPhotosChange = vi.fn();
      const updatedPhoto = { ...mockPhotos[0], title: 'Updated' };
      mockUpdatePhoto.mockResolvedValue(updatedPhoto);

      const { result } = renderHook(() =>
        usePhotoAdmin(mockPhotos, onPhotosChange)
      );

      act(() => {
        result.current.handleEditPhoto(mockPhotos[0]);
      });

      await act(async () => {
        await result.current.handleSavePhoto(1);
      });

      expect(onPhotosChange).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ id: 1, title: 'Updated' }),
        ])
      );
    });
  });

  describe('handleCancelEdit', () => {
    it('clears editingPhoto', () => {
      const { result } = renderHook(() => usePhotoAdmin(mockPhotos, vi.fn()));

      act(() => {
        result.current.handleEditPhoto(mockPhotos[0]);
      });

      expect(result.current.editingPhoto).not.toBeNull();

      act(() => {
        result.current.handleCancelEdit();
      });

      expect(result.current.editingPhoto).toBeNull();
    });
  });

  describe('handleDeletePhoto', () => {
    it('calls deletePhoto API with photo id after confirmation', async () => {
      mockDeletePhoto.mockResolvedValue({ message: 'Photo deleted' });
      const { result } = renderHook(() => usePhotoAdmin(mockPhotos, vi.fn()));

      await act(async () => {
        await result.current.handleDeletePhoto('2');
      });

      expect(mockDeletePhoto).toHaveBeenCalledWith(2);
    });

    it('calls onPhotosChange with filtered list after deletion', async () => {
      mockDeletePhoto.mockResolvedValue({ message: 'Photo deleted' });
      const onPhotosChange = vi.fn();

      const { result } = renderHook(() =>
        usePhotoAdmin(mockPhotos, onPhotosChange)
      );

      await act(async () => {
        await result.current.handleDeletePhoto('2');
      });

      expect(onPhotosChange).toHaveBeenCalledWith(
        expect.not.arrayContaining([expect.objectContaining({ id: 2 })])
      );
    });

    it('clears deletingPhotoId after deletion completes', async () => {
      mockDeletePhoto.mockResolvedValue({ message: 'Photo deleted' });
      const { result } = renderHook(() => usePhotoAdmin(mockPhotos, vi.fn()));

      await act(async () => {
        await result.current.handleDeletePhoto('2');
      });

      expect(result.current.deletingPhotoId).toBeNull();
    });
  });

  describe('handleReorderPhotos', () => {
    it('calls reorderPhotos API with new order', async () => {
      mockReorderPhotos.mockResolvedValue({ message: 'Reordered' });
      const { result } = renderHook(() => usePhotoAdmin(mockPhotos, vi.fn()));

      const newOrder = [
        { id: 3, displayOrder: 0 },
        { id: 1, displayOrder: 1 },
        { id: 2, displayOrder: 2 },
      ];

      await act(async () => {
        await result.current.handleReorderPhotos(newOrder);
      });

      expect(mockReorderPhotos).toHaveBeenCalledWith(newOrder);
    });

    it('returns true on successful reorder', async () => {
      mockReorderPhotos.mockResolvedValue({ message: 'Reordered' });
      const { result } = renderHook(() => usePhotoAdmin(mockPhotos, vi.fn()));

      let success: boolean | undefined;
      await act(async () => {
        success = await result.current.handleReorderPhotos([]);
      });

      expect(success).toBe(true);
    });

    it('returns false on failed reorder', async () => {
      mockReorderPhotos.mockRejectedValue(new Error('Network error'));
      const { result } = renderHook(() => usePhotoAdmin(mockPhotos, vi.fn()));

      let success: boolean | undefined;
      await act(async () => {
        success = await result.current.handleReorderPhotos([]);
      });

      expect(success).toBe(false);
    });
  });
});
