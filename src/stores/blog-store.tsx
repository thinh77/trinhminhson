import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { BlogPost, BlogAuthor } from "@/types/blog";
import { postsApi, BackendPost } from "@/services/posts.service";

// Default author for new posts
const DEFAULT_AUTHOR: BlogAuthor = {
    name: "Trịnh Minh Sơn",
    avatar: "https://github.com/shadcn.png",
    role: "Architect & Developer"
};

// Transform backend post to frontend format
function transformPost(backendPost: BackendPost): BlogPost {
    // Parse tags from comma-separated string
    const tags = backendPost.tags ? backendPost.tags.split(',').map(t => t.trim()) : [];

    return {
        id: String(backendPost.id),
        title: backendPost.title,
        slug: backendPost.slug,
        excerpt: backendPost.excerpt,
        content: backendPost.content,
        image: backendPost.image,
        author: {
            name: backendPost.author.name,
            avatar: "https://github.com/shadcn.png",
            role: "Author"
        },
        date: formatDate(new Date(backendPost.createdAt)),
        readTime: backendPost.readTime,
        tags: tags,
    };
}

// Initial mock data (removed, now using API)

// Helper function to generate slug from title
export function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
}

// Helper function to format date in Vietnamese
export function formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, "0");
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const months = [
        "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
        "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
    ];
    return `${day} ${months[month - 1]}, ${year}`;
}

// Context type
interface BlogContextType {
    posts: BlogPost[];
    loading: boolean;
    error: string | null;
    fetchPosts: () => Promise<void>;
    addPost: (post: Omit<BlogPost, "id" | "slug" | "author" | "date" | "relatedPosts">, userId?: number) => Promise<void>;
    getPostBySlug: (slug: string) => BlogPost | undefined;
    getRelatedPosts: (currentPostId: string, limit?: number) => BlogPost[];
}

// Create context
const BlogContext = createContext<BlogContextType | undefined>(undefined);

// Provider component
export function BlogProvider({ children }: { children: ReactNode }) {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch posts from API
    const fetchPosts = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await postsApi.getAll({ limit: 100 });
            const backendPosts = response.posts || [];
            const transformedPosts = backendPosts.map(transformPost);
            setPosts(transformedPosts);
        } catch (err) {
            console.error('Failed to fetch posts:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch posts');
            // Fall back to empty array on error
            setPosts([]);
        } finally {
            setLoading(false);
        }
    };

    // Load posts on mount
    useEffect(() => {
        fetchPosts();
    }, []);

    const addPost = async (postData: Omit<BlogPost, "id" | "slug" | "author" | "date" | "relatedPosts">, userId?: number) => {
        try {
            const createData = {
                title: postData.title,
                excerpt: postData.excerpt,
                content: postData.content,
                image: postData.image,
                slug: generateSlug(postData.title),
                tags: Array.isArray(postData.tags) ? postData.tags.join(', ') : postData.tags,
                readTime: postData.readTime,
                userId: userId || 1,
            };
            
            const newPost = await postsApi.create(createData);
            const transformedPost = transformPost(newPost);
            setPosts(prev => [transformedPost, ...prev]);
        } catch (err) {
            console.error('Failed to create post:', err);
            throw err;
        }
    };

    const getPostBySlug = (slug: string): BlogPost | undefined => {
        return posts.find(post => post.slug === slug);
    };

    const getRelatedPosts = (currentPostId: string, limit = 2): BlogPost[] => {
        return posts
            .filter(post => post.id !== currentPostId)
            .slice(0, limit);
    };

    return (
        <BlogContext.Provider value={{ 
            posts, 
            loading,
            error,
            fetchPosts,
            addPost, 
            getPostBySlug, 
            getRelatedPosts 
        }}>
            {children}
        </BlogContext.Provider>
    );
}

// Hook to use blog context
export function useBlog() {
    const context = useContext(BlogContext);
    if (context === undefined) {
        throw new Error("useBlog must be used within a BlogProvider");
    }
    return context;
}
