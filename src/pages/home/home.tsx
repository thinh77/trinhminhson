import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { hotspots } from "@/config/hotspots";
import { Navbar } from "@/components/layout/navbar";
import { cn } from "@/lib/utils";
import { Laptop, BookOpen, Monitor, ArrowRight } from "lucide-react";

// Map hotspot IDs to their display info
const hotspotInfo: Record<string, { label: string; description: string; icon: React.ComponentType<{ className?: string }> }> = {
  laptop: { label: "Blog", description: "Read my latest articles", icon: Laptop },
  notebook: { label: "About", description: "Learn more about me", icon: BookOpen },
  monitor: { label: "Videos", description: "Watch my content", icon: Monitor },
};

export function HomePage() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const navigate = useNavigate();

  // Image dimensions (16:9 aspect ratio)
  const ORIGINAL_WIDTH = 1920;
  const ORIGINAL_HEIGHT = 1080;

  useEffect(() => {
    // Trigger entrance animation after mount
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const hoveredHotspot = hoveredId ? hotspotInfo[hoveredId] : null;

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background">
      {/* Floating Navbar with proper spacing */}
      <Navbar className="fixed top-4 left-4 right-4 z-50 rounded-2xl shadow-lg shadow-black/5" />

      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-accent/5 pointer-events-none" />

      {/* Main container */}
      <div className="relative w-full min-h-screen flex items-center justify-center pt-24 pb-8 px-4">
        <div 
          className={cn(
            "relative w-full max-w-7xl mx-auto",
            "transition-all duration-700 ease-out",
            isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          {/* Interactive workspace image */}
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl shadow-black/20 border border-border/50 bg-secondary">
            {/* Background image */}
            <img
              src="/images/home.jpg"
              alt="Son Trinh's creative workspace with laptop, notebook, and monitor"
              className="absolute inset-0 w-full h-full object-cover"
              loading="eager"
            />

            {/* Subtle overlay for better contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent pointer-events-none" />

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
                const info = hotspotInfo[hotspot.id];
                
                return (
                  <path
                    key={hotspot.id}
                    d={hotspot.path}
                    className={cn(
                      "cursor-pointer transition-all duration-300 ease-out outline-none",
                      // Default: subtle indicator on mobile
                      "fill-transparent",
                      "stroke-accent/40 stroke-[3px]",
                      // Desktop: more subtle until hover
                      "md:stroke-accent/20 md:stroke-[2px]"
                    )}
                    style={{
                      fill: isHovered ? "rgba(37, 99, 235, 0.15)" : "transparent",
                      stroke: isHovered ? "hsl(217, 91%, 60%)" : undefined,
                      strokeWidth: isHovered ? 4 : undefined,
                      filter: isHovered ? "url(#glow)" : undefined,
                    }}
                    onMouseEnter={() => setHoveredId(hotspot.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => navigate(hotspot.href)}
                    role="button"
                    aria-label={`Navigate to ${info?.label || hotspot.id}`}
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
                  "absolute bottom-6 left-6 z-20",
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
                    <p className="font-semibold text-foreground" style={{ fontFamily: "'Outfit', sans-serif" }}>
                      {hoveredHotspot.label}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {hoveredHotspot.description}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-accent ml-2" />
                </div>
              </div>
            )}
          </div>

          {/* Quick navigation cards - visible on larger screens */}
          <div 
            className={cn(
              "grid grid-cols-3 gap-4 mt-6",
              "transition-all duration-700 delay-300 ease-out",
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            {hotspots.map((hotspot) => {
              const info = hotspotInfo[hotspot.id];
              if (!info) return null;
              const Icon = info.icon;
              
              return (
                <button
                  key={hotspot.id}
                  onClick={() => navigate(hotspot.href)}
                  onMouseEnter={() => setHoveredId(hotspot.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className={cn(
                    "group flex items-center gap-3 p-4 rounded-xl",
                    "bg-card/50 backdrop-blur-sm border border-border/50",
                    "hover:bg-card hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5",
                    "transition-all duration-300 ease-out",
                    "cursor-pointer",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    hoveredId === hotspot.id && "bg-card border-accent/30 shadow-lg shadow-accent/5"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    "bg-secondary group-hover:bg-accent/10 transition-colors duration-300",
                    hoveredId === hotspot.id && "bg-accent/10"
                  )}>
                    <Icon className={cn(
                      "w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors duration-300",
                      hoveredId === hotspot.id && "text-accent"
                    )} />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-foreground" style={{ fontFamily: "'Outfit', sans-serif" }}>
                      {info.label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {info.description}
                    </p>
                  </div>
                  <ArrowRight className={cn(
                    "w-4 h-4 ml-auto text-muted-foreground opacity-0 -translate-x-2",
                    "group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-accent",
                    "transition-all duration-300",
                    hoveredId === hotspot.id && "opacity-100 translate-x-0 text-accent"
                  )} />
                </button>
              );
            })}
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
        <p className="text-muted-foreground text-sm bg-card/80 backdrop-blur-sm px-4 py-2 rounded-full border border-border/50 shadow-lg">
          Hover over objects to explore
        </p>
      </div>
    </div>
  );
}