/**
 * Toast Notification Component
 * Design: Claymorphism + Vibrant Learning Colors
 * Auto-dismisses after 3 seconds with smooth animations
 */

import { useEffect } from "react";

export interface ToastProps {
  id: string;
  message: string;
  type?: "success" | "error" | "info";
  onClose: (id: string) => void;
}

const Toast = ({ id, message, type = "success", onClose }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 3000);

    return () => clearTimeout(timer);
  }, [id, onClose]);

  const icon = {
    success: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  }[type];

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-2xl text-white shadow-lg backdrop-blur-sm animate-in slide-in-from-right duration-300"
      style={{
        background: `linear-gradient(135deg, ${type === "success" ? "rgba(20, 184, 166, 0.95)" : type === "error" ? "rgba(239, 68, 68, 0.95)" : "rgba(59, 130, 246, 0.95)"}, ${type === "success" ? "rgba(16, 185, 129, 0.95)" : type === "error" ? "rgba(236, 72, 153, 0.95)" : "rgba(99, 102, 241, 0.95)"})`,
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
      }}
    >
      <div className="flex-shrink-0">{icon}</div>
      <p className="text-sm font-medium flex-1">{message}</p>
      <button
        type="button"
        onClick={() => onClose(id)}
        className="flex-shrink-0 hover:bg-white/20 rounded-lg p-1 transition-colors cursor-pointer"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default Toast;
