import { cn } from "@/lib/utils";

interface InstructionHintProps {
  isLoaded: boolean;
}

export function InstructionHint({ isLoaded }: InstructionHintProps) {
  return (
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
  );
}
