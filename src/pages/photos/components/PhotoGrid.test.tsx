import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PhotoGrid } from './PhotoGrid';
import type { Photo } from '../types';

// Mock IntersectionObserver
class MockIntersectionObserver {
  callback: IntersectionObserverCallback;
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn().mockReturnValue([]);
  root = null;
  rootMargin = '';
  thresholds = [0];

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }
}
window.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;

// Mock useAuth
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({ user: null })),
}));

import { useAuth } from '@/contexts/AuthContext';
const mockUseAuth = vi.mocked(useAuth);

const createMockPhoto = (id: string, title: string): Photo => ({
  id,
  src: `/photos/thumb/${id}.webp`,
  srcLarge: `/photos/large/${id}.webp`,
  srcOriginal: `/photos/original/${id}.jpg`,
  alt: title,
  title,
  date: '2024-01-15',
  location: 'Test Location',
  categories: ['Nature'],
  subcategories: ['Mountains'],
  aspectRatio: 'landscape',
});

describe('PhotoGrid - Admin Features', () => {
  const mockPhotos: Photo[] = [
    createMockPhoto('1', 'Mountain Sunset'),
    createMockPhoto('2', 'Ocean Wave'),
    createMockPhoto('3', 'Forest Path'),
  ];

  const defaultProps = {
    photos: mockPhotos,
    isLoaded: true,
    loadedImages: new Set<string>(['1', '2', '3']),
    onImageLoad: vi.fn(),
    onPhotoSelect: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: null } as ReturnType<typeof useAuth>);
  });

  describe('when user is NOT admin', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({ user: null } as ReturnType<typeof useAuth>);
    });

    it('does NOT show edit buttons on photo cards', () => {
      render(<PhotoGrid {...defaultProps} />);

      const editButtons = screen.queryAllByRole('button', { name: /edit/i });
      expect(editButtons).toHaveLength(0);
    });

    it('does NOT show delete buttons on photo cards', () => {
      render(<PhotoGrid {...defaultProps} />);

      const deleteButtons = screen.queryAllByRole('button', { name: /delete/i });
      expect(deleteButtons).toHaveLength(0);
    });

    it('does NOT show drag handles on photo cards', () => {
      render(<PhotoGrid {...defaultProps} />);

      const dragHandles = screen.queryAllByTestId('drag-handle');
      expect(dragHandles).toHaveLength(0);
    });

    it('photos are NOT draggable', () => {
      render(<PhotoGrid {...defaultProps} />);

      const photoCards = screen.getAllByRole('button', { name: /view/i });
      photoCards.forEach((card) => {
        expect(card).not.toHaveAttribute('draggable', 'true');
      });
    });
  });

  describe('when user IS admin', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: { id: 1, name: 'Admin', email: 'admin@test.com', role: 'admin' },
      } as ReturnType<typeof useAuth>);
    });

    it('shows edit button on each photo card', () => {
      const onEdit = vi.fn();
      render(<PhotoGrid {...defaultProps} isAdmin onEdit={onEdit} />);

      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      expect(editButtons).toHaveLength(mockPhotos.length);
    });

    it('shows delete button on each photo card', () => {
      const onDelete = vi.fn();
      render(<PhotoGrid {...defaultProps} isAdmin onDelete={onDelete} />);

      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      expect(deleteButtons).toHaveLength(mockPhotos.length);
    });

    it('edit button calls onEdit with the photo', () => {
      const onEdit = vi.fn();
      render(<PhotoGrid {...defaultProps} isAdmin onEdit={onEdit} />);

      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      fireEvent.click(editButtons[0]);

      expect(onEdit).toHaveBeenCalledTimes(1);
      expect(onEdit).toHaveBeenCalledWith(mockPhotos[0]);
    });

    it('delete button calls onDelete with the photo id', () => {
      const onDelete = vi.fn();
      render(<PhotoGrid {...defaultProps} isAdmin onDelete={onDelete} />);

      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      fireEvent.click(deleteButtons[1]);

      expect(onDelete).toHaveBeenCalledTimes(1);
      expect(onDelete).toHaveBeenCalledWith('2');
    });

    it('shows drag handle on each photo card', () => {
      render(<PhotoGrid {...defaultProps} isAdmin isDragEnabled />);

      const dragHandles = screen.getAllByTestId('drag-handle');
      expect(dragHandles).toHaveLength(mockPhotos.length);
    });

    it('photos are draggable when isDragEnabled is true', () => {
      render(<PhotoGrid {...defaultProps} isAdmin isDragEnabled />);

      const photoCards = screen.getAllByTestId('photo-card');
      photoCards.forEach((card) => {
        expect(card).toHaveAttribute('draggable', 'true');
      });
    });
  });

  describe('admin controls with deleting state', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: { id: 1, name: 'Admin', email: 'admin@test.com', role: 'admin' },
      } as ReturnType<typeof useAuth>);
    });

    it('shows loading spinner on delete button when photo is being deleted', () => {
      render(
        <PhotoGrid
          {...defaultProps}
          isAdmin
          onDelete={vi.fn()}
          deletingPhotoId="2"
        />
      );

      // The delete button for photo 2 should show a spinner
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      // Find the one that has a spinner (loading indicator)
      const loadingButton = deleteButtons.find((btn) =>
        btn.querySelector('.animate-spin')
      );
      expect(loadingButton).toBeTruthy();
    });

    it('disables delete button for the photo being deleted', () => {
      render(
        <PhotoGrid
          {...defaultProps}
          isAdmin
          onDelete={vi.fn()}
          deletingPhotoId="2"
        />
      );

      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      // Photo index 1 (id='2') should be disabled
      expect(deleteButtons[1]).toBeDisabled();
    });
  });
});

describe('PhotoGrid - Basic Functionality', () => {
  const mockPhotos: Photo[] = [
    createMockPhoto('1', 'Test Photo 1'),
    createMockPhoto('2', 'Test Photo 2'),
  ];

  it('renders all photos', () => {
    render(
      <PhotoGrid
        photos={mockPhotos}
        isLoaded={true}
        loadedImages={new Set()}
        onImageLoad={vi.fn()}
        onPhotoSelect={vi.fn()}
      />
    );

    expect(screen.getByLabelText('View Test Photo 1')).toBeInTheDocument();
    expect(screen.getByLabelText('View Test Photo 2')).toBeInTheDocument();
  });

  it('calls onPhotoSelect when photo is clicked', () => {
    const onPhotoSelect = vi.fn();
    render(
      <PhotoGrid
        photos={mockPhotos}
        isLoaded={true}
        loadedImages={new Set()}
        onImageLoad={vi.fn()}
        onPhotoSelect={onPhotoSelect}
      />
    );

    fireEvent.click(screen.getByLabelText('View Test Photo 1'));
    expect(onPhotoSelect).toHaveBeenCalledWith(mockPhotos[0]);
  });

  it('shows loading indicator when isLoadingMore is true', () => {
    render(
      <PhotoGrid
        photos={mockPhotos}
        isLoaded={true}
        loadedImages={new Set()}
        onImageLoad={vi.fn()}
        onPhotoSelect={vi.fn()}
        hasMore={true}
        isLoadingMore={true}
      />
    );

    expect(screen.getByTestId('loading-more')).toBeInTheDocument();
  });
});
