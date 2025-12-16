import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
    Calendar, Clock,
    Facebook, Twitter, Linkedin, Link as LinkIcon,
    ChevronLeft, ArrowUp, MessageCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Navbar } from "@/components/layout/navbar";
import { useBlog } from "@/stores/blog-store";
import { RichContent } from "@/components/ui/rich-content";

export function BlogPost() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { getPostBySlug, getRelatedPosts } = useBlog();
    const [scrollProgress, setScrollProgress] = useState(0);
    const [showScrollTop, setShowScrollTop] = useState(false);

    // Get post data from store
    const post = slug ? getPostBySlug(slug) : undefined;
    const relatedPosts = post ? getRelatedPosts(post.id, 2) : [];

    // Handle scroll progress
    useEffect(() => {
        const handleScroll = () => {
            const totalScroll = document.documentElement.scrollTop;
            const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scroll = `${totalScroll / windowHeight}`;
            setScrollProgress(Number(scroll));

            if (totalScroll > 400) {
                setShowScrollTop(true);
            } else {
                setShowScrollTop(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Handle post not found
    if (!post) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Navbar className="fixed top-0 left-0 right-0 z-50" />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl font-bold text-foreground">Không tìm thấy bài viết</h1>
                        <p className="text-muted-foreground">Bài viết bạn đang tìm kiếm không tồn tại.</p>
                        <Button onClick={() => navigate("/blog")} className="mt-4 cursor-pointer">
                            <ChevronLeft className="w-4 h-4 mr-2" />
                            Quay lại Blog
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            <Navbar className="fixed top-0 left-0 right-0 z-50" />
            
            {/* Reading Progress Bar */}
            <div className="fixed top-0 left-0 w-full h-1 z-50 bg-secondary">
                <div 
                    className="h-full bg-accent transition-all duration-150 ease-out"
                    style={{ width: `${scrollProgress * 100}%` }}
                />
            </div>

            {/* Hero Section */}
            <div className="relative w-full h-[60vh] min-h-[400px] flex items-end justify-center pb-12 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img 
                        src={post.image} 
                        alt={post.title} 
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                </div>

                <div className="relative z-10 container max-w-4xl px-6 text-center space-y-6">
                    <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
                        {post.tags.map(tag => (
                            <span key={tag} className="px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium backdrop-blur-md border border-accent/20">
                                {tag}
                            </span>
                        ))}
                    </div>
                    
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground font-heading leading-tight">
                        {post.title}
                    </h1>

                    <div className="flex flex-wrap items-center justify-center gap-6 text-muted-foreground text-sm md:text-base">
                        <div className="flex items-center gap-2">
                            <Avatar className="w-8 h-8 border-2 border-background">
                                <AvatarImage src={post.author.avatar} />
                                <AvatarFallback>MS</AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-foreground">{post.author.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{post.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{post.readTime}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className=" max-w-7xl px-6 mx-auto mt-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Sidebar (Left) - Share & Navigation */}
                    <div className="hidden lg:block lg:col-span-2 space-y-8">
                        <div className="sticky top-24 space-y-6">
                            <div className="flex flex-col gap-4">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Chia sẻ</p>
                                <Button variant="outline" size="icon" className="rounded-full hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 cursor-pointer">
                                    <Facebook className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="icon" className="rounded-full hover:text-sky-500 hover:border-sky-200 hover:bg-sky-50 cursor-pointer">
                                    <Twitter className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="icon" className="rounded-full hover:text-blue-700 hover:border-blue-200 hover:bg-blue-50 cursor-pointer">
                                    <Linkedin className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="icon" className="rounded-full hover:text-foreground hover:border-foreground/20 cursor-pointer">
                                    <LinkIcon className="w-4 h-4" />
                                </Button>
                            </div>
                            
                            <div className="pt-6 border-t border-border">
                                <Link to="/blog" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-accent transition-colors">
                                    <ChevronLeft className="w-4 h-4" />
                                    Quay lại Blog
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-7">
                        <article>
                            <p className="text-xl text-muted-foreground mb-8 font-medium leading-relaxed">
                                {post.excerpt}
                            </p>
                            <RichContent content={post.content} />
                        </article>

                        {/* Tags & Share (Mobile) */}
                        <div className="mt-12 pt-8 border-t border-border lg:hidden">
                            <div className="flex items-center gap-4 mb-6">
                                <span className="text-sm font-medium text-muted-foreground">Chia sẻ:</span>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 cursor-pointer"><Facebook className="w-4 h-4" /></Button>
                                    <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 cursor-pointer"><Twitter className="w-4 h-4" /></Button>
                                    <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 cursor-pointer"><Linkedin className="w-4 h-4" /></Button>
                                </div>
                            </div>
                        </div>

                        {/* Author Bio */}
                        <div className="mt-12 p-8 rounded-2xl bg-secondary/30 border border-border flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
                            <Avatar className="w-20 h-20 border-4 border-background shadow-sm">
                                <AvatarImage src={post.author.avatar} />
                                <AvatarFallback>MS</AvatarFallback>
                            </Avatar>
                            <div className="space-y-2">
                                <h3 className="text-lg font-bold text-foreground">{post.author.name}</h3>
                                <p className="text-sm font-medium text-accent">{post.author.role}</p>
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    Đam mê kiến trúc và công nghệ. Luôn tìm kiếm sự cân bằng giữa thẩm mỹ và công năng trong mọi thiết kế.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar (Right) - Related Posts */}
                    <div className="lg:col-span-3 space-y-8">
                        <div className="sticky top-24">
                            {relatedPosts.length > 0 && (
                                <>
                                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                        <span className="w-1 h-6 bg-accent rounded-full"></span>
                                        Bài viết liên quan
                                    </h3>
                                    <div className="space-y-4">
                                        {relatedPosts.map(relatedPost => (
                                            <Link key={relatedPost.id} to={`/blog/${relatedPost.slug}`} className="group block space-y-2 cursor-pointer">
                                                <div className="aspect-video rounded-xl overflow-hidden bg-muted">
                                                    <img 
                                                        src={relatedPost.image} 
                                                        alt={relatedPost.title}
                                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                    />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-foreground leading-snug group-hover:text-accent transition-colors line-clamp-2">
                                                        {relatedPost.title}
                                                    </h4>
                                                    <span className="text-xs text-muted-foreground mt-1 block">{relatedPost.date}</span>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </>
                            )}

                            {/* Newsletter Box */}
                            <div className={cn("p-6 rounded-2xl bg-accent/5 border border-accent/20 text-center space-y-4", relatedPosts.length > 0 && "mt-8")}>
                                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto text-accent">
                                    <MessageCircle className="w-6 h-6" />
                                </div>
                                <h3 className="font-bold text-foreground">Đăng ký nhận tin</h3>
                                <p className="text-sm text-muted-foreground">Nhận bài viết mới nhất qua email hàng tuần.</p>
                                <div className="space-y-2">
                                    <input 
                                        type="email" 
                                        placeholder="Email của bạn" 
                                        className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm"
                                    />
                                    <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground cursor-pointer">Đăng ký</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scroll to Top Button */}
            <button
                onClick={scrollToTop}
                className={cn(
                    "fixed bottom-8 right-8 p-3 rounded-full bg-accent text-accent-foreground shadow-lg transition-all duration-300 z-40 hover:scale-110 hover:shadow-xl cursor-pointer",
                    showScrollTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
                )}
            >
                <ArrowUp className="w-5 h-5" />
            </button>
        </div>
    );
}
