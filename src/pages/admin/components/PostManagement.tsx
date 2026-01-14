import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  FileText,
  Plus,
  Search,
  Calendar,
  Tag,
  Clock,
  Edit,
  Trash2,
} from "lucide-react";
import type { BlogPost } from "@/types/blog";

interface PostManagementProps {
  posts: BlogPost[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onCreateNew: () => void;
  onEdit: (postId: string) => void;
  onDelete: (postId: string) => void;
  deletingPostId: string | null;
}

export function PostManagement({
  posts,
  searchQuery,
  onSearchChange,
  onCreateNew,
  onEdit,
  onDelete,
  deletingPostId,
}: PostManagementProps): React.ReactElement {
  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-accent" />
          Post Management
        </CardTitle>
        <CardDescription>View, edit, and manage all blog posts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button onClick={onCreateNew} className="cursor-pointer">
              <Plus className="w-4 h-4 mr-2" />
              Create New Post
            </Button>
          </div>

          {filteredPosts.length === 0 ? (
            <EmptyPostsState hasSearchQuery={!!searchQuery} />
          ) : (
            <PostList
              posts={filteredPosts}
              onEdit={onEdit}
              onDelete={onDelete}
              deletingPostId={deletingPostId}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyPostsState({
  hasSearchQuery,
}: {
  hasSearchQuery: boolean;
}): React.ReactElement {
  return (
    <div className="text-center py-12 text-muted-foreground">
      <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
      <p>{hasSearchQuery ? "No posts found" : "No posts yet"}</p>
      <p className="text-sm mt-2">
        {hasSearchQuery
          ? "Try a different search term"
          : "Create your first post to get started"}
      </p>
    </div>
  );
}

interface PostListProps {
  posts: BlogPost[];
  onEdit: (postId: string) => void;
  onDelete: (postId: string) => void;
  deletingPostId: string | null;
}

function PostList({
  posts,
  onEdit,
  onDelete,
  deletingPostId,
}: PostListProps): React.ReactElement {
  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <Card key={post.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-3">
                  {post.image && (
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">
                      {post.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {post.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.readTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {post.tags.length} tags
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(post.id)}
                  className="cursor-pointer"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(post.id)}
                  disabled={deletingPostId === post.id}
                  className="cursor-pointer text-destructive hover:text-destructive"
                >
                  {deletingPostId === post.id ? (
                    <Clock className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
