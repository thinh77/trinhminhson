import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PhotoComments } from './PhotoComments';
import type { Comment } from '@/services/comments.service';

// Mock the services
vi.mock('@/services/comments.service', () => ({
  getCommentsByPhoto: vi.fn(),
  addComment: vi.fn(),
  deleteComment: vi.fn(),
  updateComment: vi.fn(),
  toggleReaction: vi.fn(),
  toggleVote: vi.fn(),
  getVotesForComments: vi.fn(),
  ALLOWED_REACTIONS: ['like', 'love', 'haha'],
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({ user: null })),
}));

vi.mock('@/services/api', () => ({
  STATIC_BASE_URL: 'http://localhost:3000',
}));

// Import the mocked modules
import { getCommentsByPhoto, getVotesForComments, deleteComment } from '@/services/comments.service';
import { useAuth } from '@/contexts/AuthContext';

const mockGetCommentsByPhoto = vi.mocked(getCommentsByPhoto);
const mockGetVotesForComments = vi.mocked(getVotesForComments);
const mockDeleteComment = vi.mocked(deleteComment);
const mockUseAuth = vi.mocked(useAuth);

describe('PhotoComments - Guest Name Display', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetVotesForComments.mockResolvedValue({});
    mockUseAuth.mockReturnValue({ user: null } as ReturnType<typeof useAuth>);
  });

  describe('Guest comment display names', () => {
    it('displays " (Guest)" for guest comments with default "Guest" name', async () => {
      const mockComments: Comment[] = [
        {
          id: 1,
          photoId: 1,
          authorName: 'Guest',
          content: 'Test comment from default guest',
          isAnonymous: false,
          isGuest: true,
          createdAt: new Date().toISOString(),
        },
      ];

      mockGetCommentsByPhoto.mockResolvedValue(mockComments);

      render(<PhotoComments photoId={1} />);

      // Wait for loading to complete
      await screen.findByText('Test comment from default guest');

      // The display name should be " (Guest)" - check for the (Guest) part
      const authorElement = screen.getByText(/\(Guest\)/);
      expect(authorElement).toBeInTheDocument();

      // Should NOT display "Guest (Guest)" - just " (Guest)"
      expect(screen.queryByText('Guest (Guest)')).not.toBeInTheDocument();
    });

    it('displays "{name} (Guest)" for guest comments with custom name', async () => {
      const mockComments: Comment[] = [
        {
          id: 1,
          photoId: 1,
          authorName: 'John',
          content: 'Test comment from John',
          isAnonymous: false,
          isGuest: true,
          createdAt: new Date().toISOString(),
        },
      ];

      mockGetCommentsByPhoto.mockResolvedValue(mockComments);

      render(<PhotoComments photoId={1} />);

      // Wait for loading to complete
      await screen.findByText('Test comment from John');

      // The display name should be "John (Guest)"
      expect(screen.getByText('John (Guest)')).toBeInTheDocument();
    });

    it('displays authenticated user name without (Guest) suffix', async () => {
      const mockComments: Comment[] = [
        {
          id: 1,
          photoId: 1,
          authorName: 'AuthenticatedUser',
          content: 'Test comment from authenticated user',
          isAnonymous: false,
          isGuest: false,
          createdAt: new Date().toISOString(),
        },
      ];

      mockGetCommentsByPhoto.mockResolvedValue(mockComments);

      render(<PhotoComments photoId={1} />);

      // Wait for loading to complete
      await screen.findByText('Test comment from authenticated user');

      // Should display the name without (Guest) suffix
      expect(screen.getByText('AuthenticatedUser')).toBeInTheDocument();

      // Should NOT have (Guest) in the display
      const authorElements = screen.getAllByText(/AuthenticatedUser/);
      authorElements.forEach((el) => {
        expect(el.textContent).not.toContain('(Guest)');
      });
    });

    it('handles guest replies with custom names correctly', async () => {
      const mockComments: Comment[] = [
        {
          id: 1,
          photoId: 1,
          authorName: 'ParentAuthor',
          content: 'Parent comment',
          isAnonymous: false,
          isGuest: false,
          createdAt: new Date().toISOString(),
          replies: [
            {
              id: 2,
              photoId: 1,
              parentId: 1,
              authorName: 'Alice',
              content: 'Reply from Alice',
              isAnonymous: false,
              isGuest: true,
              createdAt: new Date().toISOString(),
            },
          ],
        },
      ];

      mockGetCommentsByPhoto.mockResolvedValue(mockComments);

      render(<PhotoComments photoId={1} />);

      // Wait for loading to complete
      await screen.findByText('Parent comment');

      // The reply should display "Alice (Guest)"
      expect(screen.getByText('Alice (Guest)')).toBeInTheDocument();
    });

    it('handles guest replies with default Guest name correctly', async () => {
      const mockComments: Comment[] = [
        {
          id: 1,
          photoId: 1,
          authorName: 'ParentAuthor',
          content: 'Parent comment',
          isAnonymous: false,
          isGuest: false,
          createdAt: new Date().toISOString(),
          replies: [
            {
              id: 2,
              photoId: 1,
              parentId: 1,
              authorName: 'Guest',
              content: 'Reply from default guest',
              isAnonymous: false,
              isGuest: true,
              createdAt: new Date().toISOString(),
            },
          ],
        },
      ];

      mockGetCommentsByPhoto.mockResolvedValue(mockComments);

      render(<PhotoComments photoId={1} />);

      // Wait for loading to complete
      await screen.findByText('Reply from default guest');

      // Should NOT display "Guest (Guest)"
      expect(screen.queryByText('Guest (Guest)')).not.toBeInTheDocument();
    });
  });
});

describe('PhotoComments - Guest Comment Deletion', () => {
  // Mock localStorage
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  };
  Object.defineProperty(window, 'localStorage', { value: localStorageMock });

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetVotesForComments.mockResolvedValue({});
    mockUseAuth.mockReturnValue({ user: null } as ReturnType<typeof useAuth>);
    mockDeleteComment.mockResolvedValue(undefined);
    localStorageMock.getItem.mockReturnValue(null);
    // Mock window.confirm
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  describe('canDeleteComment for guest users', () => {
    it('shows delete button for guest comment with valid token within 7 days', async () => {
      // Store guest token in localStorage
      const guestTokens = { 1: 'valid-guest-token-123' };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(guestTokens));

      const mockComments: Comment[] = [
        {
          id: 1,
          photoId: 1,
          authorName: 'TestGuest',
          content: 'Guest comment to delete',
          isAnonymous: false,
          isGuest: true,
          createdAt: new Date().toISOString(), // Just created
          isOwner: false, // Backend marks as not owner for guest
        },
      ];

      mockGetCommentsByPhoto.mockResolvedValue(mockComments);

      render(<PhotoComments photoId={1} />);

      // Wait for loading to complete
      await screen.findByText('Guest comment to delete');

      // Hover to reveal delete button - it should be visible for guest with token
      const deleteButton = screen.queryByRole('button', { name: /delete/i });
      expect(deleteButton).toBeInTheDocument();
    });

    it('hides delete button for guest comment without token', async () => {
      // No guest token stored
      localStorageMock.getItem.mockReturnValue(JSON.stringify({}));

      const mockComments: Comment[] = [
        {
          id: 1,
          photoId: 1,
          authorName: 'OtherGuest',
          content: 'Other guest comment',
          isAnonymous: false,
          isGuest: true,
          createdAt: new Date().toISOString(),
          isOwner: false,
        },
      ];

      mockGetCommentsByPhoto.mockResolvedValue(mockComments);

      render(<PhotoComments photoId={1} />);

      // Wait for loading to complete
      await screen.findByText('Other guest comment');

      // Delete button should NOT be visible for guest without token
      const deleteButton = screen.queryByRole('button', { name: /delete/i });
      expect(deleteButton).not.toBeInTheDocument();
    });

    it('hides delete button for guest comment after 7 days', async () => {
      // Store guest token in localStorage
      const guestTokens = { 1: 'valid-guest-token-123' };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(guestTokens));

      const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);
      const mockComments: Comment[] = [
        {
          id: 1,
          photoId: 1,
          authorName: 'TestGuest',
          content: 'Old guest comment',
          isAnonymous: false,
          isGuest: true,
          createdAt: eightDaysAgo.toISOString(),
          isOwner: false,
        },
      ];

      mockGetCommentsByPhoto.mockResolvedValue(mockComments);

      render(<PhotoComments photoId={1} />);

      // Wait for loading to complete
      await screen.findByText('Old guest comment');

      // Delete button should NOT be visible after 7 days
      const deleteButton = screen.queryByRole('button', { name: /delete/i });
      expect(deleteButton).not.toBeInTheDocument();
    });

    it('shows delete button for admin on any comment', async () => {
      // Admin user
      mockUseAuth.mockReturnValue({
        user: { id: 999, role: 'admin', name: 'Admin' }
      } as ReturnType<typeof useAuth>);

      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const mockComments: Comment[] = [
        {
          id: 1,
          photoId: 1,
          authorName: 'AnyGuest',
          content: 'Very old guest comment',
          isAnonymous: false,
          isGuest: true,
          createdAt: thirtyDaysAgo.toISOString(),
          isOwner: false,
        },
      ];

      mockGetCommentsByPhoto.mockResolvedValue(mockComments);

      render(<PhotoComments photoId={1} />);

      // Wait for loading to complete
      await screen.findByText('Very old guest comment');

      // Admin should always see delete button
      const deleteButton = screen.queryByRole('button', { name: /delete/i });
      expect(deleteButton).toBeInTheDocument();
    });
  });

  describe('handleDelete passes guestToken for guest comments', () => {
    it('calls deleteComment with guestToken for guest comment', async () => {
      // Store guest token in localStorage
      const guestTokens = { 1: 'valid-guest-token-123' };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(guestTokens));

      const mockComments: Comment[] = [
        {
          id: 1,
          photoId: 1,
          authorName: 'TestGuest',
          content: 'Guest comment to delete',
          isAnonymous: false,
          isGuest: true,
          createdAt: new Date().toISOString(),
          isOwner: false,
        },
      ];

      mockGetCommentsByPhoto.mockResolvedValue(mockComments);

      render(<PhotoComments photoId={1} />);

      // Wait for loading to complete
      await screen.findByText('Guest comment to delete');

      // Find and click delete button
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      fireEvent.click(deleteButton);

      // Verify deleteComment was called with guestToken
      await waitFor(() => {
        expect(mockDeleteComment).toHaveBeenCalledWith(1, 1, 'valid-guest-token-123');
      });
    });

    it('calls deleteComment without guestToken for authenticated user comment', async () => {
      // Authenticated user
      mockUseAuth.mockReturnValue({
        user: { id: 10, role: 'user', name: 'TestUser' }
      } as ReturnType<typeof useAuth>);

      const mockComments: Comment[] = [
        {
          id: 1,
          photoId: 1,
          authorName: 'TestUser',
          content: 'User comment to delete',
          isAnonymous: false,
          isGuest: false,
          createdAt: new Date().toISOString(),
          isOwner: true,
        },
      ];

      mockGetCommentsByPhoto.mockResolvedValue(mockComments);

      render(<PhotoComments photoId={1} />);

      // Wait for loading to complete
      await screen.findByText('User comment to delete');

      // Find and click delete button
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      fireEvent.click(deleteButton);

      // Verify deleteComment was called without guestToken
      await waitFor(() => {
        expect(mockDeleteComment).toHaveBeenCalledWith(1, 1, undefined);
      });
    });
  });
});
