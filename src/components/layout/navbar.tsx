import { Link } from "react-router-dom";
import { Home, Image, Video, FileText, BookOpen, MessageCircle } from "lucide-react";
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
  return (
    <nav
      className={cn(
        "flex items-center justify-between px-6 py-4",
        "bg-black/30 backdrop-blur-md",
        className
      )}
    >
      {/* Logo */}
      <Link to="/" className="text-white font-bold text-xl">
        Son Trinh
      </Link>

      {/* Nav links - ẩn trên mobile */}
      <div className="hidden md:flex items-center gap-6">
        {navItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <item.icon className="w-4 h-4" />
            <span className="text-sm">{item.label}</span>
          </Link>
        ))}
      </div>

      {/* Mobile menu button */}
      <button className="md:hidden text-white">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </nav>
  );
}