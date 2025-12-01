import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowRight, Tag } from "lucide-react";

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
  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <Navbar className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-md" />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto space-y-12">
          
          {/* Header */}
          <div className="space-y-4 text-center md:text-left">
            <h1 className="text-4xl font-bold tracking-tight text-white">Blog</h1>
            <p className="text-xl text-zinc-400 max-w-2xl">
              Thoughts, tutorials, and insights about web development, design, and technology.
            </p>
          </div>

          {/* Blog Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {BLOG_POSTS.map((post) => (
              <Card key={post.id} className="bg-zinc-900/50 border-white/10 backdrop-blur-sm flex flex-col hover:border-white/20 transition-colors group">
                <CardHeader>
                  <div className="flex items-center gap-4 text-xs text-zinc-500 mb-2">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                  <CardTitle className="text-xl text-white group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </CardTitle>
                  <CardDescription className="text-zinc-400 line-clamp-3">
                    {post.excerpt}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="flex-grow">
                  <div className="flex flex-wrap gap-2 mt-auto">
                    {post.tags.map(tag => (
                      <span key={tag} className="inline-flex items-center px-2 py-1 rounded-md bg-white/5 text-xs text-zinc-400 border border-white/5">
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </CardContent>

                <CardFooter className="pt-0">
                  <Button variant="ghost" className="w-full justify-between text-zinc-300 hover:text-white hover:bg-white/5 group/btn">
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
