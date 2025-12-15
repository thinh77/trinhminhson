/**
 * Japanese Flashcard Upload Page
 * Upload Excel file to create new vocabulary set
 * Design: Clean, Modern File Upload Experience
 */

import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { uploadVocabularySet } from "../../services/vocabulary.service";

// SVG Icons
const BackIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const UploadCloudIcon = () => (
  <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

const FileIcon = () => (
  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const AlertIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

export function JapaneseFlashcardUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      if (!name) {
        setName(selectedFile.name.replace(/\.(xlsx|xls)$/i, ""));
      }
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      const ext = droppedFile.name.split(".").pop()?.toLowerCase();
      if (ext && ["xlsx", "xls"].includes(ext)) {
        setFile(droppedFile);
        setError(null);
        if (!name) {
          setName(droppedFile.name.replace(/\.(xlsx|xls)$/i, ""));
        }
      } else {
        setError("Chỉ chấp nhận file Excel (.xlsx, .xls)");
      }
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Vui lòng chọn file Excel");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await uploadVocabularySet(file, name || file.name, description);
      navigate(`/learning/study/${result.setId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload file");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-orange-50">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 border-b border-teal-100">
        <div className="max-w-xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/learning" className="flex items-center gap-2 text-teal-700 hover:text-teal-900 transition-colors cursor-pointer">
              <BackIcon />
              <span className="font-medium">Quay lại</span>
            </Link>
            <h1 className="text-lg font-bold text-teal-800">Thêm bộ từ vựng</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload Area */}
          <div
            className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer
                        ${dragOver 
                          ? "border-teal-400 bg-teal-50" 
                          : file 
                            ? "border-emerald-300 bg-emerald-50" 
                            : "border-gray-300 bg-white hover:border-teal-300 hover:bg-teal-50/50"
                        }`}
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />
            
            {file ? (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mb-4">
                  <FileIcon />
                </div>
                <p className="font-bold text-gray-800 mb-1">{file.name}</p>
                <p className="text-sm text-gray-500">
                  {(file.size / 1024).toFixed(1)} KB • Nhấn để chọn file khác
                </p>
                <div className="mt-3 inline-flex items-center gap-1 text-sm text-emerald-600 font-medium">
                  <CheckIcon />
                  <span>Đã chọn</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors
                                ${dragOver ? "bg-teal-200 text-teal-700" : "bg-gray-100 text-gray-400"}`}>
                  <UploadCloudIcon />
                </div>
                <p className="font-bold text-gray-800 mb-1">
                  {dragOver ? "Thả file ở đây" : "Chọn hoặc kéo thả file Excel"}
                </p>
                <p className="text-sm text-gray-500">Hỗ trợ .xlsx, .xls (tối đa 10MB)</p>
              </div>
            )}
          </div>

          {/* File Format Info */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <span className="w-6 h-6 bg-teal-100 rounded-lg flex items-center justify-center text-xs">📋</span>
              Định dạng file Excel
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              File cần có các cột (không phân biệt hoa thường):
            </p>
            <div className="grid gap-2 text-sm">
              {[
                { name: "Kanji / 漢字", desc: "Chữ Kanji", color: "bg-violet-100 text-violet-700" },
                { name: "Meaning / Nghĩa", desc: "Nghĩa tiếng Việt", color: "bg-emerald-100 text-emerald-700" },
                { name: "Pronunciation / Hiragana", desc: "Phiên âm", color: "bg-amber-100 text-amber-700" },
                { name: "Sino-Vietnamese / Hán Việt", desc: "Âm Hán Việt", color: "bg-fuchsia-100 text-fuchsia-700" },
                { name: "Example / Ví dụ", desc: "Câu ví dụ", color: "bg-sky-100 text-sky-700" },
              ].map((col) => (
                <div key={col.name} className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${col.color}`}>
                    {col.name}
                  </span>
                  <span className="text-gray-400">—</span>
                  <span className="text-gray-600">{col.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên bộ từ vựng
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: N5 Từ vựng tuần 1"
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl
                           focus:border-teal-400 focus:ring-2 focus:ring-teal-100 focus:outline-none
                           transition-all placeholder:text-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả <span className="text-gray-400 font-normal">(không bắt buộc)</span>
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="VD: Từ vựng cơ bản cho người mới bắt đầu"
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl
                           focus:border-teal-400 focus:ring-2 focus:ring-teal-100 focus:outline-none
                           transition-all placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600">
              <AlertIcon />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !file}
            className={`w-full py-4 px-6 rounded-2xl font-semibold text-white
                        flex items-center justify-center gap-3 transition-all cursor-pointer
                        ${loading || !file 
                          ? "bg-gray-300 cursor-not-allowed" 
                          : "bg-gradient-to-r from-teal-500 to-emerald-500 shadow-lg shadow-teal-500/30 hover:shadow-xl hover:-translate-y-0.5"
                        }`}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Đang xử lý...</span>
              </>
            ) : (
              <>
                <UploadCloudIcon />
                <span>Tải lên và tạo bộ từ vựng</span>
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}

export default JapaneseFlashcardUpload;
