import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/navbar";
import { ArrowLeft, Clock } from "lucide-react";

export function UnderDevelopmentPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar />
      
      <main className="flex items-center justify-center px-4 pt-32 pb-16">
        <div className="max-w-md w-full text-center space-y-8">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/20 dark:bg-blue-500/10 rounded-full blur-2xl" />
              <Clock className="relative w-20 h-20 text-blue-600 dark:text-blue-400" strokeWidth={1.5} />
            </div>
          </div>

          {/* Content */}
          <div className="space-y-4">
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">
              Đang phát triển
            </h1>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Tính năng này hiện đang được phát triển. Vui lòng quay lại sau.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors duration-200 cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Quay lại</span>
            </button>
            
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 font-medium transition-colors duration-200 cursor-pointer"
            >
              Trang chủ
            </button>
          </div>
        </div>
      </main>

      <style>{`
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}
