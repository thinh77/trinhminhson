import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getCommentsByPhoto,
  addComment,
  deleteComment,
  type Comment,
} from "@/services/comments.service";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Trash2, Shield, Loader2, Send, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { STATIC_BASE_URL } from "@/services/api";

interface PhotoCommentsProps {
  photoId: number;
}

// Format relative time
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;

  return date.toLocaleDateString("vi-VN", { day: "numeric", month: "numeric" });
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
      // Silent error for UI cleanliness, or minimal indicator
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
    <div className="flex flex-col h-full bg-white">
      {/* Comments List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 custom-scrollbar space-y-5">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-10 flex flex-col items-center justify-center">
            <div className="bg-gray-100 p-3 rounded-full mb-3">
              <MessageCircle className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm">No comments yet.</p>
            <p className="text-gray-400 text-xs mt-1">Start the conversation.</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="group flex gap-3">
              {/* Avatar */}
              <Avatar className="w-8 h-8 flex-shrink-0">
                {comment.authorAvatar ? (
                  <AvatarImage
                    src={`${STATIC_BASE_URL}${comment.authorAvatar}`}
                    className="object-cover"
                  />
                ) : (
                  <AvatarFallback className="bg-gray-200 text-gray-600 text-xs font-medium">
                    {comment.authorName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-semibold text-gray-900">
                    {comment.authorName}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatRelativeTime(new Date(comment.createdAt))}
                  </span>
                  {comment.isAnonymous && isAdmin && comment.realAuthor && (
                    <span className="flex items-center gap-1 text-[10px] text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded border border-yellow-200">
                      <Shield className="w-3 h-3" />
                      {comment.realAuthor.name}
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-700 mt-0.5 whitespace-pre-wrap leading-normal">
                  {comment.content}
                </p>

                <div className="flex items-center gap-3 mt-1.5">
                  <button className="text-xs font-medium text-gray-500 hover:text-gray-800 transition-colors cursor-pointer">
                    Reply
                  </button>
                  
                  {(isAdmin ||
                    (user &&
                      !comment.isGuest &&
                      !comment.isAnonymous &&
                      comment.authorName === user.name)) && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="text-xs font-medium text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-100 bg-white">
        {!user && showGuestInput && (
          <div className="mb-2 animate-in fade-in slide-in-from-bottom-2">
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Enter your name..."
              className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => !user && setShowGuestInput(true)}
            placeholder={user ? "Add a comment..." : "Add a comment as guest..."}
            className="w-full pl-4 pr-12 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-gray-400"
          />
          
          <button
            type="submit"
            disabled={isSubmitting || !content.trim() || (!user && !guestName.trim())}
            className={cn(
              "absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors cursor-pointer",
              content.trim() 
                ? "text-blue-600 hover:bg-blue-50" 
                : "text-gray-300 cursor-not-allowed"
            )}
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
        
        {user && (
           <div className="flex items-center gap-2 mt-2">
             <label className="flex items-center gap-2 cursor-pointer group">
               <input
                 type="checkbox"
                 checked={isAnonymous}
                 onChange={(e) => setIsAnonymous(e.target.checked)}
                 className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
               />
               <span className="text-xs text-gray-500 group-hover:text-gray-700 select-none">
                 Post anonymously
               </span>
             </label>
           </div>
        )}
      </div>
    </div>
  );
}
