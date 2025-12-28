/**
 * Settings Page
 * User profile management with avatar upload
 * Design: Claymorphism + Vibrant Learning Colors
 */

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import {
  getProfile,
  updateProfile,
  uploadAvatar,
  deleteAvatar,
  changePassword,
  type UserProfile,
  type ChangePasswordData,
} from "../../services/profile.service";
import { STATIC_BASE_URL } from "../../services/api";
import { ImageCropDialog } from "../../components/ui/image-crop-dialog";

// SVG Icons
const UserIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const CameraIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

export function SettingsPage() {
  const navigate = useNavigate();
  const { user: authUser, refreshUser } = useAuth();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
  });
  const [passwordData, setPasswordData] = useState<ChangePasswordData>({
    oldPassword: "",
    newPassword: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (!authUser) {
      navigate("/login");
      return;
    }
    loadProfile();
  }, [authUser, navigate]);

  async function loadProfile() {
    try {
      setLoading(true);
      const data = await getProfile();
      setProfile(data);
      setFormData({
        name: data.name,
      });
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Không thể tải thông tin", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      showToast("Vui lòng nhập tên", "error");
      return;
    }

    try {
      setSaving(true);
      const updated = await updateProfile(formData);
      setProfile(updated);
      showToast("Đã cập nhật thông tin thành công!", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Không thể cập nhật thông tin", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast("Kích thước ảnh không được vượt quá 5MB", "error");
      return;
    }

    // Validate file type
    if (!file.type.match(/image\/(jpeg|jpg|png|gif|webp)/)) {
      showToast("Chỉ chấp nhận file ảnh (JPEG, PNG, GIF, WebP)", "error");
      return;
    }

    // Read file and show crop dialog
    const reader = new FileReader();
    reader.onload = () => {
      setImageToCrop(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleCropComplete(croppedImage: Blob) {
    try {
      setUploading(true);
      setImageToCrop(null);
      
      // Convert blob to file
      const file = new File([croppedImage], "avatar.jpg", { type: "image/jpeg" });
      
      const updated = await uploadAvatar(file);
      setProfile(updated);
      await refreshUser();
      showToast("Đã cập nhật ảnh đại diện!", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Không thể tải ảnh lên", "error");
    } finally {
      setUploading(false);
    }
  }

  function handleCropCancel() {
    setImageToCrop(null);
  }

  async function handleDeleteAvatar() {
    try {
      setUploading(true);
      const updated = await deleteAvatar();
      setProfile(updated);
      await refreshUser();
      showToast("Đã xóa ảnh đại diện", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Không thể xóa ảnh", "error");
    } finally {
      setUploading(false);
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();

    if (!passwordData.oldPassword) {
      showToast("Vui lòng nhập mật khẩu hiện tại", "error");
      return;
    }

    if (!passwordData.newPassword) {
      showToast("Vui lòng nhập mật khẩu mới", "error");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showToast("Mật khẩu mới phải có ít nhất 6 ký tự", "error");
      return;
    }

    if (passwordData.newPassword !== confirmPassword) {
      showToast("Xác nhận mật khẩu không khớp", "error");
      return;
    }

    try {
      setChangingPassword(true);
      await changePassword(passwordData);
      showToast("Đã đổi mật khẩu thành công!", "success");
      setPasswordData({ oldPassword: "", newPassword: "" });
      setConfirmPassword("");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Không thể đổi mật khẩu", "error");
    } finally {
      setChangingPassword(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-teal-600 text-lg font-semibold">Đang tải...</div>
      </div>
    );
  }

  const avatarUrl = profile?.avatar ? `${STATIC_BASE_URL}${profile.avatar}` : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-3xl mx-auto mb-6">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 px-4 py-2 text-teal-700 hover:text-teal-900 transition-colors cursor-pointer"
        >
          <ArrowLeftIcon />
          <span className="font-semibold">Quay lại</span>
        </button>
      </div>

      {/* Main Card */}
      <div className="max-w-3xl mx-auto">
        <div
          className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8"
          style={{
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
          }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Cài đặt tài khoản</h1>

          {/* Avatar Section */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Ảnh đại diện</h2>
            <div className="flex items-center gap-6">
              {/* Avatar Display */}
              <div className="relative">
                <div
                  className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center"
                  style={{
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                  }}
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={profile?.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-white text-3xl font-bold">
                      {profile?.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                {uploading && (
                  <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>

              {/* Avatar Actions */}
              <div className="flex flex-col gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <CameraIcon />
                  <span className="font-medium">Tải ảnh lên</span>
                </button>
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={handleDeleteAvatar}
                    disabled={uploading}
                    className="inline-flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <TrashIcon />
                    <span className="font-medium">Xóa ảnh</span>
                  </button>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  JPG, PNG, GIF hoặc WebP. Tối đa 5MB.
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 my-8" />

          {/* Profile Form */}
          <form onSubmit={handleSubmit}>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cá nhân</h2>
            
            <div className="space-y-4">
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Tên hiển thị
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="Nhập tên của bạn"
                />
              </div>

              {/* Username Field (Read-only) */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Tên đăng nhập
                </label>
                <div className="px-4 py-3 rounded-xl bg-gray-50 text-gray-600 border border-gray-200">
                  @{profile?.username}
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-semibold hover:from-teal-600 hover:to-emerald-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {saving ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </form>

          <div className="border-t border-gray-200 my-8" />

          {/* Password Change Form */}
          <form onSubmit={handlePasswordChange}>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Đổi mật khẩu</h2>
            
            <div className="space-y-4">
              {/* Current Password */}
              <div>
                <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Mật khẩu hiện tại
                </label>
                <input
                  id="oldPassword"
                  type="password"
                  value={passwordData.oldPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="Nhập mật khẩu hiện tại"
                />
              </div>

              {/* New Password */}
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Mật khẩu mới
                </label>
                <input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Xác nhận mật khẩu mới
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="Nhập lại mật khẩu mới"
                />
              </div>
            </div>

            {/* Change Password Button */}
            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={changingPassword}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {changingPassword ? "Đang đổi..." : "Đổi mật khẩu"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Image Crop Dialog */}
      {imageToCrop && (
        <ImageCropDialog
          image={imageToCrop}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  );
}

export default SettingsPage;
