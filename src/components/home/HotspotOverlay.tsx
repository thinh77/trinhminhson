import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { IMAGE_DIMENSIONS } from "@/constants/home";
import type { Hotspot } from "@/config/hotspots";

interface HotspotOverlayProps {
  hotspots: Hotspot[];
  hoveredId: string | null;
  onHoverChange: (id: string | null) => void;
}

export function HotspotOverlay({ hotspots, hoveredId, onHoverChange }: HotspotOverlayProps) {
  const navigate = useNavigate();

  return (
    <svg
      className="absolute inset-0 w-full h-full z-10"
      viewBox={`0 0 ${IMAGE_DIMENSIONS.width} ${IMAGE_DIMENSIONS.height}`}
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Interactive workspace - hover or click on objects to explore"
    >
      <defs>
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
              "fill-transparent hotspot-neon stroke-[6px]",
              "md:stroke-accent/0 md:stroke-[2px]"
            )}
            style={{
              fill: isHovered ? "rgba(255, 238, 255, 0.11)" : "transparent",
              stroke: isHovered ? "#ff1493" : undefined,
              strokeWidth: isHovered ? 4 : undefined,
              filter: isHovered ? "url(#glow)" : undefined,
            }}
            onMouseEnter={() => onHoverChange(hotspot.id)}
            onMouseLeave={() => onHoverChange(null)}
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
  );
}
