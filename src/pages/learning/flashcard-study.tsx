/**
 * Japanese Flashcard Study Page
 * Study flashcards with navigation and progress tracking
 * Design: Modern, Playful Learning Experience
 */

import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  getVocabularySet,
  markFlashcardLearned,
  resetVocabularySet,
  cloneVocabularySet,
  type VocabularySetWithFlashcards,
  type Flashcard as FlashcardType,
} from "../../services/vocabulary.service";
import Flashcard from "../../components/flashcard/Flashcard";
import { useAuth } from "../../contexts/AuthContext";

// SVG Icons
const BackIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const ShuffleIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const ResetIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const SkipBackIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
  </svg>
);

const RefreshIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

export function JapaneseFlashcardStudy() {
  const { setId } = useParams<{ setId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const isGuest = !authLoading && !isAuthenticated;

  const [vocabSet, setVocabSet] = useState<VocabularySetWithFlashcards | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentFace, setCurrentFace] = useState(0);
  const [defaultFace, setDefaultFace] = useState(0);
  const [shuffled, setShuffled] = useState(false);
  const [cards, setCards] = useState<FlashcardType[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [learnedCount, setLearnedCount] = useState(0);

  const isOwner = vocabSet?.is_owner !== false; // undefined => treat as owner for backward compatibility
  const isReadOnly = isGuest || !isOwner;

  async function loadVocabSet() {
    try {
      setLoading(true);
      if (!setId) return;
      // Guest mode: always load all cards (includeAll=true) so they can preview everything
      // Authenticated: load only unlearned cards (default behavior)
      const data = await getVocabularySet(setId, isGuest);
      setVocabSet(data);
      setCards(data.flashcards || []);
      setTotalCount(data.totalCount || data.flashcards?.length || 0);
      setLearnedCount(data.learnedCount || 0);
      const face = data.default_face || 0;
      setDefaultFace(face);
      setCurrentFace(face);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load vocabulary set");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Wait for auth to settle before loading (so isGuest is accurate)
    if (!authLoading) {
      loadVocabSet();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setId, authLoading]);

  const markLearnedAndNext = useCallback(async () => {
    if (cards.length === 0) return;

    const currentCard = cards[currentIndex];
    try {
      await markFlashcardLearned(currentCard.id, true);

      const newCards = cards.filter((_, idx) => idx !== currentIndex);
      setCards(newCards);
      setLearnedCount((prev) => prev + 1);

      if (currentIndex >= newCards.length && newCards.length > 0) {
        setCurrentIndex(newCards.length - 1);
      }
      setCurrentFace(defaultFace);
    } catch (err) {
      console.error("Failed to mark as learned:", err);
    }
  }, [cards, currentIndex, defaultFace]);

  const markNotLearnedAndNext = useCallback(() => {
    if (cards.length === 0) return;

    if (currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0);
    }
    setCurrentFace(defaultFace);
  }, [cards.length, currentIndex, defaultFace]);

  // Guest-safe navigation: just move to next/prev card without any API calls
  const goToNextCard = useCallback(() => {
    if (cards.length === 0) return;
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0); // Wrap to start
    }
    setCurrentFace(defaultFace);
  }, [cards.length, currentIndex, defaultFace]);

  const goToPrevCard = useCallback(() => {
    if (cards.length === 0) return;
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      setCurrentIndex(cards.length - 1); // Wrap to end
    }
    setCurrentFace(defaultFace);
  }, [cards.length, currentIndex, defaultFace]);

  const nextFace = useCallback(() => {
    setCurrentFace((prev) => (prev + 1) % 5);
  }, []);

  const setFace = useCallback((face: number) => {
    setCurrentFace(face);
  }, []);

  function shuffleCards() {
    const shuffledCards = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffledCards);
    setCurrentIndex(0);
    setCurrentFace(defaultFace);
    setShuffled(true);
  }

  async function resetAllCards() {
    try {
      if (!setId) return;
      await resetVocabularySet(setId);
      await loadVocabSet();
      setCurrentIndex(0);
      setCurrentFace(defaultFace);
      setShuffled(false);
    } catch (err) {
      console.error("Failed to reset cards:", err);
    }
  }

  function resetCards() {
    setCards(vocabSet?.flashcards || []);
    setCurrentIndex(0);
    setCurrentFace(defaultFace);
    setShuffled(false);
  }

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (isReadOnly) {
        // Read-only mode (guest OR community preview): only allow flip and prev/next navigation (no API calls)
        switch (e.key) {
          case "ArrowRight":
            goToNextCard();
            break;
          case "ArrowLeft":
            goToPrevCard();
            break;
          case " ":
          case "ArrowUp":
          case "ArrowDown":
            e.preventDefault();
            nextFace();
            break;
        }
      } else {
        // Authenticated mode: full functionality
        switch (e.key) {
          case "ArrowRight":
            markLearnedAndNext();
            break;
          case "ArrowLeft":
            markNotLearnedAndNext();
            break;
          case " ":
          case "ArrowUp":
          case "ArrowDown":
            e.preventDefault();
            nextFace();
            break;
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isReadOnly, goToNextCard, goToPrevCard, markLearnedAndNext, markNotLearnedAndNext, nextFace]);

  // Progress percentage
  const progressPercent = totalCount > 0 ? Math.round((learnedCount / totalCount) * 100) : 0;

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-orange-50">
        <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 border-b border-teal-100">
          <div className="max-w-2xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link to="/learning" className="flex items-center gap-2 text-teal-700 hover:text-teal-900 transition-colors cursor-pointer">
                <BackIcon />
                <span className="font-medium">Quay lại</span>
              </Link>
              <h1 className="text-lg font-bold text-gray-400">Đang tải...</h1>
              <div className="w-20"></div>
            </div>
          </div>
        </header>
        <main className="flex items-center justify-center py-32">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-500 rounded-full animate-spin"></div>
            <p className="mt-4 text-teal-600 font-medium">Đang tải...</p>
          </div>
        </main>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-orange-50">
        <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 border-b border-teal-100">
          <div className="max-w-2xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link to="/learning" className="flex items-center gap-2 text-teal-700 hover:text-teal-900 transition-colors cursor-pointer">
                <BackIcon />
                <span className="font-medium">Quay lại</span>
              </Link>
              <h1 className="text-lg font-bold text-red-500">Lỗi</h1>
              <div className="w-20"></div>
            </div>
          </div>
        </header>
        <main className="max-w-md mx-auto px-4 py-16">
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center text-red-500">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-red-600 mb-6">{error}</p>
            <button
              onClick={() => navigate("/learning")}
              className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors cursor-pointer"
            >
              Về trang chủ
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Completed / Empty State
  if (!cards.length) {
    const allLearned = learnedCount > 0 && learnedCount === totalCount;
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-orange-50">
        <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 border-b border-teal-100">
          <div className="max-w-2xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link to="/learning" className="flex items-center gap-2 text-teal-700 hover:text-teal-900 transition-colors cursor-pointer">
                <BackIcon />
                <span className="font-medium hidden sm:inline">Quay lại</span>
              </Link>
              <h1 className="text-lg font-bold text-teal-800 truncate max-w-[200px]">{vocabSet?.name}</h1>
              <div className="w-20"></div>
            </div>
          </div>
        </header>
        <main className="max-w-md mx-auto px-4 py-16">
          <div className="bg-white rounded-3xl p-8 text-center shadow-xl">
            <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center text-5xl
                            ${allLearned ? "bg-gradient-to-br from-emerald-400 to-teal-500" : "bg-gray-100"}`}>
              {allLearned ? "🎉" : "📭"}
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              {allLearned ? "Chúc mừng!" : "Bộ từ vựng trống"}
            </h3>
            <p className="text-gray-500 mb-8">
              {allLearned
                ? `Bạn đã thuộc hết ${totalCount} từ trong bộ này!`
                : "Không có flashcard nào trong bộ này"}
            </p>
            {/* Reset button - Only for owners */}
            {allLearned && !isReadOnly && (
              <button
                onClick={resetAllCards}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 
                           text-white font-semibold rounded-xl shadow-lg shadow-teal-500/30
                           hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                <RefreshIcon />
                <span>Học lại từ đầu</span>
              </button>
            )}
            {/* Read-only CTA */}
            {allLearned && isReadOnly && (
              <div className="space-y-3">
                {isGuest ? (
                  <>
                    <p className="text-sm text-gray-400">Đăng nhập để theo dõi tiến độ học</p>
                    <Link
                      to="/login"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition-colors cursor-pointer"
                    >
                      <span>Đăng nhập</span>
                    </Link>
                  </>
                ) : (
                  <p className="text-sm text-gray-400">Hãy thêm bộ này vào bộ của bạn để theo dõi tiến độ học</p>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  // Read-only mode (guest OR community preview): simplified flip + prev/next only UI
  if (isReadOnly) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-orange-50">
        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 border-b border-teal-100">
          <div className="max-w-2xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link to="/learning" className="flex items-center gap-2 text-teal-700 hover:text-teal-900 transition-colors cursor-pointer">
                <BackIcon />
                <span className="font-medium hidden sm:inline">Quay lại</span>
              </Link>
              <h1 className="text-lg font-bold text-teal-800 truncate max-w-[200px]">{vocabSet?.name}</h1>
              <div className="w-20"></div>
            </div>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-6">
          {/* Banner */}
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-center">
            <p className="text-amber-700 text-sm">
              <span className="font-semibold">Chế độ xem trước</span>
              {isGuest ? (
                <>
                  {" "}•{" "}
                  <Link to="/login" className="text-teal-600 font-semibold hover:underline">Đăng nhập</Link>
                  {" "}để theo dõi tiến độ học
                </>
              ) : (
                <>
                  {" "}•{" "}
                  Thêm vào bộ của bạn để theo dõi tiến độ
                </>
              )}
            </p>
          </div>

          {/* Add to my sets (authenticated community preview) */}
          {!isGuest && !isOwner && (
            <div className="mb-4 flex justify-center">
              <button
                onClick={async () => {
                  if (!setId) return;
                  try {
                    const result = await cloneVocabularySet(Number(setId));
                    navigate(`/learning/study/${result.setId}`);
                  } catch (err) {
                    setError(err instanceof Error ? err.message : "Failed to clone set");
                  }
                }}
                className="px-5 py-3 rounded-2xl font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg shadow-orange-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                Thêm vào bộ của tôi
              </button>
            </div>
          )}

          {/* Card Counter */}
          <div className="text-center mb-4">
            <span className="text-2xl font-bold text-teal-700">
              {currentIndex + 1}
              <span className="text-gray-300 mx-1">/</span>
              <span className="text-gray-400">{cards.length}</span>
            </span>
          </div>

          {/* Flashcard - no face indicators for guests */}
          <div className="mb-6">
            <Flashcard
              card={currentCard}
              currentFace={currentFace}
              onNextFace={nextFace}
              onSetFace={setFace}
              showFaceIndicators={false}
            />
          </div>

          {/* Simple Prev/Next Navigation */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <button
              onClick={goToPrevCard}
              disabled={cards.length === 0}
              className="group flex flex-col items-center gap-1 p-4 bg-white rounded-2xl shadow-lg
                         hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer
                         disabled:opacity-50 disabled:cursor-not-allowed"
              title="Từ trước (←)"
            >
              <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600 group-hover:bg-teal-100 group-hover:text-teal-600 transition-colors">
                <ChevronLeftIcon />
              </div>
              <span className="text-xs font-medium text-gray-500">Trước</span>
            </button>

            <button
              onClick={goToNextCard}
              disabled={cards.length === 0}
              className="group flex flex-col items-center gap-1 p-4 bg-white rounded-2xl shadow-lg
                         hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer
                         disabled:opacity-50 disabled:cursor-not-allowed"
              title="Từ tiếp (→)"
            >
              <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600 group-hover:bg-teal-100 group-hover:text-teal-600 transition-colors">
                <ChevronRightIcon />
              </div>
              <span className="text-xs font-medium text-gray-500">Tiếp</span>
            </button>
          </div>

          {/* Hint */}
          <div className="text-center text-sm text-gray-400">
            Nhấn vào thẻ để xem mặt tiếp theo
          </div>
        </main>
      </div>
    );
  }

  // Authenticated mode: full functionality
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-orange-50">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 border-b border-teal-100">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/learning" className="flex items-center gap-2 text-teal-700 hover:text-teal-900 transition-colors cursor-pointer">
              <BackIcon />
              <span className="font-medium hidden sm:inline">Quay lại</span>
            </Link>
            <h1 className="text-lg font-bold text-teal-800 truncate max-w-[200px]">{vocabSet?.name}</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Tiến độ học</span>
            <span className="text-sm font-bold text-teal-600">{learnedCount}/{totalCount} từ ({progressPercent}%)</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-teal-400 to-emerald-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Flashcard */}
        <div className="mb-6">
          <Flashcard
            card={currentCard}
            currentFace={currentFace}
            onNextFace={nextFace}
            onSetFace={setFace}
          />
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-4 mb-6">
          {/* Skip Button */}
          <button
            onClick={markNotLearnedAndNext}
            disabled={cards.length === 0}
            className="group flex flex-col items-center gap-1 p-4 bg-white rounded-2xl shadow-lg
                       hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer
                       disabled:opacity-50 disabled:cursor-not-allowed"
            title="Chưa thuộc (←)"
          >
            <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 group-hover:bg-amber-200 transition-colors">
              <ChevronLeftIcon />
            </div>
            <span className="text-xs font-medium text-gray-500">Chưa thuộc</span>
          </button>

          {/* Card Counter */}
          <div className="flex flex-col items-center px-6">
            <div className="text-3xl font-bold text-teal-700">
              {currentIndex + 1}
              <span className="text-gray-300 mx-1">/</span>
              <span className="text-gray-400">{cards.length}</span>
            </div>
            <span className="text-xs text-gray-400 mt-1">còn lại</span>
          </div>

          {/* Learned Button */}
          <button
            onClick={markLearnedAndNext}
            disabled={cards.length === 0}
            className="group flex flex-col items-center gap-1 p-4 bg-white rounded-2xl shadow-lg
                       hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer
                       disabled:opacity-50 disabled:cursor-not-allowed"
            title="Đã thuộc (→)"
          >
            <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-200 transition-colors">
              <ChevronRightIcon />
            </div>
            <span className="text-xs font-medium text-gray-500">Đã thuộc</span>
          </button>
        </div>

        {/* Hint */}
        <div className="text-center text-sm text-gray-400 mb-8">
          <span className="hidden sm:inline">Nhấn vào thẻ để xem mặt tiếp theo • </span>
          <span className="inline-flex items-center gap-1">
            <kbd className="px-2 py-0.5 bg-gray-100 rounded text-xs">←</kbd> Chưa thuộc
          </span>
          <span className="mx-2">•</span>
          <span className="inline-flex items-center gap-1">
            <kbd className="px-2 py-0.5 bg-gray-100 rounded text-xs">→</kbd> Đã thuộc
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={shuffled ? resetCards : shuffleCards}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-200 
                       text-gray-700 font-medium rounded-xl hover:border-teal-300 hover:bg-teal-50 
                       transition-colors cursor-pointer"
          >
            <ShuffleIcon />
            <span>{shuffled ? "Đặt lại thứ tự" : "Trộn thẻ"}</span>
          </button>
          
          <button
            onClick={() => {
              setCurrentIndex(0);
              setCurrentFace(defaultFace);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-200 
                       text-gray-700 font-medium rounded-xl hover:border-teal-300 hover:bg-teal-50 
                       transition-colors cursor-pointer"
          >
            <SkipBackIcon />
            <span>Từ đầu</span>
          </button>
          
          <button
            onClick={resetAllCards}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-red-200 
                       text-red-600 font-medium rounded-xl hover:border-red-300 hover:bg-red-50 
                       transition-colors cursor-pointer"
            title="Đặt lại tất cả thẻ về chưa thuộc"
          >
            <ResetIcon />
            <span>Học lại tất cả</span>
          </button>
        </div>
      </main>
    </div>
  );
}

export default JapaneseFlashcardStudy;
