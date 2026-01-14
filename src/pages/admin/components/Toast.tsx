import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

interface ToastProps {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}

export function Toast({ message, type, onClose }: ToastProps): React.ReactElement {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const Icon = type === "success" ? CheckCircle2 : AlertCircle;
  const bgColor = type === "success" ? "bg-green-500/90" : "bg-red-500/90";

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50",
        "flex items-center gap-3 px-4 py-3 rounded-xl",
        "shadow-lg shadow-black/20 backdrop-blur-xl",
        "animate-fade-in-up text-white",
        bgColor
      )}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 p-1 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
