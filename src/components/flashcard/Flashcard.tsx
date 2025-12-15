/**
 * Flashcard Component
 * 5-face flashcard with rotation animation
 * Design: Claymorphism with vibrant face colors
 */

import { useRef, useState } from "react";
import type { Flashcard as FlashcardType } from "../../services/vocabulary.service";

const FACE_CONFIG = [
  { label: "Kanji", field: "kanji" as const, color: "from-violet-500 to-purple-600", bgLight: "bg-violet-50", textColor: "text-violet-600" },
  { label: "Nghĩa", field: "meaning" as const, color: "from-emerald-500 to-teal-600", bgLight: "bg-emerald-50", textColor: "text-emerald-600" },
  { label: "Phiên âm", field: "pronunciation" as const, color: "from-amber-500 to-orange-600", bgLight: "bg-amber-50", textColor: "text-amber-600" },
  { label: "Hán Việt", field: "sino_vietnamese" as const, color: "from-fuchsia-500 to-pink-600", bgLight: "bg-fuchsia-50", textColor: "text-fuchsia-600" },
  { label: "Ví dụ", field: "example" as const, color: "from-sky-500 to-blue-600", bgLight: "bg-sky-50", textColor: "text-sky-600" },
];

type FaceField = "kanji" | "meaning" | "pronunciation" | "sino_vietnamese" | "example";

interface FlashcardProps {
  card: Pick<FlashcardType, FaceField>;
  currentFace: number;
  onNextFace: () => void;
  onSetFace: (index: number) => void;
  showFaceIndicators?: boolean;
}

function Flashcard({ card, currentFace, onNextFace, onSetFace, showFaceIndicators = true }: FlashcardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const minSwipeDistance = 50;

  function handleTouchStart(e: React.TouchEvent) {
    setIsTouchDevice(true);
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  }

  function handleTouchMove(e: React.TouchEvent) {
    setTouchEnd(e.targetTouches[0].clientX);
  }

  function handleTouchEnd() {
    if (!touchStart) return;

    if (touchEnd !== null) {
      const distance = touchStart - touchEnd;
      const isSwipe = Math.abs(distance) > minSwipeDistance;

      if (isSwipe) {
        setTouchStart(null);
        setTouchEnd(null);
        return;
      }
    }

    onNextFace();
    setTouchStart(null);
    setTouchEnd(null);
  }

  function handleClick() {
    if (!isTouchDevice) {
      onNextFace();
    }
  }

  const currentConfig = FACE_CONFIG[currentFace];
  const content = card[currentConfig.field] || "—";

  // Check if content contains Japanese characters
  const isJapaneseContent = ["kanji", "pronunciation", "example"].includes(currentConfig.field);

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Main Card */}
      <div
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleClick}
        className="relative aspect-[4/5] cursor-pointer select-none"
      >
        {/* Card Body */}
        <div className={`absolute inset-0 bg-gradient-to-br ${currentConfig.color} rounded-2xl 
                        shadow-2xl shadow-gray-900/20 p-1 transition-all duration-300`}>
          <div className="w-full h-full bg-white rounded-xl flex flex-col overflow-hidden">
            {/* Label Header */}
            <div className={`px-4 py-2.5 ${currentConfig.bgLight} border-b border-gray-100`}>
              <span className={`text-sm font-bold ${currentConfig.textColor} uppercase tracking-wider`}>
                {currentConfig.label}
              </span>
            </div>
            
            {/* Content */}
            <div className="flex-1 flex items-center justify-center p-5">
              <p 
                className={`text-center break-words leading-relaxed
                            ${isJapaneseContent ? "font-['Noto_Sans_JP',_'Noto_Serif_JP',_sans-serif]" : ""}
                            ${currentConfig.field === "kanji" 
                              ? "text-6xl sm:text-7xl font-bold text-gray-800" 
                              : currentConfig.field === "example"
                                ? "text-base sm:text-lg text-gray-700 leading-relaxed"
                                : currentConfig.field === "pronunciation"
                                  ? "text-3xl sm:text-4xl font-medium text-gray-800"
                                  : "text-2xl sm:text-3xl font-medium text-gray-800"
                            }`}
                style={isJapaneseContent ? { fontFamily: "'Noto Sans JP', 'Noto Serif JP', sans-serif" } : {}}
              >
                {content}
              </p>
            </div>

            {/* Tap Hint */}
            <div className="px-4 py-2.5 text-center border-t border-gray-100">
              <span className="text-xs text-gray-400">Nhấn để xem mặt tiếp theo</span>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className={`absolute -top-1.5 -right-1.5 w-6 h-6 bg-gradient-to-br ${currentConfig.color} rounded-full opacity-60 blur-sm`}></div>
        <div className={`absolute -bottom-1.5 -left-1.5 w-5 h-5 bg-gradient-to-br ${currentConfig.color} rounded-full opacity-40 blur-sm`}></div>
      </div>

      {/* Face Indicators - Only shown when showFaceIndicators is true */}
      {showFaceIndicators && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {FACE_CONFIG.map((config, index) => (
            <button
              key={config.label}
              onClick={(e) => {
                e.stopPropagation();
                onSetFace(index);
              }}
              className={`group relative cursor-pointer transition-all duration-200
                          ${currentFace === index ? "scale-110" : "hover:scale-105"}`}
              title={config.label}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold
                              transition-all duration-200
                              ${currentFace === index 
                                ? `bg-gradient-to-br ${config.color} text-white shadow-lg` 
                                : `${config.bgLight} ${config.textColor} hover:shadow-md`
                              }`}>
                {index + 1}
              </div>
              
              {/* Tooltip */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded-md
                              opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {config.label}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default Flashcard;
