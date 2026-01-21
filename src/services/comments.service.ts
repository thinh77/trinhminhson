import { API_BASE_URL } from "./api";

// Allowed reaction emojis
export const ALLOWED_REACTIONS = ["😘", "☺️", "😌", "😴", "🤢", "🤣", "🥹", "😡", "🤐", "😭"] as const;
export type ReactionEmoji = typeof ALLOWED_REACTIONS[number];

// Vote types
export const VOTE_TYPES = ["like", "dislike"] as const;
export type VoteType = typeof VOTE_TYPES[number];

export interface ReactionData {
    count: number;
    hasReacted: boolean;
}

export interface ReactionMap {
    [emoji: string]: ReactionData;
}

export interface ToggleReactionResponse {
    action: "added" | "removed";
    reactions: ReactionMap;
}

export interface VoteData {
    likes: number;
    dislikes: number;
    userVote: VoteType | null;
}

export interface ToggleVoteResponse {
    action: "added" | "removed" | "switched";
    votes: VoteData;
}

export interface Comment {
    id: number;
    photoId: number;
    authorName: string;
    realAuthor?: {
        id: number;
        name: string;
        username: string;
    };
    content: string;
    imageUrl?: string;
    isAnonymous: boolean;
    isGuest: boolean;
    createdAt: string;
    updatedAt?: string;
    isOwner?: boolean;
    guestToken?: string;
    authorAvatar?: string;
    reactions?: ReactionMap;
}

export interface CreateCommentData {
    content: string;
    guestName?: string;
    isAnonymous?: boolean;
    image?: File;
}

export interface UpdateCommentPayload {
    content: string;
    guestToken?: string;
}

function getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem("auth_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Get comments for a photo
 */
export async function getCommentsByPhoto(photoId: number): Promise<Comment[]> {
    const response = await fetch(`${API_BASE_URL}/photos/${photoId}/comments`, {
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        throw new Error("Failed to load comments");
    }

    return response.json();
}

/**
 * Add a new comment
 */
export async function addComment(
    photoId: number,
    data: CreateCommentData
): Promise<Comment> {
    const formData = new FormData();
    formData.append("content", data.content);

    if (data.guestName) {
        formData.append("guestName", data.guestName);
    }

    if (data.isAnonymous !== undefined) {
        formData.append("isAnonymous", String(data.isAnonymous));
    }

    if (data.image) {
        formData.append("image", data.image);
    }

    const response = await fetch(`${API_BASE_URL}/photos/${photoId}/comments`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || error.error || "Failed to post comment");
    }

    return response.json();
}

/**
 * Update an existing comment within edit window
 */
export async function updateComment(
    photoId: number,
    commentId: number,
    data: UpdateCommentPayload
): Promise<Comment> {
    const response = await fetch(
        `${API_BASE_URL}/photos/${photoId}/comments/${commentId}`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders(),
            },
            body: JSON.stringify(data),
        }
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update comment");
    }

    return response.json();
}

/**
 * Delete a comment
 */
export async function deleteComment(
    photoId: number,
    commentId: number
): Promise<void> {
    const response = await fetch(
        `${API_BASE_URL}/photos/${photoId}/comments/${commentId}`,
        {
            method: "DELETE",
            headers: getAuthHeaders(),
        }
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete comment");
    }
}

/**
 * Get reactions for a comment
 */
export async function getReactions(
    commentId: number,
    guestToken?: string
): Promise<ReactionMap> {
    const params = new URLSearchParams();
    if (guestToken) params.set("guestToken", guestToken);

    const url = `${API_BASE_URL}/comments/${commentId}/reactions${params.toString() ? `?${params}` : ""}`;
    const response = await fetch(url, {
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        throw new Error("Failed to load reactions");
    }

    return response.json();
}

/**
 * Toggle a reaction on a comment
 */
export async function toggleReaction(
    commentId: number,
    emoji: ReactionEmoji,
    guestToken?: string
): Promise<ToggleReactionResponse> {
    const response = await fetch(`${API_BASE_URL}/comments/${commentId}/reactions`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
        },
        body: JSON.stringify({ emoji, guestToken }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || error.error || "Failed to toggle reaction");
    }

    return response.json();
}

/**
 * Get votes for a comment
 */
export async function getVotes(
    commentId: number,
    guestToken?: string
): Promise<VoteData> {
    const params = new URLSearchParams();
    if (guestToken) params.set("guestToken", guestToken);

    const url = `${API_BASE_URL}/comments/${commentId}/votes${params.toString() ? `?${params}` : ""}`;
    const response = await fetch(url, {
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        throw new Error("Failed to load votes");
    }

    return response.json();
}

/**
 * Toggle a vote on a comment (like/dislike)
 */
export async function toggleVote(
    commentId: number,
    voteType: VoteType,
    guestToken?: string
): Promise<ToggleVoteResponse> {
    const response = await fetch(`${API_BASE_URL}/comments/${commentId}/votes`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
        },
        body: JSON.stringify({ voteType, guestToken }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || error.error || "Failed to toggle vote");
    }

    return response.json();
}

/**
 * Get votes for multiple comments (batch)
 */
export async function getVotesForComments(
    commentIds: number[],
    guestToken?: string
): Promise<Record<number, VoteData>> {
    const response = await fetch(`${API_BASE_URL}/comments/votes/batch`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
        },
        body: JSON.stringify({ commentIds, guestToken }),
    });

    if (!response.ok) {
        throw new Error("Failed to load votes");
    }

    return response.json();
}
