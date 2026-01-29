import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AdminToolbar } from './AdminToolbar';

describe('AdminToolbar', () => {
  const defaultProps = {
    onUploadClick: vi.fn(),
    onCategoryClick: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders upload button', () => {
      render(<AdminToolbar {...defaultProps} />);

      expect(screen.getByRole('button', { name: /upload/i })).toBeInTheDocument();
    });

    it('renders category management button', () => {
      render(<AdminToolbar {...defaultProps} />);

      expect(screen.getByRole('button', { name: /categories/i })).toBeInTheDocument();
    });

    it('renders as a compact horizontal toolbar', () => {
      render(<AdminToolbar {...defaultProps} />);

      const toolbar = screen.getByRole('toolbar');
      expect(toolbar).toBeInTheDocument();
      expect(toolbar).toHaveClass('flex');
    });
  });

  describe('interactions', () => {
    it('calls onUploadClick when upload button is clicked', () => {
      render(<AdminToolbar {...defaultProps} />);

      fireEvent.click(screen.getByRole('button', { name: /upload/i }));

      expect(defaultProps.onUploadClick).toHaveBeenCalledTimes(1);
    });

    it('calls onCategoryClick when category button is clicked', () => {
      render(<AdminToolbar {...defaultProps} />);

      fireEvent.click(screen.getByRole('button', { name: /categories/i }));

      expect(defaultProps.onCategoryClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('accessibility', () => {
    it('has accessible names for all buttons', () => {
      render(<AdminToolbar {...defaultProps} />);

      const uploadButton = screen.getByRole('button', { name: /upload/i });
      const categoryButton = screen.getByRole('button', { name: /categories/i });

      expect(uploadButton).toHaveAccessibleName();
      expect(categoryButton).toHaveAccessibleName();
    });

    it('buttons are focusable', () => {
      render(<AdminToolbar {...defaultProps} />);

      const uploadButton = screen.getByRole('button', { name: /upload/i });
      uploadButton.focus();
      expect(document.activeElement).toBe(uploadButton);
    });
  });
});
