/**
 * Registration Page
 * Modern professional design with glassmorphism and Soft UI Evolution
 * Typography: Poppins (heading) + Open Sans (body)
 * Colors: Blog palette (Blue #3B82F6, Orange CTA #F97316)
 */

import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Eye,
  EyeOff,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Lock,
  User,
  Home,
  Mail,
  Send,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { authApi } from "@/services/auth.service";

export default function Register() {
  const location = useLocation();
  const locationState = location.state as {
    email?: string;
    needsVerification?: boolean;
  } | null;

  const [step, setStep] = useState<"register" | "verify">(
    locationState?.needsVerification ? "verify" : "register"
  );
  const [registeredEmail, setRegisteredEmail] = useState(
    locationState?.email || ""
  );
  const [verificationCode, setVerificationCode] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [registerError, setRegisterError] = useState("");
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  // Validation functions
  const validateName = (name: string) => {
    if (!name) {
      return "Vui lòng nhập họ và tên";
    }
    if (name.length < 2) {
      return "Họ và tên phải có ít nhất 2 ký tự";
    }
    return "";
  };

  const validateUsername = (username: string) => {
    if (!username) {
      return "Vui lòng nhập tên đăng nhập";
    }
    if (username.length < 3) {
      return "Tên đăng nhập phải có ít nhất 3 ký tự";
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return "Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới";
    }
    return "";
  };

  const validateEmail = (email: string) => {
    if (!email) {
      return "Vui lòng nhập email";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Email không hợp lệ";
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

  const handleBlur = (field: keyof typeof formData) => {
    let error = "";
    switch (field) {
      case "name":
        error = validateName(formData.name);
        break;
      case "username":
        error = validateUsername(formData.username);
        break;
      case "email":
        error = validateEmail(formData.email);
        break;
      case "password":
        error = validatePassword(formData.password);
        break;
      case "confirmPassword":
        error = validateConfirmPassword(formData.confirmPassword);
        break;
    }
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const nameError = validateName(formData.name);
    const usernameError = validateUsername(formData.username);
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);
    const confirmPasswordError = validateConfirmPassword(
      formData.confirmPassword
    );

    setErrors({
      name: nameError,
      username: usernameError,
      email: emailError,
      password: passwordError,
      confirmPassword: confirmPasswordError,
    });

    if (
      nameError ||
      usernameError ||
      emailError ||
      passwordError ||
      confirmPasswordError
    ) {
      return;
    }

    setIsLoading(true);
    setRegisterError("");

    try {
      const response = await authApi.register({
        name: formData.name,
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      setRegisteredEmail(formData.email);
      setSuccessMessage(
        response.message ||
          "Đăng ký thành công! Vui lòng kiểm tra email để xác thực."
      );
      setStep("verify");
    } catch (error: unknown) {
      const errorMessage = (error as { message?: string })?.message;
      setRegisterError(errorMessage || "Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!verificationCode || verificationCode.length !== 6) {
      setRegisterError("Vui lòng nhập mã xác thực 6 chữ số");
      return;
    }

    setIsLoading(true);
    setRegisterError("");

    try {
      const response = await authApi.verifyEmail({
        email: registeredEmail,
        code: verificationCode,
      });

      // Store token with correct key matching AuthContext
      localStorage.setItem("auth_token", response.token);

      setSuccessMessage(
        "Email đã được xác thực thành công! Đang chuyển hướng..."
      );

      // Refresh auth context and redirect
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    } catch (error: unknown) {
      const errorMessage = (error as { message?: string })?.message;
      setRegisterError(errorMessage || "Xác thực thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    setRegisterError("");
    setSuccessMessage("");

    try {
      const response = await authApi.resendCode({ email: registeredEmail });
      setSuccessMessage(response.message || "Mã xác thực mới đã được gửi!");
    } catch (error: unknown) {
      const errorMessage = (error as { message?: string })?.message;
      setRegisterError(
        errorMessage || "Không thể gửi lại mã. Vui lòng thử lại."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Password strength indicator
  const getPasswordStrength = () => {
    const password = formData.password;
    if (!password) return { strength: 0, label: "", color: "" };

    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 2)
      return { strength: 1, label: "Yếu", color: "bg-red-500" };
    if (strength <= 4)
      return { strength: 2, label: "Trung bình", color: "bg-yellow-500" };
    return { strength: 3, label: "Mạnh", color: "bg-green-500" };
  };

  const passwordStrength = getPasswordStrength();

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
              {step === "register" ? (
                <UserPlus className="w-8 h-8 text-white" strokeWidth={2.5} />
              ) : (
                <Mail className="w-8 h-8 text-white" strokeWidth={2.5} />
              )}
            </div>
            <h1 className="text-3xl font-bold text-slate-900 font-['Poppins',sans-serif] tracking-tight">
              {step === "register" ? "Tạo tài khoản" : "Xác thực Email"}
            </h1>
            <p className="text-slate-600 mt-2 font-['Open_Sans',sans-serif]">
              {step === "register"
                ? "Tham gia và bắt đầu hành trình học tập của bạn"
                : `Nhập mã 6 chữ số đã được gửi đến ${registeredEmail}`}
            </p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-emerald-700 font-['Open_Sans',sans-serif]">
                {successMessage}
              </p>
            </div>
          )}

          {/* Register Error */}
          {registerError && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 font-['Open_Sans',sans-serif]">
                {registerError}
              </p>
            </div>
          )}

          {/* Registration Form */}
          {step === "register" && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name Field */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-semibold text-slate-900 mb-2 font-['Open_Sans',sans-serif]"
                >
                  Họ và tên
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <User className="w-5 h-5" />
                  </div>
                  <Input
                    id="name"
                    type="text"
                    autoComplete="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    onBlur={() => handleBlur("name")}
                    className={cn(
                      "h-12 w-full pl-11 pr-4 bg-white border transition-all duration-200 font-['Open_Sans',sans-serif]",
                      errors.name
                        ? "border-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        : "border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-slate-300"
                    )}
                    placeholder="Nguyễn Văn A"
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? "name-error" : undefined}
                  />
                </div>
                {errors.name && (
                  <p
                    id="name-error"
                    className="mt-2 text-sm text-red-600 font-['Open_Sans',sans-serif] flex items-center gap-1.5"
                    role="alert"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errors.name}</span>
                  </p>
                )}
              </div>

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
                    aria-describedby={
                      errors.username ? "username-error" : undefined
                    }
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
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    onBlur={() => handleBlur("email")}
                    className={cn(
                      "h-12 w-full pl-11 pr-4 bg-white border transition-all duration-200 font-['Open_Sans',sans-serif]",
                      errors.email
                        ? "border-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        : "border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-slate-300"
                    )}
                    placeholder="email@example.com"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                  />
                </div>
                {errors.email && (
                  <p
                    id="email-error"
                    className="mt-2 text-sm text-red-600 font-['Open_Sans',sans-serif] flex items-center gap-1.5"
                    role="alert"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errors.email}</span>
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
                    aria-describedby={
                      errors.password ? "password-error" : undefined
                    }
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
                {formData.password && (
                  <div className="mt-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full transition-all duration-300 rounded-full",
                            passwordStrength.color
                          )}
                          style={{
                            width: `${(passwordStrength.strength / 3) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-slate-600 min-w-[70px] text-right font-['Open_Sans',sans-serif]">
                        {passwordStrength.label}
                      </span>
                    </div>
                  </div>
                )}
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
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
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
                      errors.confirmPassword
                        ? "confirm-password-error"
                        : undefined
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors duration-200 cursor-pointer p-1"
                    aria-label={
                      showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                    }
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
                    id="confirm-password-error"
                    className="mt-2 text-sm text-red-600 font-['Open_Sans',sans-serif] flex items-center gap-1.5"
                    role="alert"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errors.confirmPassword}</span>
                  </p>
                )}
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
                    <span>Đang tạo tài khoản...</span>
                  </div>
                ) : (
                  "Tạo tài khoản"
                )}
              </Button>
            </form>
          )}

          {/* Verification Form */}
          {step === "verify" && (
            <form onSubmit={handleVerifyEmail} className="space-y-5">
              {/* Verification Code Input */}
              <div>
                <label
                  htmlFor="code"
                  className="block text-sm font-semibold text-slate-900 mb-2 font-['Open_Sans',sans-serif]"
                >
                  Mã xác thực
                </label>
                <Input
                  id="code"
                  type="text"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setVerificationCode(value);
                  }}
                  className="h-14 text-center text-2xl font-bold tracking-widest font-mono"
                  placeholder="000000"
                  autoComplete="off"
                  autoFocus
                />
                <p className="mt-2 text-sm text-slate-500 font-['Open_Sans',sans-serif] text-center">
                  Nhập mã 6 chữ số từ email của bạn
                </p>
              </div>

              {/* Verify Button */}
              <Button
                type="submit"
                disabled={isLoading || verificationCode.length !== 6}
                className="w-full h-12 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 font-semibold font-['Poppins',sans-serif] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin h-5 w-5 text-white" />
                    <span>Đang xác thực...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Xác thực Email</span>
                  </div>
                )}
              </Button>

              {/* Resend Code Button */}
              <Button
                type="button"
                onClick={handleResendCode}
                disabled={isLoading}
                variant="outline"
                className="w-full h-12 border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-semibold font-['Poppins',sans-serif] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin h-5 w-5" />
                    <span>Đang gửi...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Send className="w-5 h-5" />
                    <span>Gửi lại mã</span>
                  </div>
                )}
              </Button>

              {/* Back to Register */}
              <Button
                type="button"
                onClick={() => {
                  setStep("register");
                  setVerificationCode("");
                  setSuccessMessage("");
                  setRegisterError("");
                }}
                variant="ghost"
                className="w-full h-12 text-slate-600 hover:text-slate-900 font-semibold font-['Poppins',sans-serif] cursor-pointer"
              >
                <div className="flex items-center justify-center gap-2">
                  <ArrowLeft className="w-5 h-5" />
                  <span>Quay lại đăng ký</span>
                </div>
              </Button>
            </form>
          )}

          {/* Divider */}
          {step === "register" && (
            <>
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-slate-500 font-['Open_Sans',sans-serif]">
                    Đã có tài khoản?
                  </span>
                </div>
              </div>

              {/* Login Link */}
              <Link
                to="/login"
                className="block w-full h-12 px-6 rounded-xl border-2 border-blue-500 hover:border-blue-600 text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-semibold font-['Poppins',sans-serif] transition-all duration-200 flex items-center justify-center cursor-pointer"
              >
                Đăng nhập ngay
              </Link>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
