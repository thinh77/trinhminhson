import { useState, useEffect, useRef } from "react";
import EmojiPicker, { type EmojiClickData } from "emoji-picker-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getCommentsByPhoto,
  addComment,
  deleteComment,
  updateComment,
  toggleReaction,
  ALLOWED_REACTIONS,
  type Comment,
  type ReactionMap,
  type ReactionEmoji,
} from "@/services/comments.service";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Shield,
  Loader2,
  Send,
  MessageCircle,
  Image as ImageIcon,
  X as XIcon,
  Smile,
  SmilePlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { STATIC_BASE_URL } from "@/services/api";

interface PhotoCommentsProps {
  photoId: number;
}

const EDIT_WINDOW_MS = 5 * 60 * 1000;
const DELETE_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
const COMMENT_TOKEN_KEY = "comment_tokens";

function loadGuestTokens(): Record<number, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(COMMENT_TOKEN_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

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
  const [guestTokens, setGuestTokens] = useState<Record<number, string>>(() =>
    loadGuestTokens()
  );
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [commentReactions, setCommentReactions] = useState<
    Record<number, ReactionMap>
  >({});
  const [showReactionPicker, setShowReactionPicker] = useState<number | null>(
    null
  );
  const [reactingCommentId, setReactingCommentId] = useState<number | null>(
    null
  );

  // Form state
  const [content, setContent] = useState("");
  const [guestName, setGuestName] = useState("Guest");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showGuestInput, setShowGuestInput] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadComments();
  }, [photoId]);

  const persistGuestToken = (commentId: number, token: string) => {
    setGuestTokens((prev) => {
      const next = { ...prev, [commentId]: token };
      try {
        localStorage.setItem(COMMENT_TOKEN_KEY, JSON.stringify(next));
      } catch {
        // ignore storage failures to avoid blocking UI
      }
      return next;
    });
  };

  const getGuestToken = (commentId: number) => guestTokens[commentId];

  const canEditComment = (comment: Comment) => {
    const withinWindow =
      Date.now() - new Date(comment.createdAt).getTime() <= EDIT_WINDOW_MS;
    if (!withinWindow) return false;

    if (comment.isGuest) {
      return Boolean(getGuestToken(comment.id));
    }

    return Boolean(comment.isOwner);
  };

  const canDeleteComment = (comment: Comment) => {
    const isAdmin = user?.role === "admin";
    if (isAdmin) return true;
    if (!comment.isOwner) return false;
    const withinWindow =
      Date.now() - new Date(comment.createdAt).getTime() <= DELETE_WINDOW_MS;
    return withinWindow;
  };

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>): void {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_SIZE = 15 * 1024 * 1024;
    const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png"];

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Only JPG and PNG images are allowed");
      return;
    }

    if (file.size > MAX_SIZE) {
      setError("Image size must be less than 15MB");
      return;
    }

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
    setError(null);
  }

  function handleRemoveImage(): void {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  const onEmojiClick = (emojiData: EmojiClickData) => {
    if (content.length + emojiData.emoji.length <= 500) {
      setContent((prev) => prev + emojiData.emoji);
    }
    // Don't close picker automatically for better UX if adding multiple emojis
    // setShowEmojiPicker(false);
  };

  const loadComments = async () => {
    try {
      setIsLoading(true);
      const data = await getCommentsByPhoto(photoId);
      setComments(data);

      // Extract reactions from comments
      const reactionsData: Record<number, ReactionMap> = {};
      for (const comment of data) {
        if (comment.reactions) {
          reactionsData[comment.id] = comment.reactions;
        }
      }
      setCommentReactions(reactionsData);

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
    if (!content.trim() && !selectedImage) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const newComment = await addComment(photoId, {
        content,
        guestName: !user ? guestName : undefined,
        isAnonymous: user ? isAnonymous : undefined,
        image: selectedImage || undefined,
      });

      if (newComment.guestToken) {
        persistGuestToken(newComment.id, newComment.guestToken);
      }

      setComments([newComment, ...comments]);
      setContent("");
      handleRemoveImage();
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

  const handleStartEdit = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
    setError(null);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditContent("");
  };

  const handleUpdate = async (comment: Comment) => {
    if (!editContent.trim()) {
      setError("Comment content is required");
      return;
    }

    if (comment.isGuest && !getGuestToken(comment.id)) {
      setError("Missing guest token to edit this comment");
      return;
    }

    try {
      setIsUpdating(true);
      const updated = await updateComment(photoId, comment.id, {
        content: editContent.trim(),
        guestToken: getGuestToken(comment.id),
      });

      setComments((prev) =>
        prev.map((c) => (c.id === comment.id ? { ...c, ...updated } : c))
      );
      setError(null);
      handleCancelEdit();
    } catch (err: any) {
      console.error("Failed to update comment:", err);
      setError(err.message || "Failed to update comment");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReaction = async (commentId: number, emoji: ReactionEmoji) => {
    // Must be logged in or have a guest token
    const guestToken = getGuestToken(commentId);
    if (!user && !guestToken) {
      setError("Please log in to react to comments");
      return;
    }

    try {
      setReactingCommentId(commentId);
      const result = await toggleReaction(commentId, emoji, guestToken);

      setCommentReactions((prev) => ({
        ...prev,
        [commentId]: result.reactions,
      }));
      setShowReactionPicker(null);
    } catch (err: any) {
      console.error("Failed to toggle reaction:", err);
      setError(err.message || "Failed to react");
    } finally {
      setReactingCommentId(null);
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
            <p className="text-gray-400 text-xs mt-1">
              Start the conversation.
            </p>
          </div>
        ) : (
          comments.map((comment) => {
            const canEdit = canEditComment(comment);
            const isEditing = editingCommentId === comment.id;

            return (
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
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      {formatRelativeTime(new Date(comment.createdAt))}
                      {comment.updatedAt && (
                        <span className="text-[11px] text-gray-400">
                          · đã chỉnh sửa{" "}
                          {formatRelativeTime(new Date(comment.updatedAt))}
                        </span>
                      )}
                    </span>
                    {comment.isAnonymous && isAdmin && comment.realAuthor && (
                      <span className="flex items-center gap-1 text-[10px] text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded border border-yellow-200">
                        <Shield className="w-3 h-3" />
                        {comment.realAuthor.name}
                      </span>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="mt-1 space-y-2">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        maxLength={500}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <div className="flex items-center gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => handleUpdate(comment)}
                          disabled={isUpdating || !editContent.trim()}
                          className={cn(
                            "px-3 py-1.5 rounded-md font-medium",
                            isUpdating || !editContent.trim()
                              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                              : "bg-blue-600 text-white hover:bg-blue-700"
                          )}
                        >
                          {isUpdating ? "Saving..." : "Save"}
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="px-3 py-1.5 rounded-md font-medium text-gray-600 hover:bg-gray-100"
                        >
                          Cancel
                        </button>
                        <span className="ml-auto text-gray-400">
                          {editContent.length}/500
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-700 mt-0.5 whitespace-pre-wrap leading-normal">
                      {comment.content}
                    </p>
                  )}

                  {comment.imageUrl && (
                    <div className="mt-2">
                      <img
                        src={`${STATIC_BASE_URL}${comment.imageUrl}`}
                        alt="Comment attachment"
                        className="max-w-full rounded-lg border border-gray-200 max-h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() =>
                          window.open(
                            `${STATIC_BASE_URL}${comment.imageUrl}`,
                            "_blank"
                          )
                        }
                      />
                    </div>
                  )}

                  {/* Reactions display */}
                  {(() => {
                    const reactions = commentReactions[comment.id] || {};
                    const reactionEntries = Object.entries(reactions).filter(
                      ([, data]) => data.count > 0
                    );

                    return (
                      reactionEntries.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          {reactionEntries.map(([emoji, data]) => (
                            <button
                              key={emoji}
                              onClick={() =>
                                handleReaction(
                                  comment.id,
                                  emoji as ReactionEmoji
                                )
                              }
                              disabled={reactingCommentId === comment.id}
                              className={cn(
                                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-all",
                                data.hasReacted
                                  ? "bg-blue-100 text-blue-700 border border-blue-300"
                                  : "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200",
                                "cursor-pointer"
                              )}
                            >
                              <span>{emoji}</span>
                              <span className="font-medium">{data.count}</span>
                            </button>
                          ))}
                        </div>
                      )
                    );
                  })()}

                  {/* Actions row */}
                  <div className="flex items-center gap-3 mt-1.5 relative">
                    {/* Reaction button */}
                    <div className="relative">
                      <button
                        onClick={() =>
                          setShowReactionPicker(
                            showReactionPicker === comment.id
                              ? null
                              : comment.id
                          )
                        }
                        disabled={!user && !getGuestToken(comment.id)}
                        className={cn(
                          "text-xs font-medium transition-colors cursor-pointer flex items-center gap-1",
                          showReactionPicker === comment.id
                            ? "text-blue-600"
                            : "text-gray-400 hover:text-blue-600",
                          !user &&
                            !getGuestToken(comment.id) &&
                            "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <SmilePlus className="w-3.5 h-3.5" />
                      </button>

                      {/* Reaction picker popup */}
                      {showReactionPicker === comment.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setShowReactionPicker(null)}
                          />
                          <div className="absolute bottom-0 left-5 z-20 bg-white rounded-xl shadow-lg border border-gray-200 p-2 grid grid-cols-5 gap-1 w-[180px] animate-in fade-in slide-in-from-bottom-2">
                            {ALLOWED_REACTIONS.map((emoji) => {
                              const hasReacted =
                                commentReactions[comment.id]?.[emoji]
                                  ?.hasReacted;
                              return (
                                <button
                                  key={emoji}
                                  onClick={() =>
                                    handleReaction(comment.id, emoji)
                                  }
                                  disabled={reactingCommentId === comment.id}
                                  className={cn(
                                    "w-8 h-8 flex items-center justify-center rounded-full text-lg hover:bg-gray-100 transition-all hover:scale-110",
                                    hasReacted && "bg-blue-100",
                                    reactingCommentId === comment.id &&
                                      "opacity-50"
                                  )}
                                >
                                  {emoji}
                                </button>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </div>

                    {canEdit && (
                      <button
                        onClick={() => handleStartEdit(comment)}
                        className="text-xs font-medium text-gray-400 hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                      >
                        Edit
                      </button>
                    )}

                    {canDeleteComment(comment) && (
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
            );
          })
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-100 bg-white relative">
        {error && (
          <div className="mb-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
            {error}
          </div>
        )}

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

        {imagePreview && (
          <div className="mb-2 relative inline-block">
            <img
              src={imagePreview}
              alt="Preview"
              className="max-h-32 rounded-lg border border-gray-200"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors cursor-pointer"
            >
              <XIcon className="w-3 h-3" />
            </button>
          </div>
        )}

        <div className="flex justify-end mb-1 px-1">
          <span
            className={cn(
              "text-xs transition-colors",
              content.length >= 500
                ? "text-red-500 font-medium"
                : "text-gray-400"
            )}
          >
            {content.length}/500
          </span>
        </div>

        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => !user && setShowGuestInput(true)}
            placeholder={
              user ? "Add a comment..." : "Add a comment as guest..."
            }
            maxLength={500}
            className="w-full pl-4 pr-32 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-gray-400"
          />

          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className={cn(
                "p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer",
                showEmojiPicker ? "text-blue-500 bg-blue-50" : "text-gray-400"
              )}
            >
              <Smile className="w-4 h-4" />
            </button>
            {user && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="comment-image-upload"
                />
                <label
                  htmlFor="comment-image-upload"
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <ImageIcon className="w-4 h-4 text-gray-500" />
                </label>
              </>
            )}

            <button
              type="submit"
              disabled={
                isSubmitting ||
                (!content.trim() && !selectedImage) ||
                (!user && !guestName.trim())
              }
              className={cn(
                "p-2 rounded-full transition-colors cursor-pointer",
                content.trim() || selectedImage
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
          </div>

          {showEmojiPicker && (
            <div className="absolute bottom-full right-0 mb-2 z-50 shadow-xl rounded-lg border border-gray-100">
              <div
                className="fixed inset-0 z-0"
                onClick={() => setShowEmojiPicker(false)}
              />
              <div className="relative z-10">
                <EmojiPicker
                  onEmojiClick={onEmojiClick}
                  width={300}
                  height={400}
                />
              </div>
            </div>
          )}
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
