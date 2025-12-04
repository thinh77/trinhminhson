import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowRight, Tag, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

// Dummy data for blog posts
const BLOG_POSTS = [
  {
    id: 1,
    title: "Building a 3D Portfolio with React and Three.js",
    excerpt: "Learn how to create an immersive 3D portfolio website using React, Three.js, and React Three Fiber. We'll cover the basics of 3D rendering on the web.",
    date: "2024-03-15",
    readTime: "5 min read",
    tags: ["React", "Three.js", "Web Design"],
    slug: "building-3d-portfolio"
  },
  {
    id: 2,
    title: "Mastering Tailwind CSS: Tips and Tricks",
    excerpt: "Discover advanced techniques for using Tailwind CSS effectively in your projects. From custom configurations to creating reusable components.",
    date: "2024-03-10",
    readTime: "8 min read",
    tags: ["CSS", "Tailwind", "Frontend"],
    slug: "mastering-tailwind-css"
  },
  {
    id: 3,
    title: "The Future of Web Development in 2024",
    excerpt: "A look at the emerging trends and technologies that are shaping the future of web development. AI, Server Components, and more.",
    date: "2024-02-28",
    readTime: "6 min read",
    tags: ["Trends", "Web Dev", "AI"],
    slug: "future-web-dev-2024"
  },
  {
    id: 4,
    title: "Optimizing React Performance",
    excerpt: "Practical strategies to improve the performance of your React applications. Memoization, code splitting, and rendering optimizations.",
    date: "2024-02-15",
    readTime: "10 min read",
    tags: ["React", "Performance", "Optimization"],
    slug: "optimizing-react-performance"
  }
];

export function BlogPage() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Floating Navbar */}
      <Navbar className="fixed top-4 left-4 right-4 z-50 rounded-2xl shadow-lg shadow-black/5" />
      
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-accent/5 pointer-events-none" />

      <main className="relative pt-28 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div 
            className={cn(
              "mb-12 transition-all duration-700 ease-out",
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h1 
                  className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  Blog
                </h1>
                <p className="text-muted-foreground text-sm">
                  Thoughts, tutorials, and insights about web development
                </p>
              </div>
            </div>
          </div>

          {/* Blog Grid */}
          <div 
            className={cn(
              "grid gap-6 md:grid-cols-2",
              "transition-all duration-700 delay-150 ease-out",
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
          >
            {BLOG_POSTS.map((post) => (
              <Card 
                key={post.id} 
                className="bg-card/80 backdrop-blur-sm border-border hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300 flex flex-col group cursor-pointer"
              >
                <CardHeader>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                  <CardTitle className="text-xl text-foreground group-hover:text-accent transition-colors line-clamp-2">
                    {post.title}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground line-clamp-3">
                    {post.excerpt}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="flex-grow">
                  <div className="flex flex-wrap gap-2 mt-auto">
                    {post.tags.map(tag => (
                      <span key={tag} className="inline-flex items-center px-2 py-1 rounded-md bg-secondary text-xs text-muted-foreground border border-border">
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </CardContent>

                <CardFooter className="pt-0">
                  <Button variant="ghost" className="w-full justify-between text-foreground hover:text-accent hover:bg-accent/5 group/btn cursor-pointer">
                    Read Article
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

        </div>
      </main>
    </div>
  );
}
