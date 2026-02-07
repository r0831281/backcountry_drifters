import { useState, useCallback, useEffect } from 'react';
import { type Testimonial, type TestimonialFormData } from '../../types';
import { Modal, ModalFooter } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import {
  validateTestimonialForm,
  type TestimonialValidationErrors,
} from '../../lib/validation';
import { sanitizeText, sanitizeUrl, warnIfSuspicious } from '../../lib/sanitization';

interface TestimonialFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: TestimonialFormData) => Promise<void>;
  testimonial?: Testimonial | null;
}

type FormErrors = TestimonialValidationErrors;

const EMPTY_FORM: TestimonialFormData = {
  customerName: '',
  testimonialText: '',
  rating: 0,
  photoUrl: '',
  tripType: '',
  isApproved: false,
};

/**
 * Interactive star rating selector component.
 * Allows selecting a rating from 1-5 with hover preview and keyboard support.
 */
function StarSelector({
  value,
  onChange,
  error,
}: {
  value: number;
  onChange: (rating: number) => void;
  error?: string;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        Rating <span className="text-red-500">*</span>
      </label>
      <div
        className="flex items-center gap-1"
        role="radiogroup"
        aria-label="Rating"
        onMouseLeave={() => setHovered(0)}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const isActive = star <= (hovered || value);
          return (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              onMouseEnter={() => setHovered(star)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowRight' && star < 5) onChange(star + 1);
                if (e.key === 'ArrowLeft' && star > 1) onChange(star - 1);
              }}
              className={`
                p-1 rounded transition-all duration-150 cursor-pointer border-0 bg-transparent
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trout-gold focus-visible:ring-offset-1
                ${isActive ? 'text-trout-gold scale-110' : 'text-gray-300 hover:text-trout-gold-light'}
              `}
              role="radio"
              aria-checked={star === value}
              aria-label={`${star} star${star !== 1 ? 's' : ''}`}
              tabIndex={star === value || (value === 0 && star === 1) ? 0 : -1}
            >
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          );
        })}
        {value > 0 && (
          <span className="ml-2 text-sm text-gray-500">{value}/5</span>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-red-600 animate-fade-in-fast" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function TestimonialForm({ isOpen, onClose, onSave, testimonial }: TestimonialFormProps) {
  const isEditing = Boolean(testimonial);
  const [formData, setFormData] = useState<TestimonialFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Reset form when modal opens/closes or testimonial changes
  useEffect(() => {
    if (isOpen) {
      if (testimonial) {
        setFormData({
          customerName: testimonial.customerName,
          testimonialText: testimonial.testimonialText,
          rating: testimonial.rating,
          photoUrl: testimonial.photoUrl || '',
          tripType: testimonial.tripType,
          isApproved: testimonial.isApproved,
        });
      } else {
        setFormData(EMPTY_FORM);
      }
      setErrors({});
      setSaveError(null);
    }
  }, [isOpen, testimonial]);

  const updateField = useCallback(<K extends keyof TestimonialFormData>(
    field: K,
    value: TestimonialFormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user types
    setErrors((prev) => {
      if (prev[field as keyof FormErrors]) {
        const next = { ...prev };
        delete next[field as keyof FormErrors];
        return next;
      }
      return prev;
    });
  }, []);

  const validate = useCallback((): FormErrors => {
    return validateTestimonialForm({
      customerName: formData.customerName,
      rating: formData.rating,
      testimonialText: formData.testimonialText,
      tripType: formData.tripType,
      photoUrl: formData.photoUrl,
    });
  }, [formData]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Log warnings for suspicious patterns (defense-in-depth)
    warnIfSuspicious('customerName', formData.customerName);
    warnIfSuspicious('testimonialText', formData.testimonialText);

    // Sanitize all string fields before saving
    setSaving(true);
    try {
      await onSave({
        ...formData,
        customerName: sanitizeText(formData.customerName.trim()),
        testimonialText: sanitizeText(formData.testimonialText.trim()),
        tripType: sanitizeText(formData.tripType.trim()),
        photoUrl: formData.photoUrl ? sanitizeUrl(formData.photoUrl.trim()) || undefined : undefined,
      });
      onClose();
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  }, [formData, validate, onSave, onClose]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Testimonial' : 'Add Testimonial'}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} noValidate>
        <div className="space-y-5">
          <Input
            label="Customer Name"
            placeholder="e.g., John Smith"
            value={formData.customerName}
            onChange={(e) => updateField('customerName', e.target.value)}
            error={errors.customerName}
            required
            autoFocus
            maxLength={100}
          />

          <StarSelector
            value={formData.rating}
            onChange={(rating) => updateField('rating', rating)}
            error={errors.rating}
          />

          <Textarea
            label="Testimonial Text"
            placeholder="Share the customer's experience... (minimum 20 characters)"
            value={formData.testimonialText}
            onChange={(e) => updateField('testimonialText', e.target.value)}
            error={errors.testimonialText}
            rows={4}
            required
            maxLength={2000}
            helperText={
              !errors.testimonialText && formData.testimonialText.length > 0
                ? `${formData.testimonialText.length}/2000 characters`
                : undefined
            }
          />

          <Input
            label="Trip Type"
            placeholder="e.g., Half Day Wade Trip"
            value={formData.tripType}
            onChange={(e) => updateField('tripType', e.target.value)}
            error={errors.tripType}
            required
            maxLength={100}
          />

          <Input
            label="Photo URL"
            placeholder="https://example.com/photo.jpg (optional)"
            value={formData.photoUrl || ''}
            onChange={(e) => updateField('photoUrl', e.target.value)}
            type="url"
            error={errors.photoUrl}
            helperText="Optional. Direct link to the customer's photo."
            maxLength={2048}
          />

          <div className="flex items-center gap-3">
            <button
              type="button"
              role="switch"
              aria-checked={formData.isApproved}
              onClick={() => updateField('isApproved', !formData.isApproved)}
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full
                transition-colors duration-200 cursor-pointer border-0
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trout-gold focus-visible:ring-offset-2
                ${formData.isApproved ? 'bg-green-500' : 'bg-gray-300'}
              `}
            >
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white shadow-sm
                  transition-transform duration-200
                  ${formData.isApproved ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </button>
            <label className="text-sm font-medium text-gray-700 cursor-pointer" onClick={() => updateField('isApproved', !formData.isApproved)}>
              Approved for public display
            </label>
          </div>

          {saveError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200" role="alert">
              <p className="text-sm text-red-700">{saveError}</p>
            </div>
          )}
        </div>

        <ModalFooter>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            loading={saving}
          >
            {isEditing ? 'Save Changes' : 'Add Testimonial'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
