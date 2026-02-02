import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PaginationState } from "../hooks/usePaginatedPhotos";

interface PaginationProps {
  pagination: PaginationState;
  onPageChange: (page: number) => void;
  onNextPage: () => void;
  onPrevPage: () => void;
  isLoading?: boolean;
}

export function Pagination({
  pagination,
  onPageChange,
  onNextPage,
  onPrevPage,
  isLoading = false,
}: PaginationProps): React.ReactElement | null {
  const { currentPage, totalPages, totalPhotos, hasNextPage, hasPrevPage } = pagination;

  // Don't render if only one page
  if (totalPages <= 1) {
    return (
      <div className="flex justify-center py-4">
        <span className="text-sm text-muted-foreground">
          {totalPhotos} photos
        </span>
      </div>
    );
  }

  // Generate page numbers to display
  const getPageNumbers = (): (number | "ellipsis")[] => {
    const pages: (number | "ellipsis")[] = [];
    const showEllipsis = totalPages > 7;

    if (!showEllipsis) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push("ellipsis");
      }

      // Show pages around current
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("ellipsis");
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col items-center gap-4 py-6">
      {/* Photo count */}
      <span className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages} ({totalPhotos} photos)
      </span>

      {/* Navigation */}
      <div className="flex items-center gap-2">
        {/* Previous button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevPage}
          disabled={!hasPrevPage || isLoading}
          aria-label="Previous page"
          className="cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </Button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((page, index) =>
            page === "ellipsis" ? (
              <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
                ...
              </span>
            ) : (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(page)}
                disabled={isLoading}
                aria-label={`Go to page ${page}`}
                aria-current={currentPage === page ? "page" : undefined}
                className={cn(
                  "w-9 h-9 p-0 cursor-pointer",
                  currentPage === page && "pointer-events-none"
                )}
              >
                {page}
              </Button>
            )
          )}
        </div>

        {/* Next button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onNextPage}
          disabled={!hasNextPage || isLoading}
          aria-label="Next page"
          className="cursor-pointer"
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
