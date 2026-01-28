import { useState, useEffect, useCallback } from "react";
import {
  updatePhoto,
  deletePhoto,
  reorderPhotos,
  type Photo as ApiPhoto,
} from "@/services/photos.service";
import { getAllCategories, type Category } from "@/services/categories.service";
import { useConfirm } from "@/hooks/useConfirm";

export interface EditPhotoFormData {
  title: string;
  alt: string;
  location: string;
  categoryIds: number[];
  subcategoryIds: number[];
  dateTaken: string;
}

interface UsePhotoAdminReturn {
  editingPhoto: ApiPhoto | null;
  editForm: EditPhotoFormData;
  deletingPhotoId: string | null;
  categories: Category[];
  handleEditPhoto: (photo: ApiPhoto) => void;
  handleSavePhoto: (photoId: number) => Promise<void>;
  handleCancelEdit: () => void;
  handleDeletePhoto: (photoId: string) => Promise<void>;
  handleReorderPhotos: (newOrder: { id: number; displayOrder: number }[]) => Promise<boolean>;
  setEditForm: React.Dispatch<React.SetStateAction<EditPhotoFormData>>;
}

const initialEditForm: EditPhotoFormData = {
  title: "",
  alt: "",
  location: "",
  categoryIds: [],
  subcategoryIds: [],
  dateTaken: "",
};

export function usePhotoAdmin(
  photos: ApiPhoto[],
  onPhotosChange: (photos: ApiPhoto[]) => void
): UsePhotoAdminReturn {
  const [editingPhoto, setEditingPhoto] = useState<ApiPhoto | null>(null);
  const [editForm, setEditForm] = useState<EditPhotoFormData>(initialEditForm);
  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const confirm = useConfirm();

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

  const handleEditPhoto = useCallback((photo: ApiPhoto) => {
    const categoryIds = photo.categories?.map((cat) => cat.id) || [];
    const subcategoryIds = photo.subcategories?.map((sub) => sub.id) || [];

    setEditForm({
      title: photo.title || "",
      alt: photo.alt || "",
      location: photo.location || "",
      categoryIds,
      subcategoryIds,
      dateTaken: photo.date_taken ? photo.date_taken.split("T")[0] : "",
    });
    setEditingPhoto(photo);
  }, []);

  const handleSavePhoto = useCallback(
    async (photoId: number) => {
      try {
        const updatedPhoto = await updatePhoto(photoId, {
          title: editForm.title,
          alt: editForm.alt,
          location: editForm.location || undefined,
          categoryIds:
            editForm.categoryIds.length > 0 ? editForm.categoryIds : undefined,
          subcategoryIds:
            editForm.subcategoryIds.length > 0
              ? editForm.subcategoryIds
              : undefined,
          dateTaken: editForm.dateTaken || undefined,
        });

        const updatedPhotos = photos.map((p) =>
          p.id === photoId ? updatedPhoto : p
        );
        onPhotosChange(updatedPhotos);
        setEditingPhoto(null);
      } catch (error) {
        console.error("Failed to update photo:", error);
        throw error;
      }
    },
    [editForm, photos, onPhotosChange]
  );

  const handleCancelEdit = useCallback(() => {
    setEditingPhoto(null);
  }, []);

  const handleDeletePhoto = useCallback(
    async (photoId: string) => {
      const confirmed = await confirm({
        title: "Xóa ảnh",
        message: "Bạn có chắc muốn xóa ảnh này?",
        confirmText: "Xóa",
        cancelText: "Hủy",
        type: "danger",
      });

      if (!confirmed) return;

      setDeletingPhotoId(photoId);
      try {
        await deletePhoto(Number(photoId));
        const filteredPhotos = photos.filter((p) => p.id !== Number(photoId));
        onPhotosChange(filteredPhotos);
      } catch (error) {
        console.error("Failed to delete photo:", error);
      } finally {
        setDeletingPhotoId(null);
      }
    },
    [photos, onPhotosChange, confirm]
  );

  const handleReorderPhotos = useCallback(
    async (newOrder: { id: number; displayOrder: number }[]): Promise<boolean> => {
      try {
        await reorderPhotos(newOrder);
        return true;
      } catch (error) {
        console.error("Failed to reorder photos:", error);
        return false;
      }
    },
    []
  );

  return {
    editingPhoto,
    editForm,
    deletingPhotoId,
    categories,
    handleEditPhoto,
    handleSavePhoto,
    handleCancelEdit,
    handleDeletePhoto,
    handleReorderPhotos,
    setEditForm,
  };
}
