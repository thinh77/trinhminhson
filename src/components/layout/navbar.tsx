import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Home, BookOpen, MessageCircle, Menu, X, 
  ChevronDown, Music, 
  Dumbbell, Briefcase, Archive, LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";

type NavItem = {
  label: string;
  href?: string;
  icon?: LucideIcon;
  children?: NavItem[];
};

const MobileNavItem = ({ 
  item, 
  depth = 0, 
  onNavigate 
}: { 
  item: NavItem; 
  depth?: number; 
  onNavigate: (href?: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const hasChildren = item.children && item.children.length > 0;
  
  // Check if any child is active to auto-expand or highlight
  const isChildActive = (items?: NavItem[]): boolean => {
    if (!items) return false;
    return items.some(i => 
      i.href === location.pathname || isChildActive(i.children)
    );
  };
  
  const isActive = item.href === location.pathname || isChildActive(item.children);

  if (hasChildren) {
    return (
      <div className="w-full">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex items-center justify-between w-full px-4 py-3 rounded-xl text-base font-medium transition-all duration-200",
            "hover:bg-secondary/50 hover:text-accent",
            isActive ? "text-accent" : "text-foreground/80",
            depth > 0 && "pl-8 text-sm"
          )}
        >
          <div className="flex items-center gap-3">
            {item.icon && depth === 0 && <item.icon className="w-5 h-5" />}
            <span>{item.label}</span>
          </div>
          <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", isOpen && "rotate-180")} />
        </button>
        
        <div className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        )}>
          <div className="border-l-2 border-border/50 ml-6 my-1 space-y-1">
            {item.children!.map((child, index) => (
              <MobileNavItem key={index} item={child} depth={depth + 1} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => onNavigate(item.href)}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium w-full text-left",
        "transition-all duration-200 ease-out",
        "hover:bg-secondary/50 hover:text-accent",
        location.pathname === item.href 
          ? "text-accent bg-accent/10" 
          : "text-foreground",
        depth > 0 && "pl-8 text-sm"
      )}
    >
      {item.icon && depth === 0 && <item.icon className="w-5 h-5" />}
      <span>{item.label}</span>
    </button>
  );
};

const navItems: NavItem[] = [
  { 
    label: "Rèn luyện", 
    icon: Dumbbell,
    children: [
      { label: "Ngoại ngữ", href: "/training/language" },
      { label: "Thể thao", href: "/training/sports" },
      { label: "Nghệ thuật", href: "/training/arts" },
      { label: "Chuyên môn", href: "/training/professional" },
      { label: "Đam mê", href: "/training/passion" },
      { label: "Kiến thức mới", href: "/training/knowledge" },
    ]
  },
  { 
    label: "Giải trí", 
    icon: Music,
    children: [
      { label: "Nghe nhạc", href: "/music" },
      { label: "Xem phim", href: "/movies" },
      { label: "Đọc truyện", href: "/stories" },
      { label: "Ôn kỷ niệm", href: "/memories" },
    ]
  },
  { 
    label: "Công việc", 
    icon: Briefcase,
    children: [
      { 
        label: "Sản phẩm",
        children: [
          { label: "Nhiếp ảnh", href: "/photos" },
          { label: "Thiết kế kiến trúc", href: "/architecture" },
          { label: "Phát triển ứng dụng", href: "/apps" },
        ]
      },
      { 
        label: "Dự án",
        children: [
          { label: "Mua hộ đồ Nhật", href: "/projects/japan-order" },
        ]
      }
    ]
  },
  { 
    label: "Quan điểm", 
    icon: BookOpen,
    children: [
      { label: "Blog", href: "/blog" },
    ]
  },
  { 
    label: "Liên hệ", 
    icon: MessageCircle,
    children: [
      { label: "Thông tin cá nhân", href: "/about" },
      { label: "Thông tin liên hệ", href: "/contact-info" },
      { label: "Địa chỉ sinh sống", href: "/location" },
      { label: "Kết bạn", href: "/register" },
      { label: "Để lại lời nhắn", href: "/board" },
    ]
  },
  { 
    label: "Nhà kho", 
    icon: Archive,
    children: [
      { label: "Kho App Online", href: "/warehouse/apps" },
      { label: "Kho phần mềm", href: "/warehouse/software" },
      { label: "Kho Media", href: "/warehouse/media" },
      { label: "Kho giáo trình", href: "/warehouse/courses" },
      { label: "Kho sách", href: "/books" },
    ]
  }
];

interface NavbarProps {
  className?: string;
}

export function Navbar({ className }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigate = (href?: string) => {
    if (href) {
      navigate(href);
      setIsOpen(false);
    }
  };

  return (
    <nav
      className={cn(
        "flex items-center justify-between px-6 py-4",
        // Mobile: Solid background (95%) for readability, Desktop: Glass effect (70%)
        "bg-background/95 md:bg-background/70",
        // Enhanced blur and proper border for floating navbar
        "backdrop-blur-2xl border border-border/80 md:border-border/50",
        // Shadow for depth and separation
        "shadow-lg shadow-black/5",
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
        <Link
          to="/"
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium",
            "transition-all duration-200 ease-out hover:bg-secondary/50",
            location.pathname === "/" ? "text-accent bg-accent/10" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </Link>

        {navItems.map((item, index) => (
          <DropdownMenu key={index}>
            <DropdownMenuTrigger className={cn(
              "flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium outline-none",
              "transition-all duration-200 ease-out",
              "text-muted-foreground hover:text-foreground hover:bg-secondary/50 data-[state=open]:bg-secondary/50"
            )}>
              {item.icon && <item.icon className="w-4 h-4" />}
              <span>{item.label}</span>
              <ChevronDown className="w-3 h-3 opacity-50" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 bg-background/95 backdrop-blur-xl">
              {item.children?.map((child, childIndex) => (
                child.children ? (
                  <DropdownMenuSub key={childIndex}>
                    <DropdownMenuSubTrigger>
                      <span>{child.label}</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="bg-background/95 backdrop-blur-xl">
                      {child.children.map((subChild, subIndex) => (
                        <DropdownMenuItem key={subIndex} onClick={() => handleNavigate(subChild.href)}>
                          {subChild.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                ) : (
                  <DropdownMenuItem key={childIndex} onClick={() => handleNavigate(child.href)}>
                    {child.label}
                  </DropdownMenuItem>
                )
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ))}
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
          className="fixed inset-x-4 top-[88px] z-40 md:hidden max-h-[80vh] overflow-y-auto rounded-2xl shadow-2xl shadow-black/20 border border-border/50 bg-background/98 backdrop-blur-2xl"
        >
          <div className="flex flex-col p-4 gap-1">
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium",
                "transition-all duration-200 ease-out hover:bg-secondary/50",
                location.pathname === "/" ? "text-accent bg-accent/10" : "text-foreground"
              )}
            >
              <Home className="w-5 h-5" />
              <span>Home</span>
            </Link>
            {navItems.map((item, index) => (
              <MobileNavItem key={index} item={item} onNavigate={handleNavigate} />
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}