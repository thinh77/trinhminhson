import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getVocabularySets,
  createTestSet,
  type VocabularySet,
} from "../../services/vocabulary.service";
import { useToast } from "../../contexts/ToastContext";

const PRESETS = [10, 20, 50, 100];

export function JapaneseFlashcardTestCreate() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [sets, setSets] = useState<VocabularySet[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [wordCount, setWordCount] = useState<number>(20);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await getVocabularySets("personal");
        if (!alive) return;
        setSets(data);
      } catch (err) {
        if (!alive) return;
        setLoadError(
          err instanceof Error ? err.message : "Không tải được danh sách bộ từ vựng"
        );
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const totalDifficult = useMemo(() => {
    let sum = 0;
    for (const s of sets) {
      if (selectedIds.has(s.id)) sum += s.difficult_count ?? 0;
    }
    return sum;
  }, [sets, selectedIds]);

  const trimmedName = name.trim();
  const nameValid = trimmedName.length > 0 && trimmedName.length <= 255;
  const wordCountValid =
    Number.isFinite(wordCount) && Number.isInteger(wordCount) && wordCount >= 1 && wordCount <= 500;
  const canSubmit =
    !submitting && nameValid && selectedIds.size > 0 && totalDifficult > 0 && wordCountValid;

  function toggleSet(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const result = await createTestSet({
        name: trimmedName,
        sourceSetIds: Array.from(selectedIds),
        wordCount,
      });

      if (result.shortage) {
        showToast(
          `Chỉ có ${result.cardCount} từ khó, đã tạo bài test với ${result.cardCount} từ`,
          "info"
        );
      } else {
        showToast("Đã tạo bài test!", "success");
      }
      navigate(`/learning/study/${result.setId}`);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Không tạo được bài test",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-orange-50">
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 border-b border-teal-100">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            to="/learning"
            className="flex items-center gap-2 text-teal-700 hover:text-teal-900 transition-colors cursor-pointer"
          >
            ← <span className="font-medium">Quay lại</span>
          </Link>
          <h1 className="text-lg font-bold text-teal-800">Tạo bài test từ từ khó</h1>
          <div className="w-20" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {loading && (
          <div className="flex flex-col items-center py-16">
            <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-500 rounded-full animate-spin" />
            <p className="mt-3 text-teal-600">Đang tải...</p>
          </div>
        )}

        {loadError && !loading && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 text-center text-red-600">
            {loadError}
          </div>
        )}

        {!loading && !loadError && (
          <>
            <section>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tên bài test
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={255}
                placeholder="VD: Ôn JLPT N4 - tuần này"
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-400 transition-colors"
              />
            </section>

            <section>
              <p className="text-sm font-semibold text-gray-700 mb-2">Chọn bộ nguồn</p>
              {sets.length === 0 ? (
                <div className="text-sm text-gray-500 text-center py-6">
                  Bạn chưa có bộ từ vựng nào. Tạo bộ từ vựng trước để có thể tạo bài test.
                </div>
              ) : (
                <ul className="space-y-2">
                  {sets.map((s) => {
                    const checked = selectedIds.has(s.id);
                    return (
                      <li key={s.id}>
                        <label className="flex items-center gap-3 p-3 bg-white rounded-xl border-2 border-gray-100 hover:border-teal-200 transition-colors cursor-pointer">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleSet(s.id)}
                            aria-label={s.name}
                            className="w-4 h-4 accent-teal-600 cursor-pointer"
                          />
                          <span className="flex-1 font-medium text-gray-800">{s.name}</span>
                          <span className="text-xs text-gray-500">{s.card_count} từ</span>
                          <span className="text-xs px-2 py-0.5 bg-orange-50 text-orange-700 rounded-full font-medium">
                            {s.difficult_count ?? 0} khó
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              )}

              {selectedIds.size > 0 && (
                <p className="mt-3 text-sm text-gray-600">
                  Tổng {totalDifficult} từ khó từ {selectedIds.size} bộ đã chọn
                </p>
              )}
              {selectedIds.size > 0 && totalDifficult === 0 && (
                <p className="mt-1 text-sm text-amber-600">
                  Các bộ đã chọn chưa có từ khó nào
                </p>
              )}
            </section>

            <section>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Số lượng từ
              </label>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {PRESETS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setWordCount(n)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                      wordCount === n
                        ? "bg-teal-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={wordCount}
                  aria-label="Số lượng"
                  onChange={(e) => setWordCount(Number(e.target.value))}
                  className="w-24 px-3 py-2 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-400"
                />
              </div>
              {totalDifficult > 0 && wordCount > totalDifficult && (
                <p className="text-sm text-amber-600">
                  Chỉ có {totalDifficult} từ khó, bài test sẽ có {totalDifficult} từ.
                </p>
              )}
            </section>

            <div className="flex gap-3 pt-2">
              <Link
                to="/learning"
                className="flex-1 text-center px-4 py-3 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
              >
                Huỷ
              </Link>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="flex-1 px-4 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Đang tạo..." : "Tạo bài test"}
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default JapaneseFlashcardTestCreate;
