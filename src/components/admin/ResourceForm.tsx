import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  type Resource,
  type ResourceFormData,
  type ResourceCategory,
  type ResourceCategoryFormData,
  type ResourceContentBlock,
} from '../../types';
import { Modal, ModalFooter } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { ImageUpload } from '../ui/ImageUpload';
import { sanitizeText, sanitizeUrl, warnIfSuspicious } from '../../lib/sanitization';
import { useResourceCategories } from '../../hooks';

interface ResourceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ResourceFormData) => Promise<void>;
  resource?: Resource | null;
}

interface FormErrors {
  title?: string;
  contentBlocks?: string;
  imageUrl?: string;
  category?: string;
}

interface CategoryFormErrors {
  name?: string;
  label?: string;
  order?: string;
}

const EMPTY_FORM: ResourceFormData = {
  title: '',
  imageUrl: '',
  category: '',
  contentBlocks: [],
  isVisible: true,
};

const EMPTY_CATEGORY_FORM: ResourceCategoryFormData = {
  name: '',
  label: '',
  order: 1,
};

export function ResourceForm({ isOpen, onClose, onSave, resource }: ResourceFormProps) {
  const isEditing = Boolean(resource);
  const [formData, setFormData] = useState<ResourceFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  // Load resource categories
  const {
    categories,
    loading: categoriesLoading,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useResourceCategories({ realtime: true });

  const [categoryForm, setCategoryForm] = useState<ResourceCategoryFormData>(EMPTY_CATEGORY_FORM);
  const [categoryErrors, setCategoryErrors] = useState<CategoryFormErrors>({});
  const [categoryEditId, setCategoryEditId] = useState<string | null>(null);
  const [categorySaving, setCategorySaving] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  const nextCategoryOrder = useMemo(() => {
    if (categories.length === 0) return 1;
    return categories.reduce((max, category) => Math.max(max, category.order ?? 0), 0) + 1;
  }, [categories]);

  // Reset form when modal opens/closes or resource changes
  useEffect(() => {
    if (isOpen) {
      if (resource) {
        const blocks = resource.contentBlocks && resource.contentBlocks.length > 0
          ? resource.contentBlocks
          : resource.text
            ? [{ type: 'paragraph', text: resource.text } as ResourceContentBlock]
            : [];
        setFormData({
          title: resource.title,
          imageUrl: resource.imageUrl || '',
          category: resource.category,
          contentBlocks: blocks,
          isVisible: resource.isVisible,
        });
      } else {
        setFormData(EMPTY_FORM);
      }
      setErrors({});
      setSaveError(null);
    }
  }, [isOpen, resource]);

  // Default category when opening a new resource and categories are available
  useEffect(() => {
    if (!isOpen || resource) return;
    if (categories.length === 0) return;
    setFormData((prev) => {
      if (prev.category) return prev;
      return { ...prev, category: categories[0].name };
    });
  }, [isOpen, resource, categories]);

  // Keep selected category valid if categories change
  useEffect(() => {
    if (!isOpen || resource) return;
    if (!formData.category) return;
    const exists = categories.some((category) => category.name === formData.category);
    if (exists) return;
    setFormData((prev) => ({ ...prev, category: categories[0]?.name || '' }));
  }, [isOpen, resource, categories, formData.category]);

  // Reset category form state when modal opens
  useEffect(() => {
    if (!isOpen) return;
    setCategoryForm({ ...EMPTY_CATEGORY_FORM, order: nextCategoryOrder });
    setCategoryErrors({});
    setCategoryEditId(null);
    setCategoryError(null);
  }, [isOpen, nextCategoryOrder]);

  const updateField = useCallback(<K extends keyof ResourceFormData>(
    field: K,
    value: ResourceFormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user changes it
    setErrors((prev) => {
      if (prev[field as keyof FormErrors]) {
        const next = { ...prev };
        delete next[field as keyof FormErrors];
        return next;
      }
      return prev;
    });
  }, []);

  const blockHasContent = useCallback((block: ResourceContentBlock) => {
    if (block.type === 'heading' || block.type === 'paragraph') {
      return block.text.trim().length > 0;
    }
    if (block.type === 'list') {
      return block.items.some((item) => item.trim().length > 0);
    }
    if (block.type === 'image') {
      return block.imageUrl.trim().length > 0;
    }
    return false;
  }, []);

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    // Title validation
    const title = formData.title.trim();
    if (!title) {
      newErrors.title = 'Title is required';
    } else if (title.length < 2) {
      newErrors.title = 'Title must be at least 2 characters';
    } else if (title.length > 200) {
      newErrors.title = 'Title must not exceed 200 characters';
    }
    warnIfSuspicious('title', title);

    const hasContent = formData.contentBlocks.some(blockHasContent);
    if (!hasContent) {
      newErrors.contentBlocks = 'Add at least one content block.';
    }

    // Image validation - now optional
    // No validation needed since it's optional

    // Category validation
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, blockHasContent]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setSaveError(null);

    try {
      const normalizedBlocks = formData.contentBlocks
        .map((block) => {
          if (block.type === 'heading' || block.type === 'paragraph') {
            return { ...block, text: block.text.trim() };
          }
          if (block.type === 'list') {
            return {
              ...block,
              items: block.items.map((item) => item.trim()).filter((item) => item.length > 0),
            };
          }
          return {
            ...block,
            imageUrl: block.imageUrl.trim(),
            alt: block.alt?.trim() || undefined,
          };
        })
        .filter(blockHasContent);

      const sanitizedBlocks: ResourceContentBlock[] = normalizedBlocks.map((block) => {
        if (block.type === 'heading' || block.type === 'paragraph') {
          warnIfSuspicious('resource-block', block.text);
          return { ...block, text: sanitizeText(block.text) };
        }
        if (block.type === 'list') {
          return { ...block, items: block.items.map((item) => sanitizeText(item)) };
        }
        return {
          ...block,
          imageUrl: sanitizeUrl(block.imageUrl),
          alt: block.alt ? sanitizeText(block.alt) : undefined,
        };
      });

      const plainText = sanitizedBlocks
        .map((block) => {
          if (block.type === 'heading' || block.type === 'paragraph') {
            return block.text;
          }
          if (block.type === 'list') {
            return block.items.join('\n');
          }
          return '';
        })
        .filter((chunk) => chunk.length > 0)
        .join('\n\n');

      const sanitizedData: ResourceFormData = {
        title: sanitizeText(formData.title.trim()),
        text: plainText,
        imageUrl: formData.imageUrl,
        category: formData.category,
        contentBlocks: sanitizedBlocks,
        isVisible: formData.isVisible,
      };

      await onSave(sanitizedData);
      onClose();
    } catch (err) {
      console.error('Error saving resource:', err);
      setSaveError(err instanceof Error ? err.message : 'Failed to save resource');
    } finally {
      setSaving(false);
    }
  }, [formData, validateForm, onSave, onClose, blockHasContent]);

  const addBlock = useCallback((type: ResourceContentBlock['type']) => {
    const newBlock: ResourceContentBlock =
      type === 'heading'
        ? { type: 'heading', text: '' }
        : type === 'paragraph'
          ? { type: 'paragraph', text: '' }
          : type === 'list'
            ? { type: 'list', items: [] }
            : { type: 'image', imageUrl: '', alt: '' };

    setFormData((prev) => ({
      ...prev,
      contentBlocks: [...prev.contentBlocks, newBlock],
    }));
    setErrors((prev) => {
      if (!prev.contentBlocks) return prev;
      const next = { ...prev };
      delete next.contentBlocks;
      return next;
    });
  }, []);

  const updateBlock = useCallback((index: number, block: ResourceContentBlock) => {
    setFormData((prev) => {
      const nextBlocks = [...prev.contentBlocks];
      nextBlocks[index] = block;
      return { ...prev, contentBlocks: nextBlocks };
    });
    setErrors((prev) => {
      if (!prev.contentBlocks) return prev;
      const next = { ...prev };
      delete next.contentBlocks;
      return next;
    });
  }, []);

  const removeBlock = useCallback((index: number) => {
    setFormData((prev) => {
      const nextBlocks = prev.contentBlocks.filter((_, i) => i !== index);
      return { ...prev, contentBlocks: nextBlocks };
    });
    setErrors((prev) => {
      if (!prev.contentBlocks) return prev;
      const next = { ...prev };
      delete next.contentBlocks;
      return next;
    });
  }, []);

  const moveBlock = useCallback((index: number, direction: -1 | 1) => {
    setFormData((prev) => {
      const nextBlocks = [...prev.contentBlocks];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= nextBlocks.length) return prev;
      const [moved] = nextBlocks.splice(index, 1);
      nextBlocks.splice(targetIndex, 0, moved);
      return { ...prev, contentBlocks: nextBlocks };
    });
  }, []);

  const handleCancel = useCallback(() => {
    onClose();
  }, [onClose]);

  const updateCategoryField = useCallback(<K extends keyof ResourceCategoryFormData>(
    field: K,
    value: ResourceCategoryFormData[K],
  ) => {
    setCategoryForm((prev) => ({ ...prev, [field]: value }));
    setCategoryErrors((prev) => {
      if (prev[field as keyof CategoryFormErrors]) {
        const next = { ...prev };
        delete next[field as keyof CategoryFormErrors];
        return next;
      }
      return prev;
    });
  }, []);

  const validateCategoryForm = useCallback((): boolean => {
    const newErrors: CategoryFormErrors = {};
    const name = categoryForm.name.trim();
    const label = categoryForm.label.trim();

    if (!name) {
      newErrors.name = 'Value is required';
    }

    if (!label) {
      newErrors.label = 'Label is required';
    }

    if (Number.isNaN(categoryForm.order) || categoryForm.order < 0) {
      newErrors.order = 'Order must be 0 or higher';
    }

    const duplicate = categories.find(
      (category) => category.name === name && category.id !== categoryEditId
    );
    if (duplicate) {
      newErrors.name = 'Value must be unique';
    }

    setCategoryErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [categoryForm, categories, categoryEditId]);

  const resetCategoryForm = useCallback(() => {
    setCategoryForm({ ...EMPTY_CATEGORY_FORM, order: nextCategoryOrder });
    setCategoryErrors({});
    setCategoryEditId(null);
    setCategoryError(null);
  }, [nextCategoryOrder]);

  const handleSaveCategory = useCallback(async () => {
    if (!validateCategoryForm()) return;

    setCategorySaving(true);
    setCategoryError(null);

    const payload = {
      name: sanitizeText(categoryForm.name.trim()),
      label: sanitizeText(categoryForm.label.trim()),
      order: Number(categoryForm.order),
    };

    try {
      if (categoryEditId) {
        await updateCategory(categoryEditId, payload);
      } else {
        await createCategory(payload);
      }
      resetCategoryForm();
    } catch (err) {
      console.error('Error saving resource category:', err);
      setCategoryError(err instanceof Error ? err.message : 'Failed to save category');
    } finally {
      setCategorySaving(false);
    }
  }, [categoryForm, categoryEditId, createCategory, updateCategory, resetCategoryForm, validateCategoryForm]);

  const handleEditCategory = useCallback((category: ResourceCategory) => {
    setCategoryEditId(category.id);
    setCategoryForm({
      name: category.name,
      label: category.label,
      order: category.order ?? 0,
    });
    setCategoryErrors({});
    setCategoryError(null);
  }, []);

  const handleDeleteCategory = useCallback(async (category: ResourceCategory) => {
    const confirmed = window.confirm(`Delete category "${category.label}"? This cannot be undone.`);
    if (!confirmed) return;

    setCategorySaving(true);
    setCategoryError(null);
    try {
      await deleteCategory(category.id);
      if (categoryEditId === category.id) {
        resetCategoryForm();
      }
    } catch (err) {
      console.error('Error deleting resource category:', err);
      setCategoryError(err instanceof Error ? err.message : 'Failed to delete category');
    } finally {
      setCategorySaving(false);
    }
  }, [deleteCategory, categoryEditId, resetCategoryForm]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Resource' : 'Add New Resource'}
      maxWidth="full"
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-6 p-6">
          {/* Title Input */}
          <div>
            <Input
              label="Title"
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="e.g., Essential Fly Fishing Gear for Alberta"
              error={errors.title}
              required
              maxLength={200}
            />
          </div>

          {/* Category Select */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            {categoriesLoading ? (
              <div className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
                Loading categories...
              </div>
            ) : categories.length === 0 ? (
              <div className="w-full px-4 py-2 border border-yellow-300 rounded-md bg-yellow-50 text-yellow-700 text-sm">
                No categories available. Please add categories in the admin settings first.
              </div>
            ) : (
              <select
                id="category"
                value={formData.category}
                onChange={(e) => updateField('category', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-trout-gold focus:border-transparent"
                required
                disabled={categoriesLoading}
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.label}
                  </option>
                ))}
              </select>
            )}
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category}</p>
            )}
          </div>

          {/* Category Manager */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-forest-700">Manage Categories</h3>
              <p className="text-xs text-gray-500">
                Add, edit, or remove categories used in the dropdown.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input
                label="Value"
                value={categoryForm.name}
                onChange={(e) => updateCategoryField('name', e.target.value)}
                placeholder="e.g., gear-guides"
                error={categoryErrors.name}
              />
              <Input
                label="Label"
                value={categoryForm.label}
                onChange={(e) => updateCategoryField('label', e.target.value)}
                placeholder="e.g., Gear Guides"
                error={categoryErrors.label}
              />
              <Input
                label="Order"
                type="number"
                min={0}
                value={categoryForm.order}
                onChange={(e) => {
                  const nextValue = e.target.value === '' ? 0 : Number(e.target.value);
                  updateCategoryField('order', nextValue);
                }}
                error={categoryErrors.order}
              />
            </div>
            {categoryError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
                {categoryError}
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleSaveCategory}
                disabled={categorySaving || categoriesLoading}
              >
                {categoryEditId ? 'Update Category' : 'Add Category'}
              </Button>
              {categoryEditId && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={resetCategoryForm}
                  disabled={categorySaving || categoriesLoading}
                >
                  Cancel Edit
                </Button>
              )}
            </div>
            <div className="divide-y divide-gray-200">
              {categories.length === 0 ? (
                <p className="text-sm text-gray-500 py-2">No categories yet.</p>
              ) : (
                categories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between py-2 gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{category.label}</p>
                      <p className="text-xs text-gray-500 truncate">{category.name} · Order {category.order}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditCategory(category)}
                        disabled={categorySaving || categoriesLoading}
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCategory(category)}
                        disabled={categorySaving || categoriesLoading}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Content Blocks */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-700">Content Blocks</h3>
                <p className="text-xs text-gray-500">Build the resource content by stacking blocks.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => addBlock('heading')}>
                  Add Heading
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => addBlock('paragraph')}>
                  Add Paragraph
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => addBlock('list')}>
                  Add List
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => addBlock('image')}>
                  Add Image
                </Button>
              </div>
            </div>

            {formData.contentBlocks.length === 0 ? (
              <div className="border border-dashed border-gray-300 rounded-lg p-6 text-sm text-gray-500">
                No content blocks yet. Add a heading, paragraph, list, or image.
              </div>
            ) : (
              <div className="space-y-4">
                {formData.contentBlocks.map((block, index) => (
                  <div key={`${block.type}-${index}`} className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        {block.type}
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => moveBlock(index, -1)}
                          disabled={index === 0}
                        >
                          Up
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => moveBlock(index, 1)}
                          disabled={index === formData.contentBlocks.length - 1}
                        >
                          Down
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeBlock(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>

                    {block.type === 'heading' && (
                      <Input
                        label="Heading"
                        value={block.text}
                        onChange={(e) => updateBlock(index, { ...block, text: e.target.value })}
                        placeholder="Section heading"
                        maxLength={200}
                      />
                    )}

                    {block.type === 'paragraph' && (
                      <Textarea
                        label="Paragraph"
                        value={block.text}
                        onChange={(e) => updateBlock(index, { ...block, text: e.target.value })}
                        placeholder="Write your paragraph here..."
                        rows={5}
                        maxLength={5000}
                      />
                    )}

                    {block.type === 'list' && (
                      <Textarea
                        label="List Items"
                        value={block.items.join('\n')}
                        onChange={(e) => {
                          const items = e.target.value
                            .split('\n')
                            .map((item) => item.trim())
                            .filter((item) => item.length > 0);
                          updateBlock(index, { ...block, items });
                        }}
                        placeholder="One item per line"
                        rows={4}
                        maxLength={2000}
                      />
                    )}

                    {block.type === 'image' && (
                      <div className="space-y-3">
                        <ImageUpload
                          label="Block Image"
                          value={block.imageUrl}
                          onChange={(url) => updateBlock(index, { ...block, imageUrl: url || '' })}
                          storagePath="resources"
                          helperText="Upload an image for this section (max 5MB, JPEG/PNG/WebP)"
                          required={false}
                        />
                        <Input
                          label="Alt Text"
                          value={block.alt || ''}
                          onChange={(e) => updateBlock(index, { ...block, alt: e.target.value })}
                          placeholder="Describe the image"
                          maxLength={200}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {errors.contentBlocks && (
              <p className="text-sm text-red-600">{errors.contentBlocks}</p>
            )}
          </div>

          {/* Image Upload - now optional */}
          <div>
            <ImageUpload
              label="Resource Image (Optional)"
              value={formData.imageUrl || ''}
              onChange={(url) => updateField('imageUrl', url || '')}
              storagePath="resources"
              helperText="Upload an image related to this resource (max 5MB, JPEG/PNG/WebP)"
              error={errors.imageUrl}
              required={false}
            />
          </div>

          {/* Visibility Toggle */}
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-md">
            <input
              id="isVisible"
              type="checkbox"
              checked={formData.isVisible}
              onChange={(e) => updateField('isVisible', e.target.checked)}
              className="h-4 w-4 text-trout-gold focus:ring-trout-gold border-gray-300 rounded"
            />
            <label htmlFor="isVisible" className="text-sm font-medium text-gray-700">
              Make this resource visible to the public
            </label>
          </div>

          {/* Error Message */}
          {saveError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
              {saveError}
            </div>
          )}
        </div>

        <ModalFooter>
          <Button type="button" variant="secondary" onClick={handleCancel} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : isEditing ? 'Update Resource' : 'Create Resource'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
