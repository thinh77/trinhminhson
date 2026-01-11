import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getCommentsByPhoto,
  addComment,
  deleteComment,
  type Comment,
} from "@/services/comments.service";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Trash2,
  Shield,
  Loader2,
  Send,
  MessageCircle,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { STATIC_BASE_URL } from "@/services/api";

interface PhotoCommentsProps {
  photoId: number;
}

// Format relative time like Facebook
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;

  return date.toLocaleDateString("vi-VN", { day: "numeric", month: "short" });
}

export function PhotoComments({ photoId }: PhotoCommentsProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [content, setContent] = useState("");
  const [guestName, setGuestName] = useState("Guest");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showGuestInput, setShowGuestInput] = useState(false);

  useEffect(() => {
    loadComments();
  }, [photoId]);

  const loadComments = async () => {
    try {
      setIsLoading(true);
      const data = await getCommentsByPhoto(photoId);
      setComments(data);
      setError(null);
    } catch (err) {
      console.error("Failed to load comments:", err);
      setError("Failed to load comments");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const newComment = await addComment(photoId, {
        content,
        guestName: !user ? guestName : undefined,
        isAnonymous: user ? isAnonymous : undefined,
      });

      setComments([newComment, ...comments]);
      setContent("");
      if (!user) {
        setGuestName("Guest");
        setShowGuestInput(false);
      }
      setIsAnonymous(false);
    } catch (err: any) {
      console.error("Failed to post comment:", err);
      setError(err.message || "Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: number) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      await deleteComment(photoId, commentId);
      setComments(comments.filter((c) => c.id !== commentId));
    } catch (err: any) {
      console.error("Failed to delete comment:", err);
      alert(err.message || "Failed to delete comment");
    }
  };

  const isAdmin = user?.role === "admin";

  return (
    <div className="flex flex-col h-full">
      {/* Comments List - Facebook Style */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-[#b0b3b8]" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="w-10 h-10 text-[#3e4042] mx-auto mb-2" />
            <p className="text-[#b0b3b8] text-[13px]">
              Be the first to comment.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {comments.map((comment) => (
              <div key={comment.id} className="group flex gap-2">
                {/* Avatar */}
                <Avatar className="w-8 h-8 flex-shrink-0">
                  {comment.authorAvatar ? (
                    <AvatarImage
                      src={`${STATIC_BASE_URL}${comment.authorAvatar}`}
                    />
                  ) : (
                    <AvatarFallback className="bg-[#3a3b3c] text-[#e4e6eb] text-xs">
                      {comment.authorName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>

                <div className="flex-1 min-w-0">
                  {/* Comment bubble */}
                  <div className="inline-block bg-[#3a3b3c] rounded-2xl px-3 py-2 max-w-full">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[13px] font-semibold text-[#e4e6eb]">
                        {comment.authorName}
                      </span>
                      {comment.isAnonymous && isAdmin && comment.realAuthor && (
                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400 text-[10px]">
                          <Shield className="w-3 h-3" />
                          <span>{comment.realAuthor.name}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-[15px] text-[#e4e6eb] whitespace-pre-wrap break-words leading-snug">
                      {comment.content}
                    </p>
                  </div>

                  {/* Actions row - Facebook style */}
                  <div className="flex items-center gap-3 mt-1 ml-3">
                    <button className="text-[12px] font-semibold text-[#b0b3b8] hover:underline cursor-pointer">
                      Like
                    </button>
                    <button className="text-[12px] font-semibold text-[#b0b3b8] hover:underline cursor-pointer">
                      Reply
                    </button>
                    <span className="text-[12px] text-[#b0b3b8]">
                      {formatRelativeTime(new Date(comment.createdAt))}
                    </span>

                    {/* Delete Button (Owner or Admin) */}
                    {(isAdmin ||
                      (user &&
                        !comment.isGuest &&
                        !comment.isAnonymous &&
                        comment.authorName === user.name)) && (
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="text-[#b0b3b8] hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                        title="Delete comment"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* More options */}
                <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 self-center cursor-pointer">
                  <MoreHorizontal className="w-4 h-4 text-[#b0b3b8]" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Comment Input - Facebook Style (Fixed at bottom) */}
      <div className="border-t border-[#3e4042] p-3 bg-[#242526] flex-shrink-0">
        {/* Guest name input */}
        {!user && showGuestInput && (
          <div className="mb-2">
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Your name"
              className="w-full px-3 py-2 rounded-lg bg-[#3a3b3c] border-none text-[#e4e6eb] text-[13px] placeholder:text-[#b0b3b8] focus:outline-none focus:ring-1 focus:ring-[#2d88ff]"
            />
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex items-start gap-2">
          {/* User avatar */}
          <Avatar className="w-8 h-8 flex-shrink-0">
            {user?.avatar ? (
              <AvatarImage src={`${STATIC_BASE_URL}${user.avatar}`} />
            ) : null}
            <AvatarFallback
              className={
                user
                  ? "bg-[#2d88ff] text-white text-xs"
                  : "bg-[#3a3b3c] text-[#e4e6eb] text-xs"
              }
            >
              {user ? user.name?.charAt(0).toUpperCase() || "U" : "G"}
            </AvatarFallback>
          </Avatar>

          {/* Input area */}
          <div className="flex-1 relative">
            <div className="flex items-center bg-[#3a3b3c] rounded-full overflow-hidden pr-2">
              <input
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onFocus={() => !user && setShowGuestInput(true)}
                placeholder={
                  user ? "Write a comment..." : "Write a comment as guest..."
                }
                className="flex-1 px-4 py-2 bg-transparent border-none text-[#e4e6eb] text-[15px] placeholder:text-[#b0b3b8] focus:outline-none"
              />

              {/* Send button */}
              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  !content.trim() ||
                  (!user && !guestName.trim())
                }
                className={cn(
                  "p-2 rounded-full transition-colors cursor-pointer",
                  content.trim()
                    ? "text-[#2d88ff] hover:bg-[#2d88ff]/10"
                    : "text-[#65676b]"
                )}
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Anonymous option for logged in users */}
            {user && (
              <div className="flex items-center gap-2 mt-2 ml-4">
                <input
                  type="checkbox"
                  id="anonymous-fb"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-[#3e4042] bg-[#3a3b3c] text-[#2d88ff] focus:ring-[#2d88ff] cursor-pointer"
                />
                <label
                  htmlFor="anonymous-fb"
                  className="text-[12px] text-[#b0b3b8] cursor-pointer select-none"
                >
                  Post anonymously
                </label>
              </div>
            )}

            {error && (
              <p className="text-red-400 text-[12px] mt-2 ml-4">{error}</p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
