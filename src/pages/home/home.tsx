import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { hotspots } from "@/config/hotspots";
import { Navbar } from "@/components/layout/navbar";
import { cn } from "@/lib/utils";

// Map hotspot IDs to their display info

export function HomePage() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const navigate = useNavigate();

  // Image dimensions (16:9 aspect ratio)
  const ORIGINAL_WIDTH = 3161;
  const ORIGINAL_HEIGHT = 1778;

  useEffect(() => {
    // Trigger entrance animation after mount
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const hoveredHotspot = hoveredId ? hotspots.find(h => h.id === hoveredId) : null;

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background">
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes neon-blink {
          0%, 100% {
            stroke: rgba(255, 20, 147, 0.9);
            filter: drop-shadow(0 0 8px rgba(255, 20, 147, 0.8)) drop-shadow(0 0 20px rgba(255, 20, 147, 0.5));
          }
          50% {
            stroke: rgba(255, 20, 147, 0.4);
            filter: drop-shadow(0 0 2px rgba(255, 20, 147, 0.3));
          }
        }
        @media (max-width: 767px) {
          .hotspot-neon {
            animation: neon-blink 1.5s ease-in-out infinite !important;
            stroke: rgba(255, 20, 147, 0.9) !important;
            stroke-width: 6px !important;
            stroke-linecap: round;
            stroke-linejoin: round;
          }
        }
      `}</style>

      {/* Floating Navbar with proper spacing */}
      <Navbar className="fixed top-4 left-4 right-4 z-50 rounded-2xl shadow-lg shadow-black/5" />

      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-accent/5 pointer-events-none" />

      {/* Main container */}
      <div className="absolute inset-0 w-full min-h-full overflow-x-auto overflow-y-hidden hide-scrollbar">
        <div className="min-w-full min-h-screen flex items-center justify-start md:justify-center px-0 md:px-0 py-0">
          <div 
            className={cn(
              "relative mx-auto transition-all duration-700 ease-out flex-shrink-0",
              // Mobile: Panorama view (height-constrained, scrollable width)
              "h-[100vh] w-auto aspect-video",
              // Desktop: Standard view (width-constrained)
              "md:w-full md:h-auto",
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
          >
            {/* Interactive workspace image */}
            <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl shadow-black/20 border border-border/50 bg-secondary">
            {/* Background image */}
            <img
              src="/images/home.png"
              alt="Son Trinh's creative workspace with laptop, notebook, and monitor"
              className="absolute inset-0 w-full h-full aspect-video object-contain"
              // loading="eager"
            />

            {/* Subtle overlay for better contrast */}
            {/* <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent pointer-events-none" /> */}

            {/* SVG hotspot overlay */}
            <svg
              className="absolute inset-0 w-full h-full z-10"
              viewBox={`0 0 ${ORIGINAL_WIDTH} ${ORIGINAL_HEIGHT}`}
              preserveAspectRatio="xMidYMid meet"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="Interactive workspace - hover or click on objects to explore"
            >
              <defs>
                {/* Glow filter for hover state */}
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {hotspots.map((hotspot) => {
                const isHovered = hoveredId === hotspot.id;
                return (
                  <path
                    key={hotspot.id}
                    d={hotspot.path}
                    className={cn(
                      "cursor-pointer transition-all duration-300 ease-out outline-none",
                      // Default: neon blink on mobile
                      "fill-transparent hotspot-neon",
                      "stroke-[6px]",
                      // Desktop: more subtle until hover
                      "md:stroke-accent/20 md:stroke-[2px]"
                    )}
                    style={{
                      fill: isHovered ? "rgba(255, 100, 191, 0.06)" : "transparent",
                      stroke: isHovered ? "#ff1493" : undefined,
                      strokeWidth: isHovered ? 4 : undefined,
                      filter: isHovered ? "url(#glow)" : undefined,
                    }}
                    onMouseEnter={() => setHoveredId(hotspot.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => navigate(hotspot.href)}
                    role="button"
                    aria-label={`Navigate to ${hotspot.label || hotspot.id}`}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        navigate(hotspot.href);
                      }
                    }}
                  />
                );
              })}
            </svg>

            {/* Hotspot tooltip card */}
            {hoveredHotspot && (
              <div 
                className={cn(
                  "absolute bottom-40 left-6 z-20",
                  "bg-card/95 backdrop-blur-xl border border-border rounded-xl",
                  "px-5 py-4 shadow-xl shadow-black/20",
                  "animate-fade-in-up",
                  "pointer-events-none"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <hoveredHotspot.icon className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {hoveredHotspot.label}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {hoveredHotspot.description}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>

      {/* Instruction hint */}
      <div 
        className={cn(
          "absolute bottom-6 left-1/2 -translate-x-1/2 z-30",
          "transition-all duration-700 delay-500 ease-out",
          isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}
      >
        <p className="text-muted-foreground text-sm bg-card/80 backdrop-blur-sm px-4 py-2 rounded-full border border-border/50 shadow-lg whitespace-nowrap">
          <span className="hidden md:inline">Hover over objects to explore</span>
          <span className="md:hidden">Drag left/right to explore</span>
        </p>
      </div>
    </div>
  );
}