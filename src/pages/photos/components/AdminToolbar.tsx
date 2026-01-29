import { Button } from "@/components/ui/button";
import { Upload, FolderTree } from "lucide-react";

interface AdminToolbarProps {
  onUploadClick: () => void;
  onCategoryClick: () => void;
}

export function AdminToolbar({
  onUploadClick,
  onCategoryClick,
}: AdminToolbarProps): React.ReactElement {
  return (
    <div
      role="toolbar"
      aria-label="Admin actions"
      className="flex items-center gap-2 p-2 bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg"
    >
      <Button
        variant="outline"
        size="sm"
        onClick={onUploadClick}
        className="cursor-pointer"
        aria-label="Upload photos"
      >
        <Upload className="w-4 h-4 mr-2" />
        Upload
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onCategoryClick}
        className="cursor-pointer"
        aria-label="Manage categories"
      >
        <FolderTree className="w-4 h-4 mr-2" />
        Categories
      </Button>
    </div>
  );
}
