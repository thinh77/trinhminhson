import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Image, Video, FileText, BookOpen, MessageCircle, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/blog", label: "Blog", icon: FileText },
  { href: "/photos", label: "Photos", icon: Image },
  { href: "/videos", label: "Videos", icon: Video },
  { href: "/books", label: "Books", icon: BookOpen },
  { href: "/chat", label: "Chat", icon: MessageCircle },
];

interface NavbarProps {
  className?: string;
}

export function Navbar({ className }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  return (
    <nav
      className={cn(
        "flex items-center justify-between px-6 py-4",
        "bg-background/60 backdrop-blur-xl border-b border-border/50",
        "transition-all duration-300 ease-out",
        className
      )}
    >
      {/* Logo */}
      <Link 
        to="/" 
        className="group flex items-center gap-2 text-foreground font-bold text-xl tracking-tight transition-colors hover:text-accent"
        style={{ fontFamily: "'Outfit', sans-serif" }}
      >
        <span className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-accent-foreground text-sm font-semibold group-hover:scale-105 transition-transform duration-200">
          ST
        </span>
        <span className="hidden sm:inline">Son Trinh</span>
      </Link>

      {/* Desktop nav links */}
      <div className="hidden md:flex items-center gap-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium",
                "transition-all duration-200 ease-out",
                "cursor-pointer",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                isActive 
                  ? "text-accent bg-accent/10" 
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              )}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Mobile menu button */}
      <button 
        className={cn(
          "md:hidden p-2 rounded-lg text-foreground",
          "hover:bg-secondary/50 transition-colors duration-200",
          "cursor-pointer",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        )}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile menu overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 top-[73px] z-40 bg-background/95 backdrop-blur-xl md:hidden"
          onClick={() => setIsOpen(false)}
        >
          <div className="flex flex-col p-6 gap-2">
            {navItems.map((item, index) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium",
                    "transition-all duration-200 ease-out",
                    "cursor-pointer animate-fade-in-up",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                    isActive 
                      ? "text-accent bg-accent/10" 
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}