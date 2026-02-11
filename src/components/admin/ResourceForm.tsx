import { useState, useCallback, useEffect } from 'react';
import { type Resource, type ResourceFormData, type ResourceCategory } from '../../types';
import { Modal, ModalFooter } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { ImageUpload } from '../ui/ImageUpload';
import { sanitizeText, warnIfSuspicious } from '../../lib/sanitization';

interface ResourceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ResourceFormData) => Promise<void>;
  resource?: Resource | null;
}

interface FormErrors {
  title?: string;
  text?: string;
  imageUrl?: string;
  category?: string;
}

const CATEGORY_OPTIONS: { value: ResourceCategory; label: string }[] = [
  { value: 'gear', label: 'Ideal Gear' },
  { value: 'hatch-charts', label: 'Hatch Charts' },
  { value: 'techniques', label: 'Techniques' },
  { value: 'locations', label: 'Locations' },
  { value: 'other', label: 'Other' },
];

const EMPTY_FORM: ResourceFormData = {
  title: '',
  text: '',
  imageUrl: '',
  category: 'gear',
  isVisible: true,
};

export function ResourceForm({ isOpen, onClose, onSave, resource }: ResourceFormProps) {
  const isEditing = Boolean(resource);
  const [formData, setFormData] = useState<ResourceFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Reset form when modal opens/closes or resource changes
  useEffect(() => {
    if (isOpen) {
      if (resource) {
        setFormData({
          title: resource.title,
          text: resource.text,
          imageUrl: resource.imageUrl,
          category: resource.category,
          isVisible: resource.isVisible,
        });
      } else {
        setFormData(EMPTY_FORM);
      }
      setErrors({});
      setSaveError(null);
    }
  }, [isOpen, resource]);

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

    // Text validation
    const text = formData.text.trim();
    if (!text) {
      newErrors.text = 'Content is required';
    } else if (text.length < 10) {
      newErrors.text = 'Content must be at least 10 characters';
    } else if (text.length > 10000) {
      newErrors.text = 'Content must not exceed 10,000 characters';
    }
    warnIfSuspicious('text', text);

    // Image validation
    if (!formData.imageUrl) {
      newErrors.imageUrl = 'Image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setSaveError(null);

    try {
      const sanitizedData: ResourceFormData = {
        title: sanitizeText(formData.title.trim()),
        text: sanitizeText(formData.text.trim()),
        imageUrl: formData.imageUrl,
        category: formData.category,
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
  }, [formData, validateForm, onSave, onClose]);

  const handleCancel = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Resource' : 'Add New Resource'}
      maxWidth="lg"
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
            <select
              id="category"
              value={formData.category}
              onChange={(e) => updateField('category', e.target.value as ResourceCategory)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-trout-gold focus:border-transparent"
              required
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Content Textarea */}
          <div>
            <Textarea
              label="Content"
              value={formData.text}
              onChange={(e) => updateField('text', e.target.value)}
              placeholder="Enter the resource content here. You can include lists, tips, and detailed information..."
              error={errors.text}
              required
              rows={8}
              maxLength={10000}
            />
            <div className="mt-1 text-xs text-gray-500">
              {formData.text.length} / 10,000 characters
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <ImageUpload
              label="Resource Image"
              value={formData.imageUrl}
              onChange={(url) => updateField('imageUrl', url || '')}
              storagePath="resources"
              helperText="Upload an image related to this resource (max 5MB, JPEG/PNG/WebP)"
              error={errors.imageUrl}
              required
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
