/**
 * Reset Password Page
 * Modern professional design with glassmorphism and Soft UI Evolution
 * Typography: Poppins (heading) + Open Sans (body)
 * Colors: Blog palette (Blue #3B82F6, Orange CTA #F97316)
 */

import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  KeyRound,
  AlertCircle,
  Loader2,
  Lock,
  Eye,
  EyeOff,
  Home,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { authApi } from "@/services/auth.service";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate("/forgot-password");
    }
  }, [token, navigate]);

  const validatePassword = (password: string) => {
    if (!password) {
      return "Vui lòng nhập mật khẩu";
    }
    if (password.length < 6) {
      return "Mật khẩu phải có ít nhất 6 ký tự";
    }
    if (!/[A-Z]/.test(password)) {
      return "Mật khẩu phải chứa ít nhất một chữ hoa";
    }
    if (!/[a-z]/.test(password)) {
      return "Mật khẩu phải chứa ít nhất một chữ thường";
    }
    if (!/[0-9]/.test(password)) {
      return "Mật khẩu phải chứa ít nhất một số";
    }
    return "";
  };

  const validateConfirmPassword = (confirmPassword: string) => {
    if (!confirmPassword) {
      return "Vui lòng xác nhận mật khẩu";
    }
    if (confirmPassword !== formData.password) {
      return "Mật khẩu xác nhận không khớp";
    }
    return "";
  };

  const handleBlur = (field: "password" | "confirmPassword") => {
    if (field === "password") {
      setErrors((prev) => ({
        ...prev,
        password: validatePassword(formData.password),
      }));
    } else {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: validateConfirmPassword(formData.confirmPassword),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const passwordError = validatePassword(formData.password);
    const confirmPasswordError = validateConfirmPassword(formData.confirmPassword);

    setErrors({
      password: passwordError,
      confirmPassword: confirmPasswordError,
    });

    if (passwordError || confirmPasswordError) {
      return;
    }

    if (!token) {
      setSubmitError("Token không hợp lệ");
      return;
    }

    setIsLoading(true);
    setSubmitError("");

    try {
      await authApi.resetPassword({
        token,
        password: formData.password,
      });
      setIsSuccess(true);
    } catch (error: unknown) {
      const err = error as { message?: string };
      setSubmitError(
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
              Đặt lại mật khẩu thành công!
            </h1>
            <p className="text-slate-600 font-['Open_Sans',sans-serif] mb-6">
              Bạn có thể đăng nhập bằng mật khẩu mới.
            </p>
            <Link
              to="/login"
              className="block w-full h-12 px-6 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold font-['Poppins',sans-serif] transition-all duration-200 flex items-center justify-center cursor-pointer shadow-lg shadow-orange-500/30"
            >
              Đăng nhập ngay
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
              Đặt lại mật khẩu
            </h1>
            <p className="text-slate-600 mt-2 font-['Open_Sans',sans-serif]">
              Nhập mật khẩu mới cho tài khoản của bạn
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Submit Error */}
            {submitError && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 font-['Open_Sans',sans-serif]">
                  {submitError}
                </p>
              </div>
            )}

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-slate-900 mb-2 font-['Open_Sans',sans-serif]"
              >
                Mật khẩu mới
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  onBlur={() => handleBlur("password")}
                  className={cn(
                    "h-12 w-full pl-11 pr-12 bg-white border transition-all duration-200 font-['Open_Sans',sans-serif]",
                    errors.password
                      ? "border-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      : "border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-slate-300"
                  )}
                  placeholder="••••••••"
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? "password-error" : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors duration-200 cursor-pointer p-1"
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p
                  id="password-error"
                  className="mt-2 text-sm text-red-600 font-['Open_Sans',sans-serif] flex items-center gap-1.5"
                  role="alert"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errors.password}</span>
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-semibold text-slate-900 mb-2 font-['Open_Sans',sans-serif]"
              >
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                  onBlur={() => handleBlur("confirmPassword")}
                  className={cn(
                    "h-12 w-full pl-11 pr-12 bg-white border transition-all duration-200 font-['Open_Sans',sans-serif]",
                    errors.confirmPassword
                      ? "border-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      : "border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-slate-300"
                  )}
                  placeholder="••••••••"
                  aria-invalid={!!errors.confirmPassword}
                  aria-describedby={
                    errors.confirmPassword ? "confirmPassword-error" : undefined
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors duration-200 cursor-pointer p-1"
                  aria-label={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p
                  id="confirmPassword-error"
                  className="mt-2 text-sm text-red-600 font-['Open_Sans',sans-serif] flex items-center gap-1.5"
                  role="alert"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errors.confirmPassword}</span>
                </p>
              )}
            </div>

            {/* Password Requirements */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <p className="text-xs text-slate-500 font-['Open_Sans',sans-serif]">
                Mật khẩu phải có ít nhất 6 ký tự, bao gồm chữ hoa, chữ thường và số.
              </p>
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
                  <span>Đang xử lý...</span>
                </div>
              ) : (
                "Đặt lại mật khẩu"
              )}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
