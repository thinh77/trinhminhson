import { API_BASE_URL } from "./api";

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
    isAnonymous: boolean;
    isGuest: boolean;
    createdAt: string;
    authorAvatar?: string;
}

export interface CreateCommentData {
    content: string;
    guestName?: string;
    isAnonymous?: boolean;
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
    const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
    };

    const response = await fetch(`${API_BASE_URL}/photos/${photoId}/comments`, {
        method: "POST",
        headers,
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to post comment");
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
