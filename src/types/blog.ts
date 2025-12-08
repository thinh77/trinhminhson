// Blog post author type
export interface BlogAuthor {
    name: string;
    avatar: string;
    role: string;
}

// Related post type (minimal info for sidebar)
export interface RelatedPost {
    id: string;
    title: string;
    slug: string;
    image: string;
    date: string;
}

// Full blog post type
export interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    image: string;
    author: BlogAuthor;
    date: string;
    readTime: string;
    tags: string[];
    relatedPosts?: RelatedPost[];
}

// Form data type for creating/editing blog posts
export interface BlogFormData {
    title: string;
    excerpt: string;
    content: string;
    image: string;
    tags: string;
    readTime: string;
}
