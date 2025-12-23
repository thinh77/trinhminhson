/**
 * Japanese Flashcard Home Page
 * Lists all vocabulary sets with management options
 * Design: Claymorphism + Vibrant Learning Colors
 */

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getVocabularySets,
  deleteVocabularySet,
  reorderVocabularySets,
  updateVocabularySet,
  cloneVocabularySet,
  type VocabularySet,
} from "../../services/vocabulary.service";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import ConfirmDialog from "../../components/ui/confirm-dialog";

// SVG Icons
const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const BookIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const GearIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const ChevronUpIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const HomeIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const FACE_OPTIONS = [
  { value: 0, label: "Kanji", color: "bg-violet-500" },
  { value: 1, label: "Nghĩa", color: "bg-emerald-500" },
  { value: 2, label: "Phiên âm", color: "bg-amber-500" },
  { value: 3, label: "Hán Việt", color: "bg-fuchsia-500" },
  { value: 4, label: "Ví dụ", color: "bg-sky-500" },
];

export function JapaneseFlashcardHome() {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const isGuest = !authLoading && !isAuthenticated;

  const [activeTab, setActiveTab] = useState<"personal" | "community">(
    isGuest ? "community" : "personal"
  );

  const [sets, setSets] = useState<VocabularySet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);
  const [settingsOpen, setSettingsOpen] = useState<number | null>(null);

  useEffect(() => {
    setActiveTab(isGuest ? "community" : "personal");
  }, [isGuest]);

  useEffect(() => {
    loadSets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, isGuest]);

  async function loadSets() {
    try {
      setLoading(true);
      const data = await getVocabularySets(activeTab);
      setSets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load sets");
    } finally {
      setLoading(false);
    }
  }

  async function handleClone(setId: number, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    try {
      await cloneVocabularySet(setId);
      showToast("Đã thêm bộ từ vựng vào danh sách cá nhân!", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Không thể thêm bộ từ vựng", "error");
    }
  }

  async function handleDelete(id: number, name: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDeleteTarget({ id, name });
  }

  async function confirmDelete() {
    if (!deleteTarget) return;

    try {
      await deleteVocabularySet(deleteTarget.id);
      setSets(sets.filter((s) => s.id !== deleteTarget.id));
      setDeleteTarget(null);
      showToast("Đã xóa bộ từ vựng thành công", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Không thể xóa bộ từ vựng", "error");
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  async function moveSet(index: number, direction: number, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= sets.length) return;

    const newSets = [...sets];
    const temp = newSets[index];
    newSets[index] = newSets[newIndex];
    newSets[newIndex] = temp;

    setSets(newSets);
    const orderedIds = newSets.map((set) => set.id);
    try {
      await reorderVocabularySets(orderedIds);
    } catch (err) {
      console.error("Failed to save order:", err);
    }
  }

  async function handleDefaultFaceChange(setId: number, newFace: number, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    try {
      await updateVocabularySet(setId, { default_face: newFace });
      setSets(
        sets.map((s) => (s.id === setId ? { ...s, default_face: newFace } : s))
      );
      setSettingsOpen(null);
    } catch (err) {
      console.error("Failed to update default face:", err);
    }
  }

  async function handleShareToggle(setId: number, isShared: boolean, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    try {
      await updateVocabularySet(setId, { is_shared: !isShared });
      setSets(sets.map((s) => (s.id === setId ? { ...s, is_shared: !isShared } : s)));
    } catch (err) {
      console.error("Failed to toggle sharing:", err);
      setError(err instanceof Error ? err.message : "Failed to update sharing");
    }
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (settingsOpen && !target.closest(".settings-dropdown") && !target.closest(".settings-btn")) {
        setSettingsOpen(null);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [settingsOpen]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-orange-50">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 border-b border-teal-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center gap-2 text-teal-700 hover:text-teal-900 transition-colors cursor-pointer"
            >
              <HomeIcon />
              <span className="font-medium hidden sm:inline">Trang chủ</span>
            </Link>
            <h1 className="text-xl font-bold text-teal-800 flex items-center gap-2">
              <span className="text-2xl">🎌</span>
              <span className="hidden sm:inline">Japanese Flashcard</span>
              <span className="sm:hidden">Flashcard</span>
            </h1>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Guest Banner */}
        {isGuest && (
          <div className="mb-6 p-4 bg-amber-50 border-2 border-amber-200 rounded-2xl">
            <p className="text-amber-800 text-sm text-center">
              <span className="font-semibold">Chế độ khách:</span> Bạn có thể xem và học các bộ từ vựng có sẵn.{" "}
              <Link to="/login" className="text-teal-600 font-semibold hover:underline">Đăng nhập</Link>
              {" "}hoặc{" "}
              <Link to="/register" className="text-teal-600 font-semibold hover:underline">đăng ký</Link>
              {" "}để upload, xóa và quản lý bộ từ vựng.
            </p>
          </div>
        )}

        {/* Tabs (authenticated users) */}
        {!isGuest && (
          <div className="mb-6 flex items-center gap-2 bg-white/70 backdrop-blur border border-teal-100 rounded-2xl p-2 shadow-sm">
            <button
              type="button"
              onClick={() => setActiveTab("personal")}
              className={`flex-1 py-2.5 rounded-xl font-semibold transition-colors cursor-pointer ${
                activeTab === "personal"
                  ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow"
                  : "text-teal-700 hover:bg-teal-50"
              }`}
            >
              Cá nhân
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("community")}
              className={`flex-1 py-2.5 rounded-xl font-semibold transition-colors cursor-pointer ${
                activeTab === "community"
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow"
                  : "text-orange-700 hover:bg-orange-50"
              }`}
            >
              Cộng đồng
            </button>
          </div>
        )}

        {/* Add New Button - Only for authenticated users */}
        {!isGuest && activeTab === "personal" && (
          <Link
            to="/learning/upload"
            className="group flex items-center justify-center gap-3 w-full py-4 px-6 mb-8 
                       bg-gradient-to-r from-teal-500 to-emerald-500 
                       hover:from-teal-600 hover:to-emerald-600
                       text-white font-semibold rounded-2xl
                       shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40
                       transform hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
          >
            <PlusIcon />
            <span>Thêm bộ từ vựng mới</span>
          </Link>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-500 rounded-full animate-spin"></div>
            <p className="mt-4 text-teal-600 font-medium">Đang tải...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={loadSets}
              className="px-6 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors cursor-pointer"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && sets.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-teal-100 rounded-full flex items-center justify-center">
              <BookIcon />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Chưa có bộ từ vựng nào</h3>
            <p className="text-gray-500 mb-6">
              {isGuest
                ? "Chưa có bộ từ vựng nào được chia sẻ công khai"
                : activeTab === "personal"
                  ? "Tải lên file Excel để bắt đầu học"
                  : "Chưa có bộ từ vựng nào được chia sẻ trong cộng đồng"}
            </p>
            {!isGuest && activeTab === "personal" && (
              <Link
                to="/learning/upload"
                className="inline-flex items-center gap-2 px-6 py-3 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition-colors cursor-pointer"
              >
                <PlusIcon />
                <span>Tải lên ngay</span>
              </Link>
            )}
            {isGuest && (
              <div className="space-y-3">
                <p className="text-sm text-gray-400">Đăng nhập để tạo bộ từ vựng của bạn</p>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition-colors cursor-pointer"
                >
                  <span>Đăng nhập</span>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Sets List */}
        {!loading && !error && sets.length > 0 && (
          <div className="space-y-4">
            {sets.map((set, index) => (
              <div key={set.id} className="group relative">
                {/* Reorder Buttons - Only for authenticated users */}
                {!isGuest && activeTab === "personal" && (
                  <div className="absolute -left-14 top-1/2 -translate-y-1/2 hidden md:flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => moveSet(index, -1, e)}
                      disabled={index === 0}
                      className="p-1.5 bg-white rounded-lg shadow-md hover:bg-teal-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                      title="Di chuyển lên"
                    >
                      <ChevronUpIcon />
                    </button>
                    <button
                      onClick={(e) => moveSet(index, 1, e)}
                      disabled={index === sets.length - 1}
                      className="p-1.5 bg-white rounded-lg shadow-md hover:bg-teal-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                      title="Di chuyển xuống"
                    >
                      <ChevronDownIcon />
                    </button>
                  </div>
                )}

                {/* Card */}
                <Link
                  to={`/learning/study/${set.id}`}
                  className="block bg-white rounded-2xl p-5 
                             shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] 
                             hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.15)]
                             border-2 border-transparent hover:border-teal-200
                             transform hover:-translate-y-1 transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    {/* Index Badge */}
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-teal-400 to-emerald-500 
                                    rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-teal-500/30">
                      {index + 1}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-800 truncate mb-1">
                        {set.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-50 text-teal-700 rounded-full font-medium">
                          <BookIcon />
                          {set.card_count} từ
                        </span>
                        {activeTab === "community" && (
                          <span className="inline-flex items-center gap-2 px-2.5 py-1 bg-orange-50 text-orange-700 rounded-full font-medium">
                            <span className="w-2 h-2 rounded-full bg-orange-400" />
                            {set.owner_name ? `Tác giả: ${set.owner_name}` : "Cộng đồng"}
                          </span>
                        )}
                        {!isGuest && activeTab === "personal" && (
                          <>
                            {set.original_owner_name ? (
                              <span className="inline-flex items-center gap-2 px-2.5 py-1 bg-orange-50 text-orange-700 rounded-full font-medium">
                                <span className="w-2 h-2 rounded-full bg-orange-400" />
                                {`Tác giả: ${set.original_owner_name}`}
                              </span>
                            ) : (
                              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${set.is_shared ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-700"}`}>
                                {set.is_shared ? "Đang chia sẻ" : "Cá nhân"}
                              </span>
                            )}
                          </>
                        )}
                        <span className="text-gray-400">{formatDate(set.created_at)}</span>
                        <span className={`px-2.5 py-1 rounded-full text-white text-xs font-medium ${FACE_OPTIONS[set.default_face || 0]?.color}`}>
                          {FACE_OPTIONS[set.default_face || 0]?.label}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1" onClick={(e) => e.preventDefault()}>
                      {/* Add to my sets - Community tab (authenticated users) */}
                      {!isGuest && activeTab === "community" && (
                        <button
                          onClick={(e) => handleClone(set.id, e)}
                          className="px-3 py-2 text-sm font-semibold rounded-xl bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors cursor-pointer"
                          title="Thêm bộ từ vựng này vào bộ của bạn"
                        >
                          Thêm
                        </button>
                      )}

                      {/* Settings Button - Only for authenticated users */}
                      {!isGuest && activeTab === "personal" && (
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setSettingsOpen(settingsOpen === set.id ? null : set.id);
                            }}
                            className="settings-btn p-2.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-colors cursor-pointer"
                            title="Cài đặt"
                          >
                            <GearIcon />
                          </button>

                          {/* Settings Dropdown */}
                          {settingsOpen === set.id && (
                            <div className="settings-dropdown absolute right-0 top-12 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                              <div className="px-2">
                                <button
                                  onClick={(e) => handleShareToggle(set.id, !!set.is_shared, e)}
                                  className={`w-full px-3 py-2.5 rounded-lg text-left text-sm font-semibold cursor-pointer transition-colors ${
                                    set.is_shared
                                      ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                      : "bg-orange-50 text-orange-700 hover:bg-orange-100"
                                  }`}
                                  title={set.is_shared ? "Hủy chia sẻ" : "Chia sẻ để khách thấy trong Cộng đồng"}
                                >
                                  {set.is_shared ? "Đang chia sẻ • Cộng đồng" : "Chia sẻ lên Cộng đồng"}
                                </button>
                              </div>

                              <div className="my-2 border-t border-gray-100" />
                              <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                Mặt hiển thị đầu tiên
                              </p>
                              {FACE_OPTIONS.map((option) => {
                                const isActive = (set.default_face || 0) === option.value;
                                return (
                                  <button
                                    key={option.value}
                                    onClick={(e) => handleDefaultFaceChange(set.id, option.value, e)}
                                    className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between cursor-pointer transition-colors
                                                ${isActive ? "bg-teal-50 text-teal-700" : "text-gray-600 hover:bg-gray-50"}`}
                                  >
                                    <span className="flex items-center gap-2">
                                      <span className={`w-3 h-3 rounded-full ${option.color}`}></span>
                                      {option.label}
                                    </span>
                                    {isActive && <CheckIcon />}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Delete Button - Only for authenticated users */}
                      {!isGuest && activeTab === "personal" && (
                        <button
                          onClick={(e) => handleDelete(set.id, set.name, e)}
                          className="p-2.5 rounded-xl transition-all cursor-pointer text-gray-400 hover:text-red-500 hover:bg-red-50"
                          title="Xóa"
                        >
                          <TrashIcon />
                        </button>
                      )}

                      {/* Arrow */}
                      <div className="text-gray-300 group-hover:text-teal-500 transition-colors ml-2">
                        <ArrowRightIcon />
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Footer Stats */}
        {!loading && !error && sets.length > 0 && (
          <div className="mt-8 text-center text-sm text-gray-400">
            Tổng cộng {sets.length} bộ từ vựng • {sets.reduce((sum, s) => sum + s.card_count, 0)} từ
          </div>
        )}
      </main>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title="Xóa bộ từ vựng?"
        message={`Bạn có chắc chắn muốn xóa bộ từ vựng "${deleteTarget?.name}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
        type="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

export default JapaneseFlashcardHome;
