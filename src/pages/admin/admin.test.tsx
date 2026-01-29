import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

// Mock dependencies
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { id: 1, email: "admin@test.com" } }),
}));

vi.mock("@/stores/blog-store", () => ({
  useBlog: () => ({
    posts: [],
    addPost: vi.fn(),
    fetchPosts: vi.fn(),
  }),
}));

vi.mock("@/hooks/useConfirm", () => ({
  useConfirm: () => vi.fn().mockResolvedValue(true),
}));

vi.mock("@/components/layout/navbar", () => ({
  Navbar: () => <nav data-testid="navbar">Navbar</nav>,
}));

// Import after mocks
import { AdminPage } from "./admin";

describe("AdminPage", () => {
  it("should NOT have Photo Gallery tab", () => {
    render(<AdminPage />);

    // The photos tab should not exist
    const photosTab = screen.queryByRole("button", { name: /photo gallery/i });
    expect(photosTab).not.toBeInTheDocument();
  });

  it("should have Post Management, User Management, and Create Post tabs", () => {
    render(<AdminPage />);

    expect(
      screen.getByRole("button", { name: /post management/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /user management/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /create post/i })
    ).toBeInTheDocument();
  });

  it("should NOT render PhotoGallery component", () => {
    render(<AdminPage />);

    // PhotoGallery has a card titled "Manage Photos" - should not exist
    expect(screen.queryByText("Manage Photos")).not.toBeInTheDocument();
  });
});
