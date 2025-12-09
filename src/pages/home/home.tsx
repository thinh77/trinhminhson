import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { hotspots } from "@/config/hotspots";
import { Navbar } from "@/components/layout/navbar";
import { cn } from "@/lib/utils";

// Map hotspot IDs to their display info

export function HomePage() {
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
    const [isLoaded, setIsLoaded] = useState(false);
    const navigate = useNavigate();

    // Image dimensions (16:9 aspect ratio)
    const ORIGINAL_WIDTH = 3161;
    const ORIGINAL_HEIGHT = 1777;

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
            stroke: #00FFFF;
            stroke-width: 5px;
            filter: drop-shadow(0 0 5px #00FFFF) 
                    drop-shadow(0 0 10px #00FFFF) 
                    drop-shadow(0 0 15px rgba(0, 255, 255, 0.6));
          }
          50% {
            stroke: #FF006E;
            stroke-width: 5px;
            filter: drop-shadow(0 0 5px #FF006E) 
                    drop-shadow(0 0 10px #FF006E) 
                    drop-shadow(0 0 15px rgba(255, 0, 110, 0.5));
          }
        }
        @media (max-width: 767px) {
          .hotspot-neon {
            animation: neon-blink 2s ease-in-out infinite !important;
            stroke-linecap: round;
            stroke-linejoin: round;
          }
        }
      `}</style>

            {/* Navbar */}
            <Navbar className="fixed top-0 left-0 right-0 z-50 shadow-lg shadow-black/5" />

            {/* Background gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-accent/5 pointer-events-none" />

            {/* Main container */}
            <div className="absolute top-[54px] left-0 right-0 bottom-0 w-full overflow-x-auto overflow-y-hidden hide-scrollbar select-none">
                <div className="w-full h-full flex items-center justify-start md:justify-center px-0 py-0 select-none">
                    <div
                        className={cn(
                            "relative mx-auto transition-all duration-700 ease-out flex-shrink-0",
                            // Mobile: Panorama view (height-constrained, scrollable width)
                            "h-[calc(100vh-73px)] w-auto aspect-video",
                            // Desktop: Fit to viewport with padding
                            "md:max-h-[calc(100vh-70px)] md:w-auto md:max-w-full",
                            isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                        )}
                    >
                        {/* Interactive workspace image */}
                        <div className="select-none relative w-full h-full rounded-2xl overflow-hidden shadow-2xl shadow-black/20 border border-border/50 bg-secondary">
                            {/* Background image */}
                            <img
                                src="/images/home.jpg"
                                alt="Son Trinh's creative workspace with laptop, notebook, and monitor"
                                className="absolute inset-0 w-full h-full aspect-video object-contain"
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
                                                "md:stroke-accent/0 md:stroke-[2px]"
                                            )}
                                            style={{
                                                fill: isHovered ? "rgba(255, 238, 255, 0.11)" : "transparent",
                                                stroke: isHovered ? "#ff1493" : undefined,
                                                strokeWidth: isHovered ? 4 : undefined,
                                                filter: isHovered ? "url(#glow)" : undefined,
                                            }}
                                            onMouseEnter={(e) => {
                                                setHoveredId(hotspot.id);
                                                // Get the bounding box of the path to position tooltip
                                                const bbox = (e.currentTarget as SVGPathElement).getBBox();
                                                const svg = (e.currentTarget as SVGPathElement).ownerSVGElement;
                                                if (svg) {
                                                    const svgRect = svg.getBoundingClientRect();
                                                    const scaleX = svgRect.width / ORIGINAL_WIDTH;
                                                    const scaleY = svgRect.height / ORIGINAL_HEIGHT;
                                                    
                                                    // Calculate center of hotspot in viewport coordinates
                                                    const centerX = bbox.x + bbox.width / 2;
                                                    const centerY = bbox.y + bbox.height / 2;
                                                    
                                                    setTooltipPosition({
                                                        x: centerX * scaleX,
                                                        y: centerY * scaleY
                                                    });
                                                }
                                            }}
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
                                        "absolute z-20",
                                        "bg-card/95 backdrop-blur-xl border border-border rounded-xl",
                                        "px-3 py-2 shadow-xl shadow-black/20",
                                        "animate-fade-in-up",
                                        "pointer-events-none",
                                        "max-w-xs"
                                    )}
                                    style={{
                                        left: tooltipPosition.x > window.innerWidth / 2 
                                            ? `${tooltipPosition.x - 20}px`
                                            : `${tooltipPosition.x + 20}px`,
                                        top: (() => {
                                            const baseTop = tooltipPosition.y - 40;
                                            const tooltipHeight = 100; // Approximate height
                                            const containerRect = document.querySelector('.relative.w-full.h-full')?.getBoundingClientRect();
                                            const maxTop = containerRect ? containerRect.height - tooltipHeight - 20 : baseTop;
                                            const minTop = 20;
                                            return `${Math.max(minTop, Math.min(baseTop, maxTop))}px`;
                                        })(),
                                        transform: tooltipPosition.x > window.innerWidth / 2 
                                            ? 'translateX(-100%)' 
                                            : 'translateX(0)',
                                    }}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                                            <hoveredHotspot.icon className="w-5 h-5 text-accent" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-semibold text-foreground text-sm">
                                                {hoveredHotspot.label}
                                            </p>
                                            <p className="text-xs text-muted-foreground line-clamp-2">
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
                    "absolute bottom-4 left-1/2 -translate-x-1/2 z-30",
                    "transition-all duration-700 delay-500 ease-out",
                    isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                )}
            >
                <p className="text-violet-600 font-semibold text-xs md:text-sm bg-card/90 backdrop-blur-sm px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-border/50 shadow-lg whitespace-nowrap">
                    <span className="hidden md:inline">Di chuột vào các đồ vật để khám phá</span>
                    <span className="md:hidden">Kéo trái/phải để khám phá</span>
                </p>
            </div>
        </div>
    );
}