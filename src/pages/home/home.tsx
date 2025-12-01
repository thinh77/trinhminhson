import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { hotspots } from "@/config/hotspots";
import { Navbar } from "@/components/layout/navbar";
import { cn } from "@/lib/utils";

export function HomePage() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const navigate = useNavigate();

  // Giả sử ảnh gốc kích thước 1920x1080. 
  // Bạn NÊN kiểm tra size gốc ảnh home.jpg của bạn để điền vào đây cho chuẩn tỉ lệ.
  const ORIGINAL_WIDTH = 1920;
  const ORIGINAL_HEIGHT = 1080;

  return (
    <div className="relative min-h-screen w-full overflow-x-auto overflow-y-hidden bg-black">
      <Navbar className="fixed top-0 left-0 right-0 z-50" />

      {/* Container chính: Giữ tỉ lệ khung hình hoặc full màn hình */}
      <div className="relative w-full h-screen flex items-center justify-start md:justify-center md:overflow-hidden">
        
        {/* Wrapper này giúp ảnh và SVG luôn đi cùng nhau dù zoom kiểu gì */}
        <div className="relative h-full aspect-video md:w-full md:h-full md:max-w-[177.78vh] md:max-h-[56.25vw] md:aspect-auto"> {/* Tỉ lệ 16:9 */}
          
          {/* 1. ẢNH NỀN */}
          <img
            src="/images/home.jpg"
            alt="Workspace"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
          />

          {/* 2. SVG OVERLAY (Lớp tương tác) */}
          <svg
            className="absolute inset-0 w-full h-full z-10"
            viewBox={`0 0 ${ORIGINAL_WIDTH} ${ORIGINAL_HEIGHT}`}
            preserveAspectRatio="xMidYMid meet" // Quan trọng: Đảm bảo SVG khớp 100% với ảnh object-contain
            xmlns="http://www.w3.org/2000/svg"
          >
            {hotspots.map((hotspot) => {
              const isHovered = hoveredId === hotspot.id;
              return (
                <path
                  key={hotspot.id}
                  d={hotspot.path}
                  className={cn(
                    "cursor-pointer transition-all duration-3000 ease-in-out outline-none",
                    // Mobile: Blink stroke
                    "animate-pulse stroke-red-800/80 stroke-[8px] fill-transparent",
                    // Desktop: Hidden by default
                    "md:animate-none md:stroke-transparent md:stroke-0"
                  )}
                  style={{
                    fill: isHovered ? "rgba(255, 255, 255, 0.1)" : undefined,
                    stroke: isHovered ? "rgba(190, 67, 67, 0.9)" : undefined,
                    strokeWidth: isHovered ? 5 : undefined,
                    filter: isHovered ? "drop-shadow(0 0 8px rgba(255,255,255,0.6))" : undefined,
                    animation: isHovered ? "none" : undefined
                  }}
                  onMouseEnter={() => setHoveredId(hotspot.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => navigate(hotspot.href)}
                  // Accessibility
                  role="button"
                  // aria-label={hotspot.label}
                  tabIndex={0} 
                  onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') navigate(hotspot.href);
                  }}
                />
              );
            })}
          </svg>
        </div>
      </div>

      {/* Hướng dẫn */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center pointer-events-none z-30">
        <p className="text-white/80 text-sm bg-black/40 backdrop-blur-sm px-4 py-2 rounded-full">
          Di chuột vào các vật thể để khám phá ✨
        </p>
      </div>
    </div>
  );
}