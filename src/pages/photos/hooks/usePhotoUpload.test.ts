import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { usePhotoUpload } from './usePhotoUpload';

// Mock the photos service
vi.mock('@/services/photos.service', () => ({
  uploadPhotos: vi.fn(),
}));

// Mock the categories service
vi.mock('@/services/categories.service', () => ({
  getAllCategories: vi.fn(),
}));

import { uploadPhotos } from '@/services/photos.service';
import { getAllCategories } from '@/services/categories.service';

const mockUploadPhotos = vi.mocked(uploadPhotos);
const mockGetAllCategories = vi.mocked(getAllCategories);

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
    ],
  },
];

function createMockFile(name: string, size: number = 1024): File {
  const blob = new Blob(['x'.repeat(size)], { type: 'image/jpeg' });
  return new File([blob], name, { type: 'image/jpeg' });
}

describe('usePhotoUpload hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAllCategories.mockResolvedValue(mockCategories);
  });

  describe('initialization', () => {
    it('initializes with empty form state', () => {
      const { result } = renderHook(() => usePhotoUpload(vi.fn()));

      expect(result.current.form.files).toEqual([]);
      expect(result.current.form.categoryIds).toEqual([]);
      expect(result.current.form.subcategoryIds).toEqual([]);
      expect(result.current.previews).toEqual([]);
      expect(result.current.isSubmitting).toBe(false);
    });

    it('loads categories on mount', async () => {
      const { result } = renderHook(() => usePhotoUpload(vi.fn()));

      await waitFor(() => {
        expect(result.current.categories).toEqual(mockCategories);
      });
    });
  });

  describe('handleFilesChange', () => {
    it('adds files to form state', () => {
      const { result } = renderHook(() => usePhotoUpload(vi.fn()));

      const files = [createMockFile('photo1.jpg'), createMockFile('photo2.jpg')];
      const fileList = {
        length: files.length,
        item: (i: number) => files[i],
        [Symbol.iterator]: function* () { yield* files; },
      } as unknown as FileList;

      act(() => {
        result.current.handleFilesChange(fileList);
      });

      expect(result.current.form.files).toHaveLength(2);
      expect(result.current.previews).toHaveLength(2);
    });

    it('limits files to MAX_FILES (10)', () => {
      const { result } = renderHook(() => usePhotoUpload(vi.fn()));

      // Create 12 files
      const files = Array.from({ length: 12 }, (_, i) => createMockFile(`photo${i}.jpg`));
      const fileList = {
        length: files.length,
        item: (i: number) => files[i],
        [Symbol.iterator]: function* () { yield* files; },
      } as unknown as FileList;

      // Mock alert
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

      act(() => {
        result.current.handleFilesChange(fileList);
      });

      // Should not add files that exceed limit
      expect(result.current.form.files.length).toBeLessThanOrEqual(10);
      alertSpy.mockRestore();
    });

    it('creates preview URLs for each file', () => {
      const { result } = renderHook(() => usePhotoUpload(vi.fn()));

      const file = createMockFile('photo.jpg');
      const fileList = {
        length: 1,
        item: () => file,
        [Symbol.iterator]: function* () { yield file; },
      } as unknown as FileList;

      act(() => {
        result.current.handleFilesChange(fileList);
      });

      expect(result.current.previews[0].url).toContain('blob:');
      expect(result.current.previews[0].file).toBe(file);
    });
  });

  describe('handleRemoveFile', () => {
    it('removes file at specified index', () => {
      const { result } = renderHook(() => usePhotoUpload(vi.fn()));

      // Add files first
      const files = [createMockFile('photo1.jpg'), createMockFile('photo2.jpg')];
      const fileList = {
        length: files.length,
        item: (i: number) => files[i],
        [Symbol.iterator]: function* () { yield* files; },
      } as unknown as FileList;

      act(() => {
        result.current.handleFilesChange(fileList);
      });

      expect(result.current.form.files).toHaveLength(2);

      // Remove first file
      act(() => {
        result.current.handleRemoveFile(0);
      });

      expect(result.current.form.files).toHaveLength(1);
      expect(result.current.form.files[0].name).toBe('photo2.jpg');
    });
  });

  describe('handleFormChange', () => {
    it('updates category selection', () => {
      const { result } = renderHook(() => usePhotoUpload(vi.fn()));

      act(() => {
        result.current.handleFormChange({
          ...result.current.form,
          categoryIds: [1, 2],
        });
      });

      expect(result.current.form.categoryIds).toEqual([1, 2]);
    });

    it('updates date', () => {
      const { result } = renderHook(() => usePhotoUpload(vi.fn()));

      act(() => {
        result.current.handleFormChange({
          ...result.current.form,
          date: '2024-06-15',
        });
      });

      expect(result.current.form.date).toBe('2024-06-15');
    });
  });

  describe('handleSubmit', () => {
    it('calls uploadPhotos API with correct data', async () => {
      const onUploadComplete = vi.fn();
      mockUploadPhotos.mockResolvedValue({
        message: 'Upload successful',
        uploaded: [],
        errors: [],
        total: 1,
      });

      const { result } = renderHook(() => usePhotoUpload(onUploadComplete));

      // Add a file
      const file = createMockFile('photo1.jpg');
      const fileList = {
        length: 1,
        item: () => file,
        [Symbol.iterator]: function* () { yield file; },
      } as unknown as FileList;

      act(() => {
        result.current.handleFilesChange(fileList);
      });
      
      act(() => {
        result.current.handleFormChange({
          ...result.current.form,
          categoryIds: [1],
          date: '2024-06-15',
        });
      });

      // Submit
      await act(async () => {
        await result.current.handleSubmit({ preventDefault: vi.fn() } as unknown as React.FormEvent);
      });

      expect(mockUploadPhotos).toHaveBeenCalledWith(
        [file],
        expect.objectContaining({
          categoryIds: [1],
          dateTaken: '2024-06-15',
        })
      );
    });

    it('calls onUploadComplete callback after successful upload', async () => {
      const onUploadComplete = vi.fn();
      mockUploadPhotos.mockResolvedValue({
        message: 'Upload successful',
        uploaded: [],
        errors: [],
        total: 1,
      });

      const { result } = renderHook(() => usePhotoUpload(onUploadComplete));

      // Add a file and category
      const file = createMockFile('photo1.jpg');
      const fileList = {
        length: 1,
        item: () => file,
        [Symbol.iterator]: function* () { yield file; },
      } as unknown as FileList;

      act(() => {
        result.current.handleFilesChange(fileList);
      });
      
      act(() => {
        result.current.handleFormChange({
          ...result.current.form,
          categoryIds: [1],
        });
      });

      await act(async () => {
        await result.current.handleSubmit({ preventDefault: vi.fn() } as unknown as React.FormEvent);
      });

      expect(onUploadComplete).toHaveBeenCalled();
    });

    it('clears form after successful upload', async () => {
      mockUploadPhotos.mockResolvedValue({
        message: 'Upload successful',
        uploaded: [],
        errors: [],
        total: 1,
      });

      const { result } = renderHook(() => usePhotoUpload(vi.fn()));

      // Add a file
      const file = createMockFile('photo1.jpg');
      const fileList = {
        length: 1,
        item: () => file,
        [Symbol.iterator]: function* () { yield file; },
      } as unknown as FileList;

      act(() => {
        result.current.handleFilesChange(fileList);
      });
      
      act(() => {
        result.current.handleFormChange({
          ...result.current.form,
          categoryIds: [1],
        });
      });

      await act(async () => {
        await result.current.handleSubmit({ preventDefault: vi.fn() } as unknown as React.FormEvent);
      });

      expect(result.current.form.files).toEqual([]);
      expect(result.current.previews).toEqual([]);
    });

    it('sets isSubmitting while upload is in progress', async () => {
      let resolveUpload: () => void;
      mockUploadPhotos.mockImplementation(() => new Promise((resolve) => {
        resolveUpload = () => resolve({ message: 'Upload successful', uploaded: [], errors: [], total: 0 });
      }));

      const { result } = renderHook(() => usePhotoUpload(vi.fn()));

      // Add a file
      const file = createMockFile('photo1.jpg');
      const fileList = {
        length: 1,
        item: () => file,
        [Symbol.iterator]: function* () { yield file; },
      } as unknown as FileList;

      act(() => {
        result.current.handleFilesChange(fileList);
      });
      
      act(() => {
        result.current.handleFormChange({
          ...result.current.form,
          categoryIds: [1],
        });
      });

      // Start submit - use async act since handleSubmit is async
      const submitPromise = act(async () => {
        result.current.handleSubmit({ preventDefault: vi.fn() } as unknown as React.FormEvent);
        // Allow promise to start
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      await submitPromise;
      expect(result.current.isSubmitting).toBe(true);

      // Complete upload
      await act(async () => {
        resolveUpload!();
      });

      expect(result.current.isSubmitting).toBe(false);
    });
  });

  describe('validation', () => {
    it('sets error when no files selected', async () => {
      const { result } = renderHook(() => usePhotoUpload(vi.fn()));

      act(() => {
        result.current.handleFormChange({
          ...result.current.form,
          categoryIds: [1],
        });
      });

      await act(async () => {
        await result.current.handleSubmit({ preventDefault: vi.fn() } as unknown as React.FormEvent);
      });

      expect(result.current.errors.files).toBeDefined();
    });

    it('sets error when no category selected', async () => {
      const { result } = renderHook(() => usePhotoUpload(vi.fn()));

      // Add a file but no category
      const file = createMockFile('photo1.jpg');
      const fileList = {
        length: 1,
        item: () => file,
        [Symbol.iterator]: function* () { yield file; },
      } as unknown as FileList;

      act(() => {
        result.current.handleFilesChange(fileList);
      });

      await act(async () => {
        await result.current.handleSubmit({ preventDefault: vi.fn() } as unknown as React.FormEvent);
      });

      expect(result.current.errors.categoryIds).toBeDefined();
    });
  });

  describe('clearForm', () => {
    it('resets all form state', () => {
      const { result } = renderHook(() => usePhotoUpload(vi.fn()));

      // Add files and selections
      const file = createMockFile('photo1.jpg');
      const fileList = {
        length: 1,
        item: () => file,
        [Symbol.iterator]: function* () { yield file; },
      } as unknown as FileList;

      act(() => {
        result.current.handleFilesChange(fileList);
      });
      
      act(() => {
        result.current.handleFormChange({
          ...result.current.form,
          categoryIds: [1, 2],
        });
      });

      expect(result.current.form.files).toHaveLength(1);

      act(() => {
        result.current.clearForm();
      });

      expect(result.current.form.files).toEqual([]);
      expect(result.current.form.categoryIds).toEqual([]);
      expect(result.current.previews).toEqual([]);
    });
  });
});
