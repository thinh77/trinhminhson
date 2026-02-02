import { useState, useEffect, useCallback } from "react";
import { uploadPhotos } from "@/services/photos.service";
import { getAllCategories, type Category } from "@/services/categories.service";

export interface PhotoFormData {
  files: File[];
  categoryIds: number[];
  subcategoryIds: number[];
  date: string;
}

export interface PhotoPreview {
  file: File;
  url: string;
  title: string;
}

interface UsePhotoUploadReturn {
  form: PhotoFormData;
  previews: PhotoPreview[];
  errors: Partial<Record<string, string>>;
  isSubmitting: boolean;
  categories: Category[];
  handleFilesChange: (files: FileList | null) => void;
  handleRemoveFile: (index: number) => void;
  handleFormChange: (form: PhotoFormData) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  clearForm: () => void;
}

const MAX_FILES = 10;

const initialForm: PhotoFormData = {
  files: [],
  categoryIds: [],
  subcategoryIds: [],
  date: new Date().toISOString().split("T")[0],
};

export function usePhotoUpload(
  onUploadComplete: () => void
): UsePhotoUploadReturn {
  const [form, setForm] = useState<PhotoFormData>(initialForm);
  const [previews, setPreviews] = useState<PhotoPreview[]>([]);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  // Load categories on mount
  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getAllCategories(false);
        setCategories(data);
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    }
    loadCategories();
  }, []);

  // Sync previews with form.files - prevents duplicates and ensures consistency
  useEffect(() => {
    setPreviews((currentPreviews) => {
      const formFileSet = new Set(form.files);

      // Keep only previews whose files are still in form.files
      const validPreviews = currentPreviews.filter((p) => formFileSet.has(p.file));

      // Find files that need new previews
      const existingPreviewFiles = new Set(validPreviews.map((p) => p.file));
      const newFiles = form.files.filter((f) => !existingPreviewFiles.has(f));

      // Create previews for new files only
      const newPreviews: PhotoPreview[] = newFiles.map((file) => ({
        file,
        url: URL.createObjectURL(file),
        title: file.name.replace(/\.[^/.]+$/, ""),
      }));

      // Revoke URLs for removed previews to free memory
      const removedPreviews = currentPreviews.filter(
        (p) => !formFileSet.has(p.file)
      );
      removedPreviews.forEach((p) => URL.revokeObjectURL(p.url));

      // Only update if there are actual changes
      if (
        newFiles.length === 0 &&
        removedPreviews.length === 0 &&
        validPreviews.length === currentPreviews.length
      ) {
        return currentPreviews;
      }

      return [...validPreviews, ...newPreviews];
    });
  }, [form.files]);

  const handleFilesChange = useCallback((fileList: FileList | null) => {
    if (!fileList) return;

    const newFiles = Array.from(fileList);

    setForm((prevForm) => {
      const totalFiles = prevForm.files.length + newFiles.length;

      if (totalFiles > MAX_FILES) {
        alert(
          `Maximum ${MAX_FILES} photos allowed. You have already selected ${prevForm.files.length} photos.`
        );
        return prevForm;
      }

      return { ...prevForm, files: [...prevForm.files, ...newFiles] };
    });
  }, []);

  const handleRemoveFile = useCallback((index: number) => {
    // Only update form.files - previews will be synced automatically via useEffect
    setForm((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }));
  }, []);

  const handleFormChange = useCallback((newForm: PhotoFormData) => {
    setForm(newForm);
  }, []);

  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<Record<string, string>> = {};

    if (form.files.length === 0) {
      newErrors.files = "At least one image file is required";
    } else if (form.files.length > MAX_FILES) {
      newErrors.files = `Maximum ${MAX_FILES} files allowed`;
    } else {
      const MAX_SIZE = 15 * 1024 * 1024; // 15MB
      const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png"];

      for (const file of form.files) {
        if (!ALLOWED_TYPES.includes(file.type)) {
          newErrors.files = "Only JPG and PNG images are allowed";
          break;
        }
        if (file.size > MAX_SIZE) {
          newErrors.files = "Each image must be less than 15MB";
          break;
        }
      }
    }

    if (!form.categoryIds || form.categoryIds.length === 0) {
      newErrors.categoryIds = "At least one category is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      setIsSubmitting(true);
      try {
        await uploadPhotos(form.files, {
          categoryIds: form.categoryIds,
          subcategoryIds:
            form.subcategoryIds.length > 0 ? form.subcategoryIds : undefined,
          dateTaken: form.date,
          isPublic: true,
        });

        // Clear previews URLs to free memory
        previews.forEach((preview) => URL.revokeObjectURL(preview.url));

        setForm(initialForm);
        setPreviews([]);
        setErrors({});

        onUploadComplete();
      } catch (error) {
        console.error("Failed to upload photos:", error);
        setErrors({ files: "Failed to upload photos. Please try again." });
      } finally {
        setIsSubmitting(false);
      }
    },
    [form, previews, validateForm, onUploadComplete]
  );

  const clearForm = useCallback(() => {
    previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    setForm(initialForm);
    setPreviews([]);
    setErrors({});
  }, [previews]);

  return {
    form,
    previews,
    errors,
    isSubmitting,
    categories,
    handleFilesChange,
    handleRemoveFile,
    handleFormChange,
    handleSubmit,
    clearForm,
  };
}
