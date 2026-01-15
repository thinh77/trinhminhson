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
    imageUrl?: string;
    isAnonymous: boolean;
    isGuest: boolean;
    createdAt: string;
    authorAvatar?: string;
}

export interface CreateCommentData {
    content: string;
    guestName?: string;
    isAnonymous?: boolean;
    image?: File;
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
