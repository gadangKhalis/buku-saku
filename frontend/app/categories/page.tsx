"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Utensils,
  Car,
  Home,
  Zap,
  HeartPulse,
  ShoppingBag,
  Gamepad2,
  GraduationCap,
  PiggyBank,
  Gift,
  Plane,
  MoreHorizontal,
  Trash2,
  Pencil,
  Plus,
  X,
} from "lucide-react";
import {
  ALLOWED_ICONS,
  ALLOWED_COLORS,
  CategoryIcon,
  CategoryColor,
} from "@/lib/constants/categoryPresets";
import { Category, CategoryFormData } from "@/lib/types/category";

const ICON_MAP: Record<CategoryIcon, React.ElementType> = {
  utensils: Utensils,
  car: Car,
  home: Home,
  zap: Zap,
  "heart-pulse": HeartPulse,
  "shopping-bag": ShoppingBag,
  "gamepad-2": Gamepad2,
  "graduation-cap": GraduationCap,
  "piggy-bank": PiggyBank,
  gift: Gift,
  plane: Plane,
  "more-horizontal": MoreHorizontal,
};

const EMPTY_FORM: CategoryFormData = {
  name: "",
  icon: ALLOWED_ICONS[0],
  color: ALLOWED_COLORS[0],
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get("/categories");
      setCategories(res.data.data);
    } catch (err) {
      setError("Category Load failed, Refresh the page");
    } finally {
      setIsLoading(false);
    }
  }
  function openCreateForm() {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setFormError(null);
    setIsFormOpen(true);
  }

  function openEditForm(category: Category) {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      icon: category.icon,
      color: category.color,
    });
    setFormError(null);
    setIsFormOpen(true);
  }

  function closeForm() {
    setIsFormOpen(false);
    setEditingId(null);
    setFormError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      if (editingId) {
        const res = await api.put(`/categories/${editingId}`, formData);
        setCategories((prev) =>
          prev.map((c) => (c.id === editingId ? res.data.data : c)),
        );
      } else {
        const res = await api.post("/categories", formData);
        setCategories((prev) => [...prev, res.data.data]);
      }
      closeForm();
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Saving Category failed. Try again.";
      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await api.delete(`/categories/${id}`);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setDeleteTargetId(null);
    } catch (err: any) {
      const message = err.response?.data?.message || "Delete category failed.";
      alert(message);
      setDeleteTargetId(null);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Category</h1>
        <Button onClick={openCreateForm}>
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* FORM: CREATE / Edit */}
      {isFormOpen && (
        <form
          onSubmit={handleSubmit}
          className="border rounded-lg p-4 mb-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-medium">
              {editingId ? "Edit Category" : "New Category"}
            </h2>
            <button type="button" onClick={closeForm}>
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Name</label>
            <input
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Example: Food and Drinks"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Icon</label>
            <div className="grid grid-cols-6 gap-2">
              {ALLOWED_ICONS.map((iconKey) => {
                const IconComponent = ICON_MAP[iconKey];
                const isSelected = formData.icon === iconKey;
                return (
                  <button
                    key={iconKey}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, icon: iconKey }))
                    }
                    className={`p-2 rounded-md border flex items-center justify-center ${isSelected ? "border-primary bg-primary/10" : "border-input"}`}
                  >
                    <IconComponent className="w-5 h-5" />
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Color</label>
            <div>
              {ALLOWED_COLORS.map((colorHex) => {
                const isSelected = formData.color === colorHex;
                return (
                  <button
                    key={colorHex}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, color: colorHex }))
                    }
                    style={{ backgroundColor: colorHex }}
                    className={`w-8 h-8 rounded-full border-2 ${isSelected ? "border-foreground" : "border-transparent"}`}
                  />
                );
              })}
            </div>
          </div>

          {formError && <p className="text-sm text-destructive">{formError}</p>}

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Saving ..." : "Save"}
          </Button>
        </form>
      )}

      {/* LIST STATES */}
      {isLoading && (
        <p className="text-muted-foreground text-sm">Loading Category....</p>
      )}

      {!isLoading && error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {!isLoading && !error && categories.length === 0 && (
        <p className="text-muted-foreground text-sm">
          Belum ada kategori. Klik "Tambah Kategori" untuk membuat yang pertama.
        </p>
      )}

      {!isLoading && !error && categories.length > 0 && (
        <ul className="space-y-2">
          {categories.map((category) => {
            const IconComponent = ICON_MAP[category.icon];
            return (
              <li
                key={category.id}
                className="flex items-center justify-between border rounded-md p-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    style={{ backgroundColor: category.color }}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white"
                  >
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <span className="font-medium">{category.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => openEditForm(category)}>
                    <Pencil className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button onClick={() => setDeleteTargetId(category.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* CONFIRM DELETE */}
      {deleteTargetId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-background rounded-lg p-6 max-w-sm w-full space-y-4">
            <p>Are you sure to delete this category?</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteTargetId(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDelete(deleteTargetId)}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
