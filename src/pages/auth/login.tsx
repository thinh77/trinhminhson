/**
 * Login Page
 * Modern professional design with glassmorphism and Soft UI Evolution
 * Typography: Poppins (heading) + Open Sans (body)
 * Colors: Blog palette (Blue #3B82F6, Orange CTA #F97316)
 */

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Eye, EyeOff, LogIn, AlertCircle, Loader2, Lock, User, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

export default function Login() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const navigate = useNavigate();
  const { isAuthenticated, loading, login } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  const validateUsername = (username: string) => {
    if (!username) {
      return "Vui lòng nhập tên đăng nhập";
    }
    if (username.length < 3) {
      return "Tên đăng nhập phải có ít nhất 3 ký tự";
    }
    return "";
  };

  const validatePassword = (password: string) => {
    if (!password) {
      return "Vui lòng nhập mật khẩu";
    }
    if (password.length < 6) {
      return "Mật khẩu phải có ít nhất 6 ký tự";
    }
    return "";
  };

  const handleBlur = (field: "username" | "password") => {
    if (field === "username") {
      setErrors((prev) => ({ ...prev, username: validateUsername(formData.username) }));
    } else {
      setErrors((prev) => ({
        ...prev,
        password: validatePassword(formData.password),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const usernameError = validateUsername(formData.username);
    const passwordError = validatePassword(formData.password);

    setErrors({
      username: usernameError,
      password: passwordError,
    });

    if (usernameError || passwordError) {
      return;
    }

    setIsLoading(true);
    setLoginError("");
    
    try {
      await login(formData.username, formData.password);
      navigate("/", { replace: true });
    } catch (error: unknown) {
      const err = error as { message?: string };
      setLoginError(err.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking auth status
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-orange-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
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
              <LogIn className="w-8 h-8 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 font-['Poppins',sans-serif] tracking-tight">
              Chào mừng trở lại
            </h1>
            <p className="text-slate-600 mt-2 font-['Open_Sans',sans-serif]">
              Đăng nhập để tiếp tục hành trình học tập
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Login Error */}
            {loginError && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 font-['Open_Sans',sans-serif]">
                  {loginError}
                </p>
              </div>
            )}

            {/* Username Field */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-semibold text-slate-900 mb-2 font-['Open_Sans',sans-serif]"
              >
                Tên đăng nhập
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <User className="w-5 h-5" />
                </div>
                <Input
                  id="username"
                  type="text"
                  autoComplete="username"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  onBlur={() => handleBlur("username")}
                  className={cn(
                    "h-12 w-full pl-11 pr-4 bg-white border transition-all duration-200 font-['Open_Sans',sans-serif]",
                    errors.username
                      ? "border-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      : "border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-slate-300"
                  )}
                  placeholder="username123"
                  aria-invalid={!!errors.username}
                  aria-describedby={errors.username ? "username-error" : undefined}
                />
              </div>
              {errors.username && (
                <p
                  id="username-error"
                  className="mt-2 text-sm text-red-600 font-['Open_Sans',sans-serif] flex items-center gap-1.5"
                  role="alert"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errors.username}</span>
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-slate-900 mb-2 font-['Open_Sans',sans-serif]"
              >
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
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

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-500 focus:ring-2 focus:ring-blue-500 transition-colors duration-200 cursor-pointer"
                />
                <span className="ml-2 text-sm text-slate-600 group-hover:text-slate-900 transition-colors duration-200 font-['Open_Sans',sans-serif]">
                  Ghi nhớ đăng nhập
                </span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-700 transition-colors duration-200 font-['Open_Sans',sans-serif] font-medium"
              >
                Quên mật khẩu?
              </Link>
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
                  <span>Đang đăng nhập...</span>
                </div>
              ) : (
                "Đăng nhập"
              )}
            </Button>
          </form>

          {/* Sign Up Link */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-500 font-['Open_Sans',sans-serif]">
                Chưa có tài khoản?
              </span>
            </div>
          </div>

          {/* Register Link */}
          <Link
            to="/register"
            className="block w-full h-12 px-6 rounded-xl border-2 border-blue-500 hover:border-blue-600 text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-semibold font-['Poppins',sans-serif] transition-all duration-200 flex items-center justify-center cursor-pointer"
          >
            Đăng ký ngay
          </Link>
        </div>
      </Card>
    </div>
  );
}
