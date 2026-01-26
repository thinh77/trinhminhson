/**
 * Forgot Password Page
 * Modern professional design with glassmorphism and Soft UI Evolution
 * Typography: Poppins (heading) + Open Sans (body)
 * Colors: Blog palette (Blue #3B82F6, Orange CTA #F97316)
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  KeyRound,
  AlertCircle,
  Loader2,
  Mail,
  Home,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { authApi } from "@/services/auth.service";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [message, setMessage] = useState("");

  const validateEmail = (email: string) => {
    if (!email) {
      return "Vui lòng nhập email";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Email không hợp lệ";
    }
    return "";
  };

  const handleBlur = () => {
    setError(validateEmail(email));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailError = validateEmail(email);
    setError(emailError);

    if (emailError) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await authApi.forgotPassword({ email });
      setMessage(response.message);
      setIsSuccess(true);
    } catch (error: unknown) {
      const err = error as { message?: string };
      setError(
        err.message || "Có lỗi xảy ra. Vui lòng thử lại sau."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-white to-orange-50">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 -right-20 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 -left-20 w-96 h-96 bg-orange-400/10 rounded-full blur-3xl"></div>
        </div>

        {/* Home Button */}
        <Link
          to="/"
          className="absolute top-6 left-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/80 transition-all duration-200 shadow-sm font-['Open_Sans',sans-serif] text-sm font-medium"
        >
          <Home className="w-4 h-4" />
          <span>Trang chủ</span>
        </Link>

        <Card className="w-full max-w-md relative bg-white/95 backdrop-blur-xl border border-slate-200 shadow-2xl shadow-blue-500/10">
          <div className="p-8 sm:p-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg shadow-green-500/30 mb-4">
              <CheckCircle className="w-8 h-8 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 font-['Poppins',sans-serif] tracking-tight mb-2">
              Email đã được gửi
            </h1>
            <p className="text-slate-600 font-['Open_Sans',sans-serif] mb-6">
              {message}
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium font-['Open_Sans',sans-serif]"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại đăng nhập
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -right-20 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 -left-20 w-96 h-96 bg-orange-400/10 rounded-full blur-3xl"></div>
      </div>

      {/* Home Button */}
      <Link
        to="/"
        className="absolute top-6 left-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/80 transition-all duration-200 shadow-sm font-['Open_Sans',sans-serif] text-sm font-medium"
      >
        <Home className="w-4 h-4" />
        <span>Trang chủ</span>
      </Link>

      <Card className="w-full max-w-md relative bg-white/95 backdrop-blur-xl border border-slate-200 shadow-2xl shadow-blue-500/10">
        <div className="p-8 sm:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30 mb-4">
              <KeyRound className="w-8 h-8 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 font-['Poppins',sans-serif] tracking-tight">
              Quên mật khẩu?
            </h1>
            <p className="text-slate-600 mt-2 font-['Open_Sans',sans-serif]">
              Nhập email để nhận link đặt lại mật khẩu
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error */}
            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 font-['Open_Sans',sans-serif]">
                  {error}
                </p>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-slate-900 mb-2 font-['Open_Sans',sans-serif]"
              >
                Email
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Mail className="w-5 h-5" />
                </div>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={handleBlur}
                  className={cn(
                    "h-12 w-full pl-11 pr-4 bg-white border transition-all duration-200 font-['Open_Sans',sans-serif]",
                    error
                      ? "border-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      : "border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-slate-300"
                  )}
                  placeholder="email@example.com"
                  aria-invalid={!!error}
                  aria-describedby={error ? "email-error" : undefined}
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 font-semibold font-['Poppins',sans-serif] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin h-5 w-5 text-white" />
                  <span>Đang gửi...</span>
                </div>
              ) : (
                "Gửi link đặt lại mật khẩu"
              )}
            </Button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium font-['Open_Sans',sans-serif]"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
