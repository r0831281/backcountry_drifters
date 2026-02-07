import { useState, useCallback, useEffect } from 'react';
import { type Trip, type TripFormData, type TripDifficulty } from '../../types';
import { Modal, ModalFooter } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import {
  validateTripForm,
  type TripValidationErrors,
} from '../../lib/validation';
import { sanitizeText, sanitizeUrl, warnIfSuspicious } from '../../lib/sanitization';

interface TripFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: TripFormData) => Promise<void>;
  trip?: Trip | null;
}

type FormErrors = TripValidationErrors;

const DIFFICULTY_OPTIONS: TripDifficulty[] = ['Beginner', 'Intermediate', 'Advanced'];

const EMPTY_FORM: TripFormData = {
  title: '',
  description: '',
  duration: '',
  price: 0,
  maxGuests: 1,
  difficulty: 'Beginner',
  photoUrls: [],
  includedEquipment: [],
  location: '',
  isActive: true,
};

export function TripForm({ isOpen, onClose, onSave, trip }: TripFormProps) {
  const isEditing = Boolean(trip);
  const [formData, setFormData] = useState<TripFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Separate string state for the multi-line equipment input and price-in-dollars
  const [equipmentText, setEquipmentText] = useState('');
  const [photoUrlsText, setPhotoUrlsText] = useState('');
  const [priceDisplay, setPriceDisplay] = useState('');

  // Reset form when modal opens/closes or trip changes
  useEffect(() => {
    if (isOpen) {
      if (trip) {
        setFormData({
          title: trip.title,
          description: trip.description,
          duration: trip.duration,
          price: trip.price,
          maxGuests: trip.maxGuests,
          difficulty: trip.difficulty,
          photoUrls: trip.photoUrls,
          includedEquipment: trip.includedEquipment,
          location: trip.location,
          isActive: trip.isActive,
        });
        setEquipmentText(trip.includedEquipment.join('\n'));
        setPhotoUrlsText(trip.photoUrls.join('\n'));
        setPriceDisplay((trip.price / 100).toFixed(2));
      } else {
        setFormData(EMPTY_FORM);
        setEquipmentText('');
        setPhotoUrlsText('');
        setPriceDisplay('');
      }
      setErrors({});
      setSaveError(null);
    }
  }, [isOpen, trip]);

  const updateField = useCallback(<K extends keyof TripFormData>(
    field: K,
    value: TripFormData[K],
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

  const handlePriceChange = useCallback((value: string) => {
    setPriceDisplay(value);
    const parsed = parseFloat(value);
    if (!isNaN(parsed)) {
      updateField('price', Math.round(parsed * 100));
    } else {
      updateField('price', 0);
    }
  }, [updateField]);

  const handleEquipmentChange = useCallback((text: string) => {
    setEquipmentText(text);
    const items = text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    updateField('includedEquipment', items);
  }, [updateField]);

  const handlePhotoUrlsChange = useCallback((text: string) => {
    setPhotoUrlsText(text);
    const urls = text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    updateField('photoUrls', urls);
  }, [updateField]);

  const validate = useCallback((): FormErrors => {
    return validateTripForm({
      title: formData.title,
      description: formData.description,
      duration: formData.duration,
      price: formData.price,
      maxGuests: formData.maxGuests,
      difficulty: formData.difficulty,
      location: formData.location,
      photoUrls: formData.photoUrls,
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
    warnIfSuspicious('title', formData.title);
    warnIfSuspicious('description', formData.description);
    warnIfSuspicious('location', formData.location);

    // Sanitize all string fields before saving
    setSaving(true);
    try {
      await onSave({
        ...formData,
        title: sanitizeText(formData.title.trim()),
        description: sanitizeText(formData.description.trim()),
        duration: sanitizeText(formData.duration.trim()),
        location: sanitizeText(formData.location.trim()),
        includedEquipment: formData.includedEquipment.map((item) => sanitizeText(item)),
        photoUrls: formData.photoUrls.map((url) => sanitizeUrl(url)).filter(Boolean),
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
      title={isEditing ? 'Edit Trip' : 'Add Trip'}
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} noValidate>
        <div className="space-y-5">
          <Input
            label="Title"
            placeholder="e.g., Half Day Wade Trip"
            value={formData.title}
            onChange={(e) => updateField('title', e.target.value)}
            error={errors.title}
            required
            autoFocus
            maxLength={200}
          />

          <Textarea
            label="Description"
            placeholder="Describe the trip experience, what guests can expect..."
            value={formData.description}
            onChange={(e) => updateField('description', e.target.value)}
            error={errors.description}
            rows={4}
            required
            maxLength={5000}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Duration"
              placeholder='e.g., "4 Hours" or "Full Day"'
              value={formData.duration}
              onChange={(e) => updateField('duration', e.target.value)}
              error={errors.duration}
              required
              maxLength={100}
            />

            <Input
              label="Price (USD)"
              placeholder="e.g., 350.00"
              value={priceDisplay}
              onChange={(e) => handlePriceChange(e.target.value)}
              error={errors.price}
              type="number"
              min="0"
              step="0.01"
              required
              helperText={formData.price > 0 ? `Stored as ${formData.price} cents` : undefined}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Max Guests"
              placeholder="e.g., 4"
              value={formData.maxGuests.toString()}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                updateField('maxGuests', isNaN(val) ? 0 : val);
              }}
              error={errors.maxGuests}
              type="number"
              min="1"
              required
            />

            <div className="w-full">
              <label htmlFor="difficulty-select" className="block text-sm font-medium text-gray-700 mb-1.5">
                Difficulty <span className="text-red-500">*</span>
              </label>
              <select
                id="difficulty-select"
                value={formData.difficulty}
                onChange={(e) => updateField('difficulty', e.target.value as TripDifficulty)}
                className={`
                  w-full px-4 py-2.5 rounded-lg border bg-white
                  transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
                  focus:outline-none focus:ring-2 focus:ring-offset-0
                  ${errors.difficulty
                    ? 'border-red-400 focus:ring-red-500/30 focus:border-red-500'
                    : 'border-gray-200 focus:ring-forest-500/30 focus:border-forest-500 hover:border-gray-300'
                  }
                `}
                aria-invalid={errors.difficulty ? 'true' : 'false'}
              >
                {DIFFICULTY_OPTIONS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
              {errors.difficulty && (
                <p className="mt-1.5 text-sm text-red-600 animate-fade-in-fast" role="alert">
                  {errors.difficulty}
                </p>
              )}
            </div>
          </div>

          <Input
            label="Location"
            placeholder="e.g., Bow River, Calgary Area"
            value={formData.location}
            onChange={(e) => updateField('location', e.target.value)}
            error={errors.location}
            required
            maxLength={200}
          />

          <Textarea
            label="Included Equipment"
            placeholder="Enter one item per line, e.g.:&#10;Fly rods&#10;Waders&#10;Boots&#10;Lunch"
            value={equipmentText}
            onChange={(e) => handleEquipmentChange(e.target.value)}
            rows={4}
            helperText={
              formData.includedEquipment.length > 0
                ? `${formData.includedEquipment.length} item${formData.includedEquipment.length !== 1 ? 's' : ''}`
                : 'One item per line'
            }
          />

          <Textarea
            label="Photo URLs"
            placeholder="Enter one URL per line (optional)&#10;https://example.com/photo1.jpg&#10;https://example.com/photo2.jpg"
            value={photoUrlsText}
            onChange={(e) => handlePhotoUrlsChange(e.target.value)}
            rows={3}
            helperText="Optional. One URL per line. Firebase Storage upload coming soon."
          />

          <div className="flex items-center gap-3">
            <button
              type="button"
              role="switch"
              aria-checked={formData.isActive}
              onClick={() => updateField('isActive', !formData.isActive)}
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full
                transition-colors duration-200 cursor-pointer border-0
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trout-gold focus-visible:ring-offset-2
                ${formData.isActive ? 'bg-green-500' : 'bg-gray-300'}
              `}
            >
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white shadow-sm
                  transition-transform duration-200
                  ${formData.isActive ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </button>
            <label className="text-sm font-medium text-gray-700 cursor-pointer" onClick={() => updateField('isActive', !formData.isActive)}>
              Active (visible to customers)
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
            {isEditing ? 'Save Changes' : 'Add Trip'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
