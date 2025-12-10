import { cn } from "@/lib/utils";
import type { Hotspot } from "@/config/hotspots";

interface HotspotTooltipProps {
  hotspot: Hotspot;
}

export function HotspotTooltip({ hotspot }: HotspotTooltipProps) {
  const Icon = hotspot.icon;

  return (
    <div
      className={cn(
        "absolute z-20",
        "bg-card/95 backdrop-blur-xl border border-border rounded-xl",
        "px-3 py-2 shadow-xl shadow-black/20",
        "animate-fade-in-up",
        "pointer-events-none",
        "max-w-xs",
        "left-1/2 -translate-x-1/2 top-4"
      )}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-accent" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-foreground text-sm">
            {hotspot.label}
          </p>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {hotspot.description}
          </p>
        </div>
      </div>
    </div>
  );
}
