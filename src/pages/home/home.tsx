import { useState, useEffect } from "react";
import { hotspots } from "@/config/hotspots";
import { Navbar } from "@/components/layout/navbar";
import { HotspotOverlay } from "@/components/home/HotspotOverlay";
import { HotspotTooltip } from "@/components/home/HotspotTooltip";
import { InstructionHint } from "@/components/home/InstructionHint";
import { ANIMATION_DELAYS, NAVBAR_HEIGHT } from "@/constants/home";
import { cn } from "@/lib/utils";
import "@/styles/home.css";

export function HomePage() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), ANIMATION_DELAYS.pageLoad);
    return () => clearTimeout(timer);
  }, []);

  const hoveredHotspot = hoveredId ? hotspots.find(h => h.id === hoveredId) : null;

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background">
      <Navbar className="fixed top-0 left-0 right-0 z-50 shadow-lg shadow-black/5" />

      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-accent/5 pointer-events-none" />

      <div 
        className="absolute left-0 right-0 bottom-0 w-full overflow-x-auto overflow-y-hidden hide-scrollbar select-none"
        style={{ top: `${NAVBAR_HEIGHT.mobile}px` }}
      >
        <div className="w-full h-full flex items-center justify-start md:justify-center">
          <div
            className={cn(
              "relative mx-auto transition-all duration-700 ease-out flex-shrink-0",
              "h-[calc(100vh-73px)] w-auto aspect-video",
              "md:max-h-[calc(100vh-70px)] md:w-auto md:max-w-full",
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
          >
            <div className="select-none relative w-full h-full rounded-2xl overflow-hidden shadow-2xl shadow-black/20 border border-border/50 bg-secondary">
              <img
                src="/images/home.jpg"
                alt="Son Trinh's creative workspace with laptop, notebook, and monitor"
                className="absolute inset-0 w-full h-full aspect-video object-contain"
              />

              <HotspotOverlay
                hotspots={hotspots}
                hoveredId={hoveredId}
                onHoverChange={setHoveredId}
              />

              {hoveredHotspot && <HotspotTooltip hotspot={hoveredHotspot} />}
            </div>
          </div>
        </div>
      </div>

      <InstructionHint isLoaded={isLoaded} />
    </div>
  );
}