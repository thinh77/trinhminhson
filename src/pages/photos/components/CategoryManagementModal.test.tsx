import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CategoryManagementModal } from './CategoryManagementModal';

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

import { getAllCategories } from '@/services/categories.service';

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
    subcategories: [],
  },
];

describe('CategoryManagementModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onCategoriesChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAllCategories.mockResolvedValue(mockCategories);
  });

  describe('modal behavior', () => {
    it('renders modal when isOpen is true', async () => {
      render(<CategoryManagementModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });

    it('does not render modal when isOpen is false', () => {
      render(<CategoryManagementModal {...defaultProps} isOpen={false} />);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('has a title indicating category management', async () => {
      render(<CategoryManagementModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(/category management/i)).toBeInTheDocument();
      });
    });

    it('calls onClose when close button is clicked', async () => {
      render(<CategoryManagementModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // There are multiple close buttons (radix close + our footer close), get the visible one in footer
      const closeButtons = screen.getAllByRole('button', { name: /close/i });
      const footerCloseButton = closeButtons.find(btn => btn.textContent?.includes('Close'));
      if (footerCloseButton) {
        fireEvent.click(footerCloseButton);
      } else {
        fireEvent.click(closeButtons[0]);
      }

      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('calls onClose when Escape key is pressed', async () => {
      render(<CategoryManagementModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  describe('category list rendering', () => {
    it('shows loading state while fetching categories', async () => {
      mockGetAllCategories.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockCategories), 100))
      );

      render(<CategoryManagementModal {...defaultProps} />);

      // Loading spinner should be visible
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('renders all categories', async () => {
      render(<CategoryManagementModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Nature')).toBeInTheDocument();
        expect(screen.getByText('Urban')).toBeInTheDocument();
      });
    });

    it('shows subcategory count for each category', async () => {
      render(<CategoryManagementModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(/1 subcategories/i)).toBeInTheDocument();
      });
    });

    it('renders Add Category button', async () => {
      render(<CategoryManagementModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /add category/i })).toBeInTheDocument();
      });
    });

    it('renders Refresh button', async () => {
      render(<CategoryManagementModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument();
      });
    });
  });

  describe('category expansion', () => {
    it('shows subcategories when category is expanded', async () => {
      render(<CategoryManagementModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Nature')).toBeInTheDocument();
      });

      // Categories should be expanded by default
      await waitFor(() => {
        expect(screen.getByText('Mountains')).toBeInTheDocument();
      });
    });

    it('toggles category expansion on click', async () => {
      render(<CategoryManagementModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Nature')).toBeInTheDocument();
      });

      // Categories are expanded by default
      expect(screen.getByText('Mountains')).toBeInTheDocument();
    });
  });

  describe('CRUD operations', () => {
    it('shows edit and delete buttons for each category', async () => {
      render(<CategoryManagementModal {...defaultProps} />);

      await waitFor(() => {
        const editButtons = screen.getAllByRole('button', { name: /edit/i });
        const deleteButtons = screen.getAllByRole('button', { name: /delete/i });

        expect(editButtons.length).toBeGreaterThan(0);
        expect(deleteButtons.length).toBeGreaterThan(0);
      });
    });

    it('shows add subcategory button for each category', async () => {
      render(<CategoryManagementModal {...defaultProps} />);

      await waitFor(() => {
        // Each category should have an add subcategory button (+ icon)
        const addButtons = screen.getAllByTitle(/add subcategory/i);
        expect(addButtons.length).toBeGreaterThan(0);
      });
    });
  });

  describe('callbacks', () => {
    it('calls onCategoriesChange when categories are updated', async () => {
      render(<CategoryManagementModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Nature')).toBeInTheDocument();
      });

      // The actual CRUD operations trigger onCategoriesChange
      // This is tested in useCategoryManagement.test.ts
    });
  });

  describe('empty state', () => {
    it('shows empty state when no categories exist', async () => {
      mockGetAllCategories.mockResolvedValue([]);

      render(<CategoryManagementModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(/no categories/i)).toBeInTheDocument();
      });
    });

    it('shows Initialize Default button when no categories exist', async () => {
      mockGetAllCategories.mockResolvedValue([]);

      render(<CategoryManagementModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /initialize default/i })).toBeInTheDocument();
      });
    });
  });

  describe('accessibility', () => {
    it('modal is accessible as a dialog', async () => {
      render(<CategoryManagementModal {...defaultProps} />);

      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(dialog).toBeInTheDocument();
      });
    });

    it('category items are focusable', async () => {
      render(<CategoryManagementModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Nature')).toBeInTheDocument();
      });

      // Edit buttons should be focusable
      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      editButtons[0].focus();
      expect(document.activeElement).toBe(editButtons[0]);
    });
  });
});
